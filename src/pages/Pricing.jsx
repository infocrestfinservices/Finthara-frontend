import React from "react";
import {
  LandingNavbar,
  Pricing,
  CTABanner,
  LandingFooter,
} from "@/components/landing";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* Page header — compact so the pricing cards sit up front */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-emerald-500/5 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6 sm:pt-12 sm:pb-8 text-center">
          <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">
            Simple, transparent <span className="text-primary">pricing</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
            Every feature, on both plans. Add a team when you need one. No hidden fees.
          </p>
        </div>
      </section>

      <Pricing showHeader={false} />
      <CTABanner />
      <LandingFooter />
    </div>
  );
}
