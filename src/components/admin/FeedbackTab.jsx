/**
 * FeedbackTab.jsx — every response to the /feedback form, newest first (all admins).
 * Reads GET /admin/feedback (which 404s for non-admins, like the rest of /admin).
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MessageSquareText, RefreshCw, Search, Star } from "lucide-react";
import { getFeedback } from "@/api/adminService";

const PAGE = 50;

const when = (iso) =>
  iso ? new Date(iso + (iso.endsWith("Z") ? "" : "Z")).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }) : "—";

function Stars({ n }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${n} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
      ))}
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default function FeedbackTab() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [offset, setOffset] = useState(0);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setData(null);
    setError("");
    try {
      setData(await getFeedback({ limit: PAGE, offset }));
    } catch (e) {
      setError(e.message || "Could not load feedback.");
      setData({ total: 0, average_rating: null, items: [] });
    }
  }, [offset]);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const rows = data?.items || [];
    if (!needle) return rows;
    return rows.filter((f) =>
      `${f.name} ${f.email} ${f.purpose} ${f.message || ""}`.toLowerCase().includes(needle));
  }, [data, q]);

  if (!data) {
    return (
      <div className="flex items-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label="Total responses" value={data.total} />
        <Stat label="Average rating"
              value={data.average_rating != null ? `${data.average_rating} / 5` : "—"} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} className="pl-9"
                 placeholder="Search name, email, purpose or message" />
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {error ? <p className="text-sm text-amber-300">{error}</p> : null}

      {shown.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-14 text-sm text-muted-foreground">
          <MessageSquareText className="h-6 w-6" />
          {data.total === 0 ? "No feedback yet." : "Nothing matches that search."}
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((f) => (
            <div key={f.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{f.name}</div>
                  <a href={`mailto:${f.email}`} className="text-sm text-primary hover:underline">{f.email}</a>
                </div>
                <div className="text-right">
                  <Stars n={f.rating} />
                  <div className="mt-1 text-xs text-muted-foreground">{when(f.created_at)}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-border px-2.5 py-1">Used for: {f.purpose}</span>
                <span className="rounded-full border border-border px-2.5 py-1">Quality: {f.quality}</span>
                <span className="rounded-full border border-border px-2.5 py-1">Recommend: {f.recommend}</span>
              </div>
              <div className="mt-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">What to improve</div>
                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {f.message || <span className="text-muted-foreground">(left blank)</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.total > PAGE ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{offset + 1}–{Math.min(offset + PAGE, data.total)} of {data.total}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={offset === 0}
                    onClick={() => setOffset(Math.max(0, offset - PAGE))}>Previous</Button>
            <Button variant="outline" size="sm" disabled={offset + PAGE >= data.total}
                    onClick={() => setOffset(offset + PAGE)}>Next</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
