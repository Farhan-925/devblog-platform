// src/app/admin/page.jsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 0 // Force fresh data load

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // 1. Fetch counts for users, blogs, and comments
  const [{ count: totalUsers }, { data: blogs }, { data: comments }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('blogs').select('status'),
    supabase.from('comments').select('status'),
  ])

  // 2. Aggregate Blog Status Statistics
  const totalBlogs = blogs?.length || 0
  const pendingBlogs = blogs?.filter((b) => b.status === 'pending').length || 0
  const approvedBlogs = blogs?.filter((b) => b.status === 'approved').length || 0
  const rejectedBlogs = blogs?.filter((b) => b.status === 'rejected').length || 0

  // 3. Aggregate Comment Status Statistics
  const totalComments = comments?.length || 0
  const pendingComments = comments?.filter((c) => c.status === 'pending').length || 0
  const approvedComments = comments?.filter((c) => c.status === 'approved').length || 0
  const rejectedComments = comments?.filter((c) => c.status === 'rejected').length || 0

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Overview Heading */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Platform Overview & Statistics</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Monitor active metrics across registered users, content submissions, and moderation queues.
        </p>
      </div>

      {/* Responsive Stat Tile Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Users Stat */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs flex justify-between items-center">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Total Users</p>
            <p className="text-xl sm:text-3xl font-black text-gray-900 mt-1">{(totalUsers || 0).toLocaleString()}</p>
          </div>
          <div className="p-2 sm:p-3 bg-blue-50 text-blue-600 rounded-xl hidden sm:block">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>

        {/* Total Blogs Stat */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs flex justify-between items-center">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Total Blogs</p>
            <p className="text-xl sm:text-3xl font-black text-gray-900 mt-1">{totalBlogs.toLocaleString()}</p>
          </div>
          <div className="p-2 sm:p-3 bg-emerald-50 text-emerald-600 rounded-xl hidden sm:block">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
        </div>

        {/* Pending Blogs Stat */}
        <div className="bg-white border border-yellow-200 bg-yellow-50/30 rounded-xl p-4 sm:p-5 shadow-xs flex justify-between items-center">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-yellow-800 uppercase tracking-wider">Pending Blogs</p>
            <p className="text-xl sm:text-3xl font-black text-yellow-700 mt-1">{pendingBlogs.toLocaleString()}</p>
          </div>
          <div className="p-2 sm:p-3 bg-yellow-100 text-yellow-700 rounded-xl hidden sm:block">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Pending Comments Stat */}
        <div className="bg-white border border-purple-200 bg-purple-50/30 rounded-xl p-4 sm:p-5 shadow-xs flex justify-between items-center">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-purple-800 uppercase tracking-wider">Pending Comments</p>
            <p className="text-xl sm:text-3xl font-black text-purple-700 mt-1">{pendingComments.toLocaleString()}</p>
          </div>
          <div className="p-2 sm:p-3 bg-purple-100 text-purple-700 rounded-xl hidden sm:block">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        </div>

      </div>

      {/* Moderation Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Manage Blogs Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Blog Moderation</h2>
              {pendingBlogs > 0 ? (
                <span className="bg-yellow-100 text-yellow-800 text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full border border-yellow-200">
                  {pendingBlogs} Pending
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-600 text-[10px] sm:text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Up to date
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Approve, reject, or delete user blog submissions.
            </p>
            
            {/* Breakdown Pills */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="bg-yellow-50 border border-yellow-100 p-2 rounded-lg">
                <span className="block font-bold text-yellow-700">{pendingBlogs}</span>
                <span className="text-[10px] text-gray-500 font-medium">Pending</span>
              </div>
              <div className="bg-green-50 border border-green-100 p-2 rounded-lg">
                <span className="block font-bold text-green-700">{approvedBlogs}</span>
                <span className="text-[10px] text-gray-500 font-medium">Approved</span>
              </div>
              <div className="bg-red-50 border border-red-100 p-2 rounded-lg">
                <span className="block font-bold text-red-700">{rejectedBlogs}</span>
                <span className="text-[10px] text-gray-500 font-medium">Rejected</span>
              </div>
            </div>
          </div>

          <Link
            href="/admin/blogs"
            className="inline-block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2.5 rounded-lg transition-colors shadow-xs"
          >
            Manage Blogs →
          </Link>
        </div>

        {/* Manage Comments Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Comment Moderation</h2>
              {pendingComments > 0 ? (
                <span className="bg-yellow-100 text-yellow-800 text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full border border-yellow-200">
                  {pendingComments} Pending
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-600 text-[10px] sm:text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Up to date
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Review discussion comments across public articles.
            </p>

            {/* Breakdown Pills */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="bg-yellow-50 border border-yellow-100 p-2 rounded-lg">
                <span className="block font-bold text-yellow-700">{pendingComments}</span>
                <span className="text-[10px] text-gray-500 font-medium">Pending</span>
              </div>
              <div className="bg-green-50 border border-green-100 p-2 rounded-lg">
                <span className="block font-bold text-green-700">{approvedComments}</span>
                <span className="text-[10px] text-gray-500 font-medium">Approved</span>
              </div>
              <div className="bg-red-50 border border-red-100 p-2 rounded-lg">
                <span className="block font-bold text-red-700">{rejectedComments}</span>
                <span className="text-[10px] text-gray-500 font-medium">Rejected</span>
              </div>
            </div>
          </div>

          <Link
            href="/admin/comments"
            className="inline-block text-center bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs py-2.5 rounded-lg transition-colors shadow-xs"
          >
            Manage Comments →
          </Link>
        </div>

      </div>

    </div>
  )
}