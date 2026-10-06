/**
 * RolesTab.jsx — who can get into this console.
 *
 * Two roles: `admin` (everything here) and `user` (the normal product, and every /admin
 * address answers 404). Held on the user row as `is_admin`.
 *
 * The confirm step is not politeness. Granting admin hands someone every payment record on
 * the platform and the ability to change anyone's plan, and a role change leaves no trace
 * anywhere the way a payment does — only the server log. A typed reason and a second click
 * are the whole audit trail, so they are asked for.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import { AlertCircle, Loader2, Search, ShieldCheck, User as UserIcon } from "lucide-react";
import { getRoles, setUserRole } from "@/api/adminService";

const when = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN",
    { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function RolesTab({ toast }) {
  const { user: me } = useAuth();
  const [data, setData] = useState(null);
  const [q, setQ] = useState("");
  const [pending, setPending] = useState(null);   // the change awaiting confirmation

  const load = useCallback(async () => {
    setData(null);
    try { setData(await getRoles()); } catch { setData({ roles: [], users: [] }); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const rows = data?.users || [];
    if (!needle) return rows;
    return rows.filter((u) =>
      `${u.email} ${u.full_name || ""}`.toLowerCase().includes(needle));
  }, [data, q]);

  if (!data) {
    return (
      <div className="flex items-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  const lastAdmin = data.admin_count <= 1;
  // Only the super admin may change roles; everyone else sees the list read-only.
  const canManage = Boolean(data.can_manage);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {data.roles.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              {r.id === "admin"
                ? <ShieldCheck className="h-4 w-4 text-amber-400" />
                : <UserIcon className="h-4 w-4 text-muted-foreground" />}
              <span className="font-medium">{r.label}</span>
              <span className="ml-auto text-2xl font-semibold">{r.count}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          An admin sees every user, payment and project, and can change anyone's plan. You
          cannot remove your own admin access, and the last admin cannot be removed at all —
          either would lock everyone out of this console.
        </span>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search email or name…"
               value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {["User", "Role", "Plan", "Joined", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shown.map((u) => {
              const isMe = u.id === me?.id;
              const blocked = u.role === "admin" && (isMe || lastAdmin);
              return (
                <tr key={u.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{u.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {u.full_name || "—"}{isMe ? " · you" : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium ${
                      u.role === "admin"
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-muted text-muted-foreground"}`}>
                      {u.role === "admin" ? <ShieldCheck className="h-3 w-3" /> : null}
                      {u.super_admin ? "super admin" : u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.plan}</td>
                  <td className="px-4 py-3 text-muted-foreground">{when(u.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    {canManage && !u.super_admin ? (
                    <Button
                      size="sm"
                      variant={u.role === "admin" ? "ghost" : "outline"}
                      disabled={blocked}
                      title={blocked
                        ? (isMe ? "You cannot remove your own admin access"
                                : "This is the only admin left")
                        : undefined}
                      onClick={() => setPending({ user: u, makeAdmin: u.role !== "admin" })}
                    >
                      {u.role === "admin" ? "Remove admin" : "Make admin"}
                    </Button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Showing {shown.length} of {data.users.length}. If the last admin is ever lost, access
        can only be restored with <code>python grant_admin.py you@example.com</code> against
        the database.
      </p>

      <ConfirmRole
        pending={pending}
        onClose={() => setPending(null)}
        onDone={(msg) => { toast({ title: "Role updated", description: msg }); load(); }}
      />
    </div>
  );
}

function ConfirmRole({ pending, onClose, onDone }) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { if (pending) { setReason(""); setErr(""); } }, [pending]);

  const go = async () => {
    setSaving(true); setErr("");
    try {
      const r = await setUserRole(pending.user.id, { isAdmin: pending.makeAdmin, reason });
      onDone(`${r.email} is now ${r.role}.`);
      onClose();
    } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  const grant = pending?.makeAdmin;
  return (
    <Dialog open={Boolean(pending)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{grant ? "Make this account an admin?" : "Remove admin access?"}</DialogTitle>
        </DialogHeader>
        {pending ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {grant ? (
                <>
                  <strong className="text-foreground">{pending.user.email}</strong> will be
                  able to see every user, every payment and every project on the platform,
                  and to change anyone's plan and role.
                </>
              ) : (
                <>
                  <strong className="text-foreground">{pending.user.email}</strong> will lose
                  access to this console. Their account and data are untouched.
                </>
              )}
            </p>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input placeholder={grant ? "e.g. joined the support team"
                                        : "e.g. left the company"}
                     value={reason} onChange={(e) => setReason(e.target.value)} />
              <p className="text-xs text-muted-foreground">
                Written to the server log. A role change leaves no other record.
              </p>
            </div>
            {err ? <p className="text-sm text-destructive">{err}</p> : null}
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={go} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {grant ? "Make admin" : "Remove admin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
