/**
 * BlogsTab.jsx — write and edit the public /blog posts.
 *
 * A post body is an ordered list of blocks (heading, paragraph, bullet list, image,
 * call-to-action button), so the author places every heading, paragraph and picture
 * exactly where it should sit. The right-hand pane is a live preview drawn with the same
 * component the public page uses, so what is seen here is what goes out.
 *
 * Visibility: "Published" + a date that has arrived. A future date schedules the post;
 * unticking Published keeps it as a draft nobody outside this console can see.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowDown, ArrowLeft, ArrowUp, ExternalLink, Heading2, Image as ImageIcon, List,
  Loader2, MousePointerClick, Pencil, Pilcrow, Plus, Trash2, Upload,
} from "lucide-react";
import {
  adminListPosts, adminCreatePost, adminUpdatePost, adminDeletePost, adminUploadImage,
  blogImageUrl,
} from "@/api/blogService";
import { formatPostDate } from "@/lib/blogPosts";
import { PostArticle } from "@/pages/BlogPost";
import { PostTitle, SERIF, BLOG_INK } from "@/pages/Blog";

const today = () => new Date().toLocaleDateString("en-CA");   // YYYY-MM-DD

const EMPTY_POST = {
  title: "", slug: "", category: "", highlight: "", author: "Finthara Team",
  excerpt: "", keywords: "", tags: [], blocks: [], cover_image_id: null,
  published: false, date: today(),
};

const BLOCK_KINDS = [
  { type: "heading", label: "Heading", icon: Heading2, make: () => ({ type: "heading", text: "" }) },
  { type: "paragraph", label: "Paragraph", icon: Pilcrow, make: () => ({ type: "paragraph", text: "" }) },
  { type: "list", label: "Bullet list", icon: List, make: () => ({ type: "list", items: [] }) },
  { type: "image", label: "Image", icon: ImageIcon, make: () => ({ type: "image", image_id: null, size: "full", caption: "", alt: "" }) },
  { type: "cta", label: "Button box", icon: MousePointerClick, make: () => ({ type: "cta", text: "", label: "Create Report", to: "/create" }) },
];

function status(post, now) {
  if (!post.published) return { label: "Draft", cls: "bg-muted text-muted-foreground" };
  if (post.date > now) return { label: `Scheduled · ${formatPostDate(post.date)}`, cls: "bg-amber-500/15 text-amber-400" };
  return { label: "Live", cls: "bg-emerald-500/15 text-emerald-400" };
}

export default function BlogsTab({ toast }) {
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(null);     // a post object (new posts have no id)
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      setData(await adminListPosts());
    } catch (e) {
      setData({ posts: [], today: today() });
      toast({ title: "Could not load blogs", description: e.message, variant: "destructive" });
    }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const confirmDelete = async () => {
    const p = deleting;
    setDeleting(null);
    try {
      await adminDeletePost(p.id);
      toast({ title: "Post deleted", description: p.title });
      load();
    } catch (e) {
      toast({ title: "Could not delete", description: e.message, variant: "destructive" });
    }
  };

  if (editing) {
    return (
      <PostEditor
        initial={editing}
        toast={toast}
        onClose={(changed) => { setEditing(null); if (changed) load(); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {data ? `${data.posts.length} post${data.posts.length === 1 ? "" : "s"}` : "Loading…"}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <a href="/blog" target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> View blog</a>
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setEditing({ ...EMPTY_POST, date: today() })}>
            <Plus className="h-4 w-4" /> New post
          </Button>
        </div>
      </div>

      {!data ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : data.posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No posts yet — click “New post” to write the first one.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {data.posts.map((p) => {
            const st = status(p, data.today);
            return (
              <div key={p.id} className="flex items-center gap-4 border-b border-border bg-card p-3 last:border-b-0">
                <div className="h-14 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                  {p.cover_image_id && <img src={blogImageUrl(p.cover_image_id)} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.title}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${st.cls}`}>{st.label}</span>
                    {p.category && <span>{p.category}</span>}
                    <span>· {formatPostDate(p.date)}</span>
                    <span className="truncate">· /blog/{p.slug}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setEditing(p)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleting(p)} aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.title}” will be removed from the website for good. To hide it for now
              instead, edit it and switch off Published.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── editor ───────────────────────────────────────────────────────────────────────

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Upload button that hands back the stored image's id. */
function ImagePicker({ imageId, onChange, toast, compact = false }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      onChange(await adminUploadImage(file));
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex items-center gap-3">
      <div className={`${compact ? "h-12 w-20" : "h-20 w-36"} shrink-0 overflow-hidden rounded-md border border-border bg-muted`}>
        {imageId && <img src={blogImageUrl(imageId)} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" className="gap-2" disabled={busy} onClick={() => ref.current?.click()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {imageId ? "Replace" : "Upload"}
        </Button>
        {imageId && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>Remove</Button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={pick} />
    </div>
  );
}

function BlockEditor({ block, onChange, toast }) {
  const set = (patch) => onChange({ ...block, ...patch });
  switch (block.type) {
    case "heading":
      return <Input value={block.text || ""} onChange={(e) => set({ text: e.target.value })} placeholder="Section heading" />;
    case "paragraph":
      return (
        <Textarea rows={4} value={block.text || ""} onChange={(e) => set({ text: e.target.value })}
                  placeholder="Paragraph text. Wrap words in **double stars** to make them bold." />
      );
    case "list":
      return (
        <Textarea rows={4} value={(block.items || []).join("\n")}
                  onChange={(e) => set({ items: e.target.value.split("\n") })}
                  placeholder={"One bullet point per line\n**Bold label:** works here too"} />
      );
    case "image":
      return (
        <div className="space-y-2">
          <ImagePicker imageId={block.image_id} onChange={(id) => set({ image_id: id })} toast={toast} compact />
          <div className="grid gap-2 sm:grid-cols-[1fr_160px]">
            <Input value={block.caption || ""} onChange={(e) => set({ caption: e.target.value })} placeholder="Caption (optional)" />
            <select value={block.size || "full"} onChange={(e) => set({ size: e.target.value })}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="full">Full width</option>
              <option value="wide">Slightly smaller</option>
              <option value="half">Half width</option>
            </select>
          </div>
        </div>
      );
    case "cta":
      return (
        <div className="space-y-2">
          <Input value={block.text || ""} onChange={(e) => set({ text: e.target.value })} placeholder="Text in the box, e.g. Ready to apply? Create your report today." />
          <div className="grid gap-2 sm:grid-cols-2">
            <Input value={block.label || ""} onChange={(e) => set({ label: e.target.value })} placeholder="Button text" />
            <select value={block.to || "/create"} onChange={(e) => set({ to: e.target.value })}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="/create">Button opens: Create Report</option>
              <option value="/pricing">Button opens: Pricing</option>
              <option value="/features">Button opens: Features</option>
              <option value="/contact">Button opens: Contact</option>
              <option value="/blog">Button opens: Blogs</option>
            </select>
          </div>
        </div>
      );
    default:
      return null;
  }
}

function PostEditor({ initial, toast, onClose }) {
  const [post, setPost] = useState({ ...EMPTY_POST, ...initial });
  const [tagsText, setTagsText] = useState((initial.tags || []).join(", "));
  const [saving, setSaving] = useState(false);
  const set = (patch) => setPost((p) => ({ ...p, ...patch }));
  const isNew = !post.id;

  const setBlock = (i, b) => set({ blocks: post.blocks.map((x, j) => (j === i ? b : x)) });
  const moveBlock = (i, d) => {
    const blocks = [...post.blocks];
    [blocks[i], blocks[i + d]] = [blocks[i + d], blocks[i]];
    set({ blocks });
  };
  const removeBlock = (i) => set({ blocks: post.blocks.filter((_, j) => j !== i) });
  const addBlock = (kind) => set({ blocks: [...post.blocks, kind.make()] });

  const tags = tagsText.split(/[,\s]+/).map((t) => t.replace(/^#/, "").trim()).filter(Boolean);
  // Empty bullet lines are only there while typing — drop them before saving.
  const cleanBlocks = post.blocks.map((b) => (b.type === "list" ? { ...b, items: (b.items || []).filter((x) => x.trim()) } : b));
  const preview = { ...post, tags, blocks: cleanBlocks };

  const save = async () => {
    if (!post.title.trim()) {
      toast({ title: "Add a title first", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const body = { ...post, tags, blocks: cleanBlocks };
      const saved = isNew ? await adminCreatePost(body) : await adminUpdatePost(post.id, body);
      setPost(saved);
      setTagsText((saved.tags || []).join(", "));
      toast({
        title: isNew ? "Post created" : "Post saved",
        description: !saved.published ? "Saved as a draft — not on the website yet."
          : saved.date > today() ? `Scheduled — goes live on ${formatPostDate(saved.date)}.`
          : "Live on the website now.",
      });
      if (isNew) onClose(true);
    } catch (e) {
      toast({ title: "Could not save", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => onClose(true)}>
          <ArrowLeft className="h-4 w-4" /> All posts
        </Button>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={post.published} onCheckedChange={(v) => set({ published: v })} />
            Published
          </label>
          {!isNew && post.published && post.date <= today() && (
            <Button variant="outline" size="sm" asChild className="gap-2">
              <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> View</a>
            </Button>
          )}
          <Button size="sm" onClick={save} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} {isNew ? "Create post" : "Save changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Form */}
        <div className="space-y-5">
          <section className="space-y-4 rounded-xl border border-border bg-card p-5">
            <Field label="Title">
              <Input value={post.title} onChange={(e) => set({ title: e.target.value })} placeholder="What Is a Project Report and Why Does Your Bank Ask for One?" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Blue words in the title" hint="Copy a part of the title exactly — it shows in blue.">
                <Input value={post.highlight || ""} onChange={(e) => set({ highlight: e.target.value })} placeholder="Project Report" />
              </Field>
              <Field label="Category" hint="Becomes a tab on the blogs page.">
                <Input value={post.category || ""} onChange={(e) => set({ category: e.target.value })} placeholder="Loan Basics" />
              </Field>
              <Field label="Date" hint="A future date schedules the post.">
                <Input type="date" value={post.date || ""} onChange={(e) => set({ date: e.target.value })} />
              </Field>
              <Field label="Author">
                <Input value={post.author || ""} onChange={(e) => set({ author: e.target.value })} placeholder="Finthara Team" />
              </Field>
            </div>
            <Field label="Page address" hint={`finthara.com/blog/${post.slug || "made-from-the-title"} — leave empty to make it from the title.`}>
              <Input value={post.slug || ""} onChange={(e) => set({ slug: e.target.value })} placeholder="what-is-a-project-report" />
            </Field>
            <Field label="Cover image" hint="Shown on the card and at the top of the post. 1200 × 630 works best.">
              <ImagePicker imageId={post.cover_image_id} onChange={(id) => set({ cover_image_id: id })} toast={toast} />
            </Field>
            <Field label="Short summary" hint="Under the title on the card, and the description Google shows.">
              <Textarea rows={2} value={post.excerpt || ""} onChange={(e) => set({ excerpt: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="#Tags" hint="Separate with commas or spaces.">
                <Input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="ProjectReport, BusinessLoan, MSME" />
              </Field>
              <Field label="SEO keywords" hint="For search engines; not shown on the page.">
                <Input value={post.keywords || ""} onChange={(e) => set({ keywords: e.target.value })} />
              </Field>
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-card p-5">
            <div>
              <h3 className="text-sm font-semibold">Main body</h3>
              <p className="text-xs text-muted-foreground">Blocks appear on the page in this order — use the arrows to move them.</p>
            </div>
            {post.blocks.map((b, i) => {
              const kind = BLOCK_KINDS.find((k) => k.type === b.type);
              const Icon = kind?.icon || Pilcrow;
              return (
                <div key={i} className="rounded-lg border border-border bg-background p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" /> {kind?.label || b.type}
                    </span>
                    <div className="flex gap-0.5">
                      <Button variant="ghost" size="icon" className="h-7 w-7" disabled={i === 0} onClick={() => moveBlock(i, -1)} aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" disabled={i === post.blocks.length - 1} onClick={() => moveBlock(i, 1)} aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => removeBlock(i)} aria-label="Remove"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <BlockEditor block={b} onChange={(nb) => setBlock(i, nb)} toast={toast} />
                </div>
              );
            })}
            <div className="flex flex-wrap gap-2 pt-1">
              {BLOCK_KINDS.map((k) => (
                <Button key={k.type} type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => addBlock(k)}>
                  <Plus className="h-3.5 w-3.5" /> {k.label}
                </Button>
              ))}
            </div>
          </section>
        </div>

        {/* Live preview, in the public page's own (light) colours. */}
        <div className="xl:sticky xl:top-4 xl:self-start">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Preview</p>
          <div className="max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-[#F6F9FC] p-6 text-slate-900">
            {post.category && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1E88C8]">{post.category}</p>
            )}
            <h1 className="mt-2 text-3xl font-semibold leading-tight" style={{ ...SERIF, color: BLOG_INK }}>
              {post.title ? <PostTitle post={post} /> : <span className="text-slate-400">Your title</span>}
            </h1>
            <p className="mt-2 mb-6 text-xs text-slate-500">
              {post.author || "Finthara Team"} · {formatPostDate(post.date)}
            </p>
            <PostArticle post={preview} />
          </div>
        </div>
      </div>
    </div>
  );
}
