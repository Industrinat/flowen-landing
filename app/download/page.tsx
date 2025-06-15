import React from 'react';
import DownloadPage from './DownloadPage';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <DownloadPage id={id} />;
}