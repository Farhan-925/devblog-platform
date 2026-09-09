// src/app/page.jsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 0

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch published blogs
  const { data: blogs } = await supabase
    .from('blogs')
    .select('*, profiles(full_name)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(7)

  const featuredBlog = blogs && blogs.length > 0 ? blogs[0] : null
  const latestArticles = blogs && blogs.length > 1 ? blogs.slice(1) : []

  return (
    <div className="bg-gray-50/60 min-h-screen text-gray-900 font-sans space-y-12 flex flex-col justify-between">

      <div className="space-y-12">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Intro & Search */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full w-fit">
                Hi, Developer 👋
              </span>

              <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                Insights, Tutorials & Ideas for Modern <span className="text-blue-600">Developers</span>
              </h1>

              <p className="text-sm text-gray-500 leading-relaxed max-w-lg">
                A blog where I share <strong className="text-gray-700">practical</strong> web development tips, tech tutorials, and thoughts on building better products.
              </p>

              {/* Search Input Bar */}
              <form action="/blogs" className="flex items-center bg-white border border-gray-200 rounded-2xl p-1.5 shadow-xs max-w-md">
                <div className="pl-3 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  placeholder="Search articles, topics, or keywords..."
                  className="w-full text-xs bg-transparent px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors shrink-0"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Right Column: Featured Blog Hero Card */}
            <div className="lg:col-span-7">
              {featuredBlog ? (
                <div className="relative group rounded-3xl overflow-hidden h-full min-h-[380px] flex flex-col justify-end p-6 sm:p-8 text-white shadow-md">
                  <img
                    src={featuredBlog.image_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80'}
                    alt={featuredBlog.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                  <div className="relative z-10 space-y-3">
                    <span className="bg-blue-500/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider w-fit">
                      Featured
                    </span>
                    <h2 className="text-xl sm:text-3xl font-bold leading-snug group-hover:text-blue-300 transition-colors">
                      <Link href={`/blogs/${featuredBlog.slug}`}>{featuredBlog.title}</Link>
                    </h2>
                    <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                      <span>📅 {new Date(featuredBlog.created_at).toLocaleDateString()}</span>
                      <span>⏱️ 5 min read</span>
                    </div>
                  </div>

                  <Link
                    href={`/blogs/${featuredBlog.slug}`}
                    className="absolute bottom-6 right-6 z-10 w-10 h-10 bg-white/20 hover:bg-blue-600 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
                  >
                    →
                  </Link>
                </div>
              ) : (
                <div className="h-full min-h-[380px] bg-white border border-gray-200 rounded-3xl flex items-center justify-center text-gray-400 text-xs font-medium">
                  No featured articles yet.
                </div>
              )}
            </div>

          </div>
        </section>

        {/* LATEST ARTICLES GRID */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Latest Articles</h2>
              <p className="text-xs text-gray-500 mt-0.5">Fresh thoughts, tutorials, and insights.</p>
            </div>
            <Link href="/blogs" className="text-xs font-bold text-blue-600 hover:underline">
              View All Articles →
            </Link>
          </div>

          {latestArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestArticles.map((blog) => (
                <article
                  key={blog.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={blog.image_url || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80'}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="font-bold text-gray-900 text-base line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                        <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {blog.seo_description || blog.content}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                    <span>📅 {new Date(blog.created_at).toLocaleDateString()}</span>
                    <span>By {blog.profiles?.full_name || 'Author'}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-xs text-gray-500 font-medium">
              More articles coming soon.
            </div>
          )}
        </section>
      </div>

    </div>
  )
}