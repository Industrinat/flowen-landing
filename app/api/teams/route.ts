import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const user = verifyAccessToken(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: { userId: user.userId }
        }
      },
      include: {
        members: {
          where: { userId: user.userId },
          select: { role: true }
        },
        _count: {
          select: {
            members: true,
            files: true
          }
        }
      }
    })

    return NextResponse.json({
      teams: teams.map(team => ({
        id: team.id,
        name: team.name,
        slug: team.slug,
        role: team.members[0]?.role || 'member',
        memberCount: team._count.members,
        fileCount: team._count.files
      }))
    })

  } catch (error) {
    console.error('Teams GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const user = verifyAccessToken(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Team name required' }, { status: 400 })
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-')

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        slug,
        members: {
          create: {
            userId: user.userId,
            role: 'owner'
          }
        }
      }
    })

    return NextResponse.json(team)

  } catch (error) {
    console.error('Teams POST error:', error)
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
  }
}