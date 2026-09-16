import React from "react";

export default function Stats() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
      <div className="relative rounded-3xl bg-brand-gradient overflow-hidden shadow-xl shadow-primary/20">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative text-center px-6 py-5 sm:py-6">
          <p className="text-2xl sm:text-3xl font-heading font-bold text-white">
            95% Accurate <span className="text-white/70">&</span> Bank-Ready
          </p>
        </div>
      </div>
    </section>
  );
}
