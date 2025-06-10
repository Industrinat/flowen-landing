"use client";
import { useEffect, useState } from "react";
import { Paperclip, X } from "lucide-react";

export default function DemoUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);

  const [senderName, setSenderName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [sendStatus, setSendStatus] = useState("");

  // Läs verifieringsstatus direkt från URL vid sidladdning
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get("verified");
    const emailParam = urlParams.get("email");

    if (verified === "true" && emailParam) {
      setIsVerified(true);
      setEmail(emailParam);
      setEmailSent(true);
      setTimeout(() => {
        window.history.replaceState({}, document.title, "/upload");
      }, 2000);
    }
  }, []);

  // Polling: kontrollera om e-post verifierats
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (emailSent && !isVerified) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/check-verification?email=${email}`
          );
          const data = await res.json();
          if (data.verified) {
            setIsVerified(true);
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Verification check failed", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [emailSent, isVerified, email]);

  const handleEmailSubmit = async () => {
    if (!email.includes("@") || !acceptedTerms) {
      setEmailError("Please enter a valid email address and accept the terms.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      if (data.message?.includes("success")) {
        setEmailSent(true);
        setEmailError("");
      } else {
        setEmailError("There was an issue sending the email. Please try again.");
      }
    } catch {
      setEmailError("There was an error sending the email.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const confirmUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const urls: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        urls.push(data.url);
      }

      setFileUrls(urls);
      setUploaded(true);
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const sendEmailWithLinks = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/send-links`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderName,
            recipientEmail,
            fileUrls,
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setSendStatus("✅ Email sent successfully!");
      } else {
        setSendStatus("❌ Failed to send email.");
      }
    } catch (err) {
      console.error(err);
      setSendStatus("❌ Error sending email.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto mt-10 border rounded-xl shadow bg-white text-black">
      <h2 className="text-2xl font-bold mb-6 text-center">Share Files Free with Flowen</h2>

      {!emailSent && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Step 1: Enter your email</h3>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="Enter your email"
          />
          <div className="mt-4 space-y-2 text-sm">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1"
              />
              <span>
                I agree that Flowen may temporarily store my email for delivery and verification.
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={acceptedMarketing}
                onChange={(e) => setAcceptedMarketing(e.target.checked)}
                className="mt-1"
              />
              <span>
                I want to receive updates from Flowen (max 1/month).
              </span>
            </label>
          </div>
          <button
            onClick={handleEmailSubmit}
            className="w-full mt-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Send Verification Email
          </button>
          {emailError && <p className="text-red-600 mt-3 text-sm">{emailError}</p>}
        </div>
      )}

      {emailSent && !isVerified && (
        <p className="text-yellow-700 text-center mb-6">📩 Please verify your email to continue…</p>
      )}

      {isVerified && !uploaded && (
        <>
          <p className="text-green-700 text-center mb-6">✅ Email verified!</p>
          <h3 className="text-lg font-semibold mb-2">Step 2: Upload your file(s)</h3>

          <div className="mb-4">
            <button
              onClick={() => document.getElementById("hiddenFileInput")?.click()}
              className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Paperclip className="w-5 h-5" />
              <span>{files.length > 0 ? "Add More Files" : "Select Files"}</span>
            </button>
            <input
              type="file"
              id="hiddenFileInput"
              className="hidden"
              onChange={handleFileChange}
              multiple
            />
          </div>

          {files.length > 0 && (
            <div className="mb-4 space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border px-3 py-2 rounded bg-gray-100"
                >
                  <span className="truncate">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-800"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={confirmUpload}
                className="w-full mt-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Confirm Upload"}
              </button>
            </div>
          )}
        </>
      )}

      {uploaded && (
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Step 3: Share your file(s)</h3>
          <p className="text-gray-700 mb-6">Your files have been uploaded. Share the link(s) below or send them via email:</p>

          <div className="space-y-4 mb-6">
            {fileUrls.map((url, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2 border px-3 py-2 rounded bg-gray-100">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-blue-700 text-sm"
                >
                  {url}
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(url)}
                  className="text-sm text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-4 text-left">
            <input
              type="text"
              placeholder="Your name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
            <input
              type="email"
              placeholder="Recipient's email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
            <button
              onClick={sendEmailWithLinks}
              className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Send files via email
            </button>
            {sendStatus && <p className="text-center text-sm mt-2">{sendStatus}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
