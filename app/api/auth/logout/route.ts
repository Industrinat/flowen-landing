import { NextRequest, NextResponse } from 'next/server'
import { clearRefreshTokenCookie } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  clearRefreshTokenCookie(response)
  return response
}