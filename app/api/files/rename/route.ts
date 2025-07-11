// app/api/files/rename/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const validTokens = ['admin@flowen.se', 'admin@flowen.se:flowen123'];
    const userEmail = token.includes(':') ? token.split(':')[0] : token;
    
    if (!validTokens.includes(token) && userEmail !== 'admin@flowen.se') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id, newName } = await request.json();

    if (!id || !newName?.trim()) {
      return NextResponse.json({ error: 'File ID and new name are required' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');

    // Läs metadata för filen
    const metaPath = path.join(uploadsDir, id + '.meta.json');
    
    try {
      const metaContent = await fs.readFile(metaPath, 'utf-8');
      const metadata = JSON.parse(metaContent);
      
      // Uppdatera originalName i metadata
      metadata.originalName = newName.trim();
      
      // Spara uppdaterad metadata
      await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2));

      return NextResponse.json({ 
        success: true,
        message: 'File renamed successfully'
      });

    } catch (error) {
      console.error('Error reading metadata:', error);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Error renaming file:', error);
    return NextResponse.json({ error: 'Failed to rename file' }, { status: 500 });
  }
}