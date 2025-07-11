// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/auth-middleware'

// Simple user store for POC
const users = [
  {
    id: 'user-1',
    email: 'admin@flowen.se',
    password: 'flowen123',
    name: 'Admin User'
  }
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Create session
    const sessionId = createSession({
      id: user.id,
      email: user.email,
      name: user.name
    })
    
    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      sessionId // Also return in body for API testing
    })
    
    // Set secure cookie
    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}