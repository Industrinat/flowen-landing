'use client';
// 🏗️ Project Rooms rebuild - Starting fresh with proper Git workflow

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart3, Users, Clock, FolderOpen, Kanban, MessageSquare, Settings } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Auth check
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  // Show loading while auth is being checked
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-slate-900 text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  const handleLogout = () => {
    // Clear session and redirect to homepage
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome to Flowen</h1>
            <p className="text-indigo-200 mt-2">Your secure project platform</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/10">
            <div className="flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Active Projects</h3>
            <p className="text-3xl font-bold text-blue-400 mb-1">3</p>
            <p className="text-sm text-indigo-200">Total 12 projects</p>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/10">
            <div className="flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Shared Files</h3>
            <p className="text-3xl font-bold text-green-400 mb-1">47</p>
            <p className="text-sm text-indigo-200">This month</p>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/10">
            <div className="flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Team Members</h3>
            <p className="text-3xl font-bold text-yellow-400 mb-1">8</p>
            <p className="text-sm text-indigo-200">Active users</p>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Project Rooms */}
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/10">
            <div className="flex items-center mb-4">
              <FolderOpen className="w-6 h-6 text-blue-400 mr-3" />
              <h2 className="text-xl font-semibold">Project Rooms</h2>
            </div>
            <p className="text-indigo-200 mb-4">Manage your projects and collaborate with team</p>
            <button 
              onClick={() => router.push('/projects')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full"
            >
              View All Projects
            </button>
          </div>

          {/* Kanban Boards */}
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/10">
            <div className="flex items-center mb-4">
              <Kanban className="w-6 h-6 text-purple-400 mr-3" />
              <h2 className="text-xl font-semibold">Kanban Boards</h2>
            </div>
            <p className="text-indigo-200 mb-4">Organize tasks and track project progress</p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition w-full">
              Open Boards
            </button>
          </div>

          {/* Social Wall */}
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/10">
            <div className="flex items-center mb-4">
              <MessageSquare className="w-6 h-6 text-green-400 mr-3" />
              <h2 className="text-xl font-semibold">Social Wall</h2>
            </div>
            <p className="text-indigo-200 mb-4">Communicate and share updates with team</p>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition w-full">
              View Messages
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Secure File Sharing */}
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Secure File Sharing</h2>
            <p className="text-indigo-200 mb-4">Share files securely with end-to-end encryption</p>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              >
                🔒 Share New File
              </button>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition">
                View Shared Files
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white bg-opacity-5 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm">New file shared</span>
                </div>
                <span className="text-xs text-indigo-200">2h ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white bg-opacity-5 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-sm">Project updated</span>
                </div>
                <span className="text-xs text-indigo-200">5h ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white bg-opacity-5 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                  <span className="text-sm">New team member</span>
                </div>
                <span className="text-xs text-indigo-200">1d ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/10">
          <h2 className="text-xl font-semibold mb-4">🚀 Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Settings className="w-5 h-5 text-indigo-400 mr-2" />
              <span className="text-sm">Advanced CRM</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-indigo-400 mr-2" />
              <span className="text-sm">Time Tracking</span>
            </div>
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 text-indigo-400 mr-2" />
              <span className="text-sm">Advanced Analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}