import { NextRequest, NextResponse } from 'next/server'
import { verifyRefreshToken, generateTokens, setRefreshTokenCookie } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token' },
        { status: 401 }
      )
    }

    const decoded = verifyRefreshToken(refreshToken)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      )
    }

    const tokens = generateTokens({
      userId: decoded.userId,
      email: 'admin@flowen.se',
      teamId: 'default-team'
    })

    const response = NextResponse.json({
      success: true,
      accessToken: tokens.accessToken
    })

    setRefreshTokenCookie(response, tokens.refreshToken)
    return response

  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json(
      { error: 'Refresh failed' },
      { status: 500 }
    )
  }
}