// app/api/files/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE(request: NextRequest) {
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

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');

    // Ta bort fysiska filen
    const filePath = path.join(uploadsDir, id);
    const metaPath = path.join(uploadsDir, id + '.meta.json');

    try {
      // Ta bort filen om den finns
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.log('File not found, continuing with metadata cleanup');
      }

      // Ta bort metadata-filen
      try {
        await fs.unlink(metaPath);
      } catch (error) {
        console.log('Metadata file not found');
      }

      return NextResponse.json({ 
        success: true,
        message: 'File deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting file:', error);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}