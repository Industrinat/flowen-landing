import React from 'react';

interface DownloadPageProps {
  id: string;
}

export default function DownloadPage({ id }: DownloadPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Download File</h1>
      <p>Downloading file with ID: {id}</p>
      <p>Download functionality coming soon...</p>
    </div>
  );
}