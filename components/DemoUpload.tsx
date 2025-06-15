"use client";

import React, { useState, useEffect } from 'react';
import { Upload, X, Plus, Send, User, Mail } from 'lucide-react';

interface UploadResponse {
  success: boolean;
  message: string;
  uploadId: string;
  originalName: string;
  size: number;
  shareUrl: string;
}

interface DemoUploadProps {
  requireEmailVerification?: boolean;
  userEmail?: string;
}

const DemoUpload: React.FC<DemoUploadProps> = ({ requireEmailVerification = true, userEmail }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [acceptNewsletter, setAcceptNewsletter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResponse[]>([]);
  
  // Send form states
  const [senderName, setSenderName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (requireEmailVerification) {
      const urlParams = new URLSearchParams(window.location.search);
      const verified = urlParams.get('verified');
      const emailParam = urlParams.get('email');
      
      if (verified === 'true' && emailParam) {
        setEmail(emailParam);
        setStep(3);
      } else {
        setStep(1);
      }
    } else {
      setStep(3);
    }
  }, [requireEmailVerification]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!acceptNewsletter) {
      setError('You must accept our terms to use this service');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${apiUrl}/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          acceptMarketing: acceptNewsletter,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2);
      } else {
        setError(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    setError('');
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const removeAllFiles = () => {
    setSelectedFiles([]);
    setUploadResults([]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const confirmUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError('');
    const results: UploadResponse[] = [];

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${apiUrl}/upload`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success && data.shareUrl) {
          results.push(data);
        } else {
          throw new Error(data.error || "Upload failed");
        }
      }

      setUploadResults(results);
      setStep(4);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSendFiles = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!senderName || !recipientEmail) {
      setError('Please fill in your name and recipient email');
      return;
    }

    if (uploadResults.length === 0) {
      setError('No files to send');
      return;
    }

    setSending(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${apiUrl}/send-files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderName,
          senderEmail: email,
          recipientEmail,
          message,
          files: uploadResults.map(result => ({
            name: result.originalName,
            shareUrl: result.shareUrl,
            size: result.size
          }))
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(5);
      } else {
        setError(data.error || 'Failed to send files');
      }
    } catch (error) {
      console.error('Send error:', error);
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Step 1: Email Verification
  if (requireEmailVerification && step === 1) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-3">Share Files Free with Flowen</h2>
          <p className="text-indigo-200">Enter your email to get started</p>
        </div>
        
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 bg-white/20 backdrop-blur border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="newsletter"
              checked={acceptNewsletter}
              onChange={(e) => setAcceptNewsletter(e.target.checked)}
              className="mt-1 h-5 w-5 text-blue-500 bg-white/20 border-white/30 rounded focus:ring-blue-400"
              required
            />
            <label htmlFor="newsletter" className="text-sm text-white/90 leading-relaxed">
              I agree that Flowen may store my email for file sharing and accept receiving updates (max 1/month).
            </label>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition duration-300 shadow-lg"
          >
            {isLoading ? 'Sending...' : 'Start File Sharing'}
          </button>
        </form>
      </div>
    );
  }

  // Step 2: Email Sent
  if (requireEmailVerification && step === 2) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 text-center">
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">📧</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Check Your Email!</h2>
        <p className="text-indigo-200 mb-6">
          We've sent a verification link to: <strong className="text-white">{email}</strong>
        </p>
        <p className="text-sm text-white/70 mb-8">
          Click the link in your email to continue to file upload.
        </p>
        <button 
          onClick={() => setStep(3)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition duration-300 shadow-lg"
        >
          I've verified my email
        </button>
      </div>
    );
  }

  // Step 3: File Upload
  if (step === 3) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
        {requireEmailVerification && (
          <div className="text-center mb-6">
            <p className="text-sm text-green-400">✅ Verified: {email || userEmail}</p>
          </div>
        )}
        
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Share Files Free with Flowen
          </h2>
          <p className="text-indigo-200 text-lg">
            Upload your files and get ready to share
          </p>
        </div>

        <div className="border-2 border-dashed border-white/30 rounded-2xl p-12 text-center hover:border-blue-400/50 transition-colors bg-white/5">
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="mx-auto h-16 w-16 text-white/70 mb-6" />
            <p className="text-xl text-white mb-3">
              Click to select files or drag and drop
            </p>
            <p className="text-sm text-white/70">
              Max 100MB per file • Select multiple files
            </p>
          </label>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Selected files ({selectedFiles.length}):</h3>
              <button
                onClick={removeAllFiles}
                className="text-red-400 hover:text-red-300 text-sm font-medium"
              >
                Remove all
              </button>
            </div>
            
            <div className="space-y-3 mb-6">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{file.name}</p>
                    <p className="text-sm text-white/70">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => document.getElementById('file-upload')?.click()}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-colors border border-white/30"
              >
                <Plus className="h-5 w-5" />
                Upload more files
              </button>
              
              <button
                onClick={confirmUpload}
                disabled={uploading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition duration-300 shadow-lg"
              >
                {uploading ? 'Uploading...' : `Continue with ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl">
            <p className="text-red-200">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // Step 4: Send Form
  if (step === 4) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Send Your Files</h2>
          <p className="text-indigo-200">
            {uploadResults.length} file{uploadResults.length > 1 ? 's' : ''} ready to send
          </p>
        </div>

        <div className="bg-white/5 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Files to send:</h3>
          <div className="space-y-2">
            {uploadResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-white/90">{result.originalName}</span>
                <span className="text-white/60">{formatFileSize(result.size)}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSendFiles} className="space-y-6">
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              <User className="inline h-4 w-4 mr-2" />
              Your name
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              <Mail className="inline h-4 w-4 mr-2" />
              Recipient email
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Enter recipient's email"
              required
            />
          </div>

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
              placeholder="Add a personal message..."
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
            )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-colors border border-white/30"
            >
              Back to files
            </button>
            
            <button
              type="submit"
              disabled={sending}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition duration-300 shadow-lg"
            >
              <Send className="h-5 w-5" />
              {sending ? 'Sending...' : 'Send Files'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step 5: Success
  if (step === 5) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 text-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Files Sent Successfully!</h2>
        <p className="text-indigo-200 mb-6">
          Your files have been sent to: <strong className="text-white">{recipientEmail}</strong>
        </p>
        <p className="text-sm text-white/70 mb-8">
          They will receive an email with download links that work for 7 days.
        </p>
        <button 
          onClick={() => {
            setStep(3);
            setSelectedFiles([]);
            setUploadResults([]);
            setSenderName('');
            setRecipientEmail('');
            setMessage('');
          }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition duration-300 shadow-lg"
        >
          Send More Files
        </button>
      </div>
    );
  }

  return null;
};

export default DemoUpload;