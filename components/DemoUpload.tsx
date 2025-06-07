"use client";
import { useState } from "react";
import { Paperclip } from "lucide-react";

export default function DemoUpload() {
  const [file, setFile] = useState<File | null>(null); // ✅ Type fix
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState("");

  const handleFileSelect = () => {
    document.getElementById("hiddenFileInput")?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setUrl(data.url);
    } catch (err) {
      alert("An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto mt-10 border rounded-xl shadow bg-white text-black">
      <h2 className="text-2xl font-bold mb-6 text-center">Try Flowen Without an Account</h2>

      {/* STEP 1 */}
      <div className="mb-4">
        <p className="font-semibold text-sm mb-2 hover:underline underline-offset-4 cursor-default transition">
          STEP 1: Upload File
        </p>

        <button
          onClick={handleFileSelect}
          className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <Paperclip className="w-5 h-5" />
          <span className="hover:underline underline-offset-2">
            {file ? "Change File" : "Select File"}
          </span>
        </button>

        <input
          type="file"
          id="hiddenFileInput"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />

        {file && (
          <p className="mt-2 text-sm text-gray-700">
            Selected: <span className="font-medium">{file.name}</span>
          </p>
        )}

        <p className="text-xs text-gray-500 text-center mt-2">
          Accepted formats: Most file types including CAD, PDF, Word, Excel, code files, etc.
        </p>
      </div>

      {/* STEP 2 */}
      <div className="mb-6">
        <p className="font-semibold text-sm mb-2 hover:underline underline-offset-4 cursor-default transition">
          STEP 2: Confirm Upload
        </p>
        <button
          onClick={handleUpload}
          className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          disabled={uploading}
        >
          <span className="hover:underline underline-offset-2">
            {uploading ? "Uploading..." : "Confirm Upload"}
          </span>
        </button>
      </div>

      {/* RESULT */}
      {url && (
        <div className="text-center mt-4">
          <p className="text-green-700 font-semibold mb-2">File uploaded successfully!</p>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded hover:underline"
          >
            View uploaded file
          </a>
        </div>
      )}
    </div>
  );
}
