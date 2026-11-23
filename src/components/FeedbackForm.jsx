/**
 * FeedbackForm.jsx — the 5-question feedback form. Shown in two places:
 *   - a popup from the footer's "Feedback" button (LandingFooter.jsx)
 *   - the shareable /feedback page (pages/Feedback.jsx)
 *
 * Posts to POST /feedback, which emails the response to the super admin. Questions 1–4 are
 * pick-an-option; question 5 is free text. The option lists must match feedback_router.py.
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Star, Send, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const RATING_LABELS = ["Very poor", "Poor", "Okay", "Good", "Excellent"];

const CHOICE_QUESTIONS = [
  {
    key: "purpose",
    q: "2. What did you use Finthara for?",
    options: ["CMA / Bank Loan", "Feasibility Study", "Short Project Report", "Just exploring"],
  },
  {
    key: "quality",
    q: "3. How was the quality and accuracy of the report?",
    options: ["Excellent", "Good", "Average", "Poor"],
  },
  {
    key: "recommend",
    q: "4. Would you recommend Finthara to others?",
    options: ["Yes", "Maybe", "No"],
  },
];

function Pill({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-foreground hover:border-primary/60 hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

export default function FeedbackForm({ onDone }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    rating: 0, purpose: "", quality: "", recommend: "",
    message: "", name: "", email: "", company: "",
  });
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const complete = form.rating && form.purpose && form.quality && form.recommend;

  const submit = async (e) => {
    e.preventDefault();
    if (!complete) {
      toast({ title: "Please answer questions 1–4", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${BACKEND_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const d = data?.detail;
        throw new Error(typeof d === "string" ? d : "Could not send your feedback.");
      }
      setSent(true);
    } catch (err) {
      toast({ title: "Feedback not sent", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-6">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
        <p className="font-semibold">Thank you for your feedback!</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          It helps us make Finthara better.
        </p>
        {onDone && <Button variant="outline" onClick={onDone} className="mt-2">Close</Button>}
      </div>
    );
  }

  const shown = hover || form.rating;

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium">1. How was your overall experience?</Label>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => set("rating", n)}
              onMouseEnter={() => setHover(n)}
              className="p-0.5"
            >
              <Star className={cn("w-7 h-7 transition-colors",
                n <= shown ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")} />
            </button>
          ))}
          {shown > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">{RATING_LABELS[shown - 1]}</span>
          )}
        </div>
      </div>

      {CHOICE_QUESTIONS.map(({ key, q, options }) => (
        <div key={key} className="space-y-2">
          <Label className="text-sm font-medium">{q}</Label>
          <div className="flex flex-wrap gap-2">
            {options.map((o) => (
              <Pill key={o} selected={form[key] === o} onClick={() => set(key, o)}>{o}</Pill>
            ))}
          </div>
        </div>
      ))}

      <div className="space-y-2">
        <Label htmlFor="fb-message" className="text-sm font-medium">
          5. What would you like us to improve?
        </Label>
        <Textarea
          id="fb-message" rows={4} value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Tell us what we can do better…"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="fb-name" className="text-xs text-muted-foreground">Name (optional)</Label>
          <Input id="fb-name" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fb-email" className="text-xs text-muted-foreground">Email (optional)</Label>
          <Input id="fb-email" type="email" value={form.email}
                 onChange={(e) => set("email", e.target.value)} />
        </div>
      </div>

      {/* Honeypot — hidden from real users, catches bots. */}
      <input
        type="text" tabIndex={-1} autoComplete="off" value={form.company}
        onChange={(e) => set("company", e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
        aria-hidden="true"
      />

      <Button type="submit" disabled={busy || !complete} className="w-full gap-1.5">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Submit feedback
      </Button>
    </form>
  );
}
