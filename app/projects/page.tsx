'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, FolderPlus, Folder, File, Download, Edit2, Trash2, Eye, AlertCircle } from 'lucide-react'
import { useDragDrop } from '../hooks/useDragDrop'

interface FileItem {
  id: string
  name: string
  size: number
  mimeType: string
  folderId: string | null
  createdAt: string
  updatedAt: string
}

interface FolderItem {
  id: string
  name: string
  parentId: string | null
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  email: string
  name: string
}


interface UploadResult {
  file: string
  status: 'success' | 'error'
  error?: string
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const MAX_DEV_FILE_SIZE = 500 * 1024 * 1024 // 500MB for development files

// LARGE DEVELOPMENT FILES that are commonly over 100MB
const LARGE_DEV_FILES = [
  'next-swc.win32-x64-msvc.node',
  'next-swc.darwin-x64.node', 
  'next-swc.darwin-arm64.node',
  'next-swc.linux-x64-gnu.node',
  'sqlite3.node',
  'sharp.node',
  'canvas.node',
  'electron.exe',
  'chrome.exe',
  'ffmpeg.exe',
  'node.exe',
  'database.db',
  'data.sqlite',
  'main.wasm',
  'app.asar',
  'bundle.js'
]

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff',
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv',
  'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/flac',
  'text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript', 'text/markdown',
  'application/json', 'application/xml', 'application/javascript', 'application/typescript',
  'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
  'application/x-tar', 'application/gzip'
]

const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'rtf', 'odt', 'ods', 'odp',
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif', 'ico', 'avif',
  'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp', 'ogv',
  'mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus',
  'txt', 'md', 'csv', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf',
  'html', 'htm', 'css', 'scss', 'sass', 'less',
  'js', 'jsx', 'ts', 'tsx', 'vue', 'svelte',
  'py', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift',
  'sql', 'sh', 'bash', 'ps1', 'bat', 'cmd',
  'gitignore', 'gitattributes', 'gitmodules', 'env', 'example', 'sample',
  'lock', 'log', 'tmp', 'cache', 'pid', 'sock',
  'dockerfile', 'dockerignore', 'makefile', 'rakefile', 'gemfile', 'pipfile',
  'package', 'composer', 'requirements', 'cargo', 'setup', 'build', 'gradle',
  'properties', 'plist', 'manifest', 'config', 'settings',
  'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'dmg', 'iso',
  'ttf', 'otf', 'woff', 'woff2', 'eot',
  'db', 'sqlite', 'sqlite3', 'mdb', 'accdb'
]

const ALLOWED_SPECIAL_FILES = [
  'head', 'config', 'description', 'packed-refs', 'commit_editmsg', 'index', 'fetch_head', 'orig_head',
  'package.json', 'package-lock.json', 'yarn.lock', 'npm-shrinkwrap.json',
  '.nvmrc', '.node-version',
  '.env', '.env.local', '.env.development', '.env.production', '.env.test',
  '.gitignore', '.gitattributes', '.dockerignore', '.eslintrc', '.prettierrc',
  '.babelrc', '.editorconfig', '.browserslistrc',
  'tsconfig.json', 'jsconfig.json', 'webpack.config.js', 'vite.config.js',
  'tailwind.config.js', 'next.config.js', 'nuxt.config.js',
  'readme', 'readme.md', 'license', 'changelog', 'contributing', 'code_of_conduct',
  'makefile', 'dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
  '.vscode', '.idea', '.sublime-project', '.sublime-workspace',
  'main', 'master', 'develop', 'staging', 'production', 'local'
]
export default function ProjectsPage() 
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [currentFolderName, setCurrentFolderName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [contextMenu, setContextMenu] = useState<{

    x: number
    y: number
    item: FileItem | FolderItem
    type: 'file' | 'folder'
  } | null>(null)
  const [previewModal, setPreviewModal] = useState<{
    file: FileItem
    url: string
    isOffice?: boolean
  } | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set())
  const [bulkMode, setBulkMode] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [error, setError] = useState<string | null>(null)
  
  const [largeUploadProgress, setLargeUploadProgress] = useState<{
    show: boolean
    completed: number
    total: number
    failed: number
    fileProgress: {[fileName: string]: number}
    uploadedFileIds: string[]
  }>({
    show: false,
    completed: 0,
    total: 0,
    failed: 0,
    fileProgress: {},
    uploadedFileIds: []
  })
  
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const fileListRef = useRef<HTMLDivElement>(null)
  
  const [dragSelect, setDragSelect] = useState({
    isSelecting: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0
  })

  // Drag & Drop state

  const LARGE_UPLOAD_CONFIG = {
    maxFileSize: 500 * 1024 * 1024,
    maxTotalSize: 5 * 1024 * 1024 * 1024,
    chunkSize: 10 * 1024 * 1024,
    maxConcurrent: 3,
    retryAttempts: 3
  }

  const validateLargeFolder = useCallback((files: { file: File, path: string }[]): string | null => {
    const totalSize = files.reduce((sum, {file}) => sum + file.size, 0)
    
    if (totalSize > LARGE_UPLOAD_CONFIG.maxTotalSize) {
      return `Folder too large: ${formatFileSize(totalSize)}. Max allowed: ${formatFileSize(LARGE_UPLOAD_CONFIG.maxTotalSize)}`
    }
    
    const largeFiles = files.filter(({file}) => file.size > LARGE_UPLOAD_CONFIG.maxFileSize)
    if (largeFiles.length > 0) {
      return `${largeFiles.length} files exceed ${formatFileSize(LARGE_UPLOAD_CONFIG.maxFileSize)} limit`
    }
    
    return null
  }, [])

  const validateFile = useCallback((file: File): string | null => {
    const fileName = file.name.toLowerCase()
    const isLargeDevFile = LARGE_DEV_FILES.some(devFile => 
      fileName.includes(devFile.toLowerCase()) || 
      fileName.endsWith(devFile.toLowerCase())
    )
    
    const maxSize = isLargeDevFile ? MAX_DEV_FILE_SIZE : MAX_FILE_SIZE
    const maxSizeLabel = isLargeDevFile ? '500MB' : '100MB'
    
    if (file.size > maxSize) {
      return `File ${file.name} is too large (max ${maxSizeLabel}${isLargeDevFile ? ' for dev files' : ''})`
    }
    
    const fileExtension = fileName.split('.').pop()
    const baseName = fileName.split('.')[0]
    
    if (file.type && ALLOWED_TYPES.includes(file.type)) {
      return null
    }
    
    if (fileExtension && ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return null
    }
    
    if (ALLOWED_SPECIAL_FILES.some(special => 
      fileName === special || 
      fileName.includes(special) || 
      baseName === special ||
      fileName.startsWith('.')
    )) {
      return null
    }
    
    const devPatterns = [
      /^\./, /readme/i, /license/i, /changelog/i, /makefile$/i, /dockerfile$/i,
      /^package/, /\.config\./i, /\.config$/i, /^config$/i, /lock$/i,
      /^yarn\./, /^npm-/, /^\.npm/, /^node_modules/, /^\.git/, /^\.vscode/,
      /^\.idea/, /head$/i, /refs\//i, /hooks\//i, /objects\//i, /branches$/i,
      /^index$/i, /commit_editmsg$/i, /fetch_head$/i, /orig_head$/i,
      /packed-refs$/i, /^description$/i, /^local$/i, /^production$/i,
      /^staging$/i, /^development$/i, /^test$/i, /^main$/i, /^master$/i,
      /\.node$/i, /\.exe$/i, /\.dll$/i, /\.so$/i, /\.dylib$/i, /\.wasm$/i,
      /\.asar$/i, /sqlite/i, /\.db$/i, /ffmpeg/i, /chrome/i, /chromium/i,
      /puppeteer/i, /sharp/i, /canvas/i
    ]
    
    if (devPatterns.some(pattern => pattern.test(fileName))) {
      return null
    }
    
    const dangerousExtensions = ['scr', 'pif', 'com', 'vbs']
    if (fileExtension && dangerousExtensions.includes(fileExtension)) {
      return `Dangerous file type not allowed: ${fileExtension}`
    }
    
    return null
  }, [])

  useEffect(() => {
    if (!user) {
      try {
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
        if (userStr) {
          const userData = JSON.parse(userStr)
          setUser({
            id: userData.id || 'user-1',
            email: userData.email,
            name: userData.name || userData.email
          })
          createSessionFromLocalStorage(userData)
        } else {
  router.push('/login')
}
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/login')
      }
    } else {
      setLoading(false)
    }
  }, [user, router])

  const createSessionFromLocalStorage = async (userData: any) => {
    try {
      const response = await fetch('/api/auth/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userData.id || 'user-1',
          email: userData.email,
          name: userData.name || userData.email
        }),
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setSessionId(data.sessionId)
      }
      setLoading(false)
    } catch (error) {
      console.error('Session creation error:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  useEffect(() => {
    setSelectedFiles(new Set())
    setSelectedFolders(new Set())
    setBulkMode(false)
  }, [currentFolder])

  useEffect(() => {
    return () => {
      if (previewModal?.url) {
        URL.revokeObjectURL(previewModal.url)
      }
    }
  }, [previewModal])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, currentFolder])

  const fetchData = async () => {
    setError(null)
    try {
      await Promise.all([fetchFiles(), fetchFolders()])
    } catch (error) {
      setError('Failed to load data')
      console.error('Fetch data error:', error)
    }
  }

  const fetchFiles = async () => {
    if (!user) return
    
    try {
      const url = `/api/project-files${currentFolder ? `?folderId=${currentFolder}` : '?folderId='}`
      const response = await fetch(url, {
        headers: { 'x-user-email': user.email }
      })
      
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files || [])
      } else {
        throw new Error('Failed to fetch files')
      }
    } catch (error) {
      console.error('Error fetching files:', error)
      setFiles([])
    }
  }

  const fetchFolders = async () => {
    try {
      const url = `/api/folders${currentFolder ? `?parentId=${currentFolder}` : ''}`
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        const filteredFolders = (data.folders || []).filter((folder: FolderItem) => 
          folder.parentId === currentFolder
        )
        setFolders(filteredFolders)
      } else {
        throw new Error('Failed to fetch folders')
      }
    } catch (error) {
      console.error('Error fetching folders:', error)
      setFolders([])
    }
  }

  const uploadSingleFile = async (file: File, targetFolderId?: string | null): Promise<string | null> => {
    if (!user || !sessionId) throw new Error('Authentication required')

    const { generateEncryptionKey, encryptFile, keyToBase64 } = await import('@/lib/crypto')
    
    const fileBuffer = await file.arrayBuffer()
    const encryptionKey = await generateEncryptionKey()
    const encryptionKeyBase64 = keyToBase64(encryptionKey)
    const { encryptedData, iv } = await encryptFile(fileBuffer, encryptionKey)
    
    const formData = new FormData()
    formData.append('file', new Blob([encryptedData]), file.name)
    formData.append('encryptionKey', encryptionKeyBase64)
    formData.append('iv', btoa(String.fromCharCode(...iv)))
    formData.append('originalName', file.name)
    
    const folderToUse = targetFolderId !== undefined ? targetFolderId : currentFolder
    if (folderToUse) {
      formData.append('folderId', folderToUse)
    }

    const response = await fetch('/api/project-files', {
      method: 'POST',
      headers: { 'x-user-email': user.email },
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Upload failed: ${errorText}`)
    }

    const result = await response.json()
    return result.file?.id || null
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || !user) return

    const results: UploadResult[] = []
    setUploadProgress({})

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      
      try {
        const validationError = validateFile(file)
        if (validationError) {
          throw new Error(validationError)
        }

        setUploadProgress(prev => ({ ...prev, [file.name]: 50 }))
        await uploadSingleFile(file)
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
        
        results.push({ file: file.name, status: 'success' })
      } catch (error) {
        results.push({ 
          file: file.name, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successful = results.filter(r => r.status === 'success').length
    const failed = results.filter(r => r.status === 'error').length
    
    if (successful > 0) {
      showToast(`${successful} files uploaded successfully`, 'success')
    }
    if (failed > 0) {
      showToast(`${failed} files failed to upload`, 'error')
      console.error('Failed uploads:', results.filter(r => r.status === 'error'))
    }

    setUploadDialogOpen(false)
    setUploadProgress({})
    fetchFiles()
  }

  const handleDroppedFiles = async (droppedFiles: File[], droppedItems?: DataTransferItemList) => {
    if (!user) {
      console.log('❌ No user authenticated')
      return
    }

    console.log('🎯 DRAG & DROP DEBUG:')
    console.log('- Number of files:', droppedFiles.length)
    console.log('- Has items:', !!droppedItems)
    console.log('- User:', user.email)

    // Show immediate feedback for drag & drop

    showToast('Processing dropped files...', 'success')

    try {
      let allFiles: { file: File, path: string }[] = []

      if (droppedItems) {
        console.log('📁 Processing folders and files...')
        showToast('Reading folder structure...', 'success')
        allFiles = await processDataTransferItems(droppedItems)
        console.log('📄 Files found in folders:', allFiles.length)
      } else {
        console.log('📄 Processing individual files...')
        allFiles = droppedFiles.map(file => ({ file, path: file.name }))
      }

      if (allFiles.length === 0) {
        showToast('No files found to upload', 'error')
        return
      }

      console.log('✅ Files to process:', allFiles.map(f => f.path))
      showToast(`Found ${allFiles.length} files to upload`, 'success')

      const totalSize = allFiles.reduce((sum, {file}) => sum + file.size, 0)
      const isLargeUpload = totalSize > 100 * 1024 * 1024

      console.log('📊 Upload size analysis:')
      console.log('- Total size:', formatFileSize(totalSize))
      console.log('- Is large upload:', isLargeUpload)

      if (isLargeUpload) {
        const largeValidationError = validateLargeFolder(allFiles)
        if (largeValidationError) {
          console.log('❌ Large folder validation failed:', largeValidationError)
          showToast(largeValidationError, 'error')
          return
        }

        const confirmed = confirm(
          `Large upload detected!\n\n` +
          `Files: ${allFiles.length}\n` +
          `Total size: ${formatFileSize(totalSize)}\n\n` +
          `This may take several minutes. Continue?`
        )

        if (!confirmed) {
          console.log('❌ Large upload cancelled by user')
          return
        }

        console.log('🚀 Starting large upload with progress tracking')
        setLargeUploadProgress(prev => ({
          ...prev, 
          show: true, 
          completed: 0, 
          total: allFiles.length, 
          failed: 0,
          fileProgress: {},
          uploadedFileIds: []
        }))
      } else {
        // Show upload progress for regular uploads too
        showToast(`Starting upload of ${allFiles.length} files...`, 'success')
      }

      const validationErrors: string[] = []
      for (const { file } of allFiles) {
        const error = validateFile(file)
        if (error) {
          validationErrors.push(error)
          console.log('❌ Validation error:', error)
        }
      }

      if (validationErrors.length > 0) {
        console.log('❌ Validation failed:', validationErrors)
        showToast(`Validation errors: ${validationErrors.slice(0, 3).join(', ')}${validationErrors.length > 3 ? '...' : ''}`, 'error')
        if (isLargeUpload) {
          setLargeUploadProgress(prev => ({ ...prev, show: false }))
        }
        return
      }

      console.log('✅ All files validated successfully')
      showToast('Creating folder structure...', 'success')

      const folderPaths = [...new Set(
        allFiles
          .map(({ path }) => path.split('/').slice(0, -1).join('/'))
          .filter(path => path)
      )]

      console.log('📁 Folders to create:', folderPaths)

      const folderMap = new Map<string, string>()
      for (const folderPath of folderPaths.sort()) {
        console.log('📁 Creating folder:', folderPath)
        const folderId = await createFolderRecursive(folderPath, folderMap)
        if (folderId) {
          folderMap.set(folderPath, folderId)
          console.log('✅ Folder created:', folderPath, '→', folderId)
        } else {
          console.log('❌ Failed to create folder:', folderPath)
        }
      }

      const results: UploadResult[] = []
      
      console.log('📤 Starting file uploads...')
      
      for (let i = 0; i < allFiles.length; i++) {
        const { file, path } = allFiles[i]
        const progressInfo = `${i + 1}/${allFiles.length}`
        
        console.log(`📤 Uploading ${progressInfo}: ${path}`)
        
        // Show progress for both large and regular uploads
        if (isLargeUpload) {
          setLargeUploadProgress(prev => ({
            ...prev,
            fileProgress: {
              ...prev.fileProgress,
              [file.name]: 0
            }
          }))
        } else {
          showToast(`Uploading ${progressInfo}: ${file.name}`, 'success')
        }
        
        try {
          const folderPath = path.split('/').slice(0, -1).join('/')
          const targetFolderId = folderPath ? folderMap.get(folderPath) : currentFolder

          console.log('📂 Target folder:', folderPath || 'root', '→', targetFolderId)

          if (isLargeUpload) {
            setLargeUploadProgress(prev => ({
              ...prev,
              fileProgress: {
                ...prev.fileProgress,
                [file.name]: 50
              }
            }))
          }

          const fileId = await uploadSingleFile(file, targetFolderId)
          
          if (isLargeUpload) {
            setLargeUploadProgress(prev => ({
              ...prev,
              completed: prev.completed + 1,
              fileProgress: {
                ...prev.fileProgress,
                [file.name]: 100
              },
              uploadedFileIds: fileId ? [...prev.uploadedFileIds, fileId] : prev.uploadedFileIds
            }))
          }
          
          results.push({ file: file.name, status: 'success' })
          console.log('✅ Upload successful:', file.name)
          
          if (isLargeUpload && i < allFiles.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200))
          }
          
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          results.push({ file: file.name, status: 'error', error: errorMsg })
          console.log('❌ Upload failed:', file.name, errorMsg)
          
          if (isLargeUpload) {
            setLargeUploadProgress(prev => ({
              ...prev,
              failed: prev.failed + 1,
              fileProgress: {
                ...prev.fileProgress,
                [file.name]: -1
              }
            }))
          }
        }
      }

      const successful = results.filter(r => r.status === 'success').length
      const failed = results.filter(r => r.status === 'error').length

      console.log('📊 Upload results:', { successful, failed })

      if (successful > 0) {
        showToast(`${successful} file(s) uploaded successfully`, 'success')
      }
      if (failed > 0) {
        showToast(`${failed} file(s) failed to upload`, 'error')
        console.log('❌ Failed uploads:', results.filter(r => r.status === 'error'))
      }

      if (isLargeUpload) {
        setTimeout(() => {
          setLargeUploadProgress(prev => ({ ...prev, show: false }))
        }, 3000)
      }

      console.log('🔄 Refreshing file lists...')
      fetchFiles()
      fetchFolders()
    } catch (error) {
      console.error('💥 Drop upload error:', error)
      setLargeUploadProgress(prev => ({ ...prev, show: false }))
      showToast(`Failed to upload: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }

  const processDataTransferItems = async (items: DataTransferItemList): Promise<{ file: File, path: string }[]> => {
    const files: { file: File, path: string }[] = []
    
    const processEntry = async (entry: any, path = ''): Promise<void> => {
      if (entry.isFile) {
        try {
          const file = await new Promise<File>((resolve, reject) => {
            entry.file((file: File) => {
              resolve(file)
            }, (error: any) => {
              reject(error)
            })
          })
          
          const fullPath = path + file.name
          files.push({ file, path: fullPath })
        } catch (error) {
          console.error('Failed to read file:', entry.name, error)
        }
      } else if (entry.isDirectory) {
        try {
          const reader = entry.createReader()
          let allEntries: any[] = []
          
          const readEntries = (): Promise<any[]> => {
            return new Promise((resolve, reject) => {
              reader.readEntries((entries: any[]) => {
                if (entries.length === 0) {
                  resolve(allEntries)
                } else {
                  allEntries = allEntries.concat(entries)
                  readEntries().then(resolve).catch(reject)
                }
              }, (error: any) => {
                reject(error)
              })
            })
          }
          
          const entries = await readEntries()
          
          for (const childEntry of entries) {
            await processEntry(childEntry, path + entry.name + '/')
          }
        } catch (error) {
          console.error('Failed to read directory:', entry.name, error)
        }
      }
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry()
        if (entry) {
          await processEntry(entry)
        }
      }
    }

    return files
  }

  const createFolderRecursive = async (folderPath: string, folderMap: Map<string, string>): Promise<string | null> => {
    if (folderMap.has(folderPath)) {
      return folderMap.get(folderPath)!
    }

    const pathParts = folderPath.split('/')
    const folderName = pathParts[pathParts.length - 1]
    const parentPath = pathParts.slice(0, -1).join('/')
    
    let parentId = currentFolder
    if (parentPath) {
      parentId = await createFolderRecursive(parentPath, folderMap)
    }

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: folderName,
          parentId: parentId
        })
      })

      if (response.ok) {
        const data = await response.json()
        const folderId = data.folder?.id
        if (folderId) {
          folderMap.set(folderPath, folderId)
          return folderId
        }
      }
    } catch (error) {
      console.error('Failed to create folder:', folderName, error)
    }

    return null
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !user) return

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName.trim(),
          parentId: currentFolder
        })
      })

      if (response.ok) {
        showToast('Folder created successfully', 'success')
        setCreateFolderDialogOpen(false)
        setNewFolderName('')
        fetchFolders()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create folder')
      }
    } catch (error) {
      console.error('Create folder error:', error)
      showToast(`Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }

  const detectMimeTypeFromFilename = useCallback((filename: string): string => {
    const ext = filename.toLowerCase().split('.').pop()
    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mov': 'video/quicktime',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'json': 'application/json',
      'xml': 'application/xml',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'ts': 'application/typescript'
    }
    return mimeTypes[ext || ''] || 'application/octet-stream'
  }, [])

  const handleFilePreview = async (file: FileItem) => {
    try {
      const detectedMimeType = file.mimeType || detectMimeTypeFromFilename(file.name)
      
      const officeTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-powerpoint'
      ]

    

      const isImage = detectedMimeType?.startsWith('image/')
      const isPDF = detectedMimeType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      const isVideo = detectedMimeType?.startsWith('video/')
      const isAudio = detectedMimeType?.startsWith('audio/')
      const isText = detectedMimeType?.startsWith('text/') || 
                     ['application/json', 'application/xml', 'application/javascript', 'application/typescript'].includes(detectedMimeType)
      
      const isPreviewable = isImage || isPDF || isVideo || isAudio || isText
      
      if (!isPreviewable) {
        showToast('Preview not available for this file type. Use download instead.', 'error')
        return
      }

      const response = await fetch(`/api/download/${file.id}`, {
        headers: { 'x-user-email': user?.email || '' }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to load file for preview: ${response.status}`)
      }
      
      const encryptionKey = response.headers.get('X-Encryption-Key')
      const iv = response.headers.get('X-IV')
      
      if (!encryptionKey || !iv) {
        throw new Error('Missing encryption metadata')
      }
      
      const encryptedBlob = await response.blob()
      const encryptedBuffer = await encryptedBlob.arrayBuffer()
      const encryptedData = new Uint8Array(encryptedBuffer)
      
      const { decryptFile, base64ToKey } = await import('@/lib/crypto')
      const key = base64ToKey(encryptionKey)
      const ivArray = new Uint8Array(atob(iv).split('').map(c => c.charCodeAt(0)))
      const decryptedData = await decryptFile(encryptedData, key, ivArray)
      
      const blob = new Blob([decryptedData], { type: detectedMimeType })
      const url = URL.createObjectURL(blob)
      
      setPreviewModal({ file, url, isOffice: false })
      
    } catch (error) {
      console.error('Preview error:', error)
      showToast(`Failed to preview file: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }

  const getPublicFileUrl = async (fileId: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/public-url/${fileId}`, {
        headers: { 'x-user-email': user?.email || '' }
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.publicUrl
      }
    } catch (error) {
      console.log('Public URL not available')
    }
    return null
  }

  const handleDownload = async (file: FileItem) => {
    try {
      const response = await fetch(`/api/download/${file.id}`, {
        headers: { 'x-user-email': user?.email || '' }
      })
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }
      
      const encryptionKey = response.headers.get('X-Encryption-Key')
      const iv = response.headers.get('X-IV')
      
      if (!encryptionKey || !iv) {
        throw new Error('Missing encryption metadata')
      }
      
      const encryptedBlob = await response.blob()
      const encryptedBuffer = await encryptedBlob.arrayBuffer()
      const encryptedData = new Uint8Array(encryptedBuffer)
      
      const { decryptFile, base64ToKey } = await import('@/lib/crypto')
      const key = base64ToKey(encryptionKey)
      const ivArray = new Uint8Array(atob(iv).split('').map(c => c.charCodeAt(0)))
      const decryptedData = await decryptFile(encryptedData, key, ivArray)
      
      const blob = new Blob([decryptedData])
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      showToast('File downloaded successfully', 'success')
    } catch (error) {
      console.error('Download error:', error)
      showToast(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-file-item]') || target.closest('input[type="checkbox"]') || target.closest('button')) {
      return
    }

    setBulkMode(true)
    setDragSelect({
      isSelecting: true,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY
    })
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragSelect.isSelecting) return
    
    setDragSelect(prev => ({
      ...prev,
      currentX: e.clientX,
      currentY: e.clientY
    }))
  }, [dragSelect.isSelecting])

  const handleMouseUp = useCallback(() => {
    setDragSelect(prev => ({ ...prev, isSelecting: false }))
  }, [])

  const getSelectionBoxStyle = useCallback(() => {
    if (!dragSelect.isSelecting) return { display: 'none' }
    
    const container = fileListRef.current
    const containerRect = container?.getBoundingClientRect() || { left: 0, top: 0 }
    
    return {
      position: 'absolute' as const,
      left: Math.min(dragSelect.startX, dragSelect.currentX) - containerRect.left,
      top: Math.min(dragSelect.startY, dragSelect.currentY) - containerRect.top,
      width: Math.abs(dragSelect.currentX - dragSelect.startX),
      height: Math.abs(dragSelect.currentY - dragSelect.startY),
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgb(59, 130, 246)',
      zIndex: 1000,
      pointerEvents: 'none'
    }
  }, [dragSelect])

  const quickSelectAll = useCallback(() => {
    setBulkMode(true)
    setSelectedFiles(new Set(files.map(f => f.id)))
    setSelectedFolders(new Set(folders.map(f => f.id)))
  }, [files, folders])

  const quickSelectAllFiles = useCallback(() => {
    setBulkMode(true)
    setSelectedFiles(new Set(files.map(f => f.id)))
  }, [files])

  const quickSelectAllFolders = useCallback(() => {
    setBulkMode(true)
    setSelectedFolders(new Set(folders.map(f => f.id)))
  }, [folders])

  const toggleFileSelection = useCallback((fileId: string, ctrlKey = false, shiftKey = false) => {
    setSelectedFiles(prev => {
      const newSelected = new Set(prev)
      
      if (newSelected.has(fileId)) {
        newSelected.delete(fileId)
      } else {
        if (!ctrlKey && !bulkMode) {
          newSelected.clear()
        }
        newSelected.add(fileId)
      }
      return newSelected
    })
    
    if (!bulkMode) setBulkMode(true)
  }, [bulkMode])

  const toggleFolderSelection = useCallback((folderId: string, ctrlKey = false) => {
    setSelectedFolders(prev => {
      const newSelected = new Set(prev)
      if (newSelected.has(folderId)) {
        newSelected.delete(folderId)
      } else {
        if (!ctrlKey && !bulkMode) {
          newSelected.clear()
        }
        newSelected.add(folderId)
      }
      return newSelected
    })
    
    if (!bulkMode) setBulkMode(true)
  }, [bulkMode])

  const selectAllFiles = useCallback(() => {
    if (selectedFiles.size === files.length && selectedFolders.size === folders.length) {
      setSelectedFiles(new Set())
      setSelectedFolders(new Set())
    } else {
      setSelectedFiles(new Set(files.map(f => f.id)))
      setSelectedFolders(new Set(folders.map(f => f.id)))
    }
  }, [files, folders, selectedFiles.size, selectedFolders.size])

  const clearSelections = useCallback(() => {
    setSelectedFiles(new Set())
    setSelectedFolders(new Set())
    setBulkMode(false)
  }, [])

  const handleCleanupPartialUpload = async () => {
    if (!user || largeUploadProgress.uploadedFileIds.length === 0) return

    try {
      let deletedCount = 0
      for (const fileId of largeUploadProgress.uploadedFileIds) {
        try {
          const response = await fetch(`/api/project-files?id=${fileId}`, {
            method: 'DELETE',
            headers: { 'x-user-email': user.email }
          })
          
          if (response.ok) {
            deletedCount++
          }
        } catch (error) {
          console.error('Error deleting file:', fileId, error)
        }
      }

      showToast(`Cleaned up ${deletedCount} files`, 'success')
      
      setLargeUploadProgress(prev => ({ 
        ...prev, 
        show: false, 
        uploadedFileIds: [],
        completed: 0,
        total: 0,
        failed: 0,
        fileProgress: {}
      }))
      
      fetchFiles()
      fetchFolders()
    } catch (error) {
      console.error('Cleanup error:', error)
      showToast('Failed to cleanup some files', 'error')
    }
  }

  const [showCleanupOption, setShowCleanupOption] = useState(false)

  useEffect(() => {
    const recentFiles = files.filter(file => {
      const uploadTime = new Date(file.createdAt).getTime()
      const oneHourAgo = Date.now() - (60 * 60 * 1000)
      return uploadTime > oneHourAgo && !file.folderId && currentFolder === null
    })
    
    setShowCleanupOption(recentFiles.length > 10)
  }, [files, currentFolder])

  const handleQuickCleanupScatteredFiles = async () => {
    if (!user) return

    const recentFiles = files.filter(file => {
      const uploadTime = new Date(file.createdAt).getTime()
      const oneHourAgo = Date.now() - (60 * 60 * 1000)
      return uploadTime > oneHourAgo && !file.folderId && currentFolder === null
    })

    if (recentFiles.length === 0) {
      showToast('No recent scattered files found', 'error')
      return
    }

    const confirmed = confirm(
      `Found ${recentFiles.length} recently uploaded files scattered in root.\n\n` +
      `Do you want to delete them? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      let deletedCount = 0
      for (const file of recentFiles) {
        try {
          const response = await fetch(`/api/project-files?id=${file.id}`, {
            method: 'DELETE',
            headers: { 'x-user-email': user.email }
          })
          
          if (response.ok) {
            deletedCount++
          }
        } catch (error) {
          console.error('Error deleting file:', file.id, error)
        }
      }

      showToast(`Cleaned up ${deletedCount} scattered files`, 'success')
      fetchFiles()
    } catch (error) {
      console.error('Quick cleanup error:', error)
      showToast('Failed to cleanup some files', 'error')
    }
  }

  const handleBulkDelete = async () => {
    const totalSelected = selectedFiles.size + selectedFolders.size
    if (totalSelected === 0) return

    if (!confirm(`Are you sure you want to delete ${totalSelected} item(s)?`)) {
      return
    }

    try {
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      for (const fileId of selectedFiles) {
        try {
          const response = await fetch(`/api/project-files?id=${fileId}`, {
            method: 'DELETE',
            headers: { 'x-user-email': user!.email }
          })
          
          if (response.ok) {
            successCount++
          } else {
            const errorText = await response.text()
            errors.push(`File delete failed: ${errorText}`)
            errorCount++
          }
        } catch (error) {
          errors.push(`File delete error: ${error instanceof Error ? error.message : 'Unknown error'}`)
          errorCount++
        }
      }

      if (selectedFolders.size > 0) {
        const maxAttempts = 5
        let remainingFolders = new Set(selectedFolders)

        for (let attempt = 1; attempt <= maxAttempts && remainingFolders.size > 0; attempt++) {
          const foldersToRetry = new Set<string>()

          for (const folderId of remainingFolders) {
            try {
              const response = await fetch(`/api/folders?id=${folderId}`, {
                method: 'DELETE'
              })
              
              if (response.ok) {
                successCount++
              } else {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                
                if (errorData.error?.includes('subfolders') || errorData.error?.includes('Cannot delete')) {
                  foldersToRetry.add(folderId)
                } else {
                  errors.push(`Folder delete failed: ${errorData.error}`)
                  errorCount++
                }
              }
            } catch (error) {
              errors.push(`Folder delete error: ${error instanceof Error ? error.message : 'Unknown error'}`)
              errorCount++
            }
          }

          remainingFolders = foldersToRetry

          if (foldersToRetry.size === remainingFolders.size && attempt > 1) {
            break
          }

          if (remainingFolders.size > 0 && attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        }

        if (remainingFolders.size > 0) {
          for (const folderId of remainingFolders) {
            errors.push(`Folder could not be deleted: may contain subfolders not selected for deletion`)
            errorCount++
          }
        }
      }

      if (successCount > 0) {
        showToast(`${successCount} item(s) deleted successfully`, 'success')
      }
      
      if (errorCount > 0) {
        console.error('Delete errors:', errors)
        showToast(`${errorCount} item(s) failed to delete. Check console for details.`, 'error')
        
        const folderErrors = errors.filter(e => e.includes('subfolders') || e.includes('Folder'))
        if (folderErrors.length > 0) {
          setTimeout(() => {
            showToast('💡 Tip: Select all nested folders first, or delete folder contents manually', 'error')
          }, 2000)
        }
      }

      clearSelections()
      fetchData()
    } catch (error) {
      console.error('Bulk delete error:', error)
      showToast(`Failed to delete items: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }

  const handleDeepDelete = async () => {
    const totalSelected = selectedFiles.size + selectedFolders.size
    if (totalSelected === 0) return

    const confirmed = confirm(
      `⚠️ DEEP DELETE WARNING ⚠️\n\n` +
      `This will delete ${totalSelected} item(s) and ALL their contents recursively.\n\n` +
      `Selected folders will be deleted along with:\n` +
      `• All subfolders\n` +
      `• All files inside\n` +
      `• ALL nested content\n\n` +
      `This action CANNOT be undone!\n\n` +
      `Are you absolutely sure?`
    )

    if (!confirmed) return

    try {
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      for (const fileId of selectedFiles) {
        try {
          const response = await fetch(`/api/project-files?id=${fileId}`, {
            method: 'DELETE',
            headers: { 'x-user-email': user!.email }
          })
          
          if (response.ok) {
            successCount++
          } else {
            errorCount++
          }
        } catch (error) {
          errorCount++
        }
      }

      for (const folderId of selectedFolders) {
        try {
          const deletedCount = await deletefolderRecursive(folderId)
          successCount += deletedCount
        } catch (error) {
          console.error('Deep delete error for folder:', folderId, error)
          errors.push(`Failed to deep delete folder: ${error instanceof Error ? error.message : 'Unknown error'}`)
          errorCount++
        }
      }

      if (successCount > 0) {
        showToast(`${successCount} item(s) deleted successfully (deep delete)`, 'success')
      }
      
      if (errorCount > 0) {
        showToast(`${errorCount} item(s) failed to delete`, 'error')
      }

      clearSelections()
      fetchData()
    } catch (error) {
      console.error('Deep delete error:', error)
      showToast(`Deep delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }

  const deletefolderRecursive = async (folderId: string): Promise<number> => {
    let deletedCount = 0

    try {
      const [filesResponse, foldersResponse] = await Promise.all([
        fetch(`/api/project-files?folderId=${folderId}`, {
          headers: { 'x-user-email': user!.email }
        }),
        fetch(`/api/folders?parentId=${folderId}`)
      ])

      if (filesResponse.ok) {
        const filesData = await filesResponse.json()
        const folderFiles = filesData.files || []
        
        for (const file of folderFiles) {
          try {
            const deleteResponse = await fetch(`/api/project-files?id=${file.id}`, {
              method: 'DELETE',
              headers: { 'x-user-email': user!.email }
            })
            
            if (deleteResponse.ok) {
              deletedCount++
            }
          } catch (error) {
            console.error('Failed to delete file in folder:', file.id, error)
          }
        }
      }

      if (foldersResponse.ok) {
        const foldersData = await foldersResponse.json()
        const subfolders = foldersData.folders || []
        
        for (const subfolder of subfolders) {
          const subDeletedCount = await deletefolderRecursive(subfolder.id)
          deletedCount += subDeletedCount
        }
      }

      const folderDeleteResponse = await fetch(`/api/folders?id=${folderId}`, {
        method: 'DELETE'
      })
      
      if (folderDeleteResponse.ok) {
        deletedCount++
      }

    } catch (error) {
      console.error('Error in recursive folder deletion:', folderId, error)
      throw error
    }

    return deletedCount
  }

  const handleBulkDownload = async () => {
    if (selectedFiles.size === 0) {
      showToast('No files selected for download', 'error')
      return
    }

    showToast(`Downloading ${selectedFiles.size} file(s)...`, 'success')

    for (const fileId of selectedFiles) {
      const file = files.find(f => f.id === fileId)
      if (file) {
        try {
          await handleDownload(file)
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (error) {
          console.error(`Failed to download ${file.name}:`, error)
        }
      }
    }

    clearSelections()
  }

  const handleRename = async () => {
    if (!contextMenu) return
    
    const newName = prompt(`Rename ${contextMenu.item.name}:`, contextMenu.item.name)
    if (!newName || newName === contextMenu.item.name) {
      setContextMenu(null)
      return
    }

    try {
      if (contextMenu.type === 'folder') {
        const response = await fetch(`/api/folders?id=${contextMenu.item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName.trim() })
        })
        
        if (response.ok) {
          showToast('Renamed successfully', 'success')
          fetchFolders()
        } else {
          throw new Error('Rename failed')
        }
      } else {
        showToast('File rename not implemented yet', 'error')
      }
    } catch (error) {
      console.error('Rename error:', error)
      showToast('Failed to rename', 'error')
    }
    setContextMenu(null)
  }

  const handleDelete = async () => {
    if (!contextMenu) return

    if (!confirm(`Are you sure you want to delete "${contextMenu.item.name}"?`)) {
      setContextMenu(null)
      return
    }

    try {
      if (contextMenu.type === 'folder') {
        const response = await fetch(`/api/folders?id=${contextMenu.item.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          showToast('Folder deleted successfully', 'success')
          fetchFolders()
          fetchFiles()
        } else {
          const error = await response.json()
          showToast(error.error || 'Failed to delete folder', 'error')
        }
      } else {
        const response = await fetch(`/api/project-files?id=${contextMenu.item.id}`, {
          method: 'DELETE',
          headers: { 'x-user-email': user!.email }
        })
        
        if (response.ok) {
          showToast('File deleted successfully', 'success')
          fetchFiles()
        } else {
          showToast('Failed to delete file', 'error')
        }
      }
    } catch (error: any) {
      console.error('Delete error:', error)
      showToast(error.message || 'Failed to delete', 'error')
    }
    setContextMenu(null)
  }
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div')
    toast.className = `toast ${type}`
    toast.textContent = message
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 24px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      border-radius: 6px;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      max-width: 400px;
      word-wrap: break-word;
    `
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 4000)
  }, [])
  const {
  isDragging,
  dragOverFolder,
  handleDragDrop,
  dragEventHandlers,
  getFolderDragHandlers
} = useDragDrop({
  user,
  currentFolder,
  showToast,
  fetchFiles,
  fetchFolders,
  handleDroppedFiles
})

  const getFileIcon = useCallback((mimeType: string, fileName: string) => {
    const detectedType = mimeType || detectMimeTypeFromFilename(fileName)
    
    if (detectedType?.includes('word') || fileName?.match(/\.docx?$/i)) return '📄'
    if (detectedType?.includes('excel') || detectedType?.includes('spreadsheet') || fileName?.match(/\.xlsx?$/i)) return '📊'
    if (detectedType?.includes('powerpoint') || detectedType?.includes('presentation') || fileName?.match(/\.pptx?$/i)) return '📋'
    if (detectedType?.startsWith('image/')) return '🖼️'
    if (detectedType?.startsWith('video/')) return '🎬'
    if (detectedType?.startsWith('audio/')) return '🎵'
    if (detectedType?.includes('pdf')) return '📄'
    if (detectedType?.startsWith('text/') || detectedType?.includes('json')) return '📝'
    if (fileName?.match(/\.(js|jsx|ts|tsx)$/i)) return '⚡'
    if (fileName?.match(/\.(html|htm|css)$/i)) return '🌐'
    return '📄'
  }, [detectMimeTypeFromFilename])

  const fileIcons = useMemo(() => {
    return files.reduce((acc, file) => {
      acc[file.id] = getFileIcon(file.mimeType, file.name)
      return acc
    }, {} as { [key: string]: string })
  }, [files, getFileIcon])

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }, [])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <p className="text-gray-600">Authentication required</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        .dialog-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }
        
        .dialog-content {
          background: white;
          padding: 24px;
          border-radius: 8px;
          max-width: 400px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .preview-modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 60;
        }

        .preview-content {
          background: white;
          border-radius: 8px;
          max-width: 90%;
          max-height: 90%;
          overflow: auto;
        }
        
        .button {
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          text-decoration: none;
        }
        
        .button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .button-primary {
          background: #3b82f6;
          color: white;
        }
        
        .button-primary:hover:not(:disabled) {
          background: #2563eb;
        }
        
        .button-outline {
          background: white;
          border: 1px solid #e5e7eb;
          color: #374151;
        }
        
        .button-outline:hover:not(:disabled) {
          background: #f9fafb;
        }
        
        .button-ghost {
          background: transparent;
          color: #6b7280;
          padding: 8px;
        }
        
        .button-ghost:hover:not(:disabled) {
          background: #f3f4f6;
        }
        
        .context-menu {
          position: fixed;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
          padding: 4px 0;
          z-index: 100;
          min-width: 160px;
        }

        .context-menu button {
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          padding: 8px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .context-menu button:hover {
          background: #f3f4f6;
        }

        .upload-progress {
          margin-top: 16px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 6px;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: #e2e8f0;
          border-radius: 2px;
          overflow: hidden;
          margin-top: 4px;
        }

        .progress-fill {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s ease;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  className="button button-ghost"
                  onClick={() => currentFolder ? setCurrentFolder(null) : router.push('/dashboard')}
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold">Projects</h1>
                  <p className="text-sm text-gray-500">{user.name} - {user.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {showCleanupOption && (
                  <div className="flex items-center gap-2 mr-4 px-3 py-1 bg-orange-50 border border-orange-200 rounded">
                    <span className="text-sm text-orange-700">
                      🧹 Scattered files detected
                    </span>
                    <button
                      className="button button-outline text-xs text-orange-600"
                      onClick={handleQuickCleanupScatteredFiles}
                    >
                      Cleanup
                    </button>
                  </div>
                )}
                
                {(selectedFiles.size > 0 || selectedFolders.size > 0) && (
                  <div className="flex items-center gap-2 mr-4">
                    <span className="text-sm text-gray-600">
                      {selectedFiles.size + selectedFolders.size} selected
                    </span>
                    <button
                      className="button button-outline text-sm"
                      onClick={clearSelections}
                    >
                      Clear
                    </button>
                    {selectedFiles.size > 0 && (
                      <button
                        className="button button-outline text-sm"
                        onClick={handleBulkDownload}
                      >
                        <Download size={14} />
                        Download All
                      </button>
                    )}
                    <button
                      className="button button-outline text-sm text-red-600"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 size={14} />
                      Delete All
                    </button>
                    {selectedFolders.size > 0 && (
                      <button
                        className="button button-outline text-sm text-red-600"
                        onClick={handleDeepDelete}
                        title="Delete folders and all their contents recursively"
                      >
                        🗑️ Deep Delete
                      </button>
                    )}
                  </div>
                )}
                <button
                  className={`button ${bulkMode ? 'button-primary' : 'button-outline'} text-sm`}
                  onClick={() => setBulkMode(!bulkMode)}
                >
                  {bulkMode ? 'Exit Bulk' : 'Bulk Select'}
                </button>
                <button
                  className="button button-outline"
                  onClick={() => setCreateFolderDialogOpen(true)}
                >
                  <FolderPlus size={16} />
                  New Folder
                </button>
                <button
                  className="button button-primary"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <Upload size={16} />
                  Upload
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle size={16} />
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          
          {currentFolder && (
            <div className="px-6 py-2 bg-gray-50 border-b text-sm">
              <button 
                onClick={() => {
                  setCurrentFolder(null)
                  setCurrentFolderName(null)
                }}
                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                Projects
              </button>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-700">
                {currentFolderName || 'Loading...'}
              </span>
            </div>
          )}

          <div className="px-6 py-3 bg-gray-100 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Quick select:</span>
              <button
                onClick={quickSelectAll}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                All ({files.length + folders.length})
              </button>
              <button
                onClick={quickSelectAllFiles}
                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                All Files ({files.length})
              </button>
              <button
                onClick={quickSelectAllFolders}
                className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
              >
                All Folders ({folders.length})
              </button>
              {(selectedFiles.size > 0 || selectedFolders.size > 0) && (
                <button
                  onClick={clearSelections}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Clear ({selectedFiles.size + selectedFolders.size})
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>💡 Tips: Ctrl+Click (individual), Shift+Click (range)</span>
            </div>
          </div>

          <div 
            ref={fileListRef}
            className="p-6 relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onDragEnter={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // Only clear if leaving the main container
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX
              const y = e.clientY
              if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            
                getFolderDragHandlers(folder.id).onDragOver(null)
              }
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
            
              console.log('🎯 Main container drop - currentFolder:', currentFolder) // ← NY RAD
  console.log('📋 Drop in main container')
  handleDragDrop(e, currentFolder)
}}
          >
            <div className="space-y-2">
        

              {bulkMode && (files.length > 0 || folders.length > 0) && (
                <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded">
                  <input
                    type="checkbox"
                    checked={selectedFiles.size === files.length && selectedFolders.size === folders.length && (files.length > 0 || folders.length > 0)}
                    onChange={selectAllFiles}
                    className="mr-3"
                  />
                  <span className="text-sm font-medium text-blue-700">
                    Select All ({files.length + folders.length} items)
                  </span>
                </div>
              )}

              {folders.map(folder => (
                <div
                  key={folder.id}
                  data-file-item="folder"
                  draggable={true}
    onDragStart={(e) => {
      e.dataTransfer.setData('folderId', folder.id)
    }}
                  onDoubleClick={() => {
                    if (!bulkMode) {
                      setCurrentFolder(folder.id)
                      setCurrentFolderName(folder.name)
                    }
                  }}
                  onClick={(e) => {
                    if (bulkMode) {
                      toggleFolderSelection(folder.id, e.ctrlKey || e.metaKey)
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    setContextMenu({ x: e.clientX, y: e.clientY, item: folder, type: 'folder' })
                  }}
{...getFolderDragHandlers(folder.id)}
                  className={`flex items-center p-3 border-b cursor-pointer group transition-colors ${
                    selectedFolders.has(folder.id) 
                      ? 'bg-blue-100 border-blue-200' 
                      : dragOverFolder === folder.id
                      ? 'bg-green-100 border-green-300'
                      : 'hover:bg-gray-50'
                  }`}
                  title={bulkMode ? "Click to select" : "Double-click to open folder"}
                >
                  {bulkMode && (
                    <input
                      type="checkbox"
                      checked={selectedFolders.has(folder.id)}
                      onChange={() => toggleFolderSelection(folder.id)}
                      className="mr-3"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <div className="flex items-center gap-3 flex-1">
                    <Folder className={`${dragOverFolder === folder.id ? 'text-green-600' : 'text-blue-500'}`} size={20} />
                    <span className="font-medium text-gray-900">{folder.name}</span>
                    {dragOverFolder === folder.id && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        Drop here
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mr-4">
                    Folder
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(folder.createdAt)}
                  </div>
                </div>
              ))}

{files.map(file => (
                <div
                  key={file.id}
                  data-file-item="file"
                  draggable={!bulkMode}
   onDragStart={(e) => {
  console.log('🎯 File drag started:', file.id)
  
  // Stäng av bulk-mode och sätt drag-data
  if (bulkMode) {
    setBulkMode(false)
  }
  
  // Sätt alltid fileId eftersom vi stänger av bulk-mode ovan
  e.dataTransfer.setData('fileId', file.id)
  console.log('✅ Set fileId for drag:', file.id)
}}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    setContextMenu({ x: e.clientX, y: e.clientY, item: file, type: 'file' })
                  }}
                  className={`flex items-center p-3 border-b cursor-pointer group transition-colors ${
                    selectedFiles.has(file.id) 
                      ? 'bg-blue-100 border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {bulkMode && (
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                      className="mr-3"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <div 
                    className="flex items-center gap-3 flex-1"
                    onClick={(e) => {
                      if (bulkMode) {
                        toggleFileSelection(file.id, e.ctrlKey || e.metaKey, e.shiftKey)
                      } else {
                        handleFilePreview(file)
                      }
                    }}
                    title={bulkMode ? "Click to select" : "Click to preview file"}
                  >
                    <div className="flex items-center gap-2">
                      <File className="text-gray-500" size={20} />
                      <span className="text-lg">{fileIcons[file.id] || '📄'}</span>
                    </div>
                    <span className={`text-gray-900 transition-colors ${!bulkMode ? 'hover:text-blue-600' : ''}`}>
                      {file.name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mr-4">
                    {formatFileSize(file.size)}
                  </div>
                  <div className="text-sm text-gray-500 mr-4">
                    {formatDate(file.createdAt)}
                  </div>
                  {!bulkMode && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-1 hover:bg-gray-200 rounded"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFilePreview(file)
                        }}
                        title="Preview file"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-1 hover:bg-gray-200 rounded"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(file)
                        }}
                        title="Download file"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={getSelectionBoxStyle()} />

            {files.length === 0 && folders.length === 0 && (
              <div 
                className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDragEnter={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleDragDrop(e, currentFolder)
                }}
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.multiple = true
                  input.accept = '*/*'
                  input.style.display = 'none'
                  
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files
                    if (files && files.length > 0) {
                      handleDroppedFiles(Array.from(files))
                    }
                    document.body.removeChild(input)
                  }
                  
                  document.body.appendChild(input)
                  input.click()
                }}
              >
                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-500 mb-2">No files or folders yet</p>
                <p className="text-sm text-gray-400">
                  Drag files here or <span className="text-blue-600 underline">click to browse</span>
                </p>
              </div>
            )}

            {(files.length > 0 || folders.length > 0) && (
              <div 
                className="mt-6 p-8 border-2 border-dashed border-gray-200 rounded-lg text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDragEnter={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleDragDrop(e, currentFolder)
                }}
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.multiple = true
                  input.accept = '*/*'
                  input.style.display = 'none'
                  
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files
                    if (files && files.length > 0) {
                      handleDroppedFiles(Array.from(files))
                    }
                    document.body.removeChild(input)
                  }
                  
                  document.body.appendChild(input)
                  input.click()
                }}
              >
  <div className="flex flex-col items-center">
    {/* Upload ikon */}
    <div className="mb-4">
      <Upload className="mx-auto text-gray-400" size={40} />
    </div>
    
    <p className="text-lg font-medium text-gray-700 mb-2">
      Drop files or folders here
    </p>
    <p className="text-sm text-gray-500 mb-4">
      or <span className="text-blue-600 underline font-medium cursor-pointer hover:text-blue-800">click to browse and upload</span>
    </p>
    
    {/* Upload knapp */}
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
      <Upload size={16} className="text-gray-600" />
      <span className="font-medium text-gray-700">Upload Files & Folders</span>
    </div>
    
    <p className="text-xs text-gray-400 mt-4">
      Supports entire folder structures with all subfolders and files
    </p>
  </div>
</div>
)}
          </div>  {/* Stänger file list container (p-6 relative) */}
        </div>    {/* Stänger bg-white rounded-lg shadow */}
      </div>      {/* Stänger max-w-7xl mx-auto */}

      {uploadDialogOpen && (
        <div className="dialog-overlay" onClick={() => setUploadDialogOpen(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Upload Files</h2>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="w-full p-2 border rounded"
            />
            <p className="text-sm text-gray-500 mt-2">
              Maximum file size: 100MB (500MB for dev files). All file types supported.
            </p>
            
            {Object.keys(uploadProgress).length > 0 && (
              <div className="upload-progress">
                <h4 className="font-medium mb-2">Upload Progress:</h4>
                {Object.entries(uploadProgress).map(([filename, progress]) => (
                  <div key={filename} className="mb-2">
                    <div className="flex justify-between text-sm">
                      <span className="truncate">{filename}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={() => setUploadDialogOpen(false)}
              className="button button-outline w-full mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {largeUploadProgress.show && (
        <div className="dialog-overlay">
          <div className="dialog-content" style={{ maxWidth: '600px' }}>
            <h2 className="text-xl font-bold mb-4">Large Upload in Progress</h2>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{largeUploadProgress.completed} / {largeUploadProgress.total} files</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${largeUploadProgress.total > 0 ? (largeUploadProgress.completed / largeUploadProgress.total) * 100 : 0}%`,
                    backgroundColor: largeUploadProgress.failed > 0 ? '#f59e0b' : '#10b981'
                  }}
                />
              </div>
              {largeUploadProgress.failed > 0 && (
                <p className="text-sm text-orange-600 mt-1">
                  {largeUploadProgress.failed} files failed
                </p>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto">
              <h4 className="font-medium mb-2">File Progress:</h4>
              {Object.entries(largeUploadProgress.fileProgress).map(([fileName, progress]) => (
                <div key={fileName} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate mr-2" title={fileName}>{fileName}</span>
                    <span className="text-xs">
                      {progress === -1 ? 'Failed' : progress === 100 ? 'Complete' : `${progress}%`}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${Math.max(0, progress)}%`,
                        backgroundColor: progress === -1 ? '#ef4444' : progress === 100 ? '#10b981' : '#3b82f6'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-700">
                ⚠️ Please keep this tab open until upload completes. 
                Closing the tab will cancel the upload.
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              {largeUploadProgress.completed < largeUploadProgress.total && (
                <button
                  onClick={() => {
                    const confirmCancel = confirm('Are you sure you want to cancel the upload?')
                    if (confirmCancel) {
                      setLargeUploadProgress(prev => ({ ...prev, show: false }))
                      showToast('Upload cancelled', 'error')
                    }
                  }}
                  className="button button-outline flex-1"
                >
                  Cancel Upload
                </button>
              )}
              
              {largeUploadProgress.completed > 0 && (
                <button
                  onClick={async () => {
                    const confirmCleanup = confirm(
                      `Clean up ${largeUploadProgress.completed} uploaded files? This will delete all files uploaded in this session.`
                    )
                    if (confirmCleanup) {
                      await handleCleanupPartialUpload()
                    }
                  }}
                  className="button button-outline flex-1 text-red-600"
                >
                  🧹 Cleanup Files
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {createFolderDialogOpen && (
        <div className="dialog-overlay" onClick={() => setCreateFolderDialogOpen(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Create Folder</h2>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full p-2 border rounded"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCreateFolder}
                className="button button-primary flex-1"
                disabled={!newFolderName.trim()}
              >
                Create
              </button>
              <button
                onClick={() => {
                  setCreateFolderDialogOpen(false)
                  setNewFolderName('')
                }}
                className="button button-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {previewModal && (
        <div className="preview-modal" onClick={() => {
          URL.revokeObjectURL(previewModal.url)
          setPreviewModal(null)
        }}>
          <div 
            className="preview-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '95vw',
              maxHeight: '95vh',
              width: previewModal.file.name.toLowerCase().endsWith('.pdf') ? '90vw' : 'auto',
              height: previewModal.file.name.toLowerCase().endsWith('.pdf') ? '90vh' : 'auto'
            }}
          >
            <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-lg font-bold truncate mr-4">{previewModal.file.name}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const file = files.find(f => f.id === previewModal.file.id)
                    if (file) handleDownload(file)
                  }}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1"
                  title="Download file"
                >
                  <Download size={14} />
                  Download
                </button>
                <button
                  onClick={() => {
                    URL.revokeObjectURL(previewModal.url)
                    setPreviewModal(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>
            
 
            <div className="overflow-auto" style={{ height: 'calc(100% - 80px)' }}>
              {previewModal.isOffice && (
                <iframe 
                  src={previewModal.url}
                  className="w-full h-full border-0"
                  title={`Preview of ${previewModal.file.name}`}
                  style={{ minHeight: '700px' }}
                />
              )}

              {!previewModal.isOffice && (
                (previewModal.file.mimeType?.startsWith('image/') || 
                 detectMimeTypeFromFilename(previewModal.file.name).startsWith('image/'))
              ) && (
                <div className="p-4 flex justify-center">
                  <img 
                    src={previewModal.url} 
                    alt={previewModal.file.name}
                    className="max-w-full h-auto object-contain"
                    style={{ maxHeight: '80vh' }}
                  />
                </div>
              )}

              {!previewModal.isOffice && (
                (previewModal.file.mimeType?.startsWith('video/') || 
                 detectMimeTypeFromFilename(previewModal.file.name).startsWith('video/'))
              ) && (
                <div className="p-4 flex justify-center bg-black">
                  <video 
                    src={previewModal.url}
                    controls
                    className="max-w-full h-auto rounded"
                    style={{ maxHeight: '80vh' }}
                    preload="metadata"
                  >
                    <p className="text-white">Your browser doesn't support video playback.</p>
                  </video>
                </div>
              )}

              {!previewModal.isOffice && (
                (previewModal.file.mimeType?.startsWith('audio/') || 
                 detectMimeTypeFromFilename(previewModal.file.name).startsWith('audio/'))
              ) && (
                <div className="p-8 flex flex-col items-center bg-gradient-to-br from-blue-50 to-purple-50">
                  <div className="text-6xl mb-4">🎵</div>
                  <h3 className="text-lg font-semibold mb-4 text-center">{previewModal.file.name}</h3>
                  <audio 
                    src={previewModal.url}
                    controls
                    className="w-full max-w-md"
                    preload="metadata"
                  >
                    <p>Your browser doesn't support audio playback.</p>
                  </audio>
                  <div className="mt-4 text-sm text-gray-600 text-center">
                    <p>Use the controls above to play the audio file</p>
                  </div>
                </div>
              )}

              {!previewModal.isOffice && (
                (previewModal.file.mimeType?.includes('pdf') || 
                 previewModal.file.name.toLowerCase().endsWith('.pdf') ||
                 detectMimeTypeFromFilename(previewModal.file.name) === 'application/pdf')
              ) && (
                <div className="w-full h-full">
                  <embed 
                    src={previewModal.url} 
                    type="application/pdf"
                    className="w-full h-full border-0"
                    title={`PDF Preview of ${previewModal.file.name}`}
                    style={{ minHeight: '800px' }}
                  />
                </div>
              )}

              {!previewModal.isOffice && (
                (previewModal.file.mimeType?.startsWith('text/') || 
                 ['application/json', 'application/xml', 'application/javascript', 'application/typescript'].includes(
                   detectMimeTypeFromFilename(previewModal.file.name)
                 ))
              ) && (
                <div className="p-4">
                  <iframe 
                    src={previewModal.url}
                    className="w-full border rounded"
                    title={`Text Preview of ${previewModal.file.name}`}
                    style={{ height: '600px' }}
                  />
                </div>
              )}

              {!previewModal.isOffice && 
                !(previewModal.file.mimeType?.startsWith('image/') || detectMimeTypeFromFilename(previewModal.file.name).startsWith('image/')) &&
                !(previewModal.file.mimeType?.startsWith('video/') || detectMimeTypeFromFilename(previewModal.file.name).startsWith('video/')) &&
                !(previewModal.file.mimeType?.startsWith('audio/') || detectMimeTypeFromFilename(previewModal.file.name).startsWith('audio/')) &&
                !(previewModal.file.mimeType?.includes('pdf') || previewModal.file.name.toLowerCase().endsWith('.pdf')) &&
                !(previewModal.file.mimeType?.startsWith('text/') || ['application/json', 'application/xml', 'application/javascript', 'application/typescript'].includes(detectMimeTypeFromFilename(previewModal.file.name))) && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-gray-500 mb-4">Preview not available for this file type</p>
                  <p className="text-sm text-gray-400 mb-4">
                    File: {previewModal.file.name}<br/>
                    Size: {formatFileSize(previewModal.file.size)}<br/>
                    Type: {previewModal.file.mimeType || 'Unknown'}
                  </p>
                  <button
                    onClick={() => {
                      const file = files.find(f => f.id === previewModal.file.id)
                      if (file) handleDownload(file)
                    }}
                    className="button button-primary"
                  >
                    <Download size={16} />
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {(selectedFiles.size > 0 || selectedFolders.size > 0) && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white shadow-xl border rounded-lg p-4 z-50">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedFiles.size + selectedFolders.size} selected
            </span>
            <div className="flex gap-2">
              {selectedFiles.size > 0 && (
                <button
                  onClick={handleBulkDownload}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1"
                >
                  <Download size={14} />
                  Download All
                </button>
              )}
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
              >
                <Trash2 size={14} />
                Delete All
              </button>
              {selectedFolders.size > 0 && (
                <button
                  onClick={handleDeepDelete}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
                  title="Delete folders and all contents"
                >
                  🗑️ Deep Delete
                </button>
              )}
              <button
                onClick={clearSelections}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button onClick={handleRename}>
            <Edit2 size={16} />
            Rename
          </button>
          {contextMenu.type === 'file' && (
            <>
              <button
                onClick={() => {
                  handleFilePreview(contextMenu.item as FileItem)
                  setContextMenu(null)
                }}
              >
                <Eye size={16} />
                Preview
              </button>
              <button
                onClick={() => {
                  handleDownload(contextMenu.item as FileItem)
                  setContextMenu(null)
                }}
              >
                <Download size={16} />
                Download
              </button>
            </>
          )}
          <button onClick={handleDelete} style={{ color: '#dc2626' }}>
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}