import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { generateTokens, setRefreshTokenCookie } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // TODO: Ersätt med databas-lookup senare
    // För nu, behåll din existerande användare
    if (email === 'admin@flowen.se' && password === 'flowen123') {
      const tokens = generateTokens({
        userId: 'admin-user-id',
        email: 'admin@flowen.se',
        teamId: 'default-team'
      })
      
      const response = NextResponse.json({
        success: true,
        accessToken: tokens.accessToken,
        user: {
          id: 'admin-user-id',
          email: 'admin@flowen.se'
        }
      })
      
      setRefreshTokenCookie(response, tokens.refreshToken)
      
      return response
    }
    
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}