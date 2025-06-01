// pages/login.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard') // ändra till var du vill skicka användaren
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 to-slate-900 text-white px-4">
      <form onSubmit={handleLogin} className="bg-white bg-opacity-10 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Log in to Flowen</h2>

        {error && <p className="mb-4 text-red-400">{error}</p>}

        <label className="block mb-4">
          <span className="block mb-1 text-sm font-semibold">Email</span>
          <input
            type="email"
            required
            className="w-full px-4 py-2 rounded bg-white text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="block mb-6">
          <span className="block mb-1 text-sm font-semibold">Password</span>
          <input
            type="password"
            required
            className="w-full px-4 py-2 rounded bg-white text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded transition"
        >
          Log in
        </button>

        <p className="mt-4 text-sm text-center">
          Don't have an account?{' '}
          <a href="/register" className="text-indigo-300 underline hover:text-indigo-100">
            Register here
          </a>
        </p>
      </form>
    </div>
  )
}
