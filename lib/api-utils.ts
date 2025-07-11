// lib/api-utils.ts
export function getApiUrl(): string {
  // Simple API URL detection
  if (typeof window !== 'undefined') {
    // Client-side
    return window.location.origin
  }
  
  // Server-side
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  return process.env.NODE_ENV === 'production' 
    ? 'https://flowen.eu'
    : 'http://localhost:3000'
}