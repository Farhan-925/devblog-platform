// src/app/admin/blogs/page.jsx
import { createClient } from '@/lib/supabase/server'
import { updateaBlogStatus } from '../actions'


export default async function AdminBlogsPage() {
  const supabase = await createClient()

  // Fetch all blogs with author details
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="p-6 text-red-500 text-sm">
        Failed to load blog submissions: {error.message}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Blog Approval</h1>
          <p className="text-sm text-gray-500 mt-1">Review pending blogs and manage visibility.</p>
        </div>
        <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
          Total Submissions: {blogs?.length || 0}
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase">
              <th className="p-4">Blog Title</th>
              <th className="p-4">Author</th>
              <th className="p-4">Status</th>
              <th className="p-4">Submitted</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {blogs && blogs.length > 0 ? (
              blogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-gray-900">{blog.title}</td>
                  <td className="p-4 text-gray-600">{blog.profiles?.full_name || 'User'}</td>
                  <td className="p-4">
                    <StatusBadge status={blog.status} />
                  </td>
                  <td className="p-4 text-xs text-gray-400">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {blog.status !== 'approved' && (
                      <form action={updateaBlogStatus.bind(null, blog.id, 'approved')} className="inline-block">
                        <button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                        >
                          Approve
                        </button>
                      </form>
                    )}

                    {blog.status !== 'rejected' && (
                      <form action={updateaBlogStatus.bind(null, blog.id, 'rejected')} className="inline-block">
                        <button
                          type="submit"
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                        >
                          Reject
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-sm text-gray-500">
                  No blog submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  }

  return (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border capitalize ${styles[status]}`}>
      {status}
    </span>
  )
}