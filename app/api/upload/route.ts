// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const getApiUrl = (req: NextRequest) => {
  const origin = req.headers.get('origin') || req.headers.get('referer');
  console.log('API Request origin:', origin);
  
  if (origin && origin.includes('localhost')) {
    return 'http://localhost:3000';
  }
  return 'https://flowen.eu';
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Handle encrypted file upload
    const encryptedFile = formData.get('encryptedFile') as File;
    const iv = formData.get('iv') as string;
    const originalName = formData.get('originalName') as string;
    const originalSize = formData.get('originalSize') as string;
    const mimeType = formData.get('mimeType') as string;
    
    if (!encryptedFile || !iv || !originalName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueId;
    const filepath = path.join(uploadsDir, filename);

    // Save encrypted file
    const bytes = await encryptedFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Save metadata
    const metadata = {
      iv: iv,
      originalName: originalName,
      originalSize: originalSize,
      mimeType: mimeType || 'application/octet-stream',
      uploadTime: new Date().toISOString(),
      encryptedFilename: filename
    };
    
    const metadataPath = filepath + '.meta.json';
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    // Generate share URL
    const apiUrl = getApiUrl(req);
    const shareUrl = `${apiUrl}/download/${filename}`;

    console.log('Encrypted file uploaded:', originalName, '→', filename);
    console.log('Metadata saved:', filename + '.meta.json');
    console.log('Share URL:', shareUrl);

    return NextResponse.json({
      success: true,
      shareUrl: shareUrl,
      originalName: originalName,
      size: originalSize,
      uploadId: filename
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to upload file: ' + error.message
    }, { status: 500 });
  }
}
