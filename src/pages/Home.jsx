import React from "react";
import {
  LandingNavbar,
  Hero,
  Stats,
  Features,
  ReportIncludes,
  CTABanner,
  LandingFooter,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Theme / hero */}
      <LandingNavbar />
      <Hero />

      {/* Information sections — what Finthara offers, in order.
          LogoMarquee, Industries and Testimonials were dropped: the hero's
          own industries strip and capability banner already cover that
          ground, so those sections were pure repetition. HowItWorks (with
          the live chat demo) now lives only on its own dedicated page. */}
      <Features />         {/* Why Finthara — core capabilities */}
      <ReportIncludes />   {/* What's inside every report — deliverables */}

      {/* Proof & conversion */}
      <Stats />
      <CTABanner />
      <LandingFooter />
    </div>
  );
}
