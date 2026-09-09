// src/components/Footer.jsx
'use client'

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-12 pb-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <span className="text-white font-bold text-lg tracking-wide flex items-center gap-2">
              <span className="p-1 bg-blue-600 rounded-lg text-xs">⚡</span> DevBlog
            </span>
            <p className="text-xs leading-relaxed text-slate-400">
              A modern blog for developers, by a developer. Build. Learn. Grow.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/blogs" className="hover:text-white transition-colors">Articles</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/blogs?category=web-dev" className="hover:text-white transition-colors">Web Development</Link></li>
              <li><Link href="/blogs?category=frontend" className="hover:text-white transition-colors">Frontend</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Subscribe</h4>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="bg-slate-800 border border-slate-700 text-xs text-white p-2.5 rounded-lg w-full focus:outline-none focus:border-blue-500"
              />
              <button type="submit" className="bg-blue-600 text-white px-3 py-2.5 rounded-lg text-xs font-bold hover:bg-blue-500 transition-colors">
                →
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© 2026 DevBlog Platform. All rights reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}