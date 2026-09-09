// src/app/blogs/page.jsx
import { createClient } from '@/lib/supabase/server'
import BlogList from './BlogList'

export const revalidate = 0 // Ensures fresh data load

export default async function PublicBlogsPage() {
  const supabase = await createClient()

  // Fetch only approved blogs
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('*, profiles(full_name)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center text-red-500 text-sm">
        Failed to load blog posts. Please try again later.
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight">
          Latest Published Articles
        </h1>
        <p className="text-sm text-gray-500">
          Explore approved guides, tutorials, and insights from our authors.
        </p>
      </div>

      {/* Interactive Blog List with Debounced Search */}
      <BlogList initialBlogs={blogs || []} />
    </div>
  )
}