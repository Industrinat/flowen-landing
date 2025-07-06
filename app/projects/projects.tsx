// app/projects/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  FolderOpen, 
  Plus, 
  Upload, 
  File, 
  MoreVertical, 
  ArrowLeft,
  Folder,
  FileText,
  Image,
  Download
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  uploadDate: string;
  mimeType?: string;
  path: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentPath, setCurrentPath] = useState('/');
  const [items, setItems] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Auth check
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setIsAuthenticated(true);
    loadItems('/');
  }, [router]);

  // Mock data - will be replaced with API calls later
  const loadItems = (path: string) => {
    const mockItems: FileItem[] = [
      {
        id: '1',
        name: 'Project Documentation',
        type: 'folder',
        uploadDate: '2025-07-06',
        path: path + 'Project Documentation/'
      },
      {
        id: '2', 
        name: 'Images',
        type: 'folder',
        uploadDate: '2025-07-05',
        path: path + 'Images/'
      },
      {
        id: '3',
        name: 'report.pdf',
        type: 'file',
        size: 1024000,
        uploadDate: '2025-07-06',
        mimeType: 'application/pdf',
        path: path + 'report.pdf'
      },
      {
        id: '4',
        name: 'Meeting Notes',
        type: 'folder',
        uploadDate: '2025-07-04',
        path: path + 'Meeting Notes/'
      },
      {
        id: '5',
        name: 'budget-2025.xlsx',
        type: 'file',
        size: 856000,
        uploadDate: '2025-07-03',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        path: path + 'budget-2025.xlsx'
      }
    ];
    setItems(mockItems);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50/10');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50/10');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50/10');
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setIsUploading(true);
    
    try {
      for (const file of files) {
        await uploadFile(file);
      }
      loadItems(currentPath); // Reload items after upload
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFile = async (file: File) => {
    // Use same encryption as on main page
    const formData = new FormData();
    formData.append('encryptedFile', file);
    formData.append('iv', 'temp-iv-' + Date.now());
    formData.append('originalName', file.name);
    formData.append('originalSize', file.size.toString());
    formData.append('mimeType', file.type);
    formData.append('folder', currentPath);

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': JSON.stringify(user)
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    
    const newFolder: FileItem = {
      id: Date.now().toString(),
      name: newFolderName,
      type: 'folder',
      uploadDate: new Date().toISOString().split('T')[0],
      path: currentPath + newFolderName + '/'
    };
    
    setItems(prev => [...prev, newFolder]);
    setNewFolderName('');
    setShowNewFolderDialog(false);
  };

  const openItem = (item: FileItem) => {
    if (item.type === 'folder') {
      setCurrentPath(item.path);
      loadItems(item.path);
    } else {
      // Open file - implement later
      console.log('Opening file:', item.name);
    }
  };

  const goBack = () => {
    const pathParts = currentPath.split('/').filter(p => p);
    pathParts.pop();
    const newPath = '/' + pathParts.join('/') + (pathParts.length > 0 ? '/' : '');
    setCurrentPath(newPath);
    loadItems(newPath);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (item: FileItem) => {
    if (item.type === 'folder') {
      return <Folder className="w-8 h-8 text-blue-400" />;
    }
    
    if (item.mimeType?.startsWith('image/')) {
      return <Image className="w-8 h-8 text-green-400" />;
    }
    
    return <FileText className="w-8 h-8 text-gray-400" />;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-slate-900 text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="mr-4 p-2 hover:bg-white/10 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Project Rooms</h1>
              <p className="text-indigo-200 mt-1">Secure file management with folders</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowNewFolderDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Folder
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2">
            <span className="text-indigo-200">Path: </span>
            <span className="text-white">{currentPath}</span>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="mb-8 border-2 border-dashed border-white/30 rounded-2xl p-8 text-center bg-white/5 backdrop-blur transition-all hover:border-white/50 cursor-pointer"
        >
          <Upload className="w-12 h-12 text-white/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Drag and drop files here</h3>
          <p className="text-indigo-200">Or click to select files</p>
          {isUploading && (
            <div className="mt-4">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
              <p className="text-sm mt-2">Uploading...</p>
            </div>
          )}
        </div>

        {/* File/Folder Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Back button when not in root */}
          {currentPath !== '/' && (
            <div
              onClick={goBack}
              className="bg-white/10 backdrop-blur rounded-2xl p-4 cursor-pointer hover:bg-white/20 transition border border-white/10"
            >
              <div className="flex items-center mb-3">
                <ArrowLeft className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold">.. (Back)</h3>
            </div>
          )}

          {/* Items */}
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => openItem(item)}
              className="bg-white/10 backdrop-blur rounded-2xl p-4 cursor-pointer hover:bg-white/20 transition border border-white/10 group"
            >
              <div className="flex items-center justify-between mb-3">
                {getFileIcon(item)}
                <button className="opacity-0 group-hover:opacity-100 transition">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="font-semibold truncate mb-1">{item.name}</h3>
              <div className="text-sm text-indigo-200">
                <p>{item.uploadDate}</p>
                {item.size && <p>{formatFileSize(item.size)}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="text-center py-16">
            <FolderOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No content yet</h3>
            <p className="text-indigo-200">This folder is empty. Drag and drop files to get started!</p>
          </div>
        )}

        {/* New Folder Dialog */}
        {showNewFolderDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50">
            <div className="bg-white/20 backdrop-blur rounded-2xl p-6 w-96 border border-white/10">
              <h3 className="text-xl font-semibold mb-4">Create New Folder</h3>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 mb-4"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && createFolder()}
              />
              <div className="flex gap-3">
                <button
                  onClick={createFolder}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewFolderDialog(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}