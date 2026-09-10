// src/middleware.js
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshes the session token on every request
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // 1. Protect Dashboard & Admin: Redirect to login if unauthenticated
  if ((path.startsWith('/dashboard') || path.startsWith('/admin')) && !user) {
    return NextResponse.redirect(new URL('/login?error=Please log in first', request.url))
  }

  // 2. Enforce MFA Level (AAL Check) for authenticated users on protected routes
  if (user && (path.startsWith('/dashboard') || path.startsWith('/admin'))) {
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    
    if (aalData) {
      const { currentLevel, nextLevel } = aalData
      // If user enabled MFA (nextLevel === 'aal2') but hasn't entered code (currentLevel === 'aal1')
      if (nextLevel === 'aal2' && currentLevel === 'aal1') {
        return NextResponse.redirect(new URL('/mfa-verify', request.url))
      }
    }
  }

  // 3. Protect Admin Panel: Check for 'admin' role in profiles table
  if (path.startsWith('/admin') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard?error=Admin access required', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - auth/callback (PKCE token exchange handler)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!auth/callback|_next/static|_next/image|favicon.ico).*)',
  ],
}