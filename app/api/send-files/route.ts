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