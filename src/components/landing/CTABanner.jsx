import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="relative overflow-hidden rounded-[2rem] bg-brand-gradient px-6 sm:px-12 py-16 text-center shadow-2xl shadow-primary/30">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -top-20 -left-16 w-72 h-72 rounded-full bg-white/15 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-24 -right-10 w-80 h-80 rounded-full bg-emerald-300/20 blur-3xl animate-float" />

        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4 leading-tight">
            Ready to create a report that gets funded?
          </h2>
          <p className="text-white/85 mb-8 text-base sm:text-lg">
            Bank-format CMA reports, feasibility studies and investor models — with the Excel
            workbook and the Word report built from the same numbers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/create">
              <Button size="lg" className="h-12 px-7 text-base bg-white text-primary hover:bg-white/90 gap-2 shadow-xl w-full sm:w-auto group">
                Create your report now
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="h-12 px-7 text-base w-full sm:w-auto border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                View pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
