import React, { useState } from "react";
import { FileText, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Brand logo.
 *
 * Renders the real logo file once it exists (a full lockup — icon + "Finthara AI" baked
 * into one image). Until then — or if the file 404s — it falls back to the placeholder
 * tile + wordmark so the navbar/footer never show a broken image.
 *
 * To go live: drop the logo at frontend/public/logo.svg (preferred) or logo.png. Nothing
 * else changes — every <Logo> usage picks it up automatically.
 */
const SIZES = {
  sm: { box: "w-8 h-8 rounded-lg", icon: "w-4 h-4", badge: "w-3.5 h-3.5", check: "w-2 h-2", title: "text-sm", img: "h-8" },
  md: { box: "w-9 h-9 rounded-xl", icon: "w-5 h-5", badge: "w-4 h-4", check: "w-2.5 h-2.5", title: "text-base", img: "h-9" },
  lg: { box: "w-14 h-14 rounded-2xl", icon: "w-7 h-7", badge: "w-5 h-5", check: "w-3 h-3", title: "text-2xl", img: "h-14" },
};

const SOURCES = ["/logo.svg", "/logo.png"];

export default function Logo({ size = "md", showText = true, subtitle, className }) {
  const s = SIZES[size];
  // Try .svg, then .png, then give up and use the placeholder — see the doc comment above.
  const [srcIndex, setSrcIndex] = useState(0);
  const failed = srcIndex >= SOURCES.length;

  if (!failed) {
    return (
      <span className={cn("inline-flex items-center gap-2.5", className)}>
        <img
          src={SOURCES[srcIndex]}
          alt="Finthara AI"
          className={cn(s.img, "w-auto object-contain")}
          onError={() => setSrcIndex((i) => i + 1)}
        />
        {subtitle && (
          <span className="block text-[11px] text-muted-foreground leading-tight">{subtitle}</span>
        )}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative grid place-items-center bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/15",
          s.box
        )}
      >
        <FileText className={s.icon} strokeWidth={2.25} aria-hidden="true" />
        {/* emerald "verified report" accent badge */}
        <span
          className={cn(
            "absolute -bottom-1 -right-1 grid place-items-center rounded-full bg-emerald-500 text-white ring-2 ring-background",
            s.badge
          )}
        >
          <Check className={s.check} strokeWidth={3.5} aria-hidden="true" />
        </span>
      </span>

      {showText && (
        <span className="leading-tight">
          <span className={cn("block font-heading font-bold tracking-tight text-foreground", s.title)}>
            Finthara <span className="text-emerald-600">AI</span>
          </span>
          {subtitle && (
            <span className="block text-[11px] text-muted-foreground -mt-0.5">{subtitle}</span>
          )}
        </span>
      )}
    </span>
  );
}
