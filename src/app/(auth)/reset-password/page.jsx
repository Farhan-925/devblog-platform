// src/app/(auth)/reset-password/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  useEffect(() => {
    // Verify active session established by /auth/callback
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true)
      } else {
        setStatus({
          type: 'error',
          message: 'Auth session missing or link expired. Please request a new reset link.',
        })
      }
    })
  }, [supabase])

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setStatus({ type: '', message: '' })

    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' })
      return
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/
    if (!passwordRegex.test(password)) {
      setStatus({
        type: 'error',
        message: 'Password must be 8–32 characters and include uppercase, lowercase, number, and special character.',
      })
      return
    }

    setLoading(true)

    // Execute password update directly on the browser client
    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      setStatus({ type: 'error', message: error.message })
    } else {
      setStatus({ type: 'success', message: 'Password updated successfully! Redirecting to login...' })
      setTimeout(() => {
        router.push('/login?message=Password updated successfully! Please sign in.')
      }, 2000)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-gray-900">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Set New Password</h1>
        <p className="text-sm text-gray-500 mt-1">Enter your new secure password below.</p>
      </div>

      {status.message && (
        <div
          className={`mb-4 p-3 border text-xs rounded-lg font-medium ${
            status.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}
        >
          {status.type === 'error' ? '⚠️ ' : '✅ '}
          {status.message}
        </div>
      )}

      {sessionReady ? (
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors shadow-sm mt-2"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      ) : (
        !status.message && <p className="text-center text-xs text-gray-500 py-4">Validating session...</p>
      )}
    </div>
  )
}