// src/app/components/NotificationBell.jsx
'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  
  // Ref for the notification audio element
  const audioRef = useRef(null)
  
  const supabase = useMemo(() => createClient(), [])

  // Helper to play notification sound safely
  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((err) => {
        // Autoplay policy might block sound if user hasn't interacted with page yet
        console.warn('Audio play deferred:', err.message)
      })
    }
  }

  useEffect(() => {
    if (!userId) return

    async function fetchNotifications() {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching notifications:', error.message)
        return
      }

      setNotifications(data || [])
    }

    fetchNotifications()

    // Realtime WebSocket Channel
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // 1. Play notification sound on incoming alert
          playSound()

          // 2. Prepend new notification to top
          setNotifications((prev) => [payload.new, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  async function markAsRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
  }

  if (!userId) return null

  return (
    <div className="relative">
      {/* Hidden Audio Element (using a standard UI chime sound) */}
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
        preload="auto"
      />

      {/* Interactive Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none transition-colors rounded-full hover:bg-gray-100"
        aria-label="Notifications"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
            <span className="text-xs font-bold text-gray-800">Notifications</span>
            <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-semibold">
              {unreadCount} unread
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3 text-xs space-y-1 transition-colors cursor-pointer ${
                    !n.is_read ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">{n.title}</p>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 leading-snug">{n.message}</p>

                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={() => setIsOpen(false)}
                      className="inline-block text-blue-600 font-semibold hover:underline text-[11px] pt-1"
                    >
                      View details &rarr;
                    </Link>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-8">
                No notifications yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}