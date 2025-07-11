// lib/auth-middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export interface User {
  id: string
  email: string
  name: string
}

export interface AuthenticatedRequest extends NextRequest {
  user: User
}

// Simple session storage for POC (use Redis/DB in production)
const sessions = new Map<string, User>()

export function createSession(user: User): string {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  sessions.set(sessionId, user)
  return sessionId
}

export function getSession(sessionId: string): User | null {
  return sessions.get(sessionId) || null
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId)
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // Try to get session from cookie first
      const sessionCookie = req.cookies.get('session')
      const sessionId = sessionCookie?.value
      
      // Fallback to header for API testing
      const authHeader = req.headers.get('x-session-id') || req.headers.get('authorization')
      const headerSessionId = authHeader?.replace('Bearer ', '')
      
      const finalSessionId = sessionId || headerSessionId
      
      if (!finalSessionId) {
        return NextResponse.json(
          { error: 'No session found' },
          { status: 401 }
        )
      }
      
      const user = getSession(finalSessionId)
      
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid or expired session' },
          { status: 401 }
        )
      }
      
      // Create authenticated request
      const authReq = req as AuthenticatedRequest
      authReq.user = user
      
      return handler(authReq)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}