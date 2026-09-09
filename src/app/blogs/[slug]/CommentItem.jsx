// src/app/blogs/[slug]/CommentItem.jsx
'use client'

import { useState } from 'react'
import { addComment, updateComment, deleteComment, reportComment } from '../CommentActions'

// ✅ Fixed: Helper function declared outside the component for consistent SSR/Client rendering
const formatDate = (dateString) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  return d.toISOString().split('T')[0] // Returns "YYYY-MM-DD" consistently
}

export default function CommentItem({ comment, currentUser, blogId, blogSlug, allComments, depth = 0 }) {
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [editContent, setEditContent] = useState(comment.content)
  const [isReported, setIsReported] = useState(comment.is_reported)

  const isOwner = currentUser?.id === comment.author_id
  const authorName = comment.profiles?.full_name || 'User'
  const authorInitial = authorName.charAt(0).toUpperCase()

  // Find direct replies to this comment
  const childReplies = allComments.filter((c) => c.parent_id === comment.id)

  async function handleReplySubmit(e) {
    e.preventDefault()
    if (!replyContent.trim()) return
    await addComment({ blogId, content: replyContent, parentId: comment.id, blogSlug })
    setReplyContent('')
    setIsReplying(false)
  }

  async function handleEditSubmit(e) {
    e.preventDefault()
    if (!editContent.trim()) return
    await updateComment({ commentId: comment.id, content: editContent, blogSlug })
    setIsEditing(false)
  }

  async function handleDelete() {
    if (confirm('Delete this comment?')) {
      await deleteComment({ commentId: comment.id, blogSlug })
    }
  }

  async function handleReport() {
    await reportComment({ commentId: comment.id, blogSlug })
    setIsReported(true)
  }

  return (
    <div className="flex gap-2.5 pt-3 group">
      
      {/* 1. Author Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs">
        {authorInitial}
      </div>

      {/* 2. Main Body & Controls */}
      <div className="flex-1 space-y-1">
        
        {/* Facebook Comment Bubble */}
        <div className="inline-block bg-gray-100/90 rounded-2xl px-3.5 py-2 max-w-[90%] space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-xs text-gray-900 hover:underline cursor-pointer">
              {authorName}
            </span>
          </div>

          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-2 pt-1">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white text-xs px-3 py-1 rounded-md font-medium">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-200 text-xs px-3 py-1 rounded-md font-medium text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className={`text-xs ${comment.is_deleted ? 'italic text-gray-400' : 'text-gray-800'} leading-normal`}>
              {comment.content}
            </p>
          )}
        </div>

        {/* Action Row below Bubble */}
        {!comment.is_deleted && (
          <div className="flex items-center gap-3 px-2 text-[11px] font-semibold text-gray-500">
            {/* ✅ Fixed: Called correctly inside JSX */}
            <span>{formatDate(comment.created_at)}</span>

            {currentUser && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="hover:underline hover:text-blue-600 transition-colors"
              >
                Reply
              </button>
            )}

            {isOwner && !isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="hover:underline hover:text-yellow-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="hover:underline hover:text-red-600 transition-colors"
                >
                  Delete
                </button>
              </>
            )}

            {!isOwner && currentUser && (
              <button
                onClick={handleReport}
                disabled={isReported}
                className="hover:underline hover:text-red-500 disabled:text-gray-300"
              >
                {isReported ? 'Reported' : 'Report'}
              </button>
            )}

            {comment.is_edited && <span className="text-gray-400 font-normal text-[10px]">(edited)</span>}
          </div>
        )}

        {/* Facebook Inline Reply Box */}
        {isReplying && (
          <form onSubmit={handleReplySubmit} className="mt-2 flex gap-2 items-center">
            <input
              type="text"
              placeholder={`Reply to ${authorName}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full bg-gray-100 border border-gray-200 rounded-full px-3.5 py-1.5 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors shrink-0"
            >
              Reply
            </button>
          </form>
        )}

        {/* Recursive Sub-tree (Indented Branch Lines) */}
        {childReplies.length > 0 && (
          <div className="pl-3 sm:pl-5 border-l-2 border-gray-200/80 ml-2 mt-1 space-y-1">
            {childReplies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUser={currentUser}
                blogId={blogId}
                blogSlug={blogSlug}
                allComments={allComments}
                depth={depth + 1}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}