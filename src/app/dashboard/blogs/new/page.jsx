// src/app/dashboard/blogs/new/page.jsx
import Link from 'next/link'
import { createBlog } from '../actions'

export default async function AddBlogPage({ searchParams }) {
  const { error } = await searchParams

  return (
    <div className="max-w-3xl mx-auto my-8 bg-white p-8 rounded-xl border border-gray-200 shadow-xs">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Blog Post</h1>
          <p className="text-xs text-gray-500 mt-1">Submit your article for review or save a draft.</p>
        </div>
        <Link
          href="/dashboard"
          className="text-xs text-gray-600 border px-3 py-1.5 rounded-lg hover:bg-gray-50"
        >
          ← Cancel
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
          ⚠️ {error}
        </div>
      )}

      <form action={createBlog} encType="multipart/form-data" className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blog Title *</label>
          <input
            name="title"
            type="text"
            required
            placeholder="e.g. Getting Started with Next.js App Router"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image (From PC)</label>
          <input
            name="image"
            type="file"
            accept="image/*"
            className="w-full border border-gray-300 rounded-lg p-2 text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blog Content *</label>
          <textarea
            name="content"
            rows="8"
            required
            placeholder="Write your blog post content here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        {/* SEO Details Section */}
        <div className="border-t pt-4">
          <h2 className="text-sm font-bold text-gray-800 mb-3">SEO Details (Optional)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">SEO Title</label>
              <input
                name="seo_title"
                type="text"
                placeholder="Meta title for search engines"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">SEO Description</label>
              <textarea
                name="seo_description"
                rows="2"
                placeholder="Brief meta description summarizing your article"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">SEO Keywords</label>
              <input
                name="seo_keywords"
                type="text"
                placeholder="e.g. nextjs, react, web development"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            name="actionType"
            value="draft"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors"
          >
            💾 Save as Draft
          </button>

          <button
            type="submit"
            name="actionType"
            value="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors shadow-xs"
          >
            🚀 Submit for Review
          </button>
        </div>
      </form>
    </div>
  )
}