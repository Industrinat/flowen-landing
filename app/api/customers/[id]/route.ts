import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/middleware/auth'
import { prisma } from '@/lib/prisma'

export const GET = requireAuth(async (request, { params }) => {
  const { userId } = request.user!
  const teamId = request.headers.get('x-team-id')
  const customerId = params.id

  if (!teamId) {
    return NextResponse.json({ error: 'Team ID required' }, { status: 400 })
  }

  try {
    const customer = await prisma.customer.findFirst({
      where: { 
        id: customerId,
        teamId
      },
      include: {
        contacts: true,
        _count: {
          select: {
            deals: true,
            files: true,
            contacts: true
          }
        }
      }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
})

export const DELETE = requireAuth(async (request, { params }) => {
  const { userId } = request.user!
  const teamId = request.headers.get('x-team-id')
  const customerId = params.id

  if (!teamId) {
    return NextResponse.json({ error: 'Team ID required' }, { status: 400 })
  }

  try {
    await prisma.customer.delete({
      where: { 
        id: customerId,
        teamId 
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
  }
})