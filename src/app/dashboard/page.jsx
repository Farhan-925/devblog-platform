// src/app/dashboard/page.jsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { deleteBlog } from '@/app/blogs/actions'

export const revalidate = 0

export default async function DashboardPage({ searchParams }) {
  const { message, status: activeFilter } = await searchParams
  const supabase = await createClient()

  // 1. Verify User Session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Fetch User's Blogs
  const { data: allBlogs } = await supabase
    .from('blogs')
    .select('*')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  const blogs = allBlogs || []

  // 3. Aggregate Stats
  const totalBlogs = blogs.length
  const draftCount = blogs.filter((b) => b.status === 'draft').length
  const pendingCount = blogs.filter((b) => b.status === 'pending').length
  const approvedCount = blogs.filter((b) => b.status === 'approved').length
  const rejectedCount = blogs.filter((b) => b.status === 'rejected').length
  const totalViews = blogs.reduce((sum, b) => sum + (b.views_count || 0), 0)

  // 4. Active Tab Filter
  const filteredBlogs = activeFilter
    ? blogs.filter((b) => b.status === activeFilter)
    : blogs

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Articles Overview</h1>
          <p className="text-xs text-gray-500 mt-1">Track views, edits, and status changes for your articles.</p>
        </div>
        <Link
          href="/dashboard/blogs/new"
          className="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg text-xs transition-colors shadow-xs"
        >
          + Write New Post
        </Link>
      </div>

      {/* Alert Banner */}
      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl">
          {message}
        </div>
      )}

      {/* Top Level Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        <StatTile label="Total Posts" value={totalBlogs} color="text-gray-900" />
        <StatTile label="Drafts" value={draftCount} color="text-slate-600" />
        <StatTile label="Pending" value={pendingCount} color="text-amber-600" />
        <StatTile label="Published" value={approvedCount} color="text-emerald-600" />
        <StatTile label="Rejected" value={rejectedCount} color="text-rose-600" />
        <StatTile label="Total Views" value={totalViews.toLocaleString()} color="text-blue-600" />
      </div>

      {/* Main Articles Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            {activeFilter ? `${activeFilter} Articles` : 'All Articles'} ({filteredBlogs.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog) => {
              const deleteAction = deleteBlog.bind(null, blog.id, blog.slug)

              return (
                <div key={blog.id} className="p-4 sm:p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug">{blog.title}</h3>
                      <StatusBadge status={blog.status} />
                    </div>
                    <p className="text-[11px] sm:text-xs text-gray-400">
                      Created on {new Date(blog.created_at).toLocaleDateString()} • {blog.views_count || 0} Views
                    </p>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-2 self-start md:self-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 w-full md:w-auto">
                    {blog.status === 'approved' && (
                      <Link
                        href={`/blogs/${blog.slug}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        View Live →
                      </Link>
                    )}

                    <Link
                      href={`/blogs/${blog.slug}/edit`}
                      className="text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Edit
                    </Link>

                    <form action={deleteAction}>
                      <button
                        type="submit"
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-8 text-center text-xs text-gray-500 space-y-2">
              <p className="font-semibold text-gray-700">No articles found in this category.</p>
              <Link href="/dashboard/blogs/new" className="inline-block text-blue-600 font-bold hover:underline">
                Write a new post
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

function StatTile({ label, value, color }) {
  return (
    <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-gray-200 text-center shadow-xs">
      <span className={`block text-lg sm:text-xl font-black ${color}`}>{value}</span>
      <span className="text-[10px] text-gray-500 font-semibold">{label}</span>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-800 border-rose-200',
  }

  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border capitalize ${styles[status] || styles.draft}`}>
      {status}
    </span>
  )
}