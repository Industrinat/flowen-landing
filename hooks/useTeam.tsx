'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './useAuth'

interface Team {
  id: string
  name: string
  slug: string
  role: string
  memberCount: number
  fileCount: number
}

interface TeamContextType {
  currentTeam: Team | null
  teams: Team[]
  switchTeam: (teamId: string) => void
  createTeam: (name: string) => Promise<Team>
  isLoading: boolean
}

const TeamContext = createContext<TeamContextType | null>(null)

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth() // Ta bort getAccessToken härifrån

  // ERSÄTT DENNA HELA FETCHTEAMS FUNKTION:
  const fetchTeams = async () => {
    try {
      console.log('📡 Fetching teams...')
      
      // Kontrollera att token finns
      const token = window.getAccessToken?.()
      if (!token) {
        console.error('❌ No access token available')
        return
      }
      
      console.log('🔑 Using token:', token.substring(0, 20) + '...')
      
      const response = await fetch('/api/teams', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📊 Teams API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Teams API error:', errorText)
        throw new Error(`Teams API failed: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ Teams data received:', data)
      
      setTeams(data.teams || [])
      
      // Set current team logic
      const savedTeamId = localStorage.getItem('currentTeamId')
      console.log('💾 Saved team ID:', savedTeamId)
      
      const team = data.teams?.find(t => t.id === savedTeamId) || data.teams?.[0]
      if (team) {
        console.log('🎯 Setting current team:', team.name)
        setCurrentTeam(team)
        localStorage.setItem('currentTeamId', team.id)
      } else {
        console.warn('⚠️ No teams available')
      }
    } catch (error) {
      console.error('💥 Failed to fetch teams:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const switchTeam = (teamId: string) => {
    const team = teams.find(t => t.id === teamId)
    if (team) {
      setCurrentTeam(team)
      localStorage.setItem('currentTeamId', teamId)
    }
  }

  const createTeam = async (name: string): Promise<Team> => {
    const token = window.getAccessToken?.() // Ändra från getAccessToken() till window.getAccessToken?.()
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    })

    if (!response.ok) {
      throw new Error('Failed to create team')
    }

    const newTeam = await response.json()
    
    // Lägg till i teams array med default counts
    const teamWithCounts = {
      ...newTeam,
      role: 'owner',
      memberCount: 1,
      fileCount: 0
    }
    
    setTeams([...teams, teamWithCounts])
    return teamWithCounts
  }

  useEffect(() => {
  // Vänta lite för att låta auth initialiseras
  const checkAndFetch = async () => {
    let attempts = 0
    const maxAttempts = 10
    
    const tryFetch = () => {
      if (typeof window !== 'undefined' && window.getAccessToken?.()) {
        console.log('🎯 Token available, fetching teams...')
        fetchTeams()
        return true
      }
      return false
    }
    
    // Försök direkt först
    if (tryFetch()) return
    
    // Annars vänta och försök igen
    const interval = setInterval(() => {
      attempts++
      if (tryFetch() || attempts >= maxAttempts) {
        clearInterval(interval)
        if (attempts >= maxAttempts) {
          console.warn('⚠️ Token not available after waiting')
          setIsLoading(false)
        }
      }
    }, 500) // Kolla var 500ms
  }
  
  checkAndFetch()
}, [])

  return (
    <TeamContext.Provider value={{
      currentTeam,
      teams,
      switchTeam,
      createTeam,
      isLoading
    }}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (!context) {
    throw new Error('useTeam must be used within TeamProvider')
  }
  return context
}