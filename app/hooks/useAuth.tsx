'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  teamId?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<string>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include' // Viktigt för cookies
      })
      
      if (!response.ok) throw new Error('Refresh failed')
      
      const data = await response.json()
      setAccessToken(data.accessToken)
      
      // Dekoda token för user info
      const payload = JSON.parse(atob(data.accessToken.split('.')[1]))
      setUser({
        id: payload.userId,
        email: payload.email,
        teamId: payload.teamId
      })
      
      return data.accessToken
    } catch (error) {
      setUser(null)
      setAccessToken(null)
      router.push('/login')
      throw error
    }
  }, [router])

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }
    
    const data = await response.json()
    setAccessToken(data.accessToken)
    setUser(data.user)
    
    // Ta bort gamla localStorage
    localStorage.removeItem('user')
    
    router.push('/dashboard')
  }

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
    
    setUser(null)
    setAccessToken(null)
    localStorage.removeItem('user') // Rensa gammal data
    router.push('/')
  }

  // Auto-refresh tokens innan de går ut
  useEffect(() => {
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]))
        const expiresAt = payload.exp * 1000
        const refreshTime = expiresAt - Date.now() - 60000 // 1 min före
        
        if (refreshTime > 0) {
          const timeout = setTimeout(async () => {
            try {
              await refreshToken()
              console.log('✅ Token auto-refreshed')
            } catch (error) {
              console.error('❌ Auto-refresh failed:', error)
            }
          }, refreshTime)
          
          return () => clearTimeout(timeout)
        }
      } catch (error) {
        console.error('Token parse error:', error)
      }
    }
  }, [accessToken, refreshToken])

  // Initial auth check
  useEffect(() => {
    refreshToken()
      .catch(() => {
        console.log('Not authenticated')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [refreshToken])

  // Gör token tillgänglig globalt för API calls
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).getAccessToken = () => accessToken
    }
  }, [accessToken])

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      refreshToken
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Helper för protected routes
export function useRequireAuth() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])
  
  return { user, isLoading }
}