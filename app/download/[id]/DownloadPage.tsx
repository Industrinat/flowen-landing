"use client";

import React, { useState, useEffect } from 'react';
import { Download, Clock, Eye, AlertCircle, CheckCircle, FileText } from 'lucide-react';

interface FileInfo {
  id: string;
  originalName: string;
  size: number;
  uploadedAt: string;
  expiresAt: string;
  downloads: number;
}

interface DownloadPageProps {
  id: string;
}

const DownloadPage: React.FC<DownloadPageProps> = ({ id }) => {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilExpiry = (expiresAt: string): string => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Utgången';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} dag${diffDays > 1 ? 'ar' : ''} kvar`;
    } else if (diffHours > 0) {
      return `${diffHours} timm${diffHours > 1 ? 'ar' : 'e'} kvar`;
    } else {
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffMinutes} minut${diffMinutes > 1 ? 'er' : ''} kvar`;
    }
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    // Du kan lägga till fler ikoner baserat på filtyp
    return <FileText className="h-12 w-12 text-blue-500" />;
  };

  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/info/${id}`);
        const data = await response.json();

        if (response.ok) {
          setFileInfo(data);
        } else {
          setError(data.error || 'Fil hittades inte');
        }
      } catch (error) {
        console.error('Error fetching file info:', error);
        setError('Kunde inte hämta filinformation');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFileInfo();
    }
  }, [id]);

  const handleDownload = async () => {
    if (!fileInfo) return;

    setDownloading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/download/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Nedladdning misslyckades');
      }

      // Skapa blob från response
      const blob = await response.blob();
      
      // Skapa nedladdningslänk
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileInfo.originalName;
      document.body.appendChild(a);
      a.click();
      
      // Rensa upp
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Uppdatera nedladdningsräknare
      setFileInfo(prev => prev ? { ...prev, downloads: prev.downloads + 1 } : null);
      
    } catch (error) {
      console.error('Download error:', error);
      setError(error instanceof Error ? error.message : 'Nedladdning misslyckades');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Hämtar filinformation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Något gick fel</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/upload'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ladda upp ny fil
          </button>
        </div>
      </div>
    );
  }

  if (!fileInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Fil hittades inte</h1>
          <p className="text-gray-600">Länken kanske har gått ut eller är felaktig.</p>
        </div>
      </div>
    );
  }

  const isExpired = new Date(fileInfo.expiresAt) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Fildelning
          </h1>
          <p className="text-gray-600">
            Någon har delat en fil med dig
          </p>
        </div>

        {/* File Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {getFileIcon(fileInfo.originalName)}
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {fileInfo.originalName}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{formatFileSize(fileInfo.size)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{getTimeUntilExpiry(fileInfo.expiresAt)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{fileInfo.downloads} nedladdningar</span>
                </div>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                <p>Uppladdad: {formatDate(fileInfo.uploadedAt)}</p>
                <p>Går ut: {formatDate(fileInfo.expiresAt)}</p>
              </div>

              {!isExpired ? (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {downloading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Laddar ner...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Ladda ner fil
                    </>
                  )}
                </button>
              ) : (
                <div className="w-full bg-red-50 border border-red-200 text-red-700 py-3 px-6 rounded-lg text-center">
                  <AlertCircle className="h-5 w-5 inline mr-2" />
                  Denna länk har gått ut
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Säker fildelning</h3>
              <p className="text-sm text-blue-700">
                Denna fil delas säkert och kommer automatiskt att tas bort efter utgångsdatumet. 
                Inga personuppgifter sparas eller delas.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.location.href = '/upload'}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Vill du dela egna filer? Klicka här
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;