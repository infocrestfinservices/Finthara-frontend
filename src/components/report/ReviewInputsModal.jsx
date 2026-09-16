import React, { useEffect, useState } from "react";
import { Loader2, RefreshCw, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProjectAnswers } from "@/api/generationService";

/**
 * ReviewInputsModal — "here's what you filled in; change anything before we rebuild".
 *
 * Regenerating used to re-ask the AI for every assumption, so the same project came
 * back with different figures each time. Now the report is rebuilt from the inputs
 * already on file, and this is where the user sees and edits them first.
 *
 * Props:
 *   projectId - the project whose inputs to show
 *   onClose   - () => void
 *   onConfirm - (changedAnswers) => Promise<void>   only the edited fields
 */
export default function ReviewInputsModal({ projectId, onClose, onConfirm }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [edits, setEdits] = useState({});
  const [instructions, setInstructions] = useState("");
  // The written report is the one slow, paid call in the pipeline and the workbook does
  // not use a word of it, so it is opt-in. Off, the Word file still builds — but its
  // Executive Summary, Business Model and References are exactly the parts that come
  // from this call, so they come out empty.
  const [withWordReport, setWithWordReport] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProjectAnswers(projectId)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setInstructions(d?.instructions || "");
      })
      .catch((e) => !cancelled && setError(e?.message || "Could not load your answers"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [projectId]);

  const shown = (f) => (edits[f.key] !== undefined ? edits[f.key] : f.value ?? "");

  const setField = (key, value) => setEdits((p) => ({ ...p, [key]: value }));

  const changedCount = Object.keys(edits).length;

  const confirm = async () => {
    setSaving(true);
    try {
      // Only send what actually changed; everything else is reused as-is.
      const payload = {};
      for (const [k, v] of Object.entries(edits)) {
        const field = data.fields.find((f) => f.key === k);
        payload[k] = field && field.type !== "text" && v !== "" && !isNaN(Number(v))
          ? Number(v)
          : v;
      }
      await onConfirm(payload, instructions, withWordReport);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-start justify-between px-5 py-4 border-b">
          <div>
            <h2 className="font-heading font-bold text-lg">Review your inputs</h2>
            <p className="text-sm text-muted-foreground">
              These are the figures your report was built from. Change anything that needs
              correcting — everything you leave alone stays exactly as it is.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-10 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading your answers…
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {data && (
            <>
              <div className="mb-4 rounded-lg bg-muted/50 px-4 py-3 text-sm">
                <span className="font-semibold">{data.project?.title}</span>
                {data.project?.industry && <span className="text-muted-foreground"> · {data.project.industry}</span>}
                {data.project?.currency && <span className="text-muted-foreground"> · {data.project.currency}</span>}
                {data.template?.label && (
                  <div className="text-xs text-muted-foreground mt-1">{data.template.label}</div>
                )}
              </div>

              {/* The user's own words. Kept above the figures because it is the thing
                  most people want to change, and it is remembered between runs. */}
              <div className="mb-5">
                <label htmlFor="report-instructions" className="text-sm font-semibold">
                  Anything you want changed in this report?
                </label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                  Write it in your own words — for example “show a month-by-month revenue
                  break-up”, “drop the market research section”, or “explain the DSCR dip in
                  the early years”.
                </p>
                <textarea
                  id="report-instructions"
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Add a monthly revenue table and keep the summary to one page."
                  className="w-full text-sm rounded-md border border-border bg-background px-3 py-2 resize-y"
                />
                {data.instructions && instructions === data.instructions && (
                  <p className="text-xs text-muted-foreground mt-1">
                    This is what you asked for last time — edit it or leave it as is.
                  </p>
                )}
              </div>

              <div className="mb-5 rounded-md border border-border bg-muted/40 px-3 py-2.5">
                <label htmlFor="with-word-report" className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    id="with-word-report"
                    type="checkbox"
                    className="mt-0.5"
                    checked={withWordReport}
                    onChange={(e) => setWithWordReport(e.target.checked)}
                  />
                  <span>
                    <span className="text-sm font-semibold">Write the Word report too</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      Leave this off and only the Excel workbook is rebuilt — quick, and the
                      figures are identical either way. Tick it to have the Executive Summary,
                      Business Model, section commentary and References written as well; that
                      takes several minutes.
                    </span>
                  </span>
                </label>
              </div>

              <p className="text-sm font-semibold mb-1">Your figures</p>
              <div className="space-y-2">
                {data.fields.map((f) => (
                  <div key={f.key} className="grid grid-cols-[1fr_auto] items-center gap-3 py-1.5 border-b border-border/60">
                    <label className="text-sm" htmlFor={f.key}>
                      {f.label}
                      {edits[f.key] !== undefined && (
                        <span className="ml-2 text-xs text-primary font-medium">edited</span>
                      )}
                    </label>
                    {f.options ? (
                      <select
                        id={f.key}
                        className="w-56 text-sm rounded-md border border-border bg-background px-2 py-1"
                        value={shown(f)}
                        onChange={(e) => setField(f.key, e.target.value)}
                      >
                        {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        id={f.key}
                        type={f.type === "text" ? "text" : "number"}
                        step="any"
                        className="w-56 text-sm rounded-md border border-border bg-background px-2 py-1 text-right"
                        value={shown(f)}
                        onChange={(e) => setField(f.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
                {data.fields.length === 0 && (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    No saved inputs for this project yet — regenerating will build them.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="border-t px-5 py-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {(() => {
              const askChanged = instructions.trim() !== (data?.instructions || "").trim();
              const doc = withWordReport ? " · Word report included" : " · workbook only";
              if (changedCount && askChanged) return `${changedCount} field(s) changed + your instructions${doc}`;
              if (changedCount) return `${changedCount} field${changedCount > 1 ? "s" : ""} changed${doc}`;
              if (askChanged) return `Your instructions will be applied${doc}`;
              return `Nothing changed — the report will rebuild with the same figures${doc}`;
            })()}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button onClick={confirm} disabled={loading || saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Regenerate Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
