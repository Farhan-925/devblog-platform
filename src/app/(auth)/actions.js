// src/app/(auth)/actions.js
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
    
    // Check both success and the bot/human score (threshold set to 0.5)
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
  const fullName = formData.get('fullName')

  // 2. Sign up user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  })

  if (authError) {
    redirect('/register?error=' + encodeURIComponent(authError.message))
  }

  // 3. Create profile row in database
  if (authData.user) {
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

  const supabase = await createClient()

  const email = formData.get('email')
  const password = formData.get('password')

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}