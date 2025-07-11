// app/api/files/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { getFiles, createFile, deleteFile, updateFile } from '@/lib/database'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// GET /api/files - List files
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const folderId = searchParams.get('folderId')
    
    const files = await getFiles(req.user.id, folderId)
    
    return NextResponse.json({ files })
  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    )
  }
})

// POST /api/files - Upload file
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const formData = await req.formData()
    
    const encryptedFile = formData.get('file') as File
    const encryptionKey = formData.get('encryptionKey') as string
    const iv = formData.get('iv') as string
    const originalName = formData.get('originalName') as string
    const folderId = formData.get('folderId') as string | null
    
    if (!encryptedFile || !encryptionKey || !iv || !originalName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Create files directory if it doesn't exist
    const filesDir = path.join(process.cwd(), 'uploads', 'files')
    if (!existsSync(filesDir)) {
      await mkdir(filesDir, { recursive: true })
    }
    
    // Save file to database first to get ID
    const fileRecord = await createFile({
      userId: req.user.id,
      name: originalName,
      size: encryptedFile.size,
      mimeType: encryptedFile.type || 'application/octet-stream',
      folderId: folderId || null,
      encryptionKey,
      iv
    })
    
    // Save encrypted file to disk using the database ID
    const filePath = path.join(filesDir, fileRecord.id)
    const bytes = await encryptedFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    
    console.log(`✅ File uploaded by ${req.user.email}: ${originalName} -> ${fileRecord.id}`)
    
    return NextResponse.json({
      success: true,
      file: fileRecord
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
})

// DELETE /api/files/:id
export const DELETE = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { pathname } = new URL(req.url)
    const fileId = pathname.split('/').pop()
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID required' },
        { status: 400 }
      )
    }
    
    const success = await deleteFile(fileId, req.user.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
})

// PATCH /api/files/:id
export const PATCH = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { pathname } = new URL(req.url)
    const fileId = pathname.split('/').pop()
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID required' },
        { status: 400 }
      )
    }
    
    const body = await req.json()
    const { name, folderId } = body
    
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (folderId !== undefined) updates.folderId = folderId
    
    const updatedFile = await updateFile(fileId, req.user.id, updates)
    
    if (!updatedFile) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      file: updatedFile
    })
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    )
  }
})