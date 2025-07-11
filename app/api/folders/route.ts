// app/api/folders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const FOLDERS_FILE = path.join(process.cwd(), 'uploads', 'folders.json')

async function ensureFoldersFile() {
  try {
    await fs.access(FOLDERS_FILE)
  } catch {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads')
    try {
      await fs.access(uploadsDir)
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true })
    }
    
    // Create empty folders file
    await fs.writeFile(FOLDERS_FILE, JSON.stringify({ folders: [] }))
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureFoldersFile()
    const data = JSON.parse(await fs.readFile(FOLDERS_FILE, 'utf-8'))
    return NextResponse.json({ folders: data.folders || [] })
  } catch (error) {
    console.error('Error fetching folders:', error)
    return NextResponse.json({ folders: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, parentId } = await request.json()
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Folder name required' },
        { status: 400 }
      )
    }
    
    await ensureFoldersFile()
    
    // Read existing folders
    const data = JSON.parse(await fs.readFile(FOLDERS_FILE, 'utf-8'))
    
    // Create new folder
    const newFolder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Add to folders array
    data.folders = data.folders || []
    data.folders.push(newFolder)
    
    // Save back to file
    await fs.writeFile(FOLDERS_FILE, JSON.stringify(data, null, 2))
    
    console.log('✅ Folder created:', newFolder.name)
    
    return NextResponse.json({
      success: true,
      folder: newFolder
    })
  } catch (error) {
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    )
  }
}

// DELETE method for removing folders
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('id')
    
    if (!folderId) {
      return NextResponse.json(
        { error: 'Folder ID required' },
        { status: 400 }
      )
    }
    
    await ensureFoldersFile()
    
    // Read existing folders
    const data = JSON.parse(await fs.readFile(FOLDERS_FILE, 'utf-8'))
    
    // Check if folder exists
    const folderIndex = data.folders.findIndex((f: any) => f.id === folderId)
    if (folderIndex === -1) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }
    
    // Check if folder has subfolders
    const hasSubfolders = data.folders.some((f: any) => f.parentId === folderId)
    if (hasSubfolders) {
      return NextResponse.json(
        { error: 'Cannot delete folder with subfolders' },
        { status: 400 }
      )
    }
    
    // Remove folder
    data.folders.splice(folderIndex, 1)
    
    // Save back to file
    await fs.writeFile(FOLDERS_FILE, JSON.stringify(data, null, 2))
    
    console.log('✅ Folder deleted:', folderId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting folder:', error)
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    )
  }
}

// PATCH method for updating folders (rename, move)
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('id')
    
    if (!folderId) {
      return NextResponse.json(
        { error: 'Folder ID required' },
        { status: 400 }
      )
    }
    
    const updates = await request.json()
    
    await ensureFoldersFile()
    
    // Read existing folders
    const data = JSON.parse(await fs.readFile(FOLDERS_FILE, 'utf-8'))
    
    // Find folder
    const folderIndex = data.folders.findIndex((f: any) => f.id === folderId)
    if (folderIndex === -1) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }
    
    // Update folder
    data.folders[folderIndex] = {
      ...data.folders[folderIndex],
      ...updates,
      id: folderId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    }
    
    // Save back to file
    await fs.writeFile(FOLDERS_FILE, JSON.stringify(data, null, 2))
    
    console.log('✅ Folder updated:', folderId)
    
    return NextResponse.json({
      success: true,
      folder: data.folders[folderIndex]
    })
  } catch (error) {
    console.error('Error updating folder:', error)
    return NextResponse.json(
      { error: 'Failed to update folder' },
      { status: 500 }
    )
  }
}