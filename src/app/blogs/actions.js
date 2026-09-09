// src/app/blogs/actions.js
'use server'

import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

/**
 * 1. Submit a New Blog Post (Notify Author + Admins)
 */
export async function createBlog(formData) {
  const supabase = await createClient()

  // Verify user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to create a blog post.' }
  }

  const title = formData.get('title')
  const content = formData.get('content')
  const slug = formData.get('slug')
  const imageUrl = formData.get('imageUrl') || null

  if (!title || !content || !slug) {
    return { error: 'Title, content, and slug are required fields.' }
  }

  // Insert blog into database with 'pending' status
  const { data: blog, error } = await supabase
    .from('blogs')
    .insert({
      author_id: user.id,
      title,
      content,
      slug,
      image_url: imageUrl,
      status: 'pending'
    })
    .select('*')
    .single()

  if (error) {
    return { error: error.message }
  }

  try {
    // Dispatch "Blog Submitted" notification to the author
    await createNotification({
      userId: user.id,
      type: 'blog_submitted',
      title: 'Blog Post Submitted 📝',
      message: `Your blog "${title}" has been submitted and is pending admin review.`,
      link: '/dashboard'
    })

    // Fetch all admins to notify them of the new pending submission
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      console.log('Found Admins:', admins, 'Admin Fetch Error:', adminError?.message)

    if (admins && admins.length > 0) {
      const adminNotifPromises = admins.map((admin) =>
        createNotification({
          userId: admin.id,
          type: 'admin_blog_pending',
          title: 'New Blog Post Pending Review 🚨',
          message: `A new blog post "${title}" has been submitted for approval.`,
          link: '/admin/blogs'
        })
      )
      await Promise.all(adminNotifPromises)
      console.log('Admin notifications sent successfully!')
    }
  } catch (notifErr) {
    console.error('Failed to dispatch blog submission notifications:', notifErr.message)
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin/blogs')
  return { success: 'Blog submitted successfully and awaiting approval!', blog }
}

/**
 * 2. Update an Existing Blog Post
 */
export async function updateBlog(formData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const blogId = formData.get('blogId')
  const title = formData.get('title')
  const content = formData.get('content')
  const slug = formData.get('slug')
  const imageUrl = formData.get('imageUrl') || null

  if (!blogId || !title || !content || !slug) {
    return { error: 'All fields are required.' }
  }

  // Update blog and reset status to 'pending' for re-moderation upon edit
  const { error } = await supabase
    .from('blogs')
    .update({
      title,
      content,
      slug,
      image_url: imageUrl,
      status: 'pending',
      updated_at: new Date().toISOString()
    })
    .eq('id', blogId)
    .eq('author_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/admin/blogs')
  revalidatePath('/blogs')
  revalidatePath(`/blogs/${slug}`)

  return { success: 'Blog updated successfully! Sent for re-review.' }
}

/**
 * 3. Delete a Blog Post
 */
export async function deleteBlog(blogId, blogSlug) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', blogId)
    .eq('author_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/admin/blogs')
  revalidatePath('/blogs')
  if (blogSlug) revalidatePath(`/blogs/${blogSlug}`)
}

/**
 * 4. Submit a New Comment (Pending Admin Review)
 */
export async function submitComment(formData) {
  const supabase = await createClient()

  // Check logged-in session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be signed in to leave a comment.' }
  }

  const blogId = formData.get('blogId')
  const blogSlug = formData.get('blogSlug')
  const content = formData.get('content')

  if (!content || !content.trim()) {
    return { error: 'Comment content cannot be empty.' }
  }

  // Insert comment with 'pending' status
  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      blog_id: blogId,
      author_id: user.id,
      content: content.trim(),
      status: 'pending'
    })
    .select('*')
    .single()

  if (error) {
    return { error: error.message }
  }

  // Fetch blog title for clear notification context
  const { data: blog } = await supabase
    .from('blogs')
    .select('title')
    .eq('id', blogId)
    .single()

  const blogTitle = blog?.title || 'the blog post'
  const snippet = content.length > 30 ? `"${content.substring(0, 30)}..."` : `"${content}"`

  // Send "Comment Submitted" notification to author
  try {
    await createNotification({
      userId: user.id,
      type: 'comment_submitted',
      title: 'Comment Awaiting Review',
      message: `Your comment ${snippet} on "${blogTitle}" was submitted for moderation.`,
      link: `/blogs/${blogSlug}`
    })
  } catch (notifErr) {
    console.error('Failed to send comment submission notification:', notifErr.message)
  }

  revalidatePath(`/blogs/${blogSlug}`)
  return { success: 'Your comment has been submitted and is awaiting admin approval!' }
}

/**
 * 5. Update Comment Status (Fallback Server Action)
 */
export async function updateCommentStatus(commentId, blogSlug, newStatus) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('comments')
    .update({ status: newStatus })
    .eq('id', commentId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/comments')
  if (blogSlug) {
    revalidatePath(`/blogs/${blogSlug}`)
  }
}