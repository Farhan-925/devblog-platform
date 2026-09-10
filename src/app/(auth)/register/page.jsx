// src/app/(auth)/register/page.jsx
import Link from 'next/link'
import { signup } from '../actions'
import RecaptchaV3Field from '../RecaptchaV3Field'

export default async function RegisterPage({ searchParams }) {
  const { error, message } = await searchParams

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
        <p className="text-sm text-gray-500 mt-1">Join DevBlog to publish articles.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
          ⚠️ {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg font-medium">
          {message}
        </div>
      )}

      <form action={signup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            name="fullName"
            type="text"
            required
            placeholder="Farhan Ayub"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

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
            minLength={6}
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* reCAPTCHA Field */}
        <RecaptchaV3Field actionName="signup"/>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors shadow-sm mt-2"
        >
          Create Account
        </button>
      </form>

      <div className="text-center mt-6 text-xs text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  )
}