import React from "react";
import { Sparkles } from "lucide-react";
import skilledapp from "@/assets/reports/skilledapp.webp";
import hardcider from "@/assets/reports/hardcider.webp";
import majorcityVilla from "@/assets/reports/majorcity-villa.webp";

// Three independent columns so the reports read as a wall, not one
// straight line — each column loops its own report, alternating
// scroll direction and speed for a lively, non-uniform feel.
const COLUMNS = [
  { image: skilledapp, direction: "up", duration: 26 },
  { image: hardcider, direction: "down", duration: 32 },
  { image: majorcityVilla, direction: "up", duration: 22 },
];

export default function ReportShowcase() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute inset-x-6 -top-4 h-32 bg-brand-gradient blur-3xl opacity-20 -z-10" />

      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5 w-fit mx-auto mb-4 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-primary" /> Real reports, real numbers
      </div>

      <div className="relative h-[440px] overflow-hidden rounded-2xl [mask-image:linear-gradient(to_bottom,transparent,#000_6%,#000_94%,transparent)]">
        <div className="grid grid-cols-3 gap-2.5 h-full">
          {COLUMNS.map((col, ci) => {
            const looped = [col.image, col.image, col.image, col.image];
            return (
              <div key={ci} className="relative overflow-hidden pause-on-hover">
                <div
                  className="flex flex-col gap-3 animate-marquee-vertical"
                  style={{
                    animationDuration: `${col.duration}s`,
                    animationDirection: col.direction === "down" ? "reverse" : "normal",
                  }}
                >
                  {looped.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="Finthara AI generated report"
                      className="w-full rounded-lg border border-border shadow-md"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
