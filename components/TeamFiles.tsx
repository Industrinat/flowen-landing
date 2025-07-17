// components/TeamFiles.tsx
'use client'
import { useTeam } from '@/hooks/useTeam'
import { useState, useEffect } from 'react'
import { FileText, Download, Eye, MoreVertical, Calendar, HardDrive } from 'lucide-react'

interface TeamFile {
  id: string
  fileName: string
  originalName: string
  mimeType: string
  size: number
  uploadedBy: {
    email: string
  }
  createdAt: string
}

export function TeamFiles() {
  const { currentTeam } = useTeam()
  const [files, setFiles] = useState<TeamFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentTeam) {
      setFiles([])
      setIsLoading(false)
      return
    }

    fetchTeamFiles()
  }, [currentTeam])

  const fetchTeamFiles = async () => {
    if (!currentTeam) return
    
    setIsLoading(true)
    setError(null)

    try {
      const token = window.getAccessToken?.()
      if (!token) {
        throw new Error('No access token')
      }

      const response = await fetch('/api/files', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Team-Id': currentTeam.id,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.status}`)
      }

      const data = await response.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error('Error fetching team files:', error)
      setError('Kunde inte ladda filer')
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return '🖼️'
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('document') || mimeType.includes('word')) return '📝'
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊'
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📈'
    if (mimeType.includes('video')) return '🎥'
    if (mimeType.includes('audio')) return '🎵'
    return '📁'
  }

  if (!currentTeam) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Välj ett team</h3>
          <p className="text-gray-500">Välj ett team för att se dess filer</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Laddar filer för {currentTeam.name}...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <FileText className="h-12 w-12 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Fel vid laddning</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchTeamFiles}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Försök igen
          </button>
        </div>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Inga filer än</h3>
          <p className="text-gray-500 mb-4">
            {currentTeam.name} har inga filer uppladdade än
          </p>
          <button 
            onClick={() => window.location.href = '/upload'}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Ladda upp första filen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Filer för {currentTeam.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {files.length} fil{files.length !== 1 ? 'er' : ''} totalt
            </p>
          </div>
          <button 
            onClick={fetchTeamFiles}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            Uppdatera
          </button>
        </div>
      </div>

      {/* Files List */}
      <div className="divide-y divide-gray-100">
        {files.map((file) => (
          <div key={file.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              {/* File Icon */}
              <div className="text-2xl flex-shrink-0">
                {getFileIcon(file.mimeType)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {file.originalName}
                  </h4>
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                    {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    {formatFileSize(file.size)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(file.createdAt)}
                  </div>
                  <div>
                    av {file.uploadedBy.email}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Totalt: {formatFileSize(files.reduce((acc, file) => acc + file.size, 0))}
          </span>
          <button 
            onClick={() => window.location.href = '/upload'}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Ladda upp fler filer →
          </button>
        </div>
      </div>
    </div>
  )
}