// app/api/project-files/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { writeFile } from 'fs/promises'
import { existsSync } from 'fs'

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'project-files')
const DB_FILE = path.join(process.cwd(), 'uploads', 'project-files.json')

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

async function ensureDirectories() {
  if (!existsSync(UPLOADS_DIR)) {
    await fs.mkdir(UPLOADS_DIR, { recursive: true })
  }
}

async function getDatabase(): Promise<{ files: FileRecord[] }> {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return { files: [] }
  }
}

async function saveDatabase(data: { files: FileRecord[] }) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2))
}

// Simple auth check
function getUserFromRequest(req: NextRequest): { id: string, email: string } | null {
  const authHeader = req.headers.get('x-user-email')
  if (!authHeader || !authHeader.includes('@')) {
    return null
  }
  
  return {
    id: authHeader.split('@')[0], // Simple user ID from email
    email: authHeader
  }
}

// GET - List files
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const folderId = searchParams.get('folderId')
  
  const db = await getDatabase()
  const userFiles = db.files.filter(file => {
    if (file.userId !== user.id) return false
    if (folderId === '' && file.folderId !== null) return false
    if (folderId && folderId !== '' && file.folderId !== folderId) return false
    return true
  })
  
  return NextResponse.json({ files: userFiles })
}

// POST - Upload file
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await ensureDirectories()
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const encryptionKey = formData.get('encryptionKey') as string
    const iv = formData.get('iv') as string
    const originalName = formData.get('originalName') as string
    const folderId = formData.get('folderId') as string | null
    
    if (!file || !encryptionKey || !iv || !originalName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Create file record
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const fileRecord: FileRecord = {
      id: fileId,
      userId: user.id,
      name: originalName,
      size: file.size,
      encryptionKey,
      iv,
      folderId: folderId || null,
      createdAt: new Date().toISOString()
    }
    
    // Save file to disk
    const filePath = path.join(UPLOADS_DIR, fileId)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    
    // Update database
    const db = await getDatabase()
    db.files.push(fileRecord)
    await saveDatabase(db)
    
    console.log(`✅ File uploaded: ${fileId}`)
    
    return NextResponse.json({
      success: true,
      file: fileRecord
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// PATCH - Update file (move, rename)
export async function PATCH(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')
    
    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 })
    }
    
    const body = await request.json()
    const { folderId, name } = body
    
    const db = await getDatabase()
    const fileIndex = db.files.findIndex(f => f.id === fileId && f.userId === user.id)
    
    if (fileIndex === -1) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    
    // Update file
    if (folderId !== undefined) {
      db.files[fileIndex].folderId = folderId
    }
    if (name !== undefined) {
      db.files[fileIndex].name = name
    }
    
    await saveDatabase(db)
    
    console.log(`✅ File updated: ${fileId}`)
    
    return NextResponse.json({
      success: true,
      file: db.files[fileIndex]
    })
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

// DELETE - Remove file
export async function DELETE(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')
    
    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 })
    }
    
    const db = await getDatabase()
    const fileIndex = db.files.findIndex(f => f.id === fileId && f.userId === user.id)
    
    if (fileIndex === -1) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    
    const fileRecord = db.files[fileIndex]
    
    // Remove physical file
    const filePath = path.join(UPLOADS_DIR, fileId)
    try {
      await fs.unlink(filePath)
      console.log(`🗑️ Physical file deleted`)
    } catch (error) {
      console.warn(`⚠️ Could not delete physical file`, error)
      // Continue anyway - remove from database
    }
    
    // Remove from database
    db.files.splice(fileIndex, 1)
    await saveDatabase(db)
    
    console.log(`✅ File deleted: ${fileId}`)
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}