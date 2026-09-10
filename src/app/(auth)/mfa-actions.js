'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// 1. Start TOTP Enrollment (Generates QR Code URI & Secret)
export async function enrollTOTP() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    issuer: 'DevBlog',
  })

  if (error) {
    return { error: error.message }
  }

  // Returns factorId, qr_code (SVG/Data URI), and secret key for manual entry
  return { 
    factorId: data.id, 
    qrCode: data.totp.qr_code, 
    secret: data.totp.secret 
  }
}

// 2. Verify TOTP Code during setup to activate the factor
export async function verifyAndEnableMFA(factorId, code) {
  const supabase = await createClient()

  // Verify the code to complete factor registration
  const { data, error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

// 3. Challenge MFA during login when a user has MFA enabled
export async function verifyLoginMFA(formData) {
  const code = formData.get('code')
  const supabase = await createClient()

  // Retrieve user factors
  const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
  if (factorsError || !factors.totp.length) {
    redirect('/login?error=' + encodeURIComponent('MFA factor not found.'))
  }

  const factorId = factors.totp[0].id

  // Challenge & Verify the 6-digit TOTP code
  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code,
  })

  if (error) {
    redirect('/mfa-verify?error=' + encodeURIComponent('Invalid authentication code.'))
  }

  redirect('/dashboard')
}