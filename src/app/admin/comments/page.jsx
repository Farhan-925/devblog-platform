// src/app/admin/comments/page.jsx
import { createClient } from '@/lib/supabase/server'
import { updateCommentStatus } from '@/app/admin/actions' // Correct import path

export default async function AdminCommentsPage() {
  const supabase = await createClient()

  const { data: comments, error } = await supabase
    .from('comments')
    .select('*, profiles(full_name), blogs(title, slug)')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-6 text-red-500 text-sm">Failed to load comments: {error.message}</div>
  }

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comment Moderation</h1>
          <p className="text-sm text-gray-500 mt-1">Approve or reject submitted user comments.</p>
        </div>
        <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
          Total Comments: {comments?.length || 0}
        </span>
      </div>

      <div className="space-y-4">
        {comments && comments.length > 0 ? (
          comments.map((comment) => {
            // Arguments match updateCommentStatus(commentId, newStatus, blogSlug)
            const approveAction = updateCommentStatus.bind(null, comment.id, 'approved', comment.blogs?.slug)
            const rejectAction = updateCommentStatus.bind(null, comment.id, 'rejected', comment.blogs?.slug)

            return (
              <div key={comment.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-xs text-gray-900">
                      {comment.profiles?.full_name || 'User'}
                    </span>
                    <span className="text-gray-400 text-xs mx-2">•</span>
                    <span className="text-xs text-gray-500">
                      On article: <strong className="text-gray-700">{comment.blogs?.title || 'Post'}</strong>
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize border ${
                    comment.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                    comment.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                    'bg-yellow-100 text-yellow-800 border-yellow-200'
                  }`}>
                    {comment.status}
                  </span>
                </div>

                <p className="text-xs text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  "{comment.content}"
                </p>

                <div className="flex justify-end space-x-2 pt-1">
                  {comment.status !== 'approved' && (
                    <form action={approveAction}>
                      <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      >
                        Approve
                      </button>
                    </form>
                  )}

                  {comment.status !== 'rejected' && (
                    <form action={rejectAction}>
                      <button
                        type="submit"
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      >
                        Reject
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-xs text-gray-500">
            No comments submitted yet.
          </div>
        )}
      </div>
    </div>
  )
}