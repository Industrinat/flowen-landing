// lib/config.ts - Centralized environment configuration
import path from 'path'

export interface AppConfig {
  uploadsDir: string
  dbFile: string
  baseUrl: string
  tokensFile: string
  isProduction: boolean
}

export function getConfig(): AppConfig {
  const isProduction = process.env.NODE_ENV === 'production'
  
  if (isProduction) {
    // Production configuration
    return {
      uploadsDir: '/var/www/flowen/uploads/project-files',
      dbFile: '/var/www/flowen/uploads/project-files.json',
      baseUrl: 'https://flowen.eu',
      tokensFile: '/var/www/flowen/uploads/public-tokens.json',
      isProduction: true
    }
  } else {
    // Development configuration
    return {
      uploadsDir: path.join(process.cwd(), 'uploads', 'project-files'),
      dbFile: path.join(process.cwd(), 'uploads', 'project-files.json'),
      baseUrl: process.env.PUBLIC_URL || 'http://localhost:3000',
      tokensFile: path.join(process.cwd(), 'uploads', 'public-tokens.json'),
      isProduction: false
    }
  }
}

// For ngrok or other development tunnels
export function getPublicUrl(): string {
  const config = getConfig()
  
  // Check for ngrok URL in environment
  if (process.env.NGROK_URL) {
    return process.env.NGROK_URL
  }
  
  // Check for other tunnel URLs
  if (process.env.PUBLIC_URL) {
    return process.env.PUBLIC_URL
  }
  
  return config.baseUrl
}