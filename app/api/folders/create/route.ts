// app/api/folders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { getFolders, createFolder, deleteFolder, updateFolder } from '@/lib/database'

// GET /api/folders - List folders
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const parentId = searchParams.get('parentId')
    
    const folders = await getFolders(req.user.id, parentId)
    
    return NextResponse.json({ folders })
  } catch (error) {
    console.error('Error listing folders:', error)
    return NextResponse.json(
      { error: 'Failed to list folders' },
      { status: 500 }
    )
  }
})

// POST /api/folders - Create folder
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { name, parentId } = await req.json()
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Folder name required' },
        { status: 400 }
      )
    }
    
    const folder = await createFolder({
      userId: req.user.id,
      name: name.trim(),
      parentId: parentId || null
    })
    
    console.log(`✅ Folder created by ${req.user.email}: ${folder.name}`)
    
    return NextResponse.json({
      success: true,
      folder
    })
  } catch (error) {
    console.error('Create folder error:', error)
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    )
  }
})

// DELETE /api/folders/:id
export const DELETE = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { pathname } = new URL(req.url)
    const folderId = pathname.split('/').pop()
    
    if (!folderId) {
      return NextResponse.json(
        { error: 'Folder ID required' },
        { status: 400 }
      )
    }
    
    const success = await deleteFolder(folderId, req.user.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Folder not found or not empty' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete folder error:', error)
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    )
  }
})

// PATCH /api/folders/:id
export const PATCH = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { pathname } = new URL(req.url)
    const folderId = pathname.split('/').pop()
    
    if (!folderId) {
      return NextResponse.json(
        { error: 'Folder ID required' },
        { status: 400 }
      )
    }
    
    const body = await req.json()
    const { name, parentId } = body
    
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (parentId !== undefined) updates.parentId = parentId
    
    const updatedFolder = await updateFolder(folderId, req.user.id, updates)
    
    if (!updatedFolder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      folder: updatedFolder
    })
  } catch (error) {
    console.error('Update folder error:', error)
    return NextResponse.json(
      { error: 'Failed to update folder' },
      { status: 500 }
    )
  }
})