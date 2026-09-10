/**
 * Contact.jsx — the public "Contact us" page (footer link, logged-out visitors).
 *
 * Logged-in users have the same form as a "Help Desk" card in Profile → Settings; both
 * render <ContactForm> and post to POST /contact.
 */
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LandingNavbar, LandingFooter } from "@/components/landing";
import ContactForm from "@/components/ContactForm";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export default function Contact() {
  const [params] = useSearchParams();
  const topic = params.get("topic") === "enterprise" ? "Enterprise plan" : "Sales question";
  const [info, setInfo] = useState({ email: "support@infocrest.in", company: null, address: null });

  useEffect(() => {
    fetch(`${BACKEND_URL}/contact`)
      .then((r) => r.json())
      .then((d) => d?.email && setInfo(d))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-14">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Contact us</h1>
        <p className="text-muted-foreground mt-2">
          Questions about a plan, Enterprise pricing, or anything else — send a message and
          we'll get back to you. You can also email{" "}
          <a href={`mailto:${info.email}`} className="text-primary underline">{info.email}</a>.
        </p>

        <div className="mt-8">
          <ContactForm defaultTopic={topic} />
        </div>

        {info.address && (
          <p className="text-xs text-muted-foreground mt-10 whitespace-pre-line">
            {info.company}
            {"\n"}{info.address}
          </p>
        )}
      </main>
      <LandingFooter />
    </div>
  );
}
