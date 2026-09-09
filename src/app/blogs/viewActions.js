// src/app/blogs/viewActions.js
'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function recordAndFetchViews(blogId) {
  const cookieStore = await cookies()
  let visitorId = cookieStore.get('visitor_id')?.value

  // Generate anonymous visitor ID cookie if not present
  if (!visitorId) {
    visitorId = crypto.randomUUID()
    cookieStore.set('visitor_id', visitorId, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      path: '/'
    })
  }

  const supabase = await createClient()

  // Execute database RPC function
  const { data, error } = await supabase.rpc('track_and_get_blog_views', {
    p_blog_id: blogId,
    p_visitor_id: visitorId
  })

  if (error) {
    console.error('Error tracking view:', error.message)
    return { total_views: 0, unique_views: 0, views_today: 0 }
  }

  return data[0] || { total_views: 0, unique_views: 0, views_today: 0 }
}