/**
 * ContactForm.jsx — the support / contact message form, used in two places:
 *   - the public /contact page (logged-out prospects)
 *   - the "Help Desk" card inside Profile → Settings (logged-in users, name/email prefilled)
 *
 * Posts to POST /contact (emailed to support via Resend). If that fails or email isn't
 * configured, it surfaces a mailto: link so the message never just disappears.
 */
import React, { useEffect, useState } from "react";
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

export const CONTACT_TOPICS = [
  "Enterprise plan",
  "Sales question",
  "Billing / payments",
  "Technical support",
  "Something else",
];

export default function ContactForm({
  defaultName = "",
  defaultEmail = "",
  defaultTopic = "Sales question",
  lockEmail = false,
}) {
  const { toast } = useToast();
  const [info, setInfo] = useState({ email: "support@infocrest.in", form_enabled: true });
  const [form, setForm] = useState({
    name: defaultName, email: defaultEmail, message: "", company: "", topic: defaultTopic,
  });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/contact`)
      .then((r) => r.json())
      .then((d) => d?.email && setInfo(d))
      .catch(() => {});
  }, []);

  // Keep prefilled values in step if the parent loads them after the first render.
  useEffect(() => {
    setForm((f) => ({
      ...f,
      name: f.name || defaultName,
      email: f.email || defaultEmail,
    }));
  }, [defaultName, defaultEmail]);

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

  if (sent) {
    return (
      <div className="border rounded-xl p-6 flex items-start gap-3 bg-muted/30">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">Message sent</p>
          <p className="text-sm text-muted-foreground">
            Thanks — we've got it and will reply to {form.email} soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cf-name">Name</Label>
          <Input id="cf-name" value={form.name} onChange={set("name")} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-email">Email</Label>
          <Input id="cf-email" type="email" value={form.email} onChange={set("email")}
                 required disabled={lockEmail} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Topic</Label>
        <Select value={form.topic} onValueChange={set("topic")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {CONTACT_TOPICS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cf-message">Message</Label>
        <Textarea id="cf-message" rows={6} value={form.message} onChange={set("message")}
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
  );
}
