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

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // 1. Protect Dashboard: Redirect to login if user is not authenticated
  if (path.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login?error=Please log in first', request.url))
  }

  // 2. Protect Admin Panel: Check both auth status and 'admin' role
  if (path.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?error=Please log in first', request.url))
    }

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
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}