// src/app/components/Navbar.jsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import UserDropdown from './UserDropdown'
import NotificationBell from './NotificationBell'

export default async function Navbar() {
  const supabase = await createClient()

  // Fetch session & profile details
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Core Nav Links */}
        <div className="flex items-center space-x-10">
          
          {/* Logo with Gradient Accent */}
          <Link href="/" className="group flex items-center space-x-2 focus:outline-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              D
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
              DevBlog<span className="text-blue-600">.</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold text-gray-600">
            
            <Link 
              href="/blogs" 
              className="px-3.5 py-2 rounded-lg hover:text-blue-600 hover:bg-gray-50 transition-all"
            >
              All Blogs
            </Link>

            {user && (
              <Link 
                href="/dashboard" 
                className="px-3.5 py-2 rounded-lg hover:text-blue-600 hover:bg-gray-50 transition-all flex items-center gap-1.5"
              >
                <span>Dashboard</span>
              </Link>
            )}

            {profile?.role === 'admin' && (
              <Link 
                href="/admin" 
                className="px-3.5 py-2 rounded-lg text-purple-700 bg-purple-50/80 border border-purple-100 hover:bg-purple-100/70 transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
                <span>Admin Panel</span>
              </Link>
            )}

          </nav>
        </div>

        {/* Right Authentication & Notifications Section */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center gap-2">
              <NotificationBell userId={user.id} />
              <UserDropdown user={user} profile={profile} />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-semibold rounded-xl group bg-gradient-to-br from-blue-600 to-indigo-600 hover:text-white text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                <span className="relative px-4 py-2 transition-all ease-in duration-75 rounded-[10px] bg-transparent flex items-center gap-1">
                  Get Started →
                </span>
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}