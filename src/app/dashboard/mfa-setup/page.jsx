// src/app/dashboard/mfa-setup/page.jsx
'use client'

import { useState } from 'react'
import { enrollTOTP, verifyAndEnableMFA } from '@/app/(auth)/mfa-actions'

export default function MFASetupPage() {
  const [qrCode, setQrCode] = useState(null)
  const [factorId, setFactorId] = useState(null)
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('')

  const handleStartEnrollment = async () => {
    const res = await enrollTOTP()
    if (res?.error) {
      setStatus('Error: ' + res.error)
      return
    }
    setQrCode(res.qrCode)
    setFactorId(res.factorId)
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const res = await verifyAndEnableMFA(factorId, code)
    if (res?.error) {
      setStatus('Verification failed: ' + res.error)
    } else {
      setStatus('MFA successfully enabled! Log out and sign back in to test the verification page.')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl border border-gray-200 shadow-sm text-gray-900">
      <h2 className="text-xl font-bold mb-4">Set Up Two-Factor Authentication</h2>

      {!qrCode ? (
        <button
          onClick={handleStartEnrollment}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Enable Authenticator App
        </button>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <p className="text-xs text-gray-600">Scan this QR code with Google Authenticator or Authy:</p>
          
          <div className="flex justify-center my-4 p-2 bg-white rounded border" dangerouslySetInnerHTML={{ __html: qrCode }} />

          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Verify & Activate MFA
          </button>
        </form>
      )}

      {status && <p className="mt-4 text-xs font-semibold text-blue-600">{status}</p>}
    </div>
  )
}