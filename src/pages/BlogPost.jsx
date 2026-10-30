import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LandingNavbar, LandingFooter } from "@/components/landing";
import { findPost, formatPostDate } from "@/lib/blogPosts";
import { BLOG_NAVY, BLOG_BG, TagPill } from "@/pages/Blog";

// **bold** inside a paragraph — the only inline formatting the content file supports.
function richText(text) {
  return String(text || "").split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>
      : part
  );
}

const IMAGE_WIDTH = { full: "w-full", wide: "w-full sm:w-[85%] mx-auto", half: "w-full sm:w-1/2 mx-auto" };

function Block({ block }) {
  switch (block.type) {
    case "heading":
      return <h2 className="text-2xl font-heading font-bold text-slate-900 mt-10 mb-3">{block.text}</h2>;
    case "paragraph":
      return <p className="text-[17px] leading-8 text-slate-700 my-4">{richText(block.text)}</p>;
    case "list":
      return (
        <ul className="list-disc pl-6 my-4 space-y-2 text-[17px] leading-8 text-slate-700">
          {(block.items || []).map((item, i) => <li key={i}>{richText(item)}</li>)}
        </ul>
      );
    case "image":
      return (
        <figure className={`my-8 ${IMAGE_WIDTH[block.size] || IMAGE_WIDTH.full}`}>
          <img src={block.src} alt={block.alt || ""} className="w-full rounded-xl border border-slate-200" />
          {block.caption && (
            <figcaption className="mt-2 text-center text-sm text-slate-500">{block.caption}</figcaption>
          )}
        </figure>
      );
    case "cta":
      return (
        <div className="my-10 rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4 justify-between" style={{ backgroundColor: BLOG_NAVY }}>
          <p className="text-white text-lg font-medium leading-snug">{block.text}</p>
          <Link
            to={block.to || "/create"}
            className="shrink-0 inline-flex items-center justify-center rounded-lg bg-white text-[#0F2350] font-semibold text-sm h-10 px-5 hover:bg-blue-50 transition-colors"
          >
            {block.label || "Get Started"}
          </Link>
        </div>
      );
    default:
      return null;
  }
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = findPost(slug);

  // Title, description and keywords for search engines and link previews; put back on leave.
  useEffect(() => {
    if (!post) return undefined;
    const prevTitle = document.title;
    const setMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      const created = !el;
      if (created) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      const prev = el.getAttribute("content");
      el.setAttribute("content", content || "");
      return () => (created ? el.remove() : el.setAttribute("content", prev || ""));
    };
    document.title = `${post.title} | Finthara Blog`;
    const undo = [setMeta("description", post.excerpt), setMeta("keywords", post.keywords)];
    return () => {
      document.title = prevTitle;
      undo.forEach((fn) => fn());
    };
  }, [post]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: BLOG_BG }}>
      <LandingNavbar />

      <section style={{ backgroundColor: BLOG_NAVY }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-blue-100/80 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> All posts
          </Link>
          <h1 className="mt-5 text-3xl sm:text-4xl font-heading font-bold tracking-tight text-white leading-tight">
            {post ? post.title : "Post not found"}
          </h1>
          {post?.date && <p className="mt-4 text-sm text-blue-100/80">{formatPostDate(post.date)}</p>}
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {!post ? (
          <p className="text-slate-600">
            This post doesn&apos;t exist. <Link to="/blog" className="text-blue-700 underline">See all posts</Link>.
          </p>
        ) : (
          <article>
            {post.cover && (
              <img src={post.cover} alt="" className="w-full rounded-2xl border border-slate-200 mb-6" />
            )}
            {(post.blocks || []).map((b, i) => <Block key={i} block={b} />)}
            {post.tags?.length > 0 && (
              <div className="mt-10 pt-6 border-t border-slate-200 flex flex-wrap gap-2">
                {post.tags.map((t) => <TagPill key={t} tag={t} />)}
              </div>
            )}
          </article>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
