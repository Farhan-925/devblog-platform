// src/app/blogs/[slug]/page.jsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CommentSection from './CommentSection'

// Consistent date formatter helper to prevent hydration mismatches
const formatDate = (dateString) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  return d.toISOString().split('T')[0] // Formats as YYYY-MM-DD
}

export default async function SingleBlogPage({ params }) {
  // 1. Await params for Next.js 15+ App Router
  const { slug } = await params
  
  const supabase = await createClient()

  // 2. Fetch current logged-in user
  const { data: { user } } = await supabase.auth.getUser()

  // 3. Automatically increment view count via SQL RPC
  await supabase.rpc('increment_blog_views', { blog_slug: slug })

  // 4. Fetch updated blog details by slug
  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*, profiles(full_name)')
    .eq('slug', slug)
    .single()

  // Render 404 if post is not found
  if (error || !blog) {
    console.error('Blog fetch error:', error?.message)
    notFound()
  }

  // 5. Fetch approved comments along with author profiles
  const { data: comments } = await supabase
    .from('comments')
    .select('*, profiles(full_name)')
    .eq('blog_id', blog.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      
      {/* Article Content Header */}
      <article className="space-y-4">
        <h1 className="text-3xl font-extrabold text-gray-900">{blog.title}</h1>
        
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>By {blog.profiles?.full_name || 'Author'}</span>
          <span>•</span>
          <span>{formatDate(blog.created_at)}</span>
          <span>•</span>
          <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {(blog.views_count || 0).toLocaleString()} Views
          </span>
        </div>

        {/* Blog Hero Image */}
        {blog.image_url && (
          <img
            src={blog.image_url}
            alt={blog.title}
            className="w-full h-80 object-cover rounded-xl my-4 shadow-sm"
          />
        )}

        {/* Blog Post Content Body */}
        <div className="prose text-gray-800 text-sm leading-relaxed whitespace-pre-line pt-2">
          {blog.content}
        </div>
      </article>

      {/* Realtime Discussion & Nested Comments */}
      <CommentSection
        comments={comments || []}
        blogId={blog.id}
        blogSlug={blog.slug}
        user={user}
      />

    </main>
  )
}