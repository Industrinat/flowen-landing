// app/api/download/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface FileRecord {
  id: string
  userId: string
  name: string
  size: number
  encryptionKey: string
  iv: string
  folderId: string | null
  createdAt: string
}

const DB_FILE = path.join(process.cwd(), 'uploads', 'project-files.json')

async function getDatabase(): Promise<{ files: FileRecord[] }> {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return { files: [] }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fileId } = await params
    const userEmail = request.headers.get('x-user-email')
    
    console.log('🔽 Download request for file:', fileId)
    console.log('👤 User authenticated')
    
    // For premium files, require authentication
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Get user ID from email
    const userId = userEmail.split('@')[0]
    
    // Get file metadata from database
    const db = await getDatabase()
    const fileRecord = db.files.find(f => f.id === fileId && f.userId === userId)
    
    if (!fileRecord) {
      console.log('❌ File record not found in database')
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }
    
    console.log('✅ File record found')
    
    // Determine uploads directory
    const uploadsDir = process.env.NODE_ENV === 'production' 
      ? '/var/www/flowen/uploads/project-files' 
      : path.join(process.cwd(), 'uploads', 'project-files')
    
    console.log('📁 Looking in uploads directory')
    
    // Check if physical file exists
    const filePath = path.join(uploadsDir, fileId)
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ Physical file not found')
      return NextResponse.json(
        { error: 'File not found on disk' },
        { status: 404 }
      )
    }
    
    // Read the encrypted file
    const encryptedData = fs.readFileSync(filePath)
    console.log('📦 File read successfully, size:', encryptedData.length)
    
    // Get encryption metadata from database
    const encryptionKey = fileRecord.encryptionKey
    const iv = fileRecord.iv
    
    if (!encryptionKey || !iv) {
      console.log('❌ Missing encryption metadata in database record')
      return NextResponse.json(
        { error: 'Encryption metadata not found' },
        { status: 500 }
      )
    }
    
    console.log('🔑 Encryption metadata found, returning encrypted file')
    
    // Return encrypted file with metadata in headers
    return new NextResponse(encryptedData, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileId}"`,
        'X-Original-Name': fileId,
        'X-Encryption-Key': encryptionKey,
        'X-IV': iv,
        'Content-Length': encryptedData.length.toString(),
      }
    })
    
  } catch (error) {
    console.error('💥 Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    )
  }
}