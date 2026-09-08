/**
 * Contact.jsx — the "Contact us" page.
 *
 * Reached from the footer and from the Enterprise pricing card ("Talk to us"), which used
 * to link to /contact — a route that didn't exist, so it 404'd. The form posts to
 * POST /contact (emailed to the support address via Resend); if that isn't configured the
 * page falls back to a plain mailto: link, which GET /contact tells us about.
 */
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LandingNavbar, LandingFooter } from "@/components/landing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Send, Loader2, CheckCircle2 } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const TOPICS = [
  "Enterprise plan",
  "Sales question",
  "Billing / payments",
  "Technical support",
  "Something else",
];

export default function Contact() {
  const { toast } = useToast();
  const [params] = useSearchParams();
  const [info, setInfo] = useState({ email: "support@infocrest.in", company: "Finthara", address: null });
  const [form, setForm] = useState({
    name: "", email: "", message: "", company: "",
    topic: params.get("topic") === "enterprise" ? "Enterprise plan" : "Sales question",
  });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/contact`)
      .then((r) => r.json())
      .then((d) => d?.email && setInfo(d))
      .catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch(`${BACKEND_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Could not send your message.");
      setSent(true);
    } catch (err) {
      toast({
        title: "Message not sent",
        description: `${err.message} You can email us at ${info.email}.`,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const mailtoHref =
    `mailto:${info.email}?subject=${encodeURIComponent(form.topic || "Enquiry")}` +
    `&body=${encodeURIComponent(form.message || "")}`;

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

        {sent ? (
          <div className="mt-8 border rounded-xl p-6 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Message sent</p>
              <p className="text-sm text-muted-foreground">
                Thanks — we've got it and will reply to {form.email} soon.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={set("name")} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={set("email")} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Topic</Label>
              <Select value={form.topic} onValueChange={set("topic")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TOPICS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" rows={6} value={form.message} onChange={set("message")}
                        required placeholder="How can we help?" />
            </div>

            {/* Honeypot — hidden from real users, catches bots. */}
            <input
              type="text" tabIndex={-1} autoComplete="off" value={form.company}
              onChange={set("company")}
              style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
              aria-hidden="true"
            />

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button type="submit" disabled={busy} className="gap-1.5">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send message
              </Button>
              <a href={mailtoHref}
                 className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> or email us directly
              </a>
            </div>
          </form>
        )}

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
