// src/app/(auth)/login/page.jsx
import Link from 'next/link'
import { login } from '../actions'

export default async function LoginPage({ searchParams }) {
  const { error, message } = await searchParams

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sign In to DevBlog</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Please enter your details.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg">
          {message}
        </div>
      )}

      <form action={login} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            name="email"
            type="email"
            required
            placeholder="name@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors shadow-sm mt-2"
        >
          Sign In
        </button>
      </form>

      <div className="text-center mt-6 text-xs text-gray-500">
        Don't have an account?{' '}
        <Link href="/register" className="text-blue-600 font-semibold hover:underline">
          Register here
        </Link>
      </div>
    </div>
  )
}