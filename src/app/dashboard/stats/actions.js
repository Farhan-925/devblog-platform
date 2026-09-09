// src/app/dashboard/stats/actions.js
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getUserBlogStats() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Fetch user's blogs with status and views_count
  const { data: blogs, error: blogsError } = await supabase
    .from('blogs')
    .select('id, status, views_count')
    .eq('author_id', user.id)

  if (blogsError) throw new Error(blogsError.message)

  // 2. Extract blog IDs to count total comments received across all blogs
  const blogIds = blogs.map((b) => b.id)

  let totalComments = 0
  if (blogIds.length > 0) {
    const { count, error: commentsError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .in('blog_id', blogIds)

    if (!commentsError) {
      totalComments = count || 0
    }
  }

  // 3. Aggregate statistics
  const stats = {
    totalBlogs: blogs.length,
    published: blogs.filter((b) => b.status === 'approved').length,
    pending: blogs.filter((b) => b.status === 'pending').length,
    rejected: blogs.filter((b) => b.status === 'rejected').length,
    totalViews: blogs.reduce((sum, b) => sum + (b.views_count || 0), 0),
    totalComments
  }

  return stats
}