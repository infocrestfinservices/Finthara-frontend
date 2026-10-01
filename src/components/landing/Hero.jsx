import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import FinanceBackdrop from "./FinanceBackdrop";
import IndustriesShowcase from "./IndustriesShowcase";
import ReportShowcase from "./ReportShowcase";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Backdrop */}
      <FinanceBackdrop />
      <div className="absolute top-[-12%] left-1/2 -translate-x-1/2 -z-10 w-[820px] h-[440px] bg-primary/10 blur-[130px] rounded-full" />
      <div className="absolute top-[8%] right-[6%] -z-10 w-[360px] h-[360px] bg-emerald-400/10 blur-[120px] rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-12 lg:gap-10 items-center">
          {/* Left: heading */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-[2.75rem] xl:text-5xl font-heading font-bold tracking-tight leading-[1.15] text-primary animate-fade-up">
              Bank <span className="font-body font-normal">&amp;</span> Investor-Ready
              <br />
              <span className="text-gradient">project reports in minutes</span>
            </h1>
            <p className="text-muted-foreground mt-5 text-base sm:text-lg max-w-md mx-auto lg:mx-0 animate-fade-up animation-delay-200">
              AI-generated CMA reports, submission-ready in minutes — DSCR, IRR and a full
              5-year model, formatted exactly the way your bank expects.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center lg:justify-start animate-fade-up animation-delay-300">
              <Link to="/create">
                <Button size="lg" className="h-12 px-7 text-base gap-2 shadow-xl shadow-primary/30 w-full sm:w-auto group">
                  Create your report
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="h-12 px-7 text-base w-full sm:w-auto">
                  See how it works
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: real generated reports, scrolling */}
          <div className="animate-fade-up animation-delay-200">
            <ReportShowcase />
          </div>
        </div>
      </div>

      <IndustriesShowcase />
    </section>
  );
}
