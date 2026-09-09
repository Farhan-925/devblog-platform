// src/app/blogs/[slug]/edit/page.jsx
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditBlogForm from '../EditBlogForm'


export default async function EditBlogPage({ params }) {
  // 1. Await params in Next.js 15+
  const { slug } = await params
  const supabase = await createClient()

  // 2. Check session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 3. Fetch blog by slug AND author_id to prevent unauthorized edits
  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('author_id', user.id)
    .single()

  if (error || !blog) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Blog Post</h1>
      <EditBlogForm blog={blog} />
    </div>
  )
}