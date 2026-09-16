import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const FLAG = "finthara:show-login-splash";

// Login.jsx calls this right before its window.location.href redirect — a hard
// navigation, so router state can't carry the "just logged in" signal across it.
// sessionStorage can, and clears itself the moment SplashScreen reads it.
export function markSplashForNextLoad() {
  try {
    sessionStorage.setItem(FLAG, "1");
  } catch {
    // sessionStorage unavailable (private browsing etc.) — splash just won't show
  }
}

export default function SplashScreen() {
  const [phase, setPhase] = useState(() => {
    try {
      return sessionStorage.getItem(FLAG) === "1" ? "in" : "hidden";
    } catch {
      return "hidden";
    }
  });

  useEffect(() => {
    if (phase === "hidden") return;
    try {
      sessionStorage.removeItem(FLAG);
    } catch {
      // ignore
    }
    const toOut = setTimeout(() => setPhase("out"), 900);
    const toHidden = setTimeout(() => setPhase("hidden"), 1300);
    return () => {
      clearTimeout(toOut);
      clearTimeout(toHidden);
    };
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] grid place-items-center bg-background",
        phase === "out" && "animate-splash-out"
      )}
    >
      <img
        src="/logo.png"
        alt="Finthara AI"
        className="h-28 sm:h-40 w-auto animate-splash-pop"
      />
    </div>
  );
}
