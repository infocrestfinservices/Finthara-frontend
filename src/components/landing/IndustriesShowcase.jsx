import React from "react";
import { REPORT_TEMPLATES } from "@/lib/reportTemplates";

import farming from "@/assets/industries/farming.webp";
import tech from "@/assets/industries/tech.webp";
import retail from "@/assets/industries/retail.webp";
import manufacturing from "@/assets/industries/manufacturing.webp";
import hospitality from "@/assets/industries/hospitality.webp";
import renewable from "@/assets/industries/renewable.webp";
import healthcare from "@/assets/industries/healthcare.webp";
import education from "@/assets/industries/education.webp";
import general from "@/assets/industries/general.webp";

const PHOTO_BY_ID = {
  farming, tech, retail, manufacturing, hospitality,
  renewable, healthcare, education, general,
};

// Only cards with a photo appear in the strip (restaurant has none yet).
const INDUSTRIES = REPORT_TEMPLATES.filter((t) => PHOTO_BY_ID[t.id]).map((t) => ({
  id: t.id,
  label: t.label,
  example: t.examples[0],
  photo: PHOTO_BY_ID[t.id],
}));

// A full-bleed, edge-to-edge scrolling strip — one real photo per industry
// template this app actually generates reports for.
export default function IndustriesShowcase() {
  return (
    <div className="w-full py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight">
          Industries We Serve
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Your industry, your idea, your data — our calculation and report.
        </p>
      </div>

      <div className="relative w-screen left-1/2 right-1/2 -mx-[50vw] overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]">
        <div className="flex w-max gap-5 px-5 animate-marquee pause-on-hover">
          {[...INDUSTRIES, ...INDUSTRIES].map((ind, i) => (
            <div
              key={`${ind.id}-${i}`}
              className="relative shrink-0 w-64 sm:w-72 aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-sm"
            >
              <img
                src={ind.photo}
                alt={ind.label}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3.5">
                <p className="text-white font-semibold text-sm leading-tight">{ind.label}</p>
                <p className="text-white/75 text-xs mt-0.5">{ind.example}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
