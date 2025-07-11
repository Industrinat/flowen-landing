// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')
    const sessionId = sessionCookie?.value
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session' },
        { status: 401 }
      )
    }
    
    const user = getSession(sessionId)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      user,
      sessionId
    })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json(
      { error: 'Failed to get user info' },
      { status: 500 }
    )
  }
}