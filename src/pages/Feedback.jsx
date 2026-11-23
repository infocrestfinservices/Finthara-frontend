/**
 * Feedback.jsx — shareable /feedback page. Same form as the footer's Feedback popup.
 */
import React from "react";
import { LandingNavbar, LandingFooter } from "@/components/landing";
import FeedbackForm from "@/components/FeedbackForm";

export default function Feedback() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-14">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Share your feedback</h1>
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
