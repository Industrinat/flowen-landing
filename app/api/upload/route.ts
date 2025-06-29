// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Smart API URL detection function
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
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file uploaded' 
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.name);
    const filename = uniqueId + fileExtension;
    const filepath = path.join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Smart URL detection for download links
    const apiUrl = getApiUrl(req);
    const shareUrl = `${apiUrl}/uploads/${filename}`;

    console.log('File uploaded:', file.name, '→', filename);
    console.log('API URL detected:', apiUrl);
    console.log('Share URL:', shareUrl);

    return NextResponse.json({ 
      success: true, 
      shareUrl: shareUrl,
      originalName: file.name,
      size: file.size,
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