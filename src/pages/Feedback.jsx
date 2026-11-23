/**
 * Feedback.jsx — shareable /feedback page, linked from the footer's Company column (same
 * layout as Terms & Conditions). "Copy link" puts this page's address on the clipboard.
 */
import React, { useState } from "react";
import { LandingNavbar, LandingFooter } from "@/components/landing";
import FeedbackForm from "@/components/FeedbackForm";
import { Button } from "@/components/ui/button";
import { Link2, Check } from "lucide-react";

export default function Feedback() {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/feedback`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", link);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Feedback</p>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold">Share your feedback</h1>
          <Button type="button" variant="outline" size="sm" onClick={copy} className="gap-1.5 shrink-0 mt-1">
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-10">
          Five quick questions — it takes under a minute and helps us improve Finthara.
        </p>

        <FeedbackForm />
      </main>

      <LandingFooter />
    </div>
  );
}
