// src/app/dashboard/layout.jsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }) {
  const supabase = await createClient()

  // 1. Verify Session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Fetch User Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-b md:border-b-0 md:border-r border-slate-800">
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <Link href="/" className="group flex items-center space-x-2 focus:outline-none">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                        D
                      </div>
                      <span className="text-md font-extrabold tracking-tight text-gray-100 group-hover:text-blue-600 transition-colors">
                        DevBlog<span className="text-gray-100 ml-1">.</span>
                      </span>
          </Link>
          {profile?.role === 'admin' && (
            <Link href="/admin" className="text-[10px] bg-purple-600/30 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-full font-bold">
              User Panel
            </Link>
          )}
        </div>

        {/* Scrollable Navigation Bar on Mobile */}
        <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible p-2 sm:p-4 md:space-y-1 text-xs sm:text-sm font-medium gap-1 md:gap-0 no-scrollbar">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
          >
            📋 <span>All Articles</span>
          </Link>
          <Link
            href="/dashboard?status=draft"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
          >
            📁 <span>Drafts</span>
          </Link>
          <Link
            href="/dashboard?status=pending"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
          >
            ⏳ <span>Pending Review</span>
          </Link>
          <Link
            href="/dashboard?status=approved"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
          >
            ✅ <span>Published</span>
          </Link>
          <Link
            href="/dashboard/blogs/new"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-blue-400 hover:bg-blue-600/20 transition-colors md:mt-4 font-bold whitespace-nowrap"
          >
            ➕ <span>Write Article</span>
          </Link>
        </nav>

        {/* Footer User Info */}
        <div className="hidden md:block p-4 border-t border-slate-800 text-xs text-slate-500 mt-auto">
          Signed in as <span className="text-slate-300 font-semibold">{profile?.full_name || user.email}</span>
        </div>
      </aside>

      {/* Main View */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50">
          {children}
        </main>
      </div>
    </div>
  )
}