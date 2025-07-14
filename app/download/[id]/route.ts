import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ÄNDRAD: Promise<>
) {
  try {
    // ÄNDRAD: Använd await
    const { id: fileId } = await params;
    console.log('Download request for:', fileId);

    // Läs metadata
    const metadataPath = path.join(process.cwd(), 'uploads', `${fileId}.meta.json`);
    
    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(metadataContent);
      
      // Returnera metadata med sökväg till krypterad fil
      return NextResponse.json({
        encrypted: true,
        url: `/uploads/${fileId}.enc`,
        iv: metadata.iv,
        originalName: metadata.originalName,
        mimeType: metadata.mimeType,
        size: metadata.originalSize
      });
      
    } catch (error) {
      console.error('Metadata not found:', error);
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 }
    );
  }
}