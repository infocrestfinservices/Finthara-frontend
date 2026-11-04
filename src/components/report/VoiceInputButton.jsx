import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Speak an answer instead of typing it. Uses the browser's own speech recognition
// (Chrome, Edge, Safari) — nothing is sent to our backend or an AI. The words land in
// the chat box as they are spoken, so the user can still correct them before sending.
// Browsers without it (Firefox) get no button at all.
const Recognition =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

const LANGS = [
  { code: "en-IN", label: "EN" },
  { code: "hi-IN", label: "हि" },
];

export default function VoiceInputButton({ value, onChange, disabled }) {
  const { toast } = useToast();
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState("en-IN");
  const recRef = useRef(null);

  const stop = () => {
    // abort() drops results still in flight, so a sent message is not refilled.
    recRef.current?.abort();
    recRef.current = null;
    setListening(false);
  };

  useEffect(() => () => recRef.current?.abort(), []);
  useEffect(() => {
    if (disabled && recRef.current) stop();
  }, [disabled]);

  if (!Recognition) return null;

  const start = () => {
    const rec = new Recognition();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    // Whatever is already typed stays; speech is added after it.
    const base = value.trim() ? value.replace(/\s*$/, " ") : "";
    rec.onresult = (e) => {
      if (recRef.current !== rec) return;
      let spoken = "";
      for (let i = 0; i < e.results.length; i++) spoken += e.results[i][0].transcript;
      onChange(base + spoken.trim());
    };
    rec.onerror = (e) => {
      if (e.error === "aborted" || e.error === "no-speech") return;
      toast({
        title: "Voice input stopped",
        description:
          e.error === "not-allowed" || e.error === "service-not-allowed"
            ? "Allow microphone access for this site in your browser, then try again."
            : "Could not hear you clearly. Please try again or type your answer.",
        variant: "destructive",
      });
    };
    rec.onend = () => {
      if (recRef.current === rec) {
        recRef.current = null;
        setListening(false);
      }
    };
    try {
      rec.start();
    } catch {
      return;
    }
    recRef.current = rec;
    setListening(true);
  };

  const nextLang = LANGS[(LANGS.findIndex((l) => l.code === lang) + 1) % LANGS.length];

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setLang(nextLang.code)}
        disabled={disabled || listening}
        className="h-11 w-11 flex-shrink-0 px-0 text-xs font-semibold"
        title={`Voice language: ${lang === "hi-IN" ? "Hindi" : "English"} (tap to switch)`}
      >
        {LANGS.find((l) => l.code === lang).label}
      </Button>
      <Button
        type="button"
        variant={listening ? "destructive" : "outline"}
        size="icon"
        onClick={listening ? stop : start}
        disabled={disabled}
        className={`h-11 w-11 flex-shrink-0 ${listening ? "animate-pulse" : ""}`}
        title={listening ? "Stop listening" : "Speak your answer"}
        aria-label={listening ? "Stop listening" : "Speak your answer"}
      >
        {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </Button>
    </>
  );
}
