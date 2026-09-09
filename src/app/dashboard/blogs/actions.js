// src/app/dashboard/blogs/actions.js
'use server'

import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createBlog(formData) {
  const supabase = await createClient()

  // 1. Verify User Session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/dashboard/blogs/new?error=' + encodeURIComponent('You must be logged in to create a blog post.'))
  }

  // 2. Extract Form Values & SEO Details
  const title = formData.get('title')
  const content = formData.get('content')
  const imageFile = formData.get('image') // Direct file from PC
  const seoTitle = formData.get('seo_title') || null
  const seoDescription = formData.get('seo_description') || null
  const seoKeywords = formData.get('seo_keywords') || null
  const actionType = formData.get('actionType') || 'submit'

  if (!title || !content) {
    redirect('/dashboard/blogs/new?error=' + encodeURIComponent('Title and content are required fields.'))
  }

  // Auto-generate URL slug from title
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4)

  // 3. Upload PC Image File to Supabase Storage 'blog-images' Bucket
  let imageUrl = null

  if (imageFile && imageFile.size > 0 && imageFile.name) {
    const fileExt = imageFile.name.split('.').pop()
    const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage Upload Error:', uploadError.message)
      redirect('/dashboard/blogs/new?error=' + encodeURIComponent('Image upload failed: ' + uploadError.message))
    }

    const { data: publicUrlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath)

    imageUrl = publicUrlData?.publicUrl || null
  }

  const postStatus = actionType === 'draft' ? 'draft' : 'pending'

  // 4. Insert Record with SEO Details into Database
  const { error: insertError } = await supabase
    .from('blogs')
    .insert({
      author_id: user.id,
      title,
      content,
      slug,
      image_url: imageUrl,
      seo_title: seoTitle,
      seo_description: seoDescription,
      seo_keywords: seoKeywords,
      status: postStatus
    })

  if (insertError) {
    console.error('Database Error:', insertError.message)
    redirect('/dashboard/blogs/new?error=' + encodeURIComponent(insertError.message))
  }

  // 5. Dispatch Moderation Notifications
  if (postStatus === 'pending') {
    try {
      await createNotification({
        userId: user.id,
        type: 'blog_submitted',
        title: 'Blog Post Submitted 📝',
        message: `Your blog "${title}" is pending admin review.`,
        link: '/dashboard'
      })

      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')

      if (admins && admins.length > 0) {
        await Promise.all(
          admins.map((admin) =>
            createNotification({
              userId: admin.id,
              type: 'admin_blog_pending',
              title: 'New Blog Post Pending Review 🚨',
              message: `A new blog post "${title}" was submitted for approval.`,
              link: '/admin/blogs'
            })
          )
        )
      }
    } catch (notifErr) {
      console.error('Notification error:', notifErr.message)
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin/blogs')

  const msg = postStatus === 'draft' ? 'Draft saved successfully!' : 'Blog submitted successfully! Awaiting approval.'
  redirect(`/dashboard?message=${encodeURIComponent(msg)}`)
}