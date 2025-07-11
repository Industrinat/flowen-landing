// app/api/auth/create-session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/auth-middleware'

export async function POST(request: NextRequest) {
  try {
    const user = await request.json()
    
    // Validate user data
    if (!user.id || !user.email) {
      return NextResponse.json(
        { error: 'Invalid user data' },
        { status: 400 }
      )
    }
    
    // Create session
    const sessionId = createSession({
      id: user.id,
      email: user.email,
      name: user.name || user.email
    })
    
    const response = NextResponse.json({
      success: true,
      sessionId
    })
    
    // Set cookie
    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    return response
  } catch (error) {
    console.error('Create session error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}