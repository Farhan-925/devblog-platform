// src/app/(auth)/actions.js
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Attach attempt counter to Node.js global object so it persists across Server Action re-renders
const globalForAttempts = global
if (!globalForAttempts.failedLoginAttempts) {
  globalForAttempts.failedLoginAttempts = new Map()
}
const failedLoginAttempts = globalForAttempts.failedLoginAttempts

// Helper function to verify reCAPTCHA v3 token and score
async function verifyRecaptchaToken(token) {
  if (!token) return false

  const secretKey = process.env.RECAPTCHA_SECRET_KEY
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await res.json()
    return data.success && data.score >= 0.5
  } catch (err) {
    console.error('reCAPTCHA Verification Fetch Error:', err)
    return false
  }
}

export async function signup(formData) {
  const captchaToken = formData.get('g-recaptcha-response')

  // 1. Verify reCAPTCHA Token & Score
  const isCaptchaValid = await verifyRecaptchaToken(captchaToken)
  if (!isCaptchaValid) {
    redirect('/register?error=' + encodeURIComponent('Security verification failed. Please try again.'))
  }

  const supabase = await createClient()

  const email = formData.get('email')
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')
  const fullName = formData.get('fullName')

  if (password !== confirmPassword) {
    redirect('/register?error=' + encodeURIComponent("Passwords do not match. Please try again."))
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/
  if (!passwordRegex.test(password)) {
    redirect('/register?error=' + encodeURIComponent("Password must be 8–32 characters and include uppercase, lowercase, number, and special character."))
  }

  // 2. Sign up user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  })

  // Handle explicit API errors
  if (authError) {
    redirect('/register?error=' + encodeURIComponent(authError.message))
  }

  // Check for duplicate email (Supabase returns an empty identities array for existing users)
  if (authData?.user && authData.user.identities && authData.user.identities.length === 0) {
    redirect('/register?error=' + encodeURIComponent('An account with this email already exists. Please sign in.'))
  }

  // 3. Create profile row for new user
  if (authData?.user) {
    await supabase.from('profiles').insert({
      id: authData.user.id,
      full_name: fullName,
      role: 'user'
    })
  }

  redirect('/login?message=Account created successfully! Please sign in.')
}

export async function login(formData) {
  const captchaToken = formData.get('g-recaptcha-response')

  // 1. Verify reCAPTCHA Token & Score
  const isCaptchaValid = await verifyRecaptchaToken(captchaToken)
  if (!isCaptchaValid) {
    redirect('/login?error=' + encodeURIComponent('Security verification failed. Please try again.'))
  }

  const email = formData.get('email')
  const password = formData.get('password')

  // 2. Progressive Delay Check (Slows down brute-force attacks)
  const attempts = failedLoginAttempts.get(email) || 0
  if (attempts > 0) {
    // Exponential delay: 1s, 2s, 4s, 8s (capped at 10 seconds max delay)
    const delay = Math.min(Math.pow(2, attempts - 1) * 1000, 10000)
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    // Increment failed attempts for progressive backoff
    failedLoginAttempts.set(email, attempts + 1)

    // Reset attempt history automatically after 15 minutes
    setTimeout(() => failedLoginAttempts.delete(email), 15 * 60 * 1000)

    // Handle Supabase 429 Too Many Requests rate-limit error
    if (error.status === 429) {
      redirect('/login?error=' + encodeURIComponent('Too many failed attempts. Please wait a few minutes before trying again.'))
    }

    // Generic error response to prevent account enumeration
    redirect('/login?error=' + encodeURIComponent('Invalid email address or password.'))
  }

  // Clear failed attempt tracking on successful login
  failedLoginAttempts.delete(email)

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// -------------------------------------------------------------
// PASSWORD RESET ACTIONS
// -------------------------------------------------------------

export async function requestPasswordReset(formData) {
  const captchaToken = formData.get('g-recaptcha-response')

  // 1. Verify reCAPTCHA Token & Score
  const isCaptchaValid = await verifyRecaptchaToken(captchaToken)
  if (!isCaptchaValid) {
    redirect('/forgot-password?error=' + encodeURIComponent('Security verification failed. Please try again.'))
  }

  const email = formData.get('email')
  const supabase = await createClient()

  // 2. Send reset link routed through /auth/callback to establish active session
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  })

  // Generic response to prevent email enumeration attacks
  redirect('/forgot-password?message=' + encodeURIComponent('If an account exists with that email address, a password reset link has been sent.'))
}

export async function updatePassword(formData) {
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')

  // 1. Verify password match
  if (password !== confirmPassword) {
    redirect('/reset-password?error=' + encodeURIComponent("Passwords do not match. Please try again."))
  }

  // 2. Enforce complexity policy
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/
  if (!passwordRegex.test(password)) {
    redirect('/reset-password?error=' + encodeURIComponent("Password must be 8–32 characters and include uppercase, lowercase, number, and special character."))
  }

  const supabase = await createClient()

  // 3. Update password (Supabase automatically invalidates the single-use reset token)
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirect('/reset-password?error=' + encodeURIComponent(error.message))
  }

  // 4. Invalidate all other active sessions across other devices for security
  await supabase.auth.signOut({ scope: 'others' })

  redirect('/login?message=' + encodeURIComponent('Password reset successful. Please sign in with your new password.'))
}

// -------------------------------------------------------------
// USER PROFILE & IN-APP SECURITY SETTINGS ACTIONS
// -------------------------------------------------------------

export async function updateProfile(formData) {
  const fullName = formData.get('fullName')
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Update full_name in Supabase Auth user metadata
  await supabase.auth.updateUser({
    data: { full_name: fullName }
  })

  // 2. Update profiles table row
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', user.id)

  if (error) {
    redirect('/dashboard/settings?error=' + encodeURIComponent(error.message))
  }

  redirect('/dashboard/settings?message=' + encodeURIComponent('Profile details updated successfully.'))
}

export async function changePasswordLoggedIn(formData) {
  const currentPassword = formData.get('currentPassword')
  const newPassword = formData.get('newPassword')
  const confirmPassword = formData.get('confirmPassword')

  if (newPassword !== confirmPassword) {
    redirect('/dashboard/settings?error=' + encodeURIComponent('New passwords do not match.'))
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/
  if (!passwordRegex.test(newPassword)) {
    redirect('/dashboard/settings?error=' + encodeURIComponent('Password must be 8–32 characters and include uppercase, lowercase, number, and special character.'))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Re-authenticate current password for security verification
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    redirect('/dashboard/settings?error=' + encodeURIComponent('Current password is incorrect.'))
  }

  // 2. Update password and invalidate other device sessions
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  if (updateError) {
    redirect('/dashboard/settings?error=' + encodeURIComponent(updateError.message))
  }

  await supabase.auth.signOut({ scope: 'others' })

  redirect('/dashboard/settings?message=' + encodeURIComponent('Password updated! Other active device sessions invalidated.'))
}