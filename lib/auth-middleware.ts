// lib/auth-middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth/jwt'

export interface User {
  id: string
  email: string
  teamId?: string
}

export interface AuthenticatedRequest extends NextRequest {
  user: User
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // Get JWT token from Authorization header
      const authHeader = req.headers.get('authorization')
      console.log('🔍 Auth header received:', authHeader) // DEBUG
      
      const token = authHeader?.replace('Bearer ', '')
      console.log('🔍 Token extracted:', token ? `${token.substring(0, 20)}...` : 'No token') // DEBUG
      
      if (!token) {
        return NextResponse.json(
          { error: 'No token provided' },
          { status: 401 }
        )
      }
      
      // Verify JWT token
      console.log('🔍 Verifying token...') // DEBUG
      const payload = verifyAccessToken(token)
      console.log('✅ Token verified! User:', payload.userId) // DEBUG
      
      // Create authenticated request
      const authReq = req as AuthenticatedRequest
      authReq.user = {
        id: payload.userId,
        email: payload.email,
        teamId: payload.teamId
      }
      
      return handler(authReq)
    } catch (error) {
      console.error('❌ Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}

// Helper function for easier use in API routes
export function requireAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(handler)
}