'use client'

import { useState } from 'react'

export default function LoginForm({
  error,
  from,
}: {
  error?: string | null
  from?: string
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email: username,
          password,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data.success) {
        alert(data.error || 'Invalid login')
        return
      }

      window.location.assign(from || '/admin')
    } catch {
      alert('Login request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-4 rounded-xl border border-neutral-800 p-6"
      >
        <h1 className="text-xl font-semibold">Admin Login</h1>

        {error ? (
          <div className="text-sm text-red-500">Invalid credentials</div>
        ) : null}

        <input
          type="text"
          placeholder="Username or email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded border border-neutral-700 bg-black p-2"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border border-neutral-700 bg-black p-2"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-yellow-500 py-2 font-medium text-black disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}