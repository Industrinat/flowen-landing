import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/middleware/auth'
import { prisma } from '@/lib/prisma'

export const GET = requireAuth(async (request) => {
  try {
    const { userId, teamId: tokenTeamId } = request.user!
    const teamId = request.headers.get('x-team-id') || tokenTeamId

    console.log('[GET /api/customers] userId:', userId)
    console.log('[GET /api/customers] teamId:', teamId)

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID required' }, { status: 400 })
    }

    const member = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } }
    })

    if (!member) {
      console.warn('[GET /api/customers] Access denied for user:', userId)
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const customers = await prisma.customer.findMany({
      where: { teamId },
      include: {
        _count: {
          select: {
            deals: true,
            files: true,
            contacts: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ customers })
  } catch (error) {
    console.error('[GET /api/customers] Internal error:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
})

export const POST = requireAuth(async (request) => {
  try {
    const { userId, teamId: tokenTeamId } = request.user!
    const teamId = request.headers.get('x-team-id') || tokenTeamId

    console.log('[POST /api/customers] userId:', userId)
    console.log('[POST /api/customers] teamId:', teamId)

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID required' }, { status: 400 })
    }

    const data = await request.json()
    const { name, email, phone, company, value, status } = data

    if (!name) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 })
    }

    const customer = await prisma.customer.create({
      data: {
        teamId,
        name,
        email,
        phone,
        company,
        value: value ? parseFloat(value) : null,
        status: status || 'prospect'
      }
    })

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('[POST /api/customers] Internal error:', error)
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
})
