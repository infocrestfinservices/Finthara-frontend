import React from "react";

/**
 * The looping chat demo, cropped tight to just the phone — no dark backdrop margin
 * around it. /chatbot-demo.html renders a 390×780 phone centered inside its own
 * 440×900 canvas (25px/60px of backdrop on each side, plus the "ONBOARDING FLOW" label
 * and corner crop-marks). Rather than showing that whole canvas shrunk to fit a small
 * box (which is what left so much empty space around a tiny phone before), this scales
 * the iframe up and translates it so ONLY the phone lands inside the box — the backdrop
 * spills past the edges and gets clipped by overflow-hidden.
 *
 * `transform: scale(S) translate(-25px, -60px)` — translate runs first (rightmost),
 * shifting the phone's own top-left corner to the canvas origin; scale then blows the
 * whole thing up together. The -25/-60 offsets are the phone's fixed position inside its
 * canvas in chatbot-demo.html and stay constant across breakpoints — only S changes,
 * driven by the box's own width so `container` stays in sync with `iframe` without a
 * media query having to update two numbers in lockstep.
 *
 * Sized up to the phone's native 390×780 (scale 1, no blur) once there's room for it,
 * and a smaller scale where there isn't — see the two rules below.
 */
export default function PhoneDemo({ className = "" }) {
  return (
    <div className={`relative overflow-hidden phone-demo-box ${className}`}>
      <iframe
        src="/chatbot-demo.html"
        title="Finthara chat demo"
        className="absolute top-0 left-0 w-[440px] h-[900px] border-0 phone-demo-frame"
        loading="lazy"
      />
      <style>{`
        .phone-demo-box .phone-demo-frame { transform-origin: 0 0; }
        .phone-demo-box { width: 280px; height: 560px; }
        .phone-demo-box .phone-demo-frame { transform: scale(0.718) translate(-25px, -60px); }
        @media (min-width: 640px) {
          .phone-demo-box { width: 340px; height: 680px; }
          .phone-demo-box .phone-demo-frame { transform: scale(0.872) translate(-25px, -60px); }
        }
        @media (min-width: 1024px) {
          .phone-demo-box { width: 390px; height: 780px; }
          .phone-demo-box .phone-demo-frame { transform: scale(1) translate(-25px, -60px); }
        }
      `}</style>
    </div>
  );
}
