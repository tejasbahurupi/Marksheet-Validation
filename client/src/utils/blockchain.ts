import { ethers, Contract } from "ethers";
import { toast } from "react-hot-toast";
import * as ExcelJS from "exceljs";
import { CONTRACT_ADDRESS, CONTRACT_ABI, PUBLIC_RPC_URL } from "../constants";

// Interfaces
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

export const generateMarksheetHash = (marks?: any): string => {
  console.log("Generating hash for marks:", marks);
  return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(marks)));
};

export const generateQrCodeData = (marks: any): string => {
  const hash = generateMarksheetHash(marks);
  return hash;
};

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
        if (!worksheet)
          throw new Error("No worksheets found in the Excel file.");

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

          // FIX: Ensure all required fields are converted to strings
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

        const validStudents = students.filter(
          (s) => s.enrollmentNumber && s.semester
        );
        if (validStudents.length === 0) {
          throw new Error(
            'No valid data found. Ensure Excel has "Enrollment Number" and "Semester" columns.'
          );
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
  ``;
};

export const processBulkMarksheets = async (
  contractInstance: Contract,
  students: StudentData[],
  onProgress?: (current: number, total: number) => void
): Promise<BatchResult> => {
  if (!contractInstance) {
    toast.error("Blockchain connection not available.");
    return { successful: [], failed: [], totalProcessed: 0 };
  }
  const BATCH_SIZE = 5;
  const successful: StudentData[] = [];
  const failed: { student: StudentData; error: string }[] = [];

  try {
    for (let i = 0; i < students.length; i += BATCH_SIZE) {
      const batch = students.slice(i, i + BATCH_SIZE);
      const studentIds = batch.map(
        (s) => `${s.enrollmentNumber.trim().toUpperCase()}-${s.semester.trim()}`
      );
      const hashes = batch.map((s) => generateMarksheetHash(s.marks));

      try {
        const tx = await contractInstance.batchStoreHashes(studentIds, hashes);
        await tx.wait();
        successful.push(...batch);
        toast.success(
          `Batch ${Math.floor(i / BATCH_SIZE) + 1} processed successfully`
        );
      } catch (batchError: any) {
        console.error(
          `Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`,
          batchError
        );
        toast.error(`Batch failed. Trying individual transactions...`);

        for (const student of batch) {
          try {
            // FIX: Added 'student.marks' to ensure the correct hash is generated and stored.
            const success = await storeMarksheetHashOnBlockchain(
              contractInstance,
              student.enrollmentNumber,
              student.semester,
              student.marks
            );
            if (success) {
              successful.push(student);
            } else {
              failed.push({
                student,
                error: "Individual transaction was rejected.",
              });
            }
          } catch (individualError: any) {
            const message =
              individualError?.reason ||
              individualError?.message ||
              "Unknown error.";
            failed.push({ student, error: message });
          }
        }
      }
      if (onProgress) {
        onProgress(Math.min(i + BATCH_SIZE, students.length), students.length);
      }
      // Add a small delay between batches to avoid overwhelming the network/RPC node.
      if (i + BATCH_SIZE < students.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
    toast.success(
      `Bulk processing complete! ${successful.length} successful, ${failed.length} failed`
    );
  } catch (error) {
    console.error("Bulk processing error:", error);
    toast.error("A critical error occurred during bulk processing.");
  }
  return {
    successful,
    failed,
    totalProcessed: successful.length + failed.length,
  };
};

export const storeMarksheetHashOnBlockchain = async (
  contractInstance: Contract,
  enrollmentNumber: string,
  semester: string,
  subjects?: any
): Promise<boolean> => {
  if (!contractInstance) {
    toast.error("Blockchain connection not available");
    return false;
  }
  try {
    const studentId = `${enrollmentNumber
      .trim()
      .toUpperCase()}-${semester.trim()}`;
    console.log("Storing hash for student ID:", studentId);
    const hash = generateMarksheetHash(subjects);
    const tx = await contractInstance.storeHash(studentId, hash);
    await tx.wait();
    toast.success("Marksheet recorded on blockchain");
    return true;
  } catch (error) {
    console.error("Error storing hash on blockchain:", error);
    toast.error("Failed to record marksheet on blockchain");
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
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    );
    const studentId = `${enrollmentNumber
      .trim()
      .toUpperCase()}-${semesterNumber.trim()}`;
    const storedHash = await contract.getStoredHash(studentId);

    if (storedHash === ethers.ZeroHash) {
      toast.error("No record found on the blockchain.");
      return false;
    }
    if (storedHash.toLowerCase() !== backendHash.toLowerCase()) {
      toast.error(
        "Document verification FAILED. The record does not match the blockchain."
      );
      return false;
    }
    toast.success("Marksheet Verified Successfully!");
    return true;
  } catch (error) {
    console.error("Error fetching hash from blockchain:", error);
    toast.error("Failed to communicate with the blockchain.");
    return false;
  }
};
