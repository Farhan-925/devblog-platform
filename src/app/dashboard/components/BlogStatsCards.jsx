// src/app/dashboard/components/BlogStatsCards.jsx
export default function BlogStatsCards({ stats }) {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Blogs" value={stats.totalBlogs} border="border-gray-200" text="text-gray-900" />
        <StatCard title="Published" value={stats.published} border="border-green-200" text="text-green-700" bg="bg-green-50/50" />
        <StatCard title="Pending" value={stats.pending} border="border-yellow-200" text="text-yellow-700" bg="bg-yellow-50/50" />
        <StatCard title="Rejected" value={stats.rejected} border="border-red-200" text="text-red-700" bg="bg-red-50/50" />
      </div>

      {/* Engagement Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-2xs">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Views</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">
            {stats.totalViews.toLocaleString()}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-2xs">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Comments</p>
          <p className="text-3xl font-extrabold text-purple-600 mt-2">
            {stats.totalComments.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, border, text, bg = 'bg-white' }) {
  return (
    <div className={`${bg} border ${border} p-5 rounded-2xl shadow-2xs space-y-1`}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
      <p className={`text-2xl font-black ${text}`}>{value}</p>
    </div>
  )
}