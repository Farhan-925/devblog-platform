// src/app/blogs/[slug]/CommentSection.jsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import CommentItem from './CommentItem'
import { addComment } from '../CommentActions'

export default function CommentSection({ comments: initialComments = [], blogId, blogSlug, user }) {
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const supabase = createClient()

  useEffect(() => {
    setComments(initialComments)
  }, [initialComments])

  // WebSocket Subscription with Profile Hydration
  useEffect(() => {
    const channel = supabase
      .channel(`realtime:comments:${blogId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `blog_id=eq.${blogId}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRecord = payload.new

            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', newRecord.author_id)
              .single()

            const hydratedComment = {
              ...newRecord,
              profiles: profile || { full_name: 'User' }
            }

            setComments((prev) => [hydratedComment, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setComments((prev) =>
              prev.map((c) =>
                c.id === payload.new.id
                  ? { ...c, ...payload.new, profiles: c.profiles }
                  : c
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setComments((prev) => prev.filter((c) => c.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [blogId, supabase])

  const rootComments = comments.filter((c) => !c.parent_id)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!newComment.trim()) return
    await addComment({ blogId, content: newComment, blogSlug })
    setNewComment('')
  }

  return (
    <section className="mt-10 pt-6 border-t border-gray-200 max-w-3xl mx-auto space-y-6">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span>Comments</span>
          <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            {comments.length}
          </span>
        </h3>

        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          Live Realtime
        </span>
      </div>

      {/* Input Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2.5 items-start">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
            {user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a public comment..."
              className="w-full bg-gray-100 border border-gray-200 rounded-full px-4 py-2 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors shrink-0"
            >
              Post
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-600 mb-2">Sign in to leave a comment or reply to others.</p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-1.5 rounded-full transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Comment List */}
      <div className="space-y-3 pt-2">
        {comments.length > 0 ? (
          rootComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={user}
              blogId={blogId}
              blogSlug={blogSlug}
              allComments={comments}
            />
          ))
        ) : (
          <p className="text-xs text-gray-400 text-center py-8">
            No comments yet. Be the first to start the conversation!
          </p>
        )}
      </div>

    </section>
  )
}