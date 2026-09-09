// src/app/dashboard/blogs/[id]/edit/EditBlogForm.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateBlog } from '@/app/blogs/actions'

export default function EditBlogForm({ blog }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.target)
    formData.append('blogId', blog.id)

    const res = await updateBlog(formData)

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      router.push('/dashboard?message=Blog updated successfully and submitted for review!')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 rounded-xl space-y-4 shadow-sm">
      {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg">{error}</div>}

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
        <input
          name="title"
          defaultValue={blog.title}
          required
          className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Slug</label>
        <input
          name="slug"
          defaultValue={blog.slug}
          required
          className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Cover Image URL</label>
        <input
          name="imageUrl"
          defaultValue={blog.image_url || ''}
          className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Content</label>
        <textarea
          name="content"
          rows="8"
          defaultValue={blog.content}
          required
          className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}