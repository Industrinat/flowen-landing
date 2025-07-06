// app/api/files/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Same auth as upload route
interface AuthenticatedRequest extends NextRequest {
  userId?: string;
  userEmail?: string;
}

function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const authHeader = req.headers.get('Authorization');
      
      if (!authHeader) {
        return NextResponse.json(
          { error: 'No authorization header' }, 
          { status: 401 }
        );
      }

      const userData = JSON.parse(authHeader);
      
      if (!userData.id || !userData.email) {
        return NextResponse.json(
          { error: 'Invalid user data' }, 
          { status: 401 }
        );
      }

      const authReq = req as AuthenticatedRequest;
      authReq.userId = userData.id;
      authReq.userEmail = userData.email;

      return await handler(authReq);
      
    } catch (error) {
      console.error('Auth error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' }, 
        { status: 401 }
      );
    }
  };
}

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    console.log('📁 Listing files for user:', req.userId);
    
    const { searchParams } = new URL(req.url);
    const requestedPath = searchParams.get('path') || '/';
    
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    if (!existsSync(uploadsDir)) {
      return NextResponse.json({
        success: true,
        files: [],
        path: requestedPath
      });
    }

    // Get all files in uploads directory
    const allFiles = await readdir(uploadsDir);
    
    // Filter files that belong to this user
    const userFiles = allFiles.filter(filename => {
      return filename.startsWith(`${req.userId}-`);
    });

    const files = [];
    
    for (const filename of userFiles) {
      try {
        const fullPath = path.join(uploadsDir, filename);
        const stats = await stat(fullPath);
        
        // Check if there's metadata
        const metadataPath = fullPath + '.meta.json';
        let metadata = null;
        
        if (existsSync(metadataPath)) {
          const metadataContent = await readFile(metadataPath, 'utf8');
          metadata = JSON.parse(metadataContent);
        }
        
        // Skip .meta.json files themselves
        if (filename.endsWith('.meta.json')) {
          continue;
        }
        
        const fileItem = {
          id: filename,
          name: metadata?.originalName || filename,
          type: 'file' as const,
          size: stats.size,
          uploadDate: metadata?.uploadTime ? 
            new Date(metadata.uploadTime).toISOString().split('T')[0] : 
            stats.birthtime.toISOString().split('T')[0],
          mimeType: metadata?.mimeType || 'application/octet-stream',
          path: requestedPath + (metadata?.originalName || filename),
          uploadId: filename
        };
        
        files.push(fileItem);
      } catch (error) {
        console.error('Error processing file:', filename, error);
        continue;
      }
    }
    
    // Sort by upload date (newest first)
    files.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    
    console.log(`📊 Found ${files.length} files for user ${req.userId}`);
    
    return NextResponse.json({
      success: true,
      files: files,
      path: requestedPath,
      userId: req.userId
    });

  } catch (error: any) {
    console.error('❌ Files listing error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to list files: ' + error.message,
      files: []
    }, { status: 500 });
  }
});