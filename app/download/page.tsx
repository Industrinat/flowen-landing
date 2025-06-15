import React from 'react';
import DownloadPage from './DownloadPage';

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  return <DownloadPage id={params.id} />;
}