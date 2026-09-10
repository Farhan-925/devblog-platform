// src/app/(auth)/mfa-verify/page.jsx
import { verifyLoginMFA } from '../mfa-actions'

export default async function MFAVerifyPage({ searchParams }) {
  const { error } = await searchParams

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Two-Factor Verification</h1>
        <p className="text-sm text-gray-500 mt-1">Enter the 6-digit code from your authenticator app.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
          ⚠️ {error}
        </div>
      )}

      <form action={verifyLoginMFA} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Authentication Code</label>
          <input
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            placeholder="123456"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center tracking-widest text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors shadow-sm"
        >
          Verify Code
        </button>
      </form>
    </div>
  )
}