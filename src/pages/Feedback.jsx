/**
 * Feedback.jsx — shareable /feedback page. Same form as the footer's Feedback popup.
 * "Copy link" puts this page's address on the clipboard so it can be shared anywhere.
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
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-14">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Share your feedback</h1>
          <Button type="button" variant="outline" size="sm" onClick={copy} className="gap-1.5 shrink-0 mt-1">
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
        <p className="text-muted-foreground mt-2">
          Five quick questions — it takes under a minute and helps us improve Finthara.
        </p>
        <div className="mt-8">
          <FeedbackForm />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
