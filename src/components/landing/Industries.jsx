import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { REPORT_TEMPLATES } from "@/lib/reportTemplates";

export default function Industries() {
  return (
    <section id="industries" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="inline-block text-primary text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-primary/10">
          Built for every industry
        </p>
        <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">
          One tool, nine industries, any business
        </h2>
        <p className="text-muted-foreground mt-3">
          Finthara tailors every section, metric and assumption to your sector — so the report
          reads like a domain expert prepared it.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_TEMPLATES.map((t) => (
          <article
            key={t.id}
            className="group rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <div
              className="w-12 h-12 rounded-xl grid place-items-center text-2xl mb-4 transition-transform group-hover:scale-105"
              style={{ backgroundColor: t.lightColor }}
            >
              {t.icon}
            </div>
            <h3 className="font-semibold text-[15px] mb-1">{t.label}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
          </article>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link
          to="/create"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
        >
          Start your industry report <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
