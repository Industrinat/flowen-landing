// app/download/[id]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { decryptFile, base64ToKey } from '@/lib/crypto';
import { getApiUrl } from '@/lib/api-utils';  

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DownloadPage({ params }: PageProps) {
  // Use React.use to unwrap params
  const { id: fileId } = use(params);
  
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [decryptedBlob, setDecryptedBlob] = useState<Blob | null>(null);

  const encryptionKey = searchParams.get('key');

  useEffect(() => {
    if (!fileId || !encryptionKey) {
      setError('Missing file ID or encryption key');
      setStatus('error');
      return;
    }

    fetchAndDecryptFile();
  }, [fileId, encryptionKey]);

  const fetchAndDecryptFile = async () => {
    try {
      // Check if this is a mock file (development mode)
      if (fileId.startsWith('mock_')) {
        // For mock files, simulate the encrypted data
        setStatus('ready');
        setFileInfo({
          name: 'Demo_File.pdf',
          size: 1024 * 50, // 50KB mock file
          type: 'application/pdf'
        });
        
        // Create a mock blob for demo purposes
        const mockContent = new Uint8Array([37, 80, 68, 70]); // PDF header
        const mockBlob = new Blob([mockContent], { type: 'application/pdf' });
        setDecryptedBlob(mockBlob);
        
        return;
      }

      // For real files, fetch metadata from backend
     const backendUrl = getApiUrl();
const metadataResponse = await fetch(`${backendUrl}/api/download/${fileId}`);
      
      if (!metadataResponse.ok) {
        throw new Error('File not found');
      }

      // Backend returns metadata for encrypted files
      const metadata = await metadataResponse.json();
      
      if (metadata.encrypted) {
        // Fetch the actual encrypted file
        const encryptedFileResponse = await fetch(`${backendUrl}${metadata.url}`);
        const encryptedArrayBuffer = await encryptedFileResponse.arrayBuffer();
        
        // Convert encryption key from base64
        if (!encryptionKey) {
  throw new Error('Encryption key is missing');
}
        const key = base64ToKey(encryptionKey);
        
        // Parse IV from the metadata
        const iv = base64ToKey(metadata.iv);
        
        // Decrypt
        const encryptedData = new Uint8Array(encryptedArrayBuffer);
        const decryptedData = await decryptFile(encryptedData, key, iv);
        
        // Create blob from decrypted data
        const mimeType = metadata.mimeType || guessMimeType(metadata.originalName || fileId);
        const blob = new Blob([decryptedData], { type: mimeType });
        
        setDecryptedBlob(blob);
        setFileInfo({
          name: metadata.originalName || fileId,
          size: blob.size,
          type: mimeType
        });
        setStatus('ready');
      } else {
        // For non-encrypted files, download directly
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/download/${fileId}`;
      }
      
    } catch (err) {
      console.error('Decryption error:', err);
      setError(err instanceof Error ? err.message : 'Failed to decrypt file');
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (!decryptedBlob || !fileInfo) return;
    
    const url = URL.createObjectURL(decryptedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileInfo.name;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const guessMimeType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed'
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Decrypting file...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center max-w-md">
          <div className="bg-red-500/20 backdrop-blur-lg text-white p-6 rounded-lg mb-4 border border-red-400/30">
            <h2 className="text-xl font-semibold mb-2">Download Error</h2>
            <p>{error}</p>
          </div>
          <a href="/" className="text-blue-300 hover:text-blue-200 hover:underline">
            Return to homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Secure Download</h1>
          <p className="text-indigo-200 mb-6">
            Your file has been decrypted and is ready to download.
          </p>
        </div>

        {fileInfo && (
          <div className="bg-white/5 p-4 rounded-lg mb-6 border border-white/10">
            <p className="text-sm text-indigo-200 mb-1">File name:</p>
            <p className="font-medium text-white">{fileInfo.name}</p>
            <p className="text-sm text-indigo-200 mb-1 mt-3">File size:</p>
            <p className="font-medium text-white">{formatFileSize(fileInfo.size)}</p>
            <p className="text-sm text-indigo-200 mb-1 mt-3">Encryption:</p>
            <p className="font-medium text-green-400">✓ AES-256 GCM</p>
          </div>
        )}

        <button
          onClick={handleDownload}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl transition duration-300 shadow-lg flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          Download Decrypted File
        </button>

        <p className="text-xs text-indigo-300 text-center mt-4">
          This file was encrypted with AES-256-GCM encryption
        </p>
      </div>
    </div>
  );
}