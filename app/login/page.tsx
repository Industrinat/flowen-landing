'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        // Save to localStorage for compatibility with existing system
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Success - redirect to dashboard or projects
        router.push('/dashboard')
      } else {
        setError(data.error || 'Fel e-post eller lösenord')
      }
    } catch (err) {
      setError('Ett fel uppstod. Försök igen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Välkommen till Flowen</h1>
            <p className="text-gray-200 mt-2">Logga in för att komma åt dina projekt</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                E-post
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-white bg-opacity-20 border border-gray-300 border-opacity-30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="admin@flowen.se"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Lösenord
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-white bg-opacity-20 border border-gray-300 border-opacity-30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500 bg-opacity-20 text-red-200 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                'Loggar in...'
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Logga in
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-300">
            <p>Demo-inloggning:</p>
            <p className="font-mono mt-1">admin@flowen.se / flowen123</p>
          </div>

          <p className="mt-4 text-sm text-center text-gray-300">
            Har du inget konto?{' '}
            <a href="/register" className="text-indigo-300 underline hover:text-indigo-100">
              Registrera dig
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}