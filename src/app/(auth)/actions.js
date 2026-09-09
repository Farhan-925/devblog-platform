// src/app/(auth)/actions.js
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData) {
  const supabase = await createClient()

  const email = formData.get('email')
  const password = formData.get('password')
  const fullName = formData.get('fullName')

  // 1. Sign up user in Supabase Auth
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

  // 2. Create profile row in database
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