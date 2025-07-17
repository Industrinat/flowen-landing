'use client'
import { useAuth } from '@/hooks/useAuth'
import { useTeam } from '@/hooks/useTeam'

export default function TestAuth() {
  const { user, isLoading, login, logout } = useAuth()
  const { currentTeam, teams, switchTeam, createTeam, isLoading: teamLoading } = useTeam()

  if (isLoading || teamLoading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🔐 JWT Auth + Teams Test</h1>
      
      {user ? (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded">
            <p className="text-green-800">✅ Logged in as: <strong>{user.email}</strong></p>
            <p className="text-sm text-green-600">User ID: {user.id}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-bold mb-2">🏢 Current Team:</h3>
            {currentTeam ? (
              <div>
                <p><strong>{currentTeam.name}</strong> ({currentTeam.role})</p>
                <p className="text-sm text-gray-600">
                  {currentTeam.memberCount} members • {currentTeam.fileCount} files
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No team selected</p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-bold mb-2">📋 All Teams:</h3>
            {teams.map(team => (
              <div key={team.id} className="flex justify-between items-center p-2 border rounded mb-2">
                <div>
                  <span className="font-medium">{team.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({team.role})</span>
                </div>
                <button
                  onClick={() => switchTeam(team.id)}
                  disabled={currentTeam?.id === team.id}
                  className={`px-3 py-1 rounded text-sm ${
                    currentTeam?.id === team.id
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {currentTeam?.id === team.id ? 'Current' : 'Switch'}
                </button>
              </div>
            ))}
          </div>

          <button 
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="bg-red-50 p-4 rounded">
          <p className="text-red-800">❌ Not logged in</p>
          <button 
            onClick={() => login('admin@flowen.se', 'flowen123')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Login
          </button>
        </div>
      )}
    </div>
  )
}