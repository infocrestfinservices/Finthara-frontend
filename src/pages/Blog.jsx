import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LandingNavbar, LandingFooter } from "@/components/landing";
import { formatPostDate, readMinutes } from "@/lib/blogPosts";
import { listPosts, blogImageUrl } from "@/api/blogService";

// The blog keeps its own fixed palette (navy band over a pale blue-grey page) in both
// light and dark mode, so its colours are set here rather than from the theme tokens.
export const BLOG_NAVY = "#0F2350";
export const BLOG_BG = "#F6F9FC";
export const BLOG_ACCENT = "#1E88C8";      // highlighted title words, category labels
export const BLOG_INK = "#1B2A55";         // card and article titles
export const SERIF = { fontFamily: "'Fraunces', Georgia, serif" };

/** The post title with its `highlight` phrase in the accent colour. */
export function PostTitle({ post }) {
  const { title, highlight } = post;
  const at = highlight ? title.indexOf(highlight) : -1;
  if (at < 0) return title;
  return (
    <>
      {title.slice(0, at)}
      <span style={{ color: BLOG_ACCENT }}>{highlight}</span>
      {title.slice(at + highlight.length)}
    </>
  );
}

/** "LOAN BASICS · OCT 30, 2026" */
export function PostEyebrow({ post, small = false }) {
  return (
    <p className={`${small ? "text-[10px] tracking-[0.12em]" : "text-[11px] tracking-[0.14em]"} font-semibold uppercase`}>
      {post.category && <span style={{ color: BLOG_ACCENT }}>{post.category}</span>}
      {post.category && <span className="text-slate-300 mx-2">·</span>}
      <span className="text-slate-400">{formatPostDate(post.date)}</span>
    </p>
  );
}

export function TagPill({ tag }) {
  return (
    <Link
      to={`/blog?tag=${encodeURIComponent(tag)}`}
      className="inline-flex text-xs font-medium rounded-full px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
    >
      #{tag}
    </Link>
  );
}

const byline = (p) => `${p.author || "Finthara Team"} · ${readMinutes(p)} min read`;

function FeaturedCard({ post }) {
  return (
    <article className="grid md:grid-cols-[1.1fr_1fr] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* The covers carry their own text, so they are shown whole (never cropped) and
          centred on a matching pale panel when the text column is taller. */}
      <Link to={`/blog/${post.slug}`} className="flex items-center bg-[#F4F8FC]">
        {post.cover_image_id && <img src={blogImageUrl(post.cover_image_id)} alt="" className="w-full aspect-[1200/630] object-cover" />}
      </Link>
      <div className="p-6 sm:p-9 flex flex-col justify-center">
        <PostEyebrow post={post} />
        <h2 className="mt-3 text-[28px] sm:text-[34px] leading-[1.15] font-semibold" style={{ ...SERIF, color: BLOG_INK }}>
          <Link to={`/blog/${post.slug}`} className="hover:opacity-85"><PostTitle post={post} /></Link>
        </h2>
        {post.excerpt && <p className="mt-4 text-[15px] leading-relaxed text-slate-500">{post.excerpt}</p>}
        <p className="mt-6 text-xs text-slate-400">{byline(post)}</p>
      </div>
    </article>
  );
}

function PostCard({ post }) {
  return (
    <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">
      {post.cover_image_id && (
        <Link to={`/blog/${post.slug}`} className="block bg-slate-100">
          <img src={blogImageUrl(post.cover_image_id)} alt="" loading="lazy" className="w-full aspect-[1200/630] object-cover" />
        </Link>
      )}
      <div className="p-4 flex flex-col flex-1">
        <PostEyebrow post={post} small />
        <h3 className="mt-2 text-[17px] leading-snug font-semibold" style={{ ...SERIF, color: BLOG_INK }}>
          <Link to={`/blog/${post.slug}`} className="hover:opacity-85"><PostTitle post={post} /></Link>
        </h3>
        {post.excerpt && <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 line-clamp-3">{post.excerpt}</p>}
        <div className="mt-auto pt-4">
          <p className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">{byline(post)}</p>
        </div>
      </div>
    </article>
  );
}

export default function BlogPage() {
  const [params] = useSearchParams();
  const tag = params.get("tag");
  const category = params.get("category");
  const [all, setAll] = useState(null);       // null while loading
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    listPosts().then(setAll).catch(() => { setAll([]); setFailed(true); });
  }, []);
  const loaded = all || [];
  const categories = [...new Set(loaded.map((p) => p.category).filter(Boolean))];
  const posts = loaded.filter((p) =>
    (!category || p.category === category) && (!tag || (p.tags || []).includes(tag)));
  const filtered = Boolean(category || tag);
  const [featured, ...rest] = posts;

  const tabClass = (active) =>
    `pb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] whitespace-nowrap border-b-2 transition-colors ${
      active ? "text-[#0F2350] border-[#1E88C8]" : "text-slate-400 border-transparent hover:text-slate-600"
    }`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: BLOG_BG }}>
      <LandingNavbar />

      <section style={{ backgroundColor: BLOG_NAVY }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-400">The Finthara Blogs</p>
            <h1 className="mt-3 text-5xl sm:text-6xl font-semibold tracking-tight text-white leading-[1.05]" style={SERIF}>
              Finthara <span className="text-sky-400">Blogs</span>
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-blue-100/75">
              Practical guides on project reports, CMA data, bank ratios and loan schemes —
              written to help you get your business loan approved faster.
            </p>
          </div>
          <div className="flex items-end gap-3 shrink-0">
            <span className="text-6xl sm:text-7xl leading-none text-white" style={SERIF}>{all ? all.length : "–"}</span>
            <span className="pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-100/70">
              {all?.length === 1 ? "Article" : "Articles"}
            </span>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        {categories.length > 0 && (
          <nav className="pt-8 flex gap-7 overflow-x-auto border-b border-slate-200">
            <Link to="/blog" className={tabClass(!category && !tag)}>All</Link>
            {categories.map((c) => (
              <Link key={c} to={`/blog?category=${encodeURIComponent(c)}`} className={tabClass(c === category)}>{c}</Link>
            ))}
          </nav>
        )}

        {tag && (
          <p className="mt-6 text-sm text-slate-500">
            Showing posts tagged <span className="font-semibold text-slate-800">#{tag}</span> ·{" "}
            <Link to="/blog" className="underline hover:text-slate-800">Show all</Link>
          </p>
        )}

        {all === null ? (
          <p className="text-center text-slate-400 py-20">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-slate-500 py-20">
            {failed ? "Could not load the blogs — please refresh the page."
              : filtered ? "No posts here yet." : "Posts are coming soon."}
          </p>
        ) : (
          <>
            <div className="mt-8"><FeaturedCard post={featured} /></div>
            {rest.length > 0 && (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {rest.map((p) => <PostCard key={p.slug} post={p} />)}
              </div>
            )}
          </>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
