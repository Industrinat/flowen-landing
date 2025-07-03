"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FolderOpen, Upload, FileText, LogOut, Plus, Download, Trash2, Shield, FolderPlus, Share2, Edit2 } from 'lucide-react';
import { generateEncryptionKey, encryptFile, decryptFile, keyToBase64, base64ToKey } from '@/lib/crypto';

interface FileItem {
  type: 'file' | 'folder';
  size?: number;
  encrypted?: boolean;
  encryptedUrl?: string;
  decryptionKey?: string;
  iv?: string;
  children?: Record<string, FileItem>;
}

interface ProjectFiles {
  [key: string]: Record<string, FileItem>;
}

export default function FileManagerPage() {
  const [currentPath, setCurrentPath] = useState('');
  const [selectedItem, setSelectedItem] = useState<{name: string, type: string} | null>(null);
  const [currentProject, setCurrentProject] = useState('Q1 Marketing Campaign');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<{name: string, content?: string} | null>(null);
  const [newFolderName, setNewFolderName] = useState('New folder');
  const [renameValue, setRenameValue] = useState('');
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, item: any} | null>(null);
  const [draggedItem, setDraggedItem] = useState<{name: string, type: string} | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<{name: string, path: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{name: string, path: string, type: string, project: string}>>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const router = useRouter();
  const userEmail = 'info@flowen.eu';

  const [projects, setProjects] = useState<ProjectFiles>({
    'Q1 Marketing Campaign': {
      'Documents': {
        type: 'folder',
        children: {
          'Contract.pdf': { type: 'file', size: 245632, encrypted: true },
          'Notes.txt': { type: 'file', size: 2048, encrypted: true }
        }
      },
      'Images': {
        type: 'folder',
        children: {
          'Logo.png': { type: 'file', size: 45678, encrypted: true }
        }
      },
      'Presentation.pptx': { type: 'file', size: 1456789, encrypted: true }
    },
    'Annual Report 2024': {
      'Q1 Report.pdf': { type: 'file', size: 3456789, encrypted: true },
      'Q2 Report.pdf': { type: 'file', size: 2987654, encrypted: true },
      'Charts': {
        type: 'folder',
        children: {}
      }
    },
    'Client Presentations': {}
  });

  // Load saved file structure from localStorage on mount
  useEffect(() => {
    const savedStructure = localStorage.getItem('flowen-file-structure');
    if (savedStructure) {
      try {
        setProjects(JSON.parse(savedStructure));
      } catch (error) {
        console.error('Failed to load file structure:', error);
      }
    }
  }, []);

  // Save file structure whenever it changes
  useEffect(() => {
    localStorage.setItem('flowen-file-structure', JSON.stringify(projects));
  }, [projects]);

  const getCurrentDirectory = () => {
    let dir = projects[currentProject] || {};
    if (currentPath) {
      const parts = currentPath.split('/');
      for (const part of parts) {
        if (!dir[part] || !dir[part].children) {
          // Path no longer exists, reset to root
          setCurrentPath('');
          return projects[currentProject] || {};
        }
        dir = (dir[part] as any).children || {};
      }
    }
    return dir;
  };

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    setContextMenu(null);
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const icons: Record<string, string> = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      txt: '📃',
      xls: '📊',
      xlsx: '📊',
      ppt: '📊',
      pptx: '📊',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      zip: '📦',
      rar: '📦'
    };
    return icons[ext || ''] || '📄';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentDir = getCurrentDirectory();
    
    for (const file of Array.from(files)) {
      try {
        console.log(`🔐 Encrypting ${file.name}...`);
        
        const encryptionKey = await generateEncryptionKey();
        const fileBuffer = await file.arrayBuffer();
        const { encryptedData, iv } = await encryptFile(fileBuffer, encryptionKey);
        
        const encryptedFileName = `encrypted_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.bin`;
        const encryptedFile = new File(
          [encryptedData], 
          encryptedFileName,
          { type: 'application/octet-stream' }
        );
        
        const formData = new FormData();
        formData.append('file', encryptedFile);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success && data.shareUrl) {
          currentDir[file.name] = {
            type: 'file',
            size: file.size,
            encrypted: true,
            encryptedUrl: data.shareUrl,
            decryptionKey: keyToBase64(encryptionKey),
            iv: keyToBase64(iv)
          };
          
          console.log(`✅ ${file.name} encrypted and uploaded successfully!`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${file.name}:`, error);
        alert(`Failed to upload ${file.name}`);
      }
    }
    
    setProjects({...projects});
  };

  const createFolder = () => {
    const currentDir = getCurrentDirectory();
    if (currentDir[newFolderName]) {
      alert('A folder with that name already exists');
      return;
    }
    
    currentDir[newFolderName] = {
      type: 'folder',
      children: {}
    };
    
    setProjects({...projects});
    setShowNewFolderModal(false);
    setNewFolderName('New folder');
  };

  const createProject = () => {
    if (!newProjectName.trim()) {
      alert('Please enter a project name');
      return;
    }
    
    if (projects[newProjectName]) {
      alert('A project with that name already exists');
      return;
    }
    
    setProjects({
      ...projects,
      [newProjectName]: {}
    });
    
    setCurrentProject(newProjectName);
    setShowNewProjectModal(false);
    setNewProjectName('');
  };

  const deleteProject = (projectName: string) => {
    if (!confirm(`Are you sure you want to delete the project "${projectName}"? This will delete all files and folders in it.`)) {
      return;
    }
    
    const newProjects = { ...projects };
    delete newProjects[projectName];
    
    setProjects(newProjects);
    
    // If we deleted the current project, switch to another one
    if (currentProject === projectName) {
      const remainingProjects = Object.keys(newProjects);
      if (remainingProjects.length > 0) {
        setCurrentProject(remainingProjects[0]);
        setCurrentPath(''); // Reset path when switching projects
      } else {
        // No projects left, create a default one
        setProjects({ 'My Project': {} });
        setCurrentProject('My Project');
        setCurrentPath(''); // Reset path
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent, name: string, type: string) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, item: { name, type } });
    setSelectedItem({ name, type });
  };

  const deleteItem = () => {
    if (!selectedItem || !confirm(`Are you sure you want to delete ${selectedItem.name}?`)) return;
    
    const currentDir = getCurrentDirectory();
    delete currentDir[selectedItem.name];
    setProjects({...projects});
    setContextMenu(null);
  };

  const handleDragStart = (e: React.DragEvent, name: string, type: string) => {
    setDraggedItem({ name, type });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (folderName: string) => {
    setDragOverFolder(folderName);
  };

  const handleDragLeave = () => {
    setDragOverFolder(null);
  };

  const handleDrop = (e: React.DragEvent, targetFolder: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem || draggedItem.name === targetFolder) {
      setDragOverFolder(null);
      return;
    }

    const currentDir = getCurrentDirectory();
    const targetDir = currentDir[targetFolder];
    
    if (targetDir && targetDir.type === 'folder' && targetDir.children) {
      targetDir.children[draggedItem.name] = currentDir[draggedItem.name];
      delete currentDir[draggedItem.name];
      setProjects({...projects});
    }
    
    setDraggedItem(null);
    setDragOverFolder(null);
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const input = document.createElement('input');
      input.type = 'file';
      input.files = e.dataTransfer.files;
      await handleFileUpload({ target: input } as any);
    }
  };

  const handleDragEnterFile = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items[0]?.kind === 'file') {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeaveFile = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the main container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDraggingFile(false);
    }
  };

  const copyItem = () => {
    if (!selectedItem) return;
    setCopiedItem({ name: selectedItem.name, path: currentPath });
    setContextMenu(null);
  };

  const pasteItem = () => {
    if (!copiedItem) return;
    
    const currentDir = getCurrentDirectory();
    
    let sourceDir = projects[currentProject];
    if (copiedItem.path) {
      const parts = copiedItem.path.split('/');
      for (const part of parts) {
        sourceDir = (sourceDir[part] as any).children || {};
      }
    }
    
    const itemToCopy = sourceDir[copiedItem.name];
    if (itemToCopy && !currentDir[copiedItem.name]) {
      currentDir[copiedItem.name] = JSON.parse(JSON.stringify(itemToCopy));
      setProjects({...projects});
    } else if (currentDir[copiedItem.name]) {
      // Silently ignore if item already exists
    }
  };

  const handleDownload = async (file: FileItem) => {
    if (!file.encryptedUrl || !file.decryptionKey || !file.iv) {
      alert('Cannot download: Missing encryption data');
      return;
    }

    try {
      const response = await fetch(file.encryptedUrl);
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const encryptedData = await response.arrayBuffer();
      
      const decryptionKey = base64ToKey(file.decryptionKey);
      const iv = base64ToKey(file.iv);
      const decryptedData = await decryptFile(new Uint8Array(encryptedData), decryptionKey, iv);
      
      const blob = new Blob([decryptedData]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedItem?.name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`✅ Downloaded and decrypted: ${selectedItem?.name}`);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Check console for details.');
    }
  };

  // Search function
  const searchFiles = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results: Array<{name: string, path: string, type: string, project: string}> = [];
    
    Object.entries(projects).forEach(([projectName, projectFiles]) => {
      const searchInDirectory = (files: Record<string, FileItem>, currentPath: string = '') => {
        Object.entries(files).forEach(([name, item]) => {
          if (name.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              name,
              path: currentPath,
              type: item.type,
              project: projectName
            });
          }
          
          if (item.type === 'folder' && item.children) {
            searchInDirectory(item.children, currentPath ? `${currentPath}/${name}` : name);
          }
        });
      };
      
      searchInDirectory(projectFiles);
    });
    
    setSearchResults(results);
    setShowSearchResults(true);
  };

  const goToSearchResult = (result: {name: string, path: string, type: string, project: string}) => {
    setCurrentProject(result.project);
    setCurrentPath(result.path);
    setSearchQuery('');
    setShowSearchResults(false);
    
    if (result.type === 'file') {
      setTimeout(() => {
        setSelectedItem({ name: result.name, type: result.type });
      }, 100);
    }
  };

  // Handle search input change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchFiles(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, projects]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c' && selectedItem) {
          e.preventDefault();
          copyItem();
        } else if (e.key === 'v' && copiedItem) {
          e.preventDefault();
          pasteItem();
        } else if (e.key === 'f') {
          e.preventDefault();
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          if (searchInput) searchInput.focus();
        }
      }
      
      if (e.key === 'Escape') {
        setSearchQuery('');
        setShowSearchResults(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, copiedItem]);

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewFile?.content?.includes('blob:')) {
        URL.revokeObjectURL(previewFile.content.substring(previewFile.content.indexOf(':') + 1));
      }
    };
  }, [previewFile]);

  const openFile = async (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    const textFiles = ['txt', 'md', 'json', 'js', 'ts', 'tsx', 'jsx', 'html', 'css', 'xml', 'csv'];
    const imageFiles = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    const pdfFiles = ['pdf'];
    
    setPreviewFile({ name });
    setShowFilePreview(true);
    
    const currentDir = getCurrentDirectory();
    const fileItem = currentDir[name];
    
    if (fileItem && fileItem.encryptedUrl && fileItem.decryptionKey && fileItem.iv) {
      try {
        const response = await fetch(fileItem.encryptedUrl);
        const encryptedData = await response.arrayBuffer();
        
        const decryptionKey = base64ToKey(fileItem.decryptionKey);
        const iv = base64ToKey(fileItem.iv);
        
        const decryptedData = await decryptFile(new Uint8Array(encryptedData), decryptionKey, iv);
        
        if (textFiles.includes(ext || '')) {
          const decoder = new TextDecoder();
          const text = decoder.decode(decryptedData);
          setPreviewFile({ name, content: text });
        } else if (pdfFiles.includes(ext || '')) {
          const blob = new Blob([decryptedData], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          setPreviewFile({ name, content: `pdf:${url}` });
        } else if (imageFiles.includes(ext || '')) {
          const blob = new Blob([decryptedData], { type: `image/${ext}` });
          const url = URL.createObjectURL(blob);
          setPreviewFile({ name, content: `image:${url}` });
        } else {
          setPreviewFile({ name, content: 'preview:not-supported' });
        }
      } catch (error) {
        console.error('Decryption error:', error);
        setPreviewFile({ name, content: 'Error: Failed to decrypt file' });
      }
    } else {
      setPreviewFile({ name, content: 'Demo: This file would be decrypted in production' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Flowen File Manager</h1>
          <div className="flex items-center gap-4">
            <span className="text-white/70">{userEmail}</span>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Search bar */}
        <div className="mb-6 relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files and folders..."
              className="w-full px-4 py-3 pl-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-all"
            />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Search results dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50">
              <div className="p-2">
                <div className="text-xs text-white/50 px-3 py-2">Found {searchResults.length} results</div>
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => goToSearchResult(result)}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <span className="text-xl">
                      {result.type === 'folder' ? '📁' : getFileIcon(result.name)}
                    </span>
                    <div className="flex-1">
                      <div className="text-white font-medium">{result.name}</div>
                      <div className="text-xs text-white/50">
                        {result.project} {result.path && `› ${result.path}`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {showSearchResults && searchResults.length === 0 && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl p-8 text-center z-50">
              <div className="text-white/50">No files or folders found matching "{searchQuery}"</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">My Projects</h2>
                <button 
                  onClick={() => setShowNewProjectModal(true)}
                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                  title="Create new project"
                >
                  <Plus className="h-5 w-5 text-white" />
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs text-white/50 px-3 py-1">💡 Right-click to delete project</div>
                {Object.keys(projects).map(projectName => {
                  const fileCount = Object.keys(projects[projectName]).length;
                  return (
                    <div
                      key={projectName}
                      onClick={() => {
                        setCurrentProject(projectName);
                        setCurrentPath('');
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (confirm(`Delete project "${projectName}"?`)) {
                          deleteProject(projectName);
                        }
                      }}
                      className={`w-full text-left p-4 rounded-lg transition-all cursor-pointer ${
                        currentProject === projectName
                          ? 'bg-blue-500/30 border border-blue-400/50'
                          : 'bg-white/10 hover:bg-white/20'
                      } group relative`}
                    >
                      <div className="flex items-center gap-3">
                        <FolderOpen className="h-5 w-5 text-white/70" />
                        <div className="flex-1">
                          <p className="text-white font-medium">{projectName}</p>
                          <p className="text-white/60 text-sm">{fileCount} files</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(projectName);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                          title="Delete project"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* File area */}
          <div className="lg:col-span-2">
            <div 
              className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 transition-all ${
                isDraggingFile ? 'border-blue-400 bg-blue-500/20' : ''
              }`}
              onDragEnter={handleDragEnterFile}
              onDragLeave={handleDragLeaveFile}
              onDragOver={handleDragOver}
              onDrop={handleFileDrop}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">{currentProject}</h2>
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-500/30 hover:bg-blue-500/40 text-white rounded-lg cursor-pointer transition-colors">
                  <Upload className="h-5 w-5" />
                  Upload files
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-4 text-white/70">
                <span 
                  className="cursor-pointer hover:text-white"
                  onClick={() => navigateTo('')}
                >
                  Home
                </span>
                {currentPath && currentPath.split('/').map((part, index) => {
                  const path = currentPath.split('/').slice(0, index + 1).join('/');
                  return (
                    <React.Fragment key={path}>
                      <span>›</span>
                      <span 
                        className="cursor-pointer hover:text-white"
                        onClick={() => navigateTo(path)}
                      >
                        {part}
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Toolbar */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setShowNewFolderModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  <FolderPlus className="h-4 w-4" />
                  New folder
                </button>
                {copiedItem && (
                  <button
                    onClick={pasteItem}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-white rounded-lg transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Paste {copiedItem.name}
                  </button>
                )}
              </div>

              {/* File grid */}
              <div 
                className="grid grid-cols-2 md:grid-cols-4 gap-4 relative"
              >
                {Object.entries(getCurrentDirectory()).map(([name, item]) => (
                  <div
                    key={name}
                    draggable
                    onDragStart={(e) => handleDragStart(e, name, item.type)}
                    onDragOver={item.type === 'folder' ? handleDragOver : undefined}
                    onDragEnter={item.type === 'folder' ? () => handleDragEnter(name) : undefined}
                    onDragLeave={item.type === 'folder' ? handleDragLeave : undefined}
                    onDrop={item.type === 'folder' ? (e) => handleDrop(e, name) : undefined}
                    className={`p-4 bg-white/10 rounded-xl border border-white/20 hover:bg-white/15 transition-colors cursor-pointer text-center ${
                      selectedItem?.name === name ? 'ring-2 ring-blue-400' : ''
                    } ${
                      dragOverFolder === name ? 'bg-blue-500/20 border-blue-400' : ''
                    }`}
                    onClick={() => {
                      setSelectedItem({ name, type: item.type });
                      if (item.type === 'folder') {
                        navigateTo(currentPath ? `${currentPath}/${name}` : name);
                      } else {
                        openFile(name);
                      }
                    }}
                    onContextMenu={(e) => handleContextMenu(e, name, item.type)}
                  >
                    <div className="text-4xl mb-2">
                      {item.type === 'folder' ? '📁' : getFileIcon(name)}
                    </div>
                    <p className="text-white text-sm truncate">{name}</p>
                    {item.type === 'file' && item.size && (
                      <p className="text-white/60 text-xs mt-1">{formatFileSize(item.size)}</p>
                    )}
                    {item.encrypted && (
                      <Shield className="h-3 w-3 text-green-400 mx-auto mt-1" />
                    )}
                  </div>
                ))}
                
                {/* Drop zone overlay */}
                {isDraggingFile && (
                  <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center pointer-events-none z-10">
                    <div className="text-center">
                      <Upload className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                      <p className="text-white text-lg font-medium">Drop files here to upload</p>
                      <p className="text-white/70 text-sm mt-1">All files will be encrypted</p>
                    </div>
                  </div>
                )}
              </div>

              {Object.keys(getCurrentDirectory()).length === 0 && (
                <div className={`text-center py-12 ${isDraggingFile ? 'opacity-50' : ''}`}>
                  <FileText className="h-16 w-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">No files uploaded yet</p>
                  <p className="text-white/40 text-sm mt-2">Click or drag files to upload</p>
                  <div className="mt-4 text-white/40 text-sm">
                    <p>💡 Tip: Drag files onto folders to move them</p>
                    <p>Use Ctrl+C to copy and Ctrl+V to paste</p>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
                    <Shield className="h-4 w-4" />
                    <p className="text-sm">All files are end-to-end encrypted</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-lg py-1 shadow-xl z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={() => setContextMenu(null)}
        >
          <button 
            onClick={() => {
              if (selectedItem) openFile(selectedItem.name);
            }}
            className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" /> Open
          </button>
          <button 
            onClick={() => {
              if (selectedItem) {
                const currentDir = getCurrentDirectory();
                const file = currentDir[selectedItem.name];
                if (file && file.type === 'file') {
                  handleDownload(file);
                }
              }
            }}
            className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Download
          </button>
          <button 
            onClick={copyItem}
            className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" /> Copy
          </button>
          <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2">
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2">
            <Edit2 className="h-4 w-4" /> Rename
          </button>
          <hr className="my-1 border-white/20" />
          <button 
            onClick={deleteItem}
            className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/20 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-xl p-6 w-96">
            <h3 className="text-white text-lg font-semibold mb-4">Create new folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && createFolder()}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                className="px-4 py-2 bg-blue-500/30 hover:bg-blue-500/40 text-white rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close context menu */}
      {contextMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setContextMenu(null)}
        />
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-xl p-6 w-96">
            <h3 className="text-white text-lg font-semibold mb-4">Create new project</h3>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name"
              className="w-full bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg mb-4 placeholder-white/50"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && createProject()}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNewProjectModal(false);
                  setNewProjectName('');
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                className="px-4 py-2 bg-blue-500/30 hover:bg-blue-500/40 text-white rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showFilePreview && previewFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{getFileIcon(previewFile.name)}</div>
                <div>
                  <h3 className="text-white text-lg font-semibold">{previewFile.name}</h3>
                  <p className="text-white/60 text-sm">Decrypted preview</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const file = getCurrentDirectory()[previewFile.name];
                    if (file && file.type === 'file') {
                      handleDownload(file);
                    }
                  }}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowFilePreview(false)}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-auto max-h-[calc(90vh-100px)]">
              {previewFile.content?.startsWith('image:') ? (
                <div className="flex items-center justify-center">
                  {previewFile.content.startsWith('image:http') || previewFile.content.startsWith('image:blob') ? (
                    <img 
                      src={previewFile.content.substring(6)} 
                      alt={previewFile.name}
                      className="max-w-full max-h-[70vh] rounded-lg shadow-xl"
                    />
                  ) : (
                    <div className="bg-white/5 rounded-lg p-20 text-center">
                      <div className="text-6xl mb-4">🖼️</div>
                      <p className="text-white/60">Image preview loading...</p>
                    </div>
                  )}
                </div>
              ) : previewFile.content?.startsWith('pdf:') ? (
                <div className="h-full min-h-[600px]">
                  {previewFile.content.startsWith('pdf:http') || previewFile.content.startsWith('pdf:blob') ? (
                    <iframe 
                      src={previewFile.content.substring(4)}
                      className="w-full h-full min-h-[600px] rounded-lg"
                      title="PDF Preview"
                    />
                  ) : (
                    <div className="h-full min-h-[600px] bg-white/5 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">📄</div>
                        <p className="text-white/60">PDF preview loading...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : previewFile.content === 'preview:not-supported' ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📎</div>
                  <p className="text-white/60">Preview not available for this file type</p>
                  <button className="mt-4 px-6 py-2 bg-blue-500/30 hover:bg-blue-500/40 text-white rounded-lg transition-colors">
                    Download to view
                  </button>
                </div>
              ) : previewFile.content?.startsWith('Error:') ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4 text-red-400">⚠️</div>
                  <p className="text-red-400">{previewFile.content}</p>
                </div>
              ) : (
                <pre className="bg-black/30 rounded-lg p-4 text-white/90 font-mono text-sm overflow-auto whitespace-pre-wrap">
                  {previewFile.content}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}