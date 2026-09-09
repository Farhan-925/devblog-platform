// src/app/admin/layout.jsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }) {
  const supabase = await createClient()

  // Verify Admin Access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      
      {/* Left Navigation Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-b md:border-b-0 md:border-r border-slate-800">
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <Link href="/admin" className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <span className="p-1.5 bg-blue-600 rounded-lg text-xs">⚡</span> Admin Core
          </Link>
          <span className="md:hidden text-[11px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md font-mono">
            Admin
          </span>
        </div>

        {/* Scrollable Navigation Links */}
        <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible p-2 sm:p-4 md:space-y-1 text-xs sm:text-sm font-medium gap-1 md:gap-0 no-scrollbar">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
          >
            📊 <span className="inline">Overview Stats</span>
          </Link>
          <Link
            href="/admin/blogs"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
          >
            📝 <span className="inline">Manage Blogs</span>
          </Link>
          <Link
            href="/admin/comments"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
          >
            💬 <span className="inline">Manage Comments</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
          >
            👥 <span className="inline">Manage Users</span>
          </Link>
        </nav>

        {/* Desktop Profile Footer */}
        <div className="hidden md:block p-4 border-t border-slate-800 text-xs text-slate-500 mt-auto">
          Logged in as <span className="text-slate-300 font-semibold">{profile?.full_name || 'Admin'}</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-14 sm:h-16 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <h2 className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider truncate">
            Control Center
          </h2>
          <Link href="/dashboard" className="text-xs text-blue-600 hover:underline font-semibold shrink-0">
            ← Exit to Dashboard
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50">
          {children}
        </main>
      </div>

    </div>
  )
}