// src/app/components/UserDropdown.jsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { logout } from '@/app/(auth)/actions'

export default function UserDropdown({ user, profile }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const displayName = profile?.full_name || user?.email || 'User'
  const initial = displayName.charAt(0).toUpperCase()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
          {initial}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">
          {displayName}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs text-gray-400">Signed in as</p>
            <p className="text-xs font-bold text-gray-800 truncate">{user.email}</p>
          </div>

          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Dashboard
          </Link>

          {profile?.role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-xs text-purple-600 font-semibold hover:bg-purple-50 transition-colors"
            >
              Admin Panel
            </Link>
          )}

          <div className="border-t border-gray-100 mt-1 pt-1">
            <form action={logout}>
              <button
                type="submit"
                className="w-full text-left px-4 py-2 text-xs text-red-600 font-medium hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}