import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export const revalidate = 0

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // 1. Fetch all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // 2. Fetch blog and comment counts per user
  const [{ data: blogs }, { data: comments }] = await Promise.all([
    supabase.from('blogs').select('author_id'),
    supabase.from('comments').select('author_id'),
  ])

  // Count helper
  const getUserStats = (userId) => {
    const userBlogs = blogs?.filter((b) => b.author_id === userId).length || 0
    const userComments = comments?.filter((c) => c.author_id === userId).length || 0
    return { userBlogs, userComments }
  }

  // Server Action: Toggle Role
  async function toggleUserRole(formData) {
    'use server'
    const targetUserId = formData.get('userId')
    const currentRole = formData.get('currentRole')
    const newRole = currentRole === 'admin' ? 'user' : 'admin'

    const db = await createClient()
    await db.from('profiles').update({ role: newRole }).eq('id', targetUserId)
    revalidatePath('/admin/users')
  }

  if (error) {
    return <div className="p-4 text-xs text-red-600 bg-red-50 rounded-lg">Error loading profiles: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-xs text-gray-500 mt-1">View registered accounts, activity summaries, and manage permissions.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Blogs Authored</th>
                <th className="py-3 px-4">Comments Posted</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {profiles && profiles.map((profile) => {
                const { userBlogs, userComments } = getUserStats(profile.id)
                const isAdmin = profile.role === 'admin'

                return (
                  <tr key={profile.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      {profile.full_name || 'Anonymous User'}
                      <span className="block text-[10px] text-gray-400 font-normal">{profile.id}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        isAdmin ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {profile.role || 'user'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-700">{userBlogs}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-700">{userComments}</td>
                    <td className="py-3.5 px-4 text-right">
                      <form action={toggleUserRole}>
                        <input type="hidden" name="userId" value={profile.id} />
                        <input type="hidden" name="currentRole" value={profile.role || 'user'} />
                        <button
                          type="submit"
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          {isAdmin ? 'Demote to User' : 'Make Admin'}
                        </button>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}