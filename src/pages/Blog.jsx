import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LandingNavbar, LandingFooter } from "@/components/landing";
import { sortedPosts, formatPostDate } from "@/lib/blogPosts";

// The blog keeps its own fixed palette (navy band over a pale blue-grey page) in both
// light and dark mode, so its text colours are set here rather than from the theme tokens.
export const BLOG_NAVY = "#0F2350";
export const BLOG_BG = "#F6F9FC";

export function TagPill({ tag, active = false }) {
  return (
    <Link
      to={`/blog?tag=${encodeURIComponent(tag)}`}
      className={`inline-flex text-xs font-medium rounded-full px-2.5 py-1 transition-colors ${
        active ? "bg-[#0F2350] text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
      }`}
    >
      #{tag}
    </Link>
  );
}

export default function BlogPage() {
  const [params] = useSearchParams();
  const tag = params.get("tag");
  const all = sortedPosts();
  const posts = tag ? all.filter((p) => (p.tags || []).includes(tag)) : all;

  return (
    <div className="min-h-screen" style={{ backgroundColor: BLOG_BG }}>
      <LandingNavbar />

      <section style={{ backgroundColor: BLOG_NAVY }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-white">Blog</h1>
          <p className="text-blue-100/80 mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
            Guides on project reports, CMA data and bank loans.
          </p>
          {tag && (
            <p className="mt-6 text-sm text-blue-100/80">
              Showing posts tagged <span className="font-semibold text-white">#{tag}</span> ·{" "}
              <Link to="/blog" className="underline hover:text-white">Show all</Link>
            </p>
          )}
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {posts.length === 0 ? (
          <p className="text-center text-slate-500 py-16">
            {tag ? "No posts with this tag yet." : "Posts are coming soon."}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <article key={p.slug} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                {p.cover && (
                  <Link to={`/blog/${p.slug}`}>
                    <img src={p.cover} alt="" className="w-full h-44 object-cover" />
                  </Link>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-slate-500">{formatPostDate(p.date)}</p>
                  <h2 className="mt-1.5 text-lg font-semibold text-slate-900 leading-snug">
                    <Link to={`/blog/${p.slug}`} className="hover:text-blue-700">{p.title}</Link>
                  </h2>
                  {p.excerpt && <p className="mt-2 text-sm text-slate-600 leading-relaxed">{p.excerpt}</p>}
                  {p.tags?.length > 0 && (
                    <div className="mt-auto pt-4 flex flex-wrap gap-1.5">
                      {p.tags.map((t) => <TagPill key={t} tag={t} active={t === tag} />)}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
