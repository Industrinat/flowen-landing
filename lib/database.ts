// lib/database.ts
import fs from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

const DB_PATH = path.join(process.cwd(), 'uploads', 'database.json')
const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

export interface FileRecord {
  id: string
  userId: string
  name: string
  size: number
  mimeType: string
  folderId: string | null
  encryptionKey: string
  iv: string
  createdAt: string
  updatedAt: string
}

export interface FolderRecord {
  id: string
  userId: string
  name: string
  parentId: string | null
  createdAt: string
  updatedAt: string
}

interface Database {
  files: FileRecord[]
  folders: FolderRecord[]
}

async function ensureDatabase(): Promise<void> {
  if (!existsSync(UPLOADS_DIR)) {
    await fs.mkdir(UPLOADS_DIR, { recursive: true })
  }
  
  if (!existsSync(DB_PATH)) {
    const emptyDb: Database = { files: [], folders: [] }
    await fs.writeFile(DB_PATH, JSON.stringify(emptyDb, null, 2))
  }
}

async function readDatabase(): Promise<Database> {
  await ensureDatabase()
  const data = await fs.readFile(DB_PATH, 'utf-8')
  return JSON.parse(data)
}

async function writeDatabase(db: Database): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2))
}

// File operations
export async function createFile(file: Omit<FileRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<FileRecord> {
  const db = await readDatabase()
  
  const newFile: FileRecord = {
    ...file,
    id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  db.files.push(newFile)
  await writeDatabase(db)
  
  return newFile
}

export async function getFiles(userId: string, folderId?: string | null): Promise<FileRecord[]> {
  const db = await readDatabase()
  
  return db.files.filter(file => {
    if (file.userId !== userId) return false
    if (folderId === undefined) return true
    return file.folderId === folderId
  })
}

export async function getFile(fileId: string, userId: string): Promise<FileRecord | null> {
  const db = await readDatabase()
  return db.files.find(f => f.id === fileId && f.userId === userId) || null
}

export async function updateFile(fileId: string, userId: string, updates: Partial<FileRecord>): Promise<FileRecord | null> {
  const db = await readDatabase()
  const index = db.files.findIndex(f => f.id === fileId && f.userId === userId)
  
  if (index === -1) return null
  
  db.files[index] = {
    ...db.files[index],
    ...updates,
    id: fileId,
    userId,
    updatedAt: new Date().toISOString()
  }
  
  await writeDatabase(db)
  return db.files[index]
}

export async function deleteFile(fileId: string, userId: string): Promise<boolean> {
  const db = await readDatabase()
  const initialLength = db.files.length
  db.files = db.files.filter(f => !(f.id === fileId && f.userId === userId))
  
  if (db.files.length < initialLength) {
    await writeDatabase(db)
    
    // Also delete the physical file
    const filePath = path.join(UPLOADS_DIR, 'files', fileId)
    try {
      await fs.unlink(filePath)
    } catch (err) {
      console.error('Error deleting physical file:', err)
    }
    
    return true
  }
  
  return false
}

// Folder operations
export async function createFolder(folder: Omit<FolderRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<FolderRecord> {
  const db = await readDatabase()
  
  const newFolder: FolderRecord = {
    ...folder,
    id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  db.folders.push(newFolder)
  await writeDatabase(db)
  
  return newFolder
}

export async function getFolders(userId: string, parentId?: string | null): Promise<FolderRecord[]> {
  const db = await readDatabase()
  
  return db.folders.filter(folder => {
    if (folder.userId !== userId) return false
    if (parentId === undefined) return true
    return folder.parentId === parentId
  })
}

export async function updateFolder(folderId: string, userId: string, updates: Partial<FolderRecord>): Promise<FolderRecord | null> {
  const db = await readDatabase()
  const index = db.folders.findIndex(f => f.id === folderId && f.userId === userId)
  
  if (index === -1) return null
  
  db.folders[index] = {
    ...db.folders[index],
    ...updates,
    id: folderId,
    userId,
    updatedAt: new Date().toISOString()
  }
  
  await writeDatabase(db)
  return db.folders[index]
}

export async function deleteFolder(folderId: string, userId: string): Promise<boolean> {
  const db = await readDatabase()
  
  // Check if folder has files
  const hasFiles = db.files.some(f => f.folderId === folderId && f.userId === userId)
  if (hasFiles) return false
  
  // Check if folder has subfolders
  const hasSubfolders = db.folders.some(f => f.parentId === folderId && f.userId === userId)
  if (hasSubfolders) return false
  
  const initialLength = db.folders.length
  db.folders = db.folders.filter(f => !(f.id === folderId && f.userId === userId))
  
  if (db.folders.length < initialLength) {
    await writeDatabase(db)
    return true
  }
  
  return false
}