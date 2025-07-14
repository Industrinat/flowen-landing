"use client";

import React, { useState, useEffect } from 'react';
import { Upload, X, Plus, Send, User, Mail } from 'lucide-react';

// Interfaces
interface UploadResponse {
  success: boolean;
  encrypted: boolean;
  url: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  encryptedSize: number;
  uploadTime: string;
  version: string;
}

interface DemoUploadProps {
  requireEmailVerification?: boolean;
  userEmail?: string;
}

// Global window type extension
declare global {
  interface Window {
    getAccessToken?: () => string | null;
  }
}

const DemoUpload: React.FC<DemoUploadProps> = ({ 
  requireEmailVerification = false, 
  userEmail 
}) => {
  // States
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [acceptNewsletter, setAcceptNewsletter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  
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
    // Hoppa direkt till fil-upload (step 3)
    setStep(3);
    
    // Ensure getAccessToken is available
    if (typeof window !== 'undefined' && !window.getAccessToken) {
      window.getAccessToken = () => localStorage.getItem('access_token');
    }
  }, []);
    
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
      const response = await fetch('/api/send-verification', {
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

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...droppedFiles]);
    setError('');
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
      console.log('🚀 Startar säker upload med ny backend...');
      
      // Hämta access token
      const accessToken = window.getAccessToken?.() || localStorage.getItem('access_token');
      
      if (!accessToken) {
        throw new Error('Please login to upload files. Go to /login to authenticate.');
      }

      for (const file of selectedFiles) {
        console.log(`📤 Uploading: ${file.name} (${formatFileSize(file.size)})`);
        
        // Skapa FormData med RAW fil (backend hanterar kryptering)
        const formData = new FormData();
        formData.append('file', file);

        // Upload med säker backend
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData,
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          
          if (response.status === 401) {
            throw new Error('Authentication failed. Please login again.');
          }
          
          console.error('Upload error:', errorData);
          throw new Error(`Upload failed for ${file.name}: ${errorData.error || response.statusText}`);
        }

        const data: UploadResponse = await response.json();
        console.log('✅ Upload success:', data);
        
        if (data.success) {
          results.push(data);
          console.log(`✅ ${file.name} - Securely encrypted and uploaded (v${data.version})`);
        } else {
          throw new Error("Upload failed - no success flag");
        }
      }

      setUploadResults(results);
      setStep(4);
      
      console.log(`🎉 All files uploaded successfully! Total: ${results.length}`);
      
    } catch (error) {
      console.error('❌ Upload error:', error);
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
      console.log('📧 Sending secure download links...');
      
      const response = await fetch('/api/send-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderName,
          senderEmail: email || 'admin@flowen.se',
          recipientEmail,
          message: message || 'Here are your securely encrypted files from Flowen.eu',
          files: uploadResults.map(result => ({
            name: result.originalName,
            shareUrl: `${window.location.origin}${result.url}`, // Full URL för email
            size: result.size,
            encrypted: result.encrypted,
            version: result.version
          }))
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Email sent successfully:', data);
        setStep(5);
      } else {
        setError(data.error || 'Failed to send files');
      }
    } catch (error) {
      console.error('❌ Send error:', error);
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Step 1: Email Verification
  if (requireEmailVerification && step === 1) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <p className="text-indigo-200">Enter your email to get started with file sharing</p>
        </div>
        
        <div className="max-w-md mx-auto">
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
      </div>
    );
  }

  // Step 2: Email Sent
  if (requireEmailVerification && step === 2) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
        <div className="max-w-md mx-auto text-center">
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-sm text-white/60">Waiting for email verification...</p>
          <p className="text-xs text-white/40 mt-2">
            You must click the link in your email to proceed
          </p>
        </div>
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
        
        {/* Security Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full">
            <span className="text-green-400">🔐</span>
            <span className="text-green-300 text-sm font-medium">AES-256-GCM Encryption v2.0</span>
          </div>
        </div>
      
        <div className="text-center mb-8">
          <p className="text-indigo-200 text-lg">
            Upload your files and get ready to share securely
          </p>
        </div>

        <div 
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 bg-white/5 ${
            isDragOver 
              ? 'border-blue-400 bg-blue-50/10 scale-105' 
              : 'border-white/30 hover:border-blue-400/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
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
              Max 100MB per file • Select multiple files • EU-compliant encryption
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
                {uploading ? 'Encrypting & Uploading...' : `Continue with ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl">
            <p className="text-red-200">{error}</p>
            {error.includes('login') && (
              <p className="text-red-300 text-sm mt-2">
                Go to <a href="/login" className="underline hover:text-red-200">/login</a> to authenticate first.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Step 4: Send Form
  if (step === 4) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full mb-4">
            <span className="text-green-400">✅</span>
            <span className="text-green-300 text-sm font-medium">
              {uploadResults.length} file{uploadResults.length > 1 ? 's' : ''} encrypted and ready
            </span>
          </div>
          <p className="text-indigo-200">
            Send secure download links to recipient
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/5 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Encrypted files to send:</h3>
            <div className="space-y-2">
              {uploadResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <span className="text-white/90 font-medium">{result.originalName}</span>
                    <div className="text-white/60 text-xs">
                      {formatFileSize(result.size)} → {formatFileSize(result.encryptedSize)} (encrypted v{result.version})
                    </div>
                  </div>
                  <span className="text-green-400 text-xs">🔐</span>
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
                {sending ? 'Sending secure links...' : 'Send Files'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Step 5: Success
  if (step === 5) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Files Sent Successfully!</h2>
          <p className="text-indigo-200 mb-4">
            Your encrypted files have been sent to: <strong className="text-white">{recipientEmail}</strong>
          </p>
          <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-4 mb-6">
            <p className="text-green-300 text-sm">
              🔐 All files encrypted with AES-256-GCM<br/>
              📧 Secure download links sent via email<br/>
              ⏰ Links valid for 7 days
            </p>
          </div>
          <button 
            onClick={() => {
              setStep(3);
              setSelectedFiles([]);
              setUploadResults([]);
              setSenderName('');
              setRecipientEmail('');
              setMessage('');
              setError('');
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition duration-300 shadow-lg"
          >
            Send More Files
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default DemoUpload;