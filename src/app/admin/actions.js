// src/app/admin/actions.js
'use server'

import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

/**
 * 1. Update Blog Status & Notify Blog Author
 */
export async function updateaBlogStatus(blogId, newStatus) {
  const supabase = await createClient()

  // Verify admin session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Fetch blog details to get author_id, title, and slug
  const { data: blog, error: fetchError } = await supabase
    .from('blogs')
    .select('author_id, title, slug')
    .eq('id', blogId)
    .single()

  if (fetchError || !blog) {
    console.error('Failed to fetch blog for notification:', fetchError?.message)
    throw new Error('Blog post not found')
  }

  // Update status in database
  const { error } = await supabase
    .from('blogs')
    .update({ 
      status: newStatus, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', blogId)

  if (error) {
    console.error('Failed to update blog status:', error.message)
    throw new Error(error.message)
  }

  // Dispatch notification to the blog author
  if (newStatus === 'approved') {
    await createNotification({
      userId: blog.author_id,
      type: 'blog_approved',
      title: 'Blog Post Approved! 🎉',
      message: `Great news! Your blog post "${blog.title}" has been approved and is now published.`,
      link: `/blogs/${blog.slug}`
    })
  } else if (newStatus === 'rejected') {
    await createNotification({
      userId: blog.author_id,
      type: 'blog_rejected',
      title: 'Blog Post Status Update',
      message: `Your blog post "${blog.title}" was not approved by moderation.`
    })
  }

  // Revalidate cache paths
  revalidatePath('/admin/blogs')
  revalidatePath('/dashboard')
  revalidatePath('/blogs')
  revalidatePath(`/blogs/${blog.slug}`)
}

/**
 * 2. Update Comment Status & Notify Comment Author
 */
export async function updateCommentStatus(commentId, newStatus, blogSlug) {
  const supabase = await createClient()

  // Verify admin session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Fetch comment details
  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('author_id, content, blog_id')
    .eq('id', commentId)
    .single()

  if (fetchError || !comment) {
    console.error('Failed to fetch comment:', fetchError?.message)
    throw new Error('Comment not found')
  }

  // Fetch blog title separately to avoid missing relation issues
  const { data: blog } = await supabase
    .from('blogs')
    .select('title, slug')
    .eq('id', comment.blog_id)
    .single()

  // Update comment status
  const { error: updateError } = await supabase
    .from('comments')
    .update({ status: newStatus })
    .eq('id', commentId)

  if (updateError) {
    console.error('Failed to update comment status:', updateError.message)
    throw new Error(updateError.message)
  }

  const targetSlug = blogSlug || blog?.slug
  const blogTitle = blog?.title || 'a blog post'
  const snippet = comment.content 
    ? `"${comment.content.substring(0, 30)}${comment.content.length > 30 ? '...' : ''}"`
    : 'Your comment'

  // Dispatch notification to comment author
  if (newStatus === 'approved') {
    await createNotification({
      userId: comment.author_id,
      type: 'comment_approved',
      title: 'Comment Approved!',
      message: `Your comment ${snippet} on "${blogTitle}" has been approved.`,
      link: targetSlug ? `/blogs/${targetSlug}` : null
    })
  } else if (newStatus === 'rejected') {
    await createNotification({
      userId: comment.author_id,
      type: 'comment_rejected',
      title: 'Comment Rejected',
      message: `Your comment ${snippet} on "${blogTitle}" was rejected.`
    })
  }

  // Revalidate cache paths
  revalidatePath('/admin/comments')
  if (targetSlug) {
    revalidatePath(`/blogs/${targetSlug}`)
  }
}