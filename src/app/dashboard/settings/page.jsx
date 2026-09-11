// src/app/dashboard/settings/page.jsx
import { createClient } from '@/lib/supabase/server'
import { updateProfile, changePasswordLoggedIn } from '@/app/(auth)/actions'
import Link from 'next/link'

export default async function SettingsPage({ searchParams }) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user?.id)
    .maybeSingle()

  const { data: factors } = await supabase.auth.mfa.listFactors()
  const isMfaEnabled = factors?.totp?.some((f) => f.status === 'verified')

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-sm text-gray-500">Manage your profile information and security preferences.</p>
      </div>

      {params?.error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          ⚠️ {params.error}
        </div>
      )}

      {params?.message && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
          ✅ {params.message}
        </div>
      )}

      {/* Profile Details Form */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">Personal Details</h2>
        <form action={updateProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              name="fullName"
              type="text"
              defaultValue={profile?.full_name || ''}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">Change Password</h2>
        <form action={changePasswordLoggedIn} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              name="currentPassword"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              name="newPassword"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Two-Factor Status Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Two-Factor Authentication (2FA)</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {isMfaEnabled
              ? 'Your account is secured with Google Authenticator / TOTP.'
              : 'Add an extra layer of security to your account using an authenticator app.'}
          </p>
        </div>

        <Link
          href="/dashboard/mfa-setup"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isMfaEnabled
              ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isMfaEnabled ? 'Manage 2FA' : 'Configure 2FA'}
        </Link>
      </div>
    </div>
  )
}