import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { NextResponse } from 'next/server'

export const GET = requireAuth(async (req: AuthenticatedRequest) => {
  return NextResponse.json({
    message: 'Auth works!',
    user: req.user
  })
})