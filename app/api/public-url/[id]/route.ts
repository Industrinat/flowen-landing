// app/api/public-url/[id]/route.ts - Universal version
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import crypto from 'crypto'
import { getConfig, getPublicUrl } from '@/lib/config'

interface FileRecord {
  id: string
  userId: string
  name: string
  size: number
  encryptionKey: string
  iv: string
  folderId: string | null
  createdAt: string
}

interface PublicUrlData {
  fileId: string
  expires: number
  userEmail: string
}

async function getDatabase(): Promise<{ files: FileRecord[] }> {
  const config = getConfig()
  try {
    const data = fs.readFileSync(config.dbFile, 'utf-8')
    return JSON.parse(data)
  } catch {
    return { files: [] }
  }
}

async function getPublicTokens(): Promise<Map<string, PublicUrlData>> {
  const config = getConfig()
  try {
    if (fs.existsSync(config.tokensFile)) {
      const data = fs.readFileSync(config.tokensFile, 'utf-8')
      const obj = JSON.parse(data)
      return new Map(Object.entries(obj))
    }
  } catch (error) {
    console.log('Could not read public tokens file')
  }
  return new Map()
}

async function savePublicTokens(tokens: Map<string, PublicUrlData>) {
  const config = getConfig()
  try {
    const obj = Object.fromEntries(tokens)
    fs.writeFileSync(config.tokensFile, JSON.stringify(obj, null, 2))
  } catch (error) {
    console.error('Could not save public tokens:', error)
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const config = getConfig()
    const { id: fileId } = await params
    const userEmail = request.headers.get('x-user-email')

    console.log('🔗 Creating public URL for file:', fileId)
    console.log('🌍 Environment:', config.isProduction ? 'PRODUCTION' : 'DEVELOPMENT')

    if (!userEmail) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user ID from email
    const userId = userEmail.split('@')[0]

    // Get file metadata from database
    const db = await getDatabase()
    const fileRecord = db.files.find(f => f.id === fileId && f.userId === userId)

    if (!fileRecord) {
      console.log('❌ File not found in database')
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Check if physical file exists
    const filePath = config.uploadsDir + '/' + fileId

    if (!fs.existsSync(filePath)) {
      console.log('❌ Physical file not found')
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
    }

    console.log('✅ File found')

    // Handle localhost special case for Office Online
    const publicUrl = getPublicUrl()
    
    if (publicUrl.includes('localhost') && !process.env.NGROK_URL) {
      console.log('⚠️ Localhost detected without ngrok - Office Online will not work')
      return NextResponse.json({ 
        error: 'Office Online preview requires public URL. Use ngrok or deploy to production.',
        suggestion: 'Run: npx ngrok http 3000, then set NGROK_URL environment variable'
      }, { status: 400 })
    }

    // Get existing tokens and clean expired ones
    const publicUrls = await getPublicTokens()
    const now = Date.now()
    
    // Clean expired tokens
    for (const [token, data] of publicUrls.entries()) {
      if (data.expires < now) {
        publicUrls.delete(token)
      }
    }

    // Generate a temporary public token
    const publicToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = Date.now() + (60 * 60 * 1000) // 1 hour expiry

    // Store the mapping
    publicUrls.set(publicToken, {
      fileId: fileId,
      expires: expiresAt,
      userEmail: userEmail
    })

    // Save tokens to file
    await savePublicTokens(publicUrls)

    // Create the public URL
    const finalPublicUrl = `${publicUrl}/api/public-file/${publicToken}`

    console.log('✅ Public URL created')

    return NextResponse.json({ 
      publicUrl: finalPublicUrl,
      expiresAt,
      environment: config.isProduction ? 'production' : 'development',
      message: 'Public URL created successfully'
    })

  } catch (error) {
    console.error('❌ Public URL creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create public URL' },
      { status: 500 }
    )
  }
}

// Export functions for use in public-file route
export { getPublicTokens, getConfig }