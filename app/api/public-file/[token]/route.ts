// app/api/public-file/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getPublicTokens, getConfig } from '../../public-url/[id]/route'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    console.log('📥 Public file request for token:', token)

    // Get configuration and tokens
    const config = getConfig()
    const publicUrls = await getPublicTokens()
    const urlData = publicUrls.get(token)
    
    if (!urlData) {
      console.log('❌ Invalid or expired token')
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
    }

    // Check if token has expired
    if (urlData.expires < Date.now()) {
      publicUrls.delete(token)
      console.log('⏰ Token expired')
      return NextResponse.json({ error: 'Link has expired' }, { status: 410 })
    }

    // Get file path using config
    const filePath = path.join(config.uploadsDir, urlData.fileId)

    console.log('📁 Serving file')

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found on disk')
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath)

    // Determine content type based on file extension (use fileId for security)
    const ext = path.extname(urlData.fileId).toLowerCase()
    const contentTypes: { [key: string]: string } = {
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.txt': 'text/plain',
    }

    const contentType = contentTypes[ext] || 'application/octet-stream'

    console.log('✅ Serving file - Type:', contentType, 'Size:', fileBuffer.length)

    // Return the file with proper headers (use fileId for security)
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${urlData.fileId}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        // CORS headers for Office Online
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })

  } catch (error) {
    console.error('❌ Public file serving error:', error)
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    )
  }
}