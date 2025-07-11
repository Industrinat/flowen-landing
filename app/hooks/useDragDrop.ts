// hooks/useDragDrop.ts
import { useState, useCallback } from 'react'

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

interface UseDragDropProps {
  user: any
  currentFolder: string | null
  showToast: (message: string, type: 'success' | 'error') => void
  fetchFiles: () => void
  fetchFolders: () => void
  handleDroppedFiles: (files: File[], items?: DataTransferItemList) => void
}

export const useDragDrop = ({
  user,
  currentFolder,
  showToast,
  fetchFiles,
  fetchFolders,
  handleDroppedFiles
}: UseDragDropProps) => {
  
  const [isDragging, setIsDragging] = useState(false)
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null)

  // Hantera extern drag & drop (från dator)
  const handleExternalDragDrop = useCallback(async (
    e: React.DragEvent, 
    targetFolderId: string | null
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setDragOverFolder(null)

    if (!user) return

    console.log('📁 External drop to folder:', targetFolderId)

    const droppedFiles = Array.from(e.dataTransfer.files)
    const droppedItems = e.dataTransfer.items

    if (droppedFiles.length > 0 || (droppedItems && droppedItems.length > 0)) {
      console.log('📄 Processing external files from computer...')
      handleDroppedFiles(droppedFiles, droppedItems)
      return
    }
  }, [user, handleDroppedFiles])

  // Hantera intern fil-flytt (fil till mapp)
  const handleInternalFileDrop = useCallback(async (
    fileId: string,
    targetFolderId: string | null
  ) => {
    if (!user) return

    console.log('🔄 Moving file:', fileId, '→', targetFolderId)

    try {
      const response = await fetch(`/api/project-files?id=${fileId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify({ folderId: targetFolderId })
      })

      if (response.ok) {
        showToast('File moved successfully', 'success')
        fetchFiles()
      } else {
        const errorText = await response.text()
        throw new Error(`Move failed: ${errorText}`)
      }
    } catch (error) {
      console.error('File move error:', error)
      showToast(`Failed to move file: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }, [user, showToast, fetchFiles])

  // Hantera intern mapp-flytt (mapp till mapp)
  const handleInternalFolderDrop = useCallback(async (
    folderId: string,
    targetFolderId: string | null
  ) => {
    if (!user) return

    // Förhindra att flytta mapp till sig själv
    if (folderId === targetFolderId) {
      showToast('Cannot move folder into itself', 'error')
      return
    }

    // Förhindra cyklisk struktur (TODO: mer avancerad check)
    console.log('🔄 Moving folder:', folderId, '→', targetFolderId)

    try {
      const response = await fetch(`/api/folders?id=${folderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: targetFolderId })
      })

      if (response.ok) {
        showToast('Folder moved successfully', 'success')
        fetchFolders()
        fetchFiles() // Uppdatera även filer i fall de påverkats
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Move failed')
      }
    } catch (error) {
      console.error('Folder move error:', error)
      showToast(`Failed to move folder: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }, [user, showToast, fetchFolders, fetchFiles])

  // Huvudsakliga drop-hanteraren
  const handleDragDrop = useCallback(async (
    e: React.DragEvent, 
    targetFolderId: string | null
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverFolder(null)

    if (!user) return

    console.log('🎯 DRAG DROP DEBUG - Target:', targetFolderId)

    // Kolla intern fil-flytt
    const fileId = e.dataTransfer.getData('fileId')
    if (fileId) {
      await handleInternalFileDrop(fileId, targetFolderId)
      return
    }

    // Kolla intern mapp-flytt
    const folderId = e.dataTransfer.getData('folderId')
    if (folderId) {
      await handleInternalFolderDrop(folderId, targetFolderId)
      return
    }

    // Extern drop från dator
    await handleExternalDragDrop(e, targetFolderId)
  }, [user, handleInternalFileDrop, handleInternalFolderDrop, handleExternalDragDrop])

  // Event handlers för drag-visual feedback
  const dragEventHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
    },
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      // Only clear if leaving the main container
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX
      const y = e.clientY
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        setIsDragging(false)
        setDragOverFolder(null)
      }
    }
  }

  // Folder-specifika drag handlers
  const getFolderDragHandlers = (folderId: string) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragOverFolder(folderId)
    },
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragOverFolder(folderId)
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX
      const y = e.clientY
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        setDragOverFolder(null)
      }
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragOverFolder(null)
      console.log('📁 Drop on folder:', folderId)
      handleDragDrop(e, folderId)
    }
  })

  return {
    // State
    isDragging,
    dragOverFolder,
    
    // Handlers
    handleDragDrop,
    dragEventHandlers,
    getFolderDragHandlers,
    
    // State setters (för external control)
    setDragOverFolder
  }
}