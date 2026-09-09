// src/lib/notifications.js
import { createClient } from '@/lib/supabase/server'

export async function createNotification({ userId, type, title, message, link = null }) {
  const supabase = await createClient()

  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
    link
  })

  if (error) {
    console.error('Failed to create notification:', error.message)
  }
}