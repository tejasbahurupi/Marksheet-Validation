import { ethers, Contract } from "ethers";
import { toast } from "react-hot-toast";
import * as ExcelJS from "exceljs";
import { CONTRACT_ADDRESS, CONTRACT_ABI, PUBLIC_RPC_URL } from "../constants";

// --- Interfaces ---
export interface StudentData {
  enrollmentNumber: string;
  semester: string;
  name?: string;
  marks?: any;
}

export interface BatchResult {
  successful: StudentData[];
  failed: { student: StudentData; error: string }[];
  totalProcessed: number;
}

// --- Hashing Utilities ---
export const generateMarksheetHash = (marks?: any): string => {
  // stringify once to ensure consistency
  const dataToHash = JSON.stringify(marks || {});
  return ethers.keccak256(ethers.toUtf8Bytes(dataToHash));
};

export const generateQrCodeData = (marks: any): string => {
  return generateMarksheetHash(marks);
};

// --- Excel Parsing ---
export const parseExcelFile = async (file: File): Promise<StudentData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        if (!buffer) throw new Error("Failed to read file buffer.");

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];
        if (!worksheet) throw new Error("No worksheets found in the Excel file.");

        const students: StudentData[] = [];
        const headers: string[] = [];

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) {
            row.eachCell((cell) => headers.push(cell.text));
            return;
          }

          const rowData: any = {};
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (header) rowData[header] = cell.value;
          });

          const student: StudentData = {
            enrollmentNumber: String(
              rowData["Enrollment Number"] || rowData["enrollmentNumber"] || ""
            ),
            semester: String(rowData["Semester"] || rowData["semester"] || ""),
            name: String(rowData["Name"] || rowData["name"] || ""),
            marks: rowData,
          };
          students.push(student);
        });

        const validStudents = students.filter((s) => s.enrollmentNumber && s.semester);
        if (validStudents.length === 0) {
          throw new Error('Ensure Excel has "Enrollment Number" and "Semester" columns.');
        }
        resolve(validStudents);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
};

// --- Core Blockchain Logic ---

/**
 * FIXED BATCH PROCESSOR
 * Forces one confirmation per 50 students.
 */
export const processBulkMarksheets = async (
  contractInstance: Contract,
  students: StudentData[],
  onProgress?: (current: number, total: number) => void
): Promise<BatchResult> => {
  if (!contractInstance) {
    toast.error("Blockchain connection not available.");
    return { successful: [], failed: [], totalProcessed: 0 };
  }

  const BATCH_SIZE = 50; 
  const successful: StudentData[] = [];
  const failed: { student: StudentData; error: string }[] = [];

  for (let i = 0; i < students.length; i += BATCH_SIZE) {
    const rawBatch = students.slice(i, i + BATCH_SIZE);
    
    // --- NEW: Pre-check for existing records ---
    const existenceCheckToastId = toast.loading(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: Checking for existing records...`);
    const studentIdsForCheck = rawBatch.map(
      (s) => `${s.enrollmentNumber.trim().toUpperCase()}-${s.semester.trim()}`
    );
    
    let existingHashes: string[] = [];
    try {
      // Use the batchGetStoredHashes function we saw in the Smart Contract
      existingHashes = await contractInstance.batchGetStoredHashes(studentIdsForCheck);
    } catch (error) {
      console.error("Error checking existence:", error);
      toast.dismiss(existenceCheckToastId);
      toast.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: Failed to verify existing records.`);
      rawBatch.forEach(s => failed.push({ student: s, error: "Failed to verify existence on blockchain" }));
      continue; // Skip this batch if we can't verify
    }
    toast.dismiss(existenceCheckToastId);

    // Filter out students that already have a non-zero hash on the blockchain
    const batch: StudentData[] = [];
    rawBatch.forEach((student, index) => {
      if (existingHashes[index] !== ethers.ZeroHash) {
        failed.push({ 
          student, 
          error: "Record already exists on the blockchain." 
        });
      } else {
        batch.push(student);
      }
    });

    if (batch.length === 0) {
      toast.success(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: All records already exist. Skipping.`);
      continue;
    }
    // -------------------------------------------
    
    // Prepare arrays for Solidity (using the filtered batch)
    const studentIds = batch.map(
      (s) => `${s.enrollmentNumber.trim().toUpperCase()}-${s.semester.trim()}`
    );
    const hashes = batch.map((s) => generateMarksheetHash(s.marks));

    try {
      const toastId = toast.loading(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: Waiting for one signature for ${batch.length} new students...`);

      const tx = await contractInstance.batchStoreHashes(studentIds, hashes);

      toast.loading(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: Mining on Sepolia...`, { id: toastId });

      // Wait for block confirmation before proceeding to next batch
      const receipt = await tx.wait(); 
      
      if (receipt.status === 1) {
        successful.push(...batch);
        toast.success(`Batch ${Math.floor(i / BATCH_SIZE) + 1} finalized on-chain!`, { id: toastId });
      } else {
        throw new Error("Transaction reverted on-chain.");
      }

    } catch (batchError: any) {
      console.error(`Batch Error Log:`, batchError);
      
      if (batchError.code === 'ACTION_REJECTED' || batchError.code === 4001) {
        toast.error("User rejected transaction. Bulk upload stopped.");
        break; 
      }

      // If it fails here, check if your wallet is authorized in the contract!
      toast.error(`Batch failed. Check console for revert details.`);
      batch.forEach(s => failed.push({ student: s, error: "Batch call failed" }));
    }

    if (onProgress) {
      onProgress(Math.min(i + BATCH_SIZE, students.length), students.length);
    }

    // Delay to prevent RPC rate limiting (spam alert)
    if (i + BATCH_SIZE < students.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return { successful, failed, totalProcessed: successful.length + failed.length };
};

export const storeMarksheetHashOnBlockchain = async (
  contractInstance: Contract,
  enrollmentNumber: string,
  semester: string,
  subjects?: any
): Promise<boolean> => {
  if (!contractInstance) return false;
  try {
    const studentId = `${enrollmentNumber.trim().toUpperCase()}-${semester.trim()}`;
    const hash = generateMarksheetHash(subjects);
    const tx = await contractInstance.storeHash(studentId, hash, { gasLimit: 500000 });
    await tx.wait();
    toast.success("Record saved successfully");
    return true;
  } catch (error) {
    console.error("Single storage error:", error);
    toast.error("Failed to save record");
    return false;
  }
};

export const verifyHashFromBlockchain = async (
  enrollmentNumber: string,
  semesterNumber: string,
  backendHash: string
): Promise<boolean> => {
  try {
    const provider = new ethers.JsonRpcProvider(PUBLIC_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const studentId = `${enrollmentNumber.trim().toUpperCase()}-${semesterNumber.trim()}`;
    const storedHash = await contract.getStoredHash(studentId);

    if (storedHash === ethers.ZeroHash) {
      toast.error("No record found.");
      return false;
    }
    if (storedHash.toLowerCase() !== backendHash.toLowerCase()) {
      toast.error("Verification FAILED. Data mismatch.");
      return false;
    }
    toast.success("Verified on Blockchain!");
    return true;
  } catch (error) {
    console.error("Verification error:", error);
    return false;
  }
};