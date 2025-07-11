// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Simple check for demo
    if (email === 'admin@flowen.se' && password === 'flowen123') {
      // Set localStorage-compatible response for now
      const user = {
        id: 'admin-user-123',
        email: 'admin@flowen.se',
        name: 'Admin User',
        loginTime: Date.now()
      }
      
      return NextResponse.json({
        success: true,
        user
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}