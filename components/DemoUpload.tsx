"use client";
import React, { useState } from "react";

export default function DemoUpload() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  return (
    <div className="bg-white/10 p-6 rounded-xl w-full max-w-xl mx-auto text-white shadow-xl">
      <h2 className="text-2xl font-bold mb-4 text-center">Testa Flowen – utan konto</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          onChange={handleChange}
          multiple
          className="bg-white text-black p-2 rounded"
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded"
        >
          Ladda upp
        </button>
        {success && <p className="text-green-400 mt-2 text-center">✔️ Uppladdningen lyckades!</p>}
      </form>
    </div>
  );
}
