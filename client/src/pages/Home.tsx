import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils/utils";
import {
  parseExcelFile,
  processBulkMarksheets,
  storeMarksheetHashOnBlockchain,
  BatchResult,
} from "../utils/blockchain";
import { connectWallet } from "../utils/ConnectWallet";
import { Contract } from "ethers";

const subjectOptions: Record<string, string[]> = {
  "1": [
    "Mathematics I",
    "Electronics",
    "Chemistry",
    "Mechanical Engineering",
    "Programming",
  ],
  "2": ["Mathematics II", "Physics", "Electrical", "Mechanics", "Graphics"],
  "3": [
    "Dicrete Mathematics",
    "Data Structures",
    "Logic Design and Computer Organization",
    "Object Oriented Programming",
    "Basics of Computer Network",
  ],
  "4": [
    "Mathematics- III ",
    "Database Systems",
    "Processor Architecture",
    "Software Engineering",
    "Computer Graphics",
  ],
  "5": [
    "Theory of Computation",
    "Operating Systems ",
    "Machine Learning",
    "Human ComputerInteraction",
    "Adv Data Structures",
  ],
  "6": [
    "Computer Network and Security",
    "Data Science and Big Data Analytics",
    "Cloud Computing",
    "Internship",
    "Web Application Development ",
  ],
  "7": [
    "Deep Learning",
    "Software Project Management ",
    "Information and Storage Retrieval",
    "Internet of Things",
    "Quantum Computing",
  ],
  "8": [
    "Distributed Systems",
    "Software Defined Network",
    "Ethics in Technology",
    "Blockchain Technology",
    "Seminar",
  ],
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [semester, setSemester] = useState<string>("");
  const [subjects, setSubjects] = useState<{ name: string; marks: string }[]>(
    []
  );
  const [name, setName] = useState<string>("");
  const [enrollmentNumber, setEnrollmentNumber] = useState<string>("");
  const [contract, setContract] = useState<Contract | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    if (!user) navigate("/login");
    else setLoggedInUser(user);

    const initBlockchain = async () => {
      const connection = await connectWallet();
      if (connection) setContract(connection.contractInstance);
      else console.log("Blockchain initialization failed, contract not set.");
    };
    initBlockchain();
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
      setBatchResult(null);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleBulkSubmit = async () => {
    if (!file) return handleError("Please select an Excel file first.");
    if (!contract)
      return handleError(
        "Blockchain connection is not available. Please connect your wallet."
      );

    setIsProcessing(true);
    setBatchResult(null);
    setProgress({ current: 0, total: 0 });

    try {
      const students = await parseExcelFile(file);
      const onProgressUpdate = (current: number, total: number) =>
        setProgress({ current, total });
      const result = await processBulkMarksheets(
        contract,
        students,
        onProgressUpdate
      );
      setBatchResult(result);
    } catch (error) {
      console.error("Bulk processing failed:", error);
      handleError(
        (error as Error).message ||
          "An unexpected error occurred during file processing."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setName(e.target.value);
  const handleEnrollmentChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEnrollmentNumber(e.target.value);
  const handleSemesterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if ((value > 0 && value < 9) || e.target.value === "") {
      setSemester(e.target.value);
      setSubjects([]);
    } else {
      handleError("Semester must be between 1 and 8!");
    }
  };
  const handleSubjectChange = (index: number, value: string) => {
    const isDuplicate = subjects.some(
      (s, i) =>
        i !== index &&
        s.name.trim().toLowerCase() === value.trim().toLowerCase()
    );
    if (isDuplicate) return handleError(`"${value}" is already added`);
    const updated = [...subjects];
    updated[index].name = value;
    setSubjects(updated);
  };
  const handleMarksChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && Number(value) <= 100) {
      const updated = [...subjects];
      updated[index].marks = value;
      setSubjects(updated);
    } else if (Number(value) > 100) {
      handleError("Marks cannot be greater than 100");
    }
  };
  function getGrade(marks: number): string {
    if (marks >= 80) return "O";
    if (marks >= 70) return "A+";
    if (marks >= 60) return "A";
    if (marks >= 55) return "B+";
    if (marks >= 50) return "B";
    if (marks >= 45) return "C";
    if (marks >= 40) return "P";
    return "F";
  }
  const addSubject = () => {
    if (!semester) return handleError("Please select a semester first");
    if (subjects.length < 5)
      setSubjects([...subjects, { name: "", marks: "" }]);
    else handleError("You can add exactly 5 subjects");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract)
      return handleError(
        "Blockchain connection not available. Please connect your wallet."
      );
    if (
      !name.trim() ||
      !enrollmentNumber.trim() ||
      !semester ||
      subjects.length !== 5 ||
      subjects.some((s) => !s.name.trim() || !s.marks.trim())
    ) {
      return handleError(
        "Please fill out all fields and add exactly 5 subjects."
      );
    }
    if (
      new Set(subjects.map((s) => s.name.trim().toLowerCase())).size !==
      subjects.length
    ) {
      return handleError("Duplicate subjects found. Please remove duplicates.");
    }

    try {
      handleSuccess("Submitting... Please wait.");

      const blockchainSuccess = await storeMarksheetHashOnBlockchain(
        contract,
        enrollmentNumber,
        semester,
        subjects
      );
      if (!blockchainSuccess)
        return handleError(
          "Failed to store hash on blockchain. Please try again."
        );

      const studentDataForPdf = {
        name: name.trim(),
        enrollmentNumber: enrollmentNumber.trim(),
        semester: semester,
        subjects: subjects.map((s) => ({
          name: s.name.trim(),
          grade: getGrade(Number(s.marks)),
        })),
      };
      const gradePoints = {
        O: 10,
        "A+": 9,
        A: 8,
        "B+": 7,
        B: 6,
        C: 5,
        P: 4,
        F: 0,
      };
      const totalGradePoints = studentDataForPdf.subjects.reduce(
        (total, s) =>
          total + (gradePoints[s.grade as keyof typeof gradePoints] || 0),
        0
      );
      const sgpa = (
        totalGradePoints / studentDataForPdf.subjects.length
      ).toFixed(2);

      localStorage.setItem("studentData", JSON.stringify(studentDataForPdf));
      localStorage.setItem("sgpa", sgpa);

      handleSuccess("Marksheet generated successfully!");
      navigate("/marksheet");
    } catch (error) {
      console.error("Error in submission process:", error);
      handleError((error as Error).message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Welcome, {loggedInUser || "Guest"}
        </h2>

        <div className="flex justify-center border-b-2 mb-6">
          <button
            onClick={() => setMode("single")}
            className={`px-4 py-2 text-lg font-medium transition-colors duration-300 ${
              mode === "single"
                ? "border-b-4 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}>
            Single Entry
          </button>
          <button
            onClick={() => setMode("bulk")}
            className={`px-4 py-2 text-lg font-medium transition-colors duration-300 ${
              mode === "bulk"
                ? "border-b-4 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}>
            Bulk Upload
          </button>
        </div>

        {mode === "single" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Enter Name:
              </label>
              <input
                type="text"
                value={name}
                placeholder="Enter Your Name"
                onChange={handleNameChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Enter Enrollment Number:
              </label>
              <input
                type="text"
                value={enrollmentNumber}
                placeholder="I2K123456"
                onChange={handleEnrollmentChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Enter Semester:
              </label>
              <input
                type="number"
                value={semester}
                onChange={handleSemesterChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="8"
                required
              />
            </div>
            {subjects.map((subject, index) => (
              <div key={index} className="flex flex-col">
                <label className="text-gray-700 font-medium">
                  Subject {index + 1}:
                </label>
                <select
                  value={subject.name}
                  onChange={(e) => handleSubjectChange(index, e.target.value)}
                  className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  required>
                  <option value="">--Select Subject--</option>
                  {semester &&
                    subjectOptions[semester]?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                </select>
                <input
                  type="number"
                  value={subject.marks}
                  onChange={(e) => handleMarksChange(index, e.target.value)}
                  placeholder="Enter Marks (0-100)"
                  className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addSubject}
              disabled={subjects.length >= 5}
              className={`w-full py-2 rounded-lg transition ${
                subjects.length >= 5
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}>
              + Add Subject
            </button>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
              Submit Marks
            </button>
          </form>
        )}

        {mode === "bulk" && (
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Upload Excel File
              </label>
              <p className="text-sm text-gray-500 mb-2">
                File must contain columns: "Enrollment Number" and "Semester".
              </p>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <button
              onClick={handleBulkSubmit}
              disabled={!file || isProcessing}
              className="w-full bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center">
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Upload and Verify on Blockchain"
              )}
            </button>
            {isProcessing && (
              <div className="text-center">
                <p className="font-semibold text-lg">
                  Processing: {progress.current} / {progress.total}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{
                      width: `${(progress.current / progress.total) * 100}%`,
                    }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Please do not close this window. This may take a few minutes.
                </p>
              </div>
            )}
            {batchResult && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-xl font-bold text-center mb-4">
                  Processing Complete
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-green-100 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">
                      {batchResult.successful.length}
                    </p>
                    <p className="text-sm font-medium text-green-800">
                      Successful
                    </p>
                  </div>
                  <div className="bg-red-100 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-red-700">
                      {batchResult.failed.length}
                    </p>
                    <p className="text-sm font-medium text-red-800">Failed</p>
                  </div>
                </div>
                {batchResult.failed.length > 0 && (
                  <div className="mt-4">
                    <p className="font-semibold">Details for failed entries:</p>
                    <ul className="list-disc list-inside text-sm text-red-600 max-h-40 overflow-y-auto">
                      {batchResult.failed.map((f, i) => (
                        <li key={i}>
                          {f.student.enrollmentNumber} (Sem {f.student.semester}
                          ): {f.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Home;
