'use client'
import { useAuth } from '@/hooks/useAuth'
import { useTeam } from '@/hooks/useTeam'
import { useState } from 'react'

export function TeamsDebug() {
  const { user } = useAuth()
  const { teams, currentTeam, isLoading } = useTeam()
  const [apiTest, setApiTest] = useState<any>(null)

  const testTeamsAPI = async () => {
    try {
      const token = typeof window !== 'undefined' ? window.getAccessToken?.() : null
      console.log('Testing with token:', token ? 'exists' : 'null')
      
      const response = await fetch('/api/teams', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('API Test response status:', response.status)
      const data = await response.json()
      console.log('API Test data:', data)
      setApiTest(data)
    } catch (error) {
      console.error('API Test error:', error)
      setApiTest({ error: error.message })
    }
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-gray-100 border rounded-lg shadow-lg max-w-sm z-50">
      <h3 className="font-bold mb-2 text-sm">🔧 Teams Debug</h3>
      
      <div className="space-y-1 text-xs">
        <div>User: {user ? user.email : 'Not logged in'}</div>
        <div>Teams loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>Teams count: {teams?.length || 0}</div>
        <div>Current team: {currentTeam?.name || 'None'}</div>
        <div>Token: {typeof window !== 'undefined' && window.getAccessToken?.() ? 'Available' : 'Missing'}</div>
        
        <button 
          onClick={testTeamsAPI}
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs mt-2"
        >
          Test API
        </button>
        
        {apiTest && (
          <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32 mt-2">
            {JSON.stringify(apiTest, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}