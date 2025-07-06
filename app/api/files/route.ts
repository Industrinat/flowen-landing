import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Get auth header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Simple auth check (replace with proper JWT validation later)
    if (token !== 'admin@flowen.se') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get path from query params
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get('path') || '/';
    
    // Security: prevent directory traversal
    const normalizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    
    // Use uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const fullPath = path.join(uploadsDir, normalizedPath);
    
    // Ensure the path is within uploads directory
    if (!fullPath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    try {
      // Check if directory exists
      await fs.access(fullPath);
      
      // Read directory contents
      const items = await fs.readdir(fullPath, { withFileTypes: true });
      
      // Format response
      const files = items.map(item => ({
        name: item.name,
        isDirectory: item.isDirectory(),
        path: path.join(normalizedPath, item.name)
      }));

      return NextResponse.json({ files });
      
    } catch (error) {
      // Directory doesn't exist - return empty array
      return NextResponse.json({ files: [] });
    }

  } catch (error) {
    console.error('Error in files API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}