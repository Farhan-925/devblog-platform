// src/app/blogs/BlogList.jsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useDebounce } from '@/hooks/useDebounce'

export default function BlogList({ initialBlogs }) {
  const [searchTerm, setSearchTerm] = useState('')
  
  // Debounce the search input by 400ms to avoid unnecessary state updates
  const debouncedSearch = useDebounce(searchTerm, 400)

  // Filter blogs based on title or content matching the debounced search term
  const filteredBlogs = initialBlogs.filter((blog) => {
    const titleMatch = blog.title?.toLowerCase().includes(debouncedSearch.toLowerCase())
    const contentMatch = blog.content?.toLowerCase().includes(debouncedSearch.toLowerCase())
    return titleMatch || contentMatch
  })

  return (
    <div className="space-y-8">
      {/* Search Input Bar */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search articles by title or keyword..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-xs text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Grid View */}
      {filteredBlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <article
              key={blog.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {blog.image_url ? (
                  <img
                    src={blog.image_url}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-medium">
                    No Featured Image
                  </div>
                )}

                <div className="p-5 space-y-2">
                  <div className="flex items-center text-xs text-gray-400 space-x-2">
                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{blog.views_count || 0} views</span>
                  </div>

                  <h2 className="text-lg font-bold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                    <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
                  </h2>

                  <p className="text-gray-600 text-xs line-clamp-3">
                    {blog.seo_description || blog.content}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 mt-auto">
                <span>By {blog.profiles?.full_name || 'Author'}</span>
                <Link
                  href={`/blogs/${blog.slug}`}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Read More →
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-sm text-gray-500 font-medium">
            {debouncedSearch
              ? `No published blogs found matching "${debouncedSearch}".`
              : 'No published blogs available yet.'}
          </p>
        </div>
      )}
    </div>
  )
}