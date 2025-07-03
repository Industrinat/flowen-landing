"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FolderOpen, Upload, FileText, LogOut, Plus, Download, Trash2, Shield } from 'lucide-react';
import { generateEncryptionKey, encryptFile, keyToBase64 } from '@/lib/crypto';
import KanbanBoard from '@/components/KanbanBoard';
// Define interfaces for project and file data
interface ProjectFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  encryptedUrl: string;
  decryptionKey: string;
  iv: string;
}

interface Project {
  id: number;
  name: string;
  files: ProjectFile[];
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([
    { id: 1, name: 'Q1 Marketing Campaign', files: [] },
    { id: 2, name: 'Annual Report 2024', files: [] },
    { id: 3, name: 'Client Presentations', files: [] }
  ]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const userEmail = 'info@flowen.eu';

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('flowen-projects');
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    }
  }, []);

  // Save to localStorage whenever projects change
  useEffect(() => {
    localStorage.setItem('flowen-projects', JSON.stringify(projects));
  }, [projects]);

  const handleLogout = () => {
    router.push('/login');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedProject || !e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);
    const files = Array.from(e.target.files);
    const newFiles: ProjectFile[] = []; 
    
    for (const file of files) {
      try {
        console.log(`🔐 Encrypting ${file.name}...`);
        
        // 1. Generate unique encryption key
        const encryptionKey = await generateEncryptionKey();
        
        // 2. Read file as ArrayBuffer
        const fileBuffer = await file.arrayBuffer();
        
        // 3. Encrypt the file
        const { encryptedData, iv } = await encryptFile(fileBuffer, encryptionKey);
        
        // 4. Create encrypted file for upload
        const encryptedFileName = `encrypted_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.bin`;
        const encryptedFile = new File(
          [encryptedData], 
          encryptedFileName,
          { type: 'application/octet-stream' }
        );
        
        // Log encryption details
        console.log('Original size:', file.size, 'bytes');
        console.log('Encrypted size:', encryptedFile.size, 'bytes');
        console.log('Size increase:', encryptedFile.size - file.size, 'bytes');
        
        // 5. Create FormData for upload
        const formData = new FormData();
        formData.append('file', encryptedFile);
        
        // 6. Upload to server
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success && data.shareUrl) {
          // 7. Create file record with encryption metadata
          const newFile: ProjectFile = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name, // Original filename for display
            size: file.size, // Original file size
            uploadedAt: new Date().toISOString(),
            encryptedUrl: data.shareUrl,
            decryptionKey: keyToBase64(encryptionKey),
            iv: keyToBase64(iv)
          };
          
          newFiles.push(newFile);
          console.log(`✅ ${file.name} encrypted and uploaded successfully!`);
        } else {
          console.error(`❌ Failed to upload ${file.name}:`, data.error);
        }
      } catch (error) {
        console.error(`❌ Error processing ${file.name}:`, error);
      }
    }

    // Update project with new files
    if (newFiles.length > 0) {
      const updatedProjects = projects.map(project => {
        if (project.id === selectedProject.id) {
          const updatedProject = {
            ...project,
            files: [...project.files, ...newFiles]
          };
          setSelectedProject(updatedProject);
          return updatedProject;
        }
        return project;
      });

      setProjects(updatedProjects);
    }
    
    setIsUploading(false);
    // Reset file input
    e.target.value = '';
  };

  const handleDownload = async (file: ProjectFile) => {
    try {
      // For now, just open the encrypted URL with the key
      // Later: implement client-side decryption
      const url = `${file.encryptedUrl}?key=${file.decryptionKey}&iv=${file.iv}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const deleteFile = (fileId: string) => {
    if (!selectedProject) return;

    const updatedProjects = projects.map(project => {
      if (project.id === selectedProject.id) {
        const updatedProject = {
          ...project,
          files: project.files.filter(f => f.id !== fileId)
        };
        setSelectedProject(updatedProject);
        return updatedProject;
      }
      return project;
    });

    setProjects(updatedProjects);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Flowen Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-white/70">{userEmail}</span>
            <button
              onClick={() => router.push('/file-manager')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <FolderOpen className="h-4 w-4" />
              File Manager
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">My Projects</h2>
                <button 
                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                  title="Create new project"
                >
                  <Plus className="h-5 w-5 text-white" />
                </button>
              </div>
              
              <div className="space-y-2">
                {projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      selectedProject?.id === project.id
                        ? 'bg-blue-500/30 border border-blue-400/50'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-5 w-5 text-white/70" />
                      <div className="flex-1">
                        <p className="text-white font-medium">{project.name}</p>
                        <p className="text-white/60 text-sm">{project.files.length} files</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* File area */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              {selectedProject ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">{selectedProject.name}</h2>
                    <label className={`flex items-center gap-2 px-4 py-2 bg-blue-500/30 hover:bg-blue-500/40 text-white rounded-lg cursor-pointer transition-colors ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}>
                      <Upload className="h-5 w-5" />
                      {isUploading ? 'Uploading...' : 'Upload Files'}
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  
                  {selectedProject.files.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-white/30 mx-auto mb-4" />
                      <p className="text-white/60">No files uploaded yet</p>
                      <p className="text-white/40 text-sm mt-2">Click or drag files to upload</p>
                      <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
                        <Shield className="h-4 w-4" />
                        <p className="text-sm">All files are end-to-end encrypted</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedProject.files.map(file => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20 hover:bg-white/15 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <FileText className="h-5 w-5 text-white/70" />
                            <div className="flex-1">
                              <p className="text-white font-medium">{file.name}</p>
                              <p className="text-white/60 text-sm">
                                {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                              </p>
                            </div>
                            <Shield className="h-4 w-4 text-green-400" />
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleDownload(file)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download className="h-4 w-4 text-white/70" />
                            </button>
                            <button
                              onClick={() => deleteFile(file.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <FolderOpen className="h-16 w-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">Select a project to view files</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}