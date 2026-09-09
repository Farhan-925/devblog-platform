// src/app/blogs/[slug]/ViewCounter.jsx
'use client'

import { useEffect, useState } from 'react'
import { recordAndFetchViews } from '../viewActions'

export default function ViewCounter({ blogId }) {
  const [stats, setStats] = useState({
    total_views: 0,
    unique_views: 0,
    views_today: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initViews() {
      const metrics = await recordAndFetchViews(blogId)
      setStats(metrics)
      setLoading(false)
    }
    initViews()
  }, [blogId])

  if (loading) {
    return (
      <div className="flex gap-2 animate-pulse py-2">
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-2 text-xs font-medium">
      
      {/* Total Views */}
      <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
        <span className="font-bold">{stats.total_views}</span> Total Views
      </div>

      {/* Unique Visitors */}
      <div className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100">
        <span className="font-bold">{stats.unique_views}</span> Unique Views
      </div>

      {/* Views Today */}
      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
        <span className="font-bold">{stats.views_today}</span> Views Today
      </div>

    </div>
  )
}