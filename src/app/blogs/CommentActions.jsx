// src/app/blogs/commentActions.js
'use server'

import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

export async function addComment({ blogId, content, parentId = null, blogSlug }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Must be signed in to comment')

  // 1. Fetch commenter's profile name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const commenterName = profile?.full_name || 'Someone'

  // 2. Insert the new comment into Supabase
  const { data: newComment, error } = await supabase
    .from('comments')
    .insert({
      blog_id: blogId,
      author_id: user.id,
      content,
      parent_id: parentId,
      status: 'approved'
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  // 3. Send Realtime Notification with Commenter Name & Clean Post Title
  try {
    if (parentId) {
      // It's a reply: Fetch parent comment author and joined blog title
      const { data: parentComment } = await supabase
        .from('comments')
        .select('author_id, blogs(title)')
        .eq('id', parentId)
        .single()

      const postTitle = parentComment?.blogs?.title || 'your post'

      if (parentComment && parentComment.author_id !== user.id) {
        await createNotification({
          userId: parentComment.author_id,
          type: 'comment_reply',
          title: 'New Reply to Your Comment',
          message: `${commenterName} replied to your comment on "${postTitle}": "${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"`,
          link: `/blogs/${blogSlug}`
        })
      }
    } else {
      // It's a root comment: Fetch blog author and human-readable title
      const { data: blog } = await supabase
        .from('blogs')
        .select('author_id, title')
        .eq('id', blogId)
        .single()

      if (blog && blog.author_id !== user.id) {
        await createNotification({
          userId: blog.author_id,
          type: 'blog_comment',
          title: 'New Comment on Your Blog',
          message: `${commenterName} commented on "${blog.title}": "${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"`,
          link: `/blogs/${blogSlug}`
        })
      }
    }
  } catch (notifErr) {
    console.error('Failed to dispatch notification:', notifErr.message)
  }

  revalidatePath(`/blogs/${blogSlug}`)
  return newComment
}

export async function updateComment({ commentId, content, blogSlug }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('comments')
    .update({ content, is_edited: true })
    .eq('id', commentId)
    .eq('author_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath(`/blogs/${blogSlug}`)
}

export async function deleteComment({ commentId, blogSlug }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('comments')
    .update({ is_deleted: true, content: '[This comment has been deleted]' })
    .eq('id', commentId)
    .eq('author_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath(`/blogs/${blogSlug}`)
}

export async function reportComment({ commentId, blogSlug }) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('comments')
    .update({ is_reported: true })
    .eq('id', commentId)

  if (error) throw new Error(error.message)
  revalidatePath(`/blogs/${blogSlug}`)
}