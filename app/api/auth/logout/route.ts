// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth-middleware'

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')
    const sessionId = sessionCookie?.value
    
    if (sessionId) {
      deleteSession(sessionId)
    }
    
    const response = NextResponse.json({ success: true })
    response.cookies.delete('session')
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}