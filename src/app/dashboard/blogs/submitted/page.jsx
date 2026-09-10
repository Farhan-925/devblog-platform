// src/app/dashboard/blogs/submitted/page.jsx
import Link from 'next/link'

export default async function BlogSubmittedPage({ searchParams }) {
  const { title } = await searchParams

  return (
    <div className="max-w-2xl mx-auto my-12 bg-white p-8 sm:p-10 rounded-2xl border border-gray-200 shadow-xs text-center space-y-6">
      <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-2xl mx-auto">
        🎉
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Congratulations!</h1>
        <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
          Your article <span className="font-bold text-gray-900">"{title || 'New Post'}"</span> has been submitted successfully and is awaiting review.
        </p>
      </div>

      <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-800 text-left space-y-1">
        <p className="font-bold">What happens next?</p>
        <p className="text-amber-700">An administrator will review your submission shortly. Once approved, your article will be published live for all readers.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
        <Link
          href="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-colors shadow-xs"
        >
          Go to Dashboard →
        </Link>
        <Link
          href="/dashboard/blogs/new"
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs px-6 py-3 rounded-xl transition-colors"
        >
          + Write Another Article
        </Link>
      </div>
    </div>
  )
}