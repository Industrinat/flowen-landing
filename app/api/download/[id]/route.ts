// app/api/download/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: filename } = await params;
    const filepath = path.join(process.cwd(), 'uploads', filename);
    const metadataPath = filepath + '.meta.json';
    
    console.log('Download request for:', filename);
    
    // Check if this is an encrypted file (has metadata)
    if (existsSync(metadataPath)) {
      try {
        // Read metadata
        const metadataContent = await readFile(metadataPath, 'utf8');
        const metadata = JSON.parse(metadataContent);
        
        // Return metadata for encrypted files
        return NextResponse.json({
          success: true,
          url: `/uploads/${filename}`,
          iv: metadata.iv,
          originalName: metadata.originalName,
          mimeType: metadata.mimeType,
          encrypted: true
        });
      } catch (error) {
        console.error('Failed to read metadata:', error);
        return NextResponse.json({ 
          error: 'Failed to read file metadata' 
        }, { status: 500 });
      }
    } else if (existsSync(filepath)) {
      // Old non-encrypted file - direct download
      const fileContent = await readFile(filepath);
      
      return new NextResponse(fileContent, {
        headers: {
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else {
      console.log('File not found:', filename);
      return NextResponse.json({ 
        error: 'File not found' 
      }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ 
      error: 'Server error' 
    }, { status: 500 });
  }
}
