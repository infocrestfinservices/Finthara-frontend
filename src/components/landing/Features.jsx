import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { FEATURES } from "./landingData";

const GRAPH_BARS = [38, 55, 46, 70, 62, 82, 74, 95];

export default function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
        <div className="max-w-xl">
          <p className="inline-block text-primary text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-primary/10">
            Why Finthara AI
          </p>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">
            Everything a banker or investor needs
          </h2>
          <p className="text-muted-foreground mt-3">
            From CMA data to VC pitch decks — the right format, every time, for every region.
          </p>
        </div>
        <Link
          to="/features"
          className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all shrink-0"
        >
          Explore all features <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(150px,auto)] grid-flow-dense gap-4">
        {/* Large AI/finance graphic tile */}
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient text-white p-7 sm:p-8 flex flex-col justify-between sm:col-span-2 sm:row-span-2">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-white/15 grid place-items-center mb-5">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-2xl sm:text-3xl leading-tight mb-3">
              AI that thinks like a financial analyst
            </h3>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-sm">
              Every report runs on a real 5-year financial model, not a template — the AI
              reasons through your numbers the way a bank or investor would.
            </p>
          </div>
          <div className="relative flex items-end gap-2 h-20 mt-8">
            {GRAPH_BARS.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md bg-white/25 origin-bottom animate-bar-wave"
                style={{ height: `${h}%`, animationDelay: `${i * 0.18}s` }}
              />
            ))}
          </div>
        </div>

        {FEATURES.map((f, i) => (
          <article
            key={f.title}
            className={`group rounded-3xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 ${
              i >= 4 ? "lg:col-span-2" : ""
            }`}
          >
            <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
              <f.icon className={`w-5 h-5 ${f.color}`} />
            </div>
            <h3 className="font-semibold text-base mb-1.5">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
