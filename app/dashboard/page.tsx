'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { Upload, FolderOpen, LayoutGrid, FileText, Users, Shield, TrendingUp, Clock, Target } from 'lucide-react'
import { TeamSwitcher } from '@/components/TeamSwitcher'
import { TeamFiles } from '@/components/TeamFiles'
import { CRMModule } from '@/components/CRMCustomers'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Team Switcher */}
      <div className="mb-8">
        <TeamSwitcher />
      </div>
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-lg text-gray-600">
          Welcome back, <span className="font-medium text-blue-600">{user?.email}</span>!
        </p>
        <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full w-fit">
          <Shield className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">AES-256 Encryption Active</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* File Upload */}
        <Link href="/" className="group">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-blue-300 hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Upload Files</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Secure file sharing with end-to-end encryption
            </p>
            <div className="flex items-center text-blue-600 group-hover:text-blue-700 text-sm font-medium">
              Start upload →
            </div>
          </div>
        </Link>

        {/* Projects */}
        <Link href="/projects" className="group">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-green-300 hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg mr-3 group-hover:bg-green-200 transition-colors">
                <FolderOpen className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Organize files and manage team collaboration
            </p>
            <div className="flex items-center text-green-600 group-hover:text-green-700 text-sm font-medium">
              View projects →
            </div>
          </div>
        </Link>

        {/* Kanban */}
        <Link href="/kanban" className="group">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-purple-300 hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg mr-3 group-hover:bg-purple-200 transition-colors">
                <LayoutGrid className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Kanban</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Track tasks with visual kanban boards
            </p>
            <div className="flex items-center text-purple-600 group-hover:text-purple-700 text-sm font-medium">
              Open kanban →
            </div>
          </div>
        </Link>

        {/* CRM Dashboard */}
        <Link href="/crm" className="group" aria-label="Open CRM dashboard with customer management and deal pipeline">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-purple-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-3 group-hover:bg-purple-200 transition-colors">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">CRM Dashboard</h3>
              </div>
              <span className="text-xs bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                ⚙️ Automated
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Manage customers, deals and pipeline with automation
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
              <div className="bg-purple-50 rounded p-2 text-center border border-purple-100">
                <div className="font-semibold text-purple-900">0</div>
                <div className="text-purple-600">Customers</div>
              </div>
              <div className="bg-green-50 rounded p-2 text-center border border-green-100">
                <div className="font-semibold text-green-900">0</div>
                <div className="text-green-600">Active deals</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-purple-600 group-hover:text-purple-700 text-sm font-medium">
                Open CRM →
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Live data
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Uploaded Files</h3>
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
          <p className="text-xs text-gray-500">+0 this week</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Storage Space</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">0 MB</div>
          <p className="text-xs text-gray-500">of 5 GB available</p>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Active Teams</h3>
            <Users className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">1</div>
          <p className="text-xs text-gray-500">Default Team</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Recent Activity</h3>
            <Clock className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">-</div>
          <p className="text-xs text-gray-500">No activity yet</p>
        </div>
      </div>

      {/* Team Files */}
      <div className="mb-8">
        <TeamFiles />
      </div>

      {/* CRM Customers */}
      <div className="mb-8">
        <CRMModule />
      </div>

      {/* Recent Activity & Quick Start */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">No activity to show yet</p>
            <p className="text-gray-400 text-xs mt-2">
              Upload your first file to get started
            </p>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Start</h3>
          <div className="space-y-4">
            
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Upload files</p>
                <p className="text-sm text-gray-600">Drag and drop files or click to select</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm font-medium">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Organize in projects</p>
                <p className="text-sm text-gray-600">Create projects for better file management</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-sm font-medium">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Track tasks</p>
                <p className="text-sm text-gray-600">Use kanban boards for project tracking</p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center block font-medium"
              >
                Start uploading files
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-green-900 mb-1">EU-compliant security</h4>
            <p className="text-sm text-green-700">
              All files are encrypted with AES-256-GCM before upload. Your data is secure and follows GDPR regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}