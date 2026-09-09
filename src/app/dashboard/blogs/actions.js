// src/app/dashboard/blogs/actions.js
'use server'

import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

export async function createBlog(formData) {
  const supabase = await createClient()

  // 1. Verify session
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

  // 2. Insert blog with 'pending' status
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

  // 3. Dispatch Notifications
  try {
    // A. Notify Author
    await createNotification({
      userId: user.id,
      type: 'blog_submitted',
      title: 'Blog Post Submitted 📝',
      message: `Your blog "${title}" has been submitted and is pending admin review.`,
      link: '/dashboard'
    })

    // B. Fetch all Admin accounts
    const { data: admins, error: adminErr } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('role', 'admin')

    if (adminErr) {
      console.error('Failed to query admin profiles:', adminErr.message)
    }

    // C. Dispatch to each Admin
    if (admins && admins.length > 0) {
      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          type: 'admin_blog_pending',
          title: 'New Blog Post Pending Review 🚨',
          message: `A new blog post "${title}" has been submitted for approval.`,
          link: '/admin/blogs'
        })
      }
    } else {
      console.warn('No users found in profiles table with role = "admin"')
    }
  } catch (notifErr) {
    console.error('Failed to send submission notifications:', notifErr.message)
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin/blogs')
  return { success: 'Blog submitted successfully and awaiting approval!', blog }
}