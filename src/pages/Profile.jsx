/**
 * Profile.jsx — the customer's own account: basic info, plan & usage, their reports,
 * billing, and settings (password, notifications, theme, 2FA, delete account).
 *
 * Plan/billing numbers come from GET /payments/me (the same call Account.jsx makes) rather
 * than a duplicate endpoint — that route is already the single source of truth for what a
 * plan allows and what has been paid. "My Reports" reuses ReportCard/reportStorage from
 * Dashboard.jsx for the same reason: one place that knows how to list and render a report.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { LandingNavbar, LandingFooter } from "@/components/landing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  User, Users, CreditCard, FileText, Receipt, Settings as SettingsIcon, Loader2, Camera,
  Mail, CheckCircle2, Pencil, Shield, ShieldCheck, ShieldOff, Sun, Moon, Monitor,
  LogOut, Trash2, Search, Plus, ExternalLink, Copy, Check, KeyRound,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { profileService } from "@/api/profileService";
import { getMyPlan } from "@/api/paymentService";
import { reportStorage } from "@/api/localStorageService";
import ReportCard from "@/components/report/ReportCard";
import TeamTab from "@/components/profile/TeamTab";

const day = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function Profile() {
  const { toast } = useToast();
  const { user, logout, checkUserAuth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const p = await profileService.getProfile();
      setProfile(p);
    } catch (e) {
      toast({ title: "Could not load profile", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  // Called by child tabs after a change that the rest of the page (or the navbar/session)
  // should also reflect — re-fetches this page's copy and the session's.
  const refresh = useCallback(async () => {
    await load();
    checkUserAuth();
  }, [load, checkUserAuth]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-heading font-bold">Your profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account, plan, reports and settings.
        </p>

        {loading || !profile ? (
          <div className="flex items-center gap-2 py-24 justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading…
          </div>
        ) : (
          <Tabs defaultValue="basic" className="mt-8">
            <TabsList className="flex w-full overflow-x-auto no-scrollbar h-auto gap-1 bg-muted/40 p-1 justify-start">
              <TabsTrigger value="basic" className="gap-1.5 text-xs sm:text-sm py-2 shrink-0 whitespace-nowrap">
                <User className="w-3.5 h-3.5" /> Basic Info
              </TabsTrigger>
              <TabsTrigger value="plan" className="gap-1.5 text-xs sm:text-sm py-2 shrink-0 whitespace-nowrap">
                <CreditCard className="w-3.5 h-3.5" /> Plan
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-1.5 text-xs sm:text-sm py-2 shrink-0 whitespace-nowrap">
                <FileText className="w-3.5 h-3.5" /> My Reports
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-1.5 text-xs sm:text-sm py-2 shrink-0 whitespace-nowrap">
                <Receipt className="w-3.5 h-3.5" /> Billing
              </TabsTrigger>
              <TabsTrigger value="team" className="gap-1.5 text-xs sm:text-sm py-2 shrink-0 whitespace-nowrap">
                <Users className="w-3.5 h-3.5" /> Team
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1.5 text-xs sm:text-sm py-2 shrink-0 whitespace-nowrap">
                <SettingsIcon className="w-3.5 h-3.5" /> Settings
              </TabsTrigger>
              {profile.is_admin && (
                <TabsTrigger value="admin" className="gap-1.5 text-xs sm:text-sm py-2 shrink-0 whitespace-nowrap">
                  <Shield className="w-3.5 h-3.5" /> Admin
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="basic" className="mt-6">
              <BasicInfoTab profile={profile} onChange={refresh} />
            </TabsContent>
            <TabsContent value="plan" className="mt-6">
              <PlanTab />
            </TabsContent>
            <TabsContent value="reports" className="mt-6">
              <MyReportsTab />
            </TabsContent>
            <TabsContent value="billing" className="mt-6">
              <BillingTab />
            </TabsContent>
            <TabsContent value="team" className="mt-6">
              <TeamTab />
            </TabsContent>
            <TabsContent value="settings" className="mt-6">
              <SettingsTab profile={profile} onChange={refresh} logout={logout} />
            </TabsContent>
            {profile.is_admin && (
              <TabsContent value="admin" className="mt-6">
                <AdminTab />
              </TabsContent>
            )}
          </Tabs>
        )}
      </main>
      <LandingFooter />
    </div>
  );
}

/* ───────────────────────── 1. Basic Info ───────────────────────── */

function BasicInfoTab({ profile, onChange }) {
  const { toast } = useToast();
  const fileRef = useRef(null);
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [saving, setSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const dirty = fullName !== (profile.full_name || "") || phone !== (profile.phone || "");

  const saveBasics = async () => {
    setSaving(true);
    try {
      await profileService.updateBasicInfo({ full_name: fullName, phone });
      toast({ title: "Saved" });
      onChange();
    } catch (e) {
      toast({ title: "Could not save", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const onPickAvatar = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 500 * 1024) {
      toast({ title: "Image too large", description: "Please choose one under 500 KB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      setAvatarBusy(true);
      try {
        await profileService.uploadAvatar(reader.result);
        toast({ title: "Photo updated" });
        onChange();
      } catch (err) {
        toast({ title: "Upload failed", description: err.message, variant: "destructive" });
      } finally {
        setAvatarBusy(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = async () => {
    setAvatarBusy(true);
    try {
      await profileService.removeAvatar();
      onChange();
    } catch (err) {
      toast({ title: "Could not remove photo", description: err.message, variant: "destructive" });
    } finally {
      setAvatarBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-xl p-5 flex items-center gap-5">
        <div className="relative">
          <Avatar className="w-16 h-16">
            <AvatarImage src={profile.avatar_url} alt={profile.full_name || profile.email} />
            <AvatarFallback className="text-lg">
              {(profile.full_name || profile.email || "?").slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={avatarBusy}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow"
            aria-label="Change photo"
          >
            {avatarBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
        </div>
        <div>
          <p className="font-medium">{profile.full_name || "Add your name"}</p>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          {profile.avatar_url && (
            <button onClick={removeAvatar} className="text-xs text-destructive hover:underline mt-1">
              Remove photo
            </button>
          )}
        </div>
      </div>

      <div className="border rounded-xl p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Name</Label>
          <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <div className="flex items-center gap-2">
            <Input value={profile.email} disabled className="bg-muted/40" />
            {profile.is_verified && (
              <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            )}
            <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => setEmailOpen(true)}>
              <Pencil className="w-3.5 h-3.5" /> Change
            </Button>
          </div>
          {profile.pending_email && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Verification pending for {profile.pending_email}.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
        </div>

        <div className="flex justify-end">
          <Button onClick={saveBasics} disabled={!dirty || saving} className="gap-1.5">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save changes
          </Button>
        </div>
      </div>

      <ChangeEmailDialog open={emailOpen} onOpenChange={setEmailOpen}
                         profile={profile} onDone={onChange} />
    </div>
  );
}

function ChangeEmailDialog({ open, onOpenChange, profile, onDone }) {
  const { toast } = useToast();
  const [step, setStep] = useState("request"); // "request" | "verify"
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [devOtp, setDevOtp] = useState(null);

  useEffect(() => {
    if (open) {
      setStep(profile.pending_email ? "verify" : "request");
      setNewEmail(""); setPassword(""); setOtp(""); setDevOtp(null);
    }
  }, [open, profile.pending_email]);

  const requestChange = async () => {
    setBusy(true);
    try {
      const res = await profileService.requestEmailChange(newEmail, password);
      setDevOtp(res.dev_otp || null);
      setStep("verify");
      toast({ title: "Code sent", description: res.message });
    } catch (e) {
      toast({ title: "Could not start email change", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    try {
      await profileService.verifyEmailChange(otp);
      toast({ title: "Email updated" });
      onOpenChange(false);
      onDone();
    } catch (e) {
      toast({ title: "Could not verify", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const cancelPending = async () => {
    setBusy(true);
    try {
      await profileService.cancelEmailChange();
      onOpenChange(false);
      onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change email address</DialogTitle>
          <DialogDescription>
            {step === "request"
              ? "Your login email stays the same until the new one is verified."
              : `Enter the code sent to ${profile.pending_email || newEmail}.`}
          </DialogDescription>
        </DialogHeader>

        {step === "request" ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="new_email">New email</Label>
              <Input id="new_email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm_pw">Current password</Label>
              <Input id="confirm_pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email_otp">Verification code</Label>
              <Input id="email_otp" value={otp} onChange={(e) => setOtp(e.target.value)}
                     placeholder="123456" className="text-center tracking-widest" />
            </div>
            {devOtp && (
              <p className="text-xs text-muted-foreground">
                Email sending isn't configured — use this code: <span className="font-mono">{devOtp}</span>
              </p>
            )}
            <button onClick={cancelPending} disabled={busy} className="text-xs text-muted-foreground hover:underline">
              Cancel this change
            </button>
          </div>
        )}

        <DialogFooter>
          {step === "request" ? (
            <Button onClick={requestChange} disabled={busy || !newEmail || !password} className="gap-1.5">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Send code
            </Button>
          ) : (
            <Button onClick={verify} disabled={busy || !otp} className="gap-1.5">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Verify
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────────────────────── 2. Plan & Usage ───────────────────────── */

function PlanTab() {
  const [plan, setPlan] = useState(null);
  useEffect(() => { getMyPlan().then(setPlan); }, []);

  if (!plan) {
    return <div className="flex items-center gap-2 py-16 justify-center text-muted-foreground">
      <Loader2 className="w-4 h-4 animate-spin" /> Loading…
    </div>;
  }

  const used = plan.reports_used;

  return (
    <div className="space-y-4">
      <div className="border rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Current plan</p>
            <p className="text-xl font-semibold mt-0.5">{plan.label}</p>
            {plan.expires_at && (
              <p className="text-sm text-muted-foreground mt-1">Renews {day(plan.expires_at)}</p>
            )}
          </div>
          <Button asChild className="gap-1.5">
            <Link to="/pricing">Upgrade <ExternalLink className="w-3.5 h-3.5" /></Link>
          </Button>
        </div>

        <div className="mt-5 pt-4 border-t">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            Usage {plan.reports_limit !== null ? "this cycle" : ""}
          </p>
          {plan.reports_limit === null ? (
            <p className="text-sm">Unlimited reports</p>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span>{used} of {plan.reports_limit} reports used</span>
                <span className="text-muted-foreground">{plan.reports_left} left</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all"
                     style={{ width: `${Math.min(100, (used / plan.reports_limit) * 100)}%` }} />
              </div>
            </>
          )}
        </div>

        {plan.exports?.length ? (
          <div className="mt-5 pt-4 border-t">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Exports included</p>
            <div className="flex gap-1.5">
              {plan.exports.map((f) => (
                <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium uppercase">
                  {f}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ───────────────────────── 3. My Reports ───────────────────────── */

function MyReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    reportStorage.list("-created_date", 100).then(setReports).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    await reportStorage.delete(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const filtered = reports.filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [r.title, r.industry, r.country].filter(Boolean).join(" ").toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)}
                 placeholder="Search by name or industry…" className="pl-9" />
        </div>
        <Link to="/create">
          <Button className="gap-1.5 shrink-0"><Plus className="w-4 h-4" /> New</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed rounded-xl p-10 text-center text-muted-foreground text-sm">
          {reports.length === 0 ? "No reports yet." : `Nothing matched "${query}".`}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((r) => <ReportCard key={r.id} report={r} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── 4. Billing ───────────────────────── */

function BillingTab() {
  const [plan, setPlan] = useState(null);
  useEffect(() => { getMyPlan().then(setPlan); }, []);

  return (
    <div className="space-y-4">
      <div className="border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Receipt className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold">Invoices</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Every invoice we've issued you, with PDF downloads, lives on the Account page.
        </p>
        <Button asChild variant="outline" className="gap-1.5">
          <Link to="/account">Open invoice history <ExternalLink className="w-3.5 h-3.5" /></Link>
        </Button>
      </div>

      <div className="border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold">Payment method</h3>
        </div>
        {plan?.subscription ? (
          <div className="text-sm space-y-1">
            <p>
              Auto-pay via Razorpay is <strong>{plan.subscription.auto_pay ? "on" : "off"}</strong>
              {plan.subscription.next_charge_at ? ` · next charge ${day(plan.subscription.next_charge_at)}` : ""}
            </p>
            <p className="text-muted-foreground text-xs">
              Card/UPI details are held by Razorpay directly — we never see or store them.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No saved payment method. Card/UPI details are handled entirely by Razorpay at
            checkout and are never stored on our servers.
          </p>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Admin (staff only) ───────────────────────── */

function AdminTab() {
  return (
    <div className="border rounded-xl p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-primary/10">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm">Admin panel</p>
          <p className="text-xs text-muted-foreground">
            Users, plans, coupons and the rest of the staff console.
          </p>
        </div>
      </div>
      <Button asChild className="gap-1.5 shrink-0">
        <Link to="/admin">Open <ExternalLink className="w-3.5 h-3.5" /></Link>
      </Button>
    </div>
  );
}

/* ───────────────────────── 5. Settings ───────────────────────── */

function SettingsTab({ profile, onChange, logout }) {
  return (
    <div className="space-y-4">
      <PasswordCard />
      <NotificationsCard profile={profile} onChange={onChange} />
      <ThemeCard profile={profile} onChange={onChange} />
      <TwoFactorCard profile={profile} onChange={onChange} />
      <div className="border rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">Log out</p>
          <p className="text-xs text-muted-foreground">End your session on this device.</p>
        </div>
        <Button variant="outline" className="gap-1.5" onClick={() => logout("/login")}>
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>
      <DeleteAccountCard logout={logout} />
    </div>
  );
}

function PasswordCard() {
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await profileService.changePassword(current, next);
      toast({ title: "Password updated" });
      setCurrent(""); setNext("");
    } catch (e) {
      toast({ title: "Could not change password", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <KeyRound className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Change password</h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <Input type="password" placeholder="Current password" value={current}
               onChange={(e) => setCurrent(e.target.value)} />
        <Input type="password" placeholder="New password (min 8 characters)" value={next}
               onChange={(e) => setNext(e.target.value)} />
      </div>
      <Button size="sm" onClick={submit} disabled={busy || !current || !next} className="gap-1.5">
        {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Update password
      </Button>
    </div>
  );
}

function NotificationsCard({ profile, onChange }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const toggle = async (checked) => {
    setBusy(true);
    try {
      await profileService.updateNotifications(checked);
      onChange();
    } catch (e) {
      toast({ title: "Could not save", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border rounded-xl p-5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Mail className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="font-medium text-sm">Email notifications</p>
          <p className="text-xs text-muted-foreground">Report-ready and account emails.</p>
        </div>
      </div>
      <Switch checked={profile.notify_email} disabled={busy} onCheckedChange={toggle} />
    </div>
  );
}

function ThemeCard({ profile, onChange }) {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [busy, setBusy] = useState(false);

  const choose = async (value) => {
    setTheme(value);       // applies immediately, this browser
    setBusy(true);
    try {
      await profileService.updateTheme(value);  // persists to the account, every device
      onChange();
    } catch (e) {
      toast({ title: "Could not save preference", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];
  const active = theme || profile.theme_preference || "system";

  return (
    <div className="border rounded-xl p-5">
      <p className="font-medium text-sm mb-3">Appearance</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => (
          <button key={o.value} disabled={busy} onClick={() => choose(o.value)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border text-xs font-medium transition-colors ${
                    active === o.value ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted/50"
                  }`}>
            <o.icon className="w-4 h-4" /> {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TwoFactorCard({ profile, onChange }) {
  const { toast } = useToast();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);

  return (
    <div className="border rounded-xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {profile.totp_enabled ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <Shield className="w-4 h-4 text-muted-foreground" />}
          <div>
            <p className="font-medium text-sm">Two-factor authentication</p>
            <p className="text-xs text-muted-foreground">
              {profile.totp_enabled ? "Enabled — an authenticator app is required at login." : "Off. Add an authenticator app for extra security."}
            </p>
          </div>
        </div>
        {profile.totp_enabled ? (
          <Button variant="outline" size="sm" className="gap-1.5 text-destructive" onClick={() => setDisableOpen(true)}>
            <ShieldOff className="w-3.5 h-3.5" /> Disable
          </Button>
        ) : (
          <Button size="sm" onClick={() => setWizardOpen(true)}>Enable</Button>
        )}
      </div>

      <TwoFactorSetupDialog open={wizardOpen} onOpenChange={setWizardOpen} onDone={onChange} />
      <TwoFactorDisableDialog open={disableOpen} onOpenChange={setDisableOpen} onDone={onChange} />
    </div>
  );
}

function TwoFactorSetupDialog({ open, onOpenChange, onDone }) {
  const { toast } = useToast();
  const [step, setStep] = useState("qr"); // "qr" | "codes"
  const [setup, setSetup] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep("qr"); setCode(""); setConfirm(null); setCopied(false);
    profileService.setup2FA()
      .then(setSetup)
      .catch((e) => toast({ title: "Could not start setup", description: e.message, variant: "destructive" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const verify = async () => {
    setBusy(true);
    try {
      const res = await profileService.confirm2FA(code);
      setConfirm(res);
      setStep("codes");
    } catch (e) {
      toast({ title: "Incorrect code", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const finish = () => {
    onOpenChange(false);
    onDone();
    toast({ title: "Two-factor authentication enabled" });
  };

  const copyCodes = () => {
    navigator.clipboard?.writeText(confirm.backup_codes.join("\n"));
    setCopied(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{step === "qr" ? "Scan with your authenticator app" : "Save your backup codes"}</DialogTitle>
          <DialogDescription>
            {step === "qr"
              ? "Google Authenticator, Authy, 1Password, etc. Then enter the 6-digit code it shows."
              : "Each code works once, if you ever lose access to your authenticator app. Store them somewhere safe."}
          </DialogDescription>
        </DialogHeader>

        {step === "qr" ? (
          !setup ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : (
            <div className="space-y-3">
              <img src={setup.qr_code} alt="Scan this QR code" className="mx-auto rounded-lg border" />
              <p className="text-xs text-center text-muted-foreground">
                Can't scan? Enter this key manually: <span className="font-mono">{setup.secret}</span>
              </p>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456"
                     className="text-center tracking-widest" autoFocus />
            </div>
          )
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 font-mono text-sm bg-muted/40 rounded-lg p-3">
              {confirm?.backup_codes.map((c) => <span key={c}>{c}</span>)}
            </div>
            <Button variant="outline" size="sm" onClick={copyCodes} className="gap-1.5 w-full">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy codes"}
            </Button>
          </div>
        )}

        <DialogFooter>
          {step === "qr" ? (
            <Button onClick={verify} disabled={busy || !code || !setup} className="gap-1.5 w-full">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Verify & enable
            </Button>
          ) : (
            <Button onClick={finish} className="w-full">Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TwoFactorDisableDialog({ open, onOpenChange, onDone }) {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await profileService.disable2FA(password);
      onOpenChange(false);
      onDone();
      toast({ title: "Two-factor authentication disabled" });
    } catch (e) {
      toast({ title: "Could not disable", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
      setPassword("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Disable two-factor authentication</DialogTitle>
          <DialogDescription>Confirm your password to turn this off.</DialogDescription>
        </DialogHeader>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
               placeholder="Current password" autoFocus />
        <DialogFooter>
          <Button variant="destructive" onClick={submit} disabled={busy || !password} className="gap-1.5 w-full">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Disable
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAccountCard({ logout }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await profileService.deleteAccount(password);
      logout("/login");
    } catch (e) {
      toast({ title: "Could not delete account", description: e.message, variant: "destructive" });
      setBusy(false);
    }
  };

  return (
    <div className="border border-destructive/30 rounded-xl p-5 flex items-center justify-between">
      <div>
        <p className="font-medium text-sm text-destructive">Delete account</p>
        <p className="text-xs text-muted-foreground">Deactivates your account. Your reports and invoices are kept for our records.</p>
      </div>
      <Button variant="destructive" className="gap-1.5 shrink-0" onClick={() => setOpen(true)}>
        <Trash2 className="w-4 h-4" /> Delete
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This can't be undone from the app. Confirm your password to continue.
            </DialogDescription>
          </DialogHeader>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                 placeholder="Current password" autoFocus />
          <DialogFooter>
            <Button variant="destructive" onClick={submit} disabled={busy || !password} className="gap-1.5 w-full">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Permanently delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
