// Helpers shared by the blog pages and the admin editor. The posts themselves live on the
// backend (see api/blogService.js) and are written from the admin console's Blogs section.
//
// A post body is a list of blocks, in the order they appear on the page:
//
//   { type: "heading",   text: "..." }                      — a section heading
//   { type: "paragraph", text: "..." }                      — body text; **bold** works
//   { type: "list",      items: ["...", "..."] }            — bullet points
//   { type: "image",     image_id: 12, alt: "...",
//                        caption: "...", size: "full" | "wide" | "half" }
//   { type: "cta",       text: "...", label: "...", to: "/create" }  — call-to-action box

// About 200 words a minute, counted over every text block.
export const readMinutes = (post) => {
  const words = (post.blocks || [])
    .flatMap((b) => [b.text, ...(b.items || [])])
    .join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

export const formatPostDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    : "";
