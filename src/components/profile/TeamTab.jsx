/**
 * TeamTab.jsx — the "Team" tab inside Profile.jsx.
 *
 * Owner view  : invite people, set each member's role (viewer / editor), remove them,
 *               see pending invites and a short activity log. Gated to Professional /
 *               Enterprise (team_enabled from the backend); other plans see an upsell.
 * Member view : the teams this account belongs to, with the option to leave.
 *
 * "owner" is not an assignable role — it is the account holder. A member is viewer or
 * editor:
 *   viewer — open the team's projects, view and download their reports
 *   editor — the above, plus create / edit / generate
 */
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, UserPlus, Trash2, Loader2, Crown, Eye, Pencil, Clock, LogOut, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { teamService } from "@/api/teamService";

const roleIcon = { viewer: Eye, editor: Pencil, owner: Crown };

function RoleBadge({ role }) {
  const Icon = roleIcon[role] || Eye;
  return (
    <Badge variant={role === "owner" ? "default" : "secondary"} className="gap-1 capitalize">
      <Icon className="w-3 h-3" /> {role}
    </Badge>
  );
}

const when = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

export default function TeamTab() {
  const { toast } = useToast();
  const [team, setTeam] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [t, m] = await Promise.all([
        teamService.getMyTeam(),
        teamService.getMemberships().catch(() => []),
      ]);
      setTeam(t);
      setMemberships(m);
      if (t?.can_manage) {
        teamService.getAudit(30).then(setAudit).catch(() => {});
      }
    } catch (e) {
      toast({ title: "Could not load your team", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {team?.team_enabled
        ? <OwnerTeamCard team={team} audit={audit} onChange={load} />
        : <UpsellCard planLabel={team?.plan_label} />}
      <MembershipsCard memberships={memberships} onChange={load} />
    </div>
  );
}

/* ─────────────────────────── owner: manage your team ─────────────────────────── */

function OwnerTeamCard({ team, audit, onChange }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [busy, setBusy] = useState(false);
  const seatsFull = team.seats_used >= team.seats_limit;

  const invite = async () => {
    if (!email.trim()) return;
    setBusy(true);
    try {
      const res = await teamService.invite(email.trim(), role);
      if (res.accept_token) {
        toast({
          title: "Invite created",
          description: "Email isn't set up here — share this link: " +
            `${window.location.origin}/accept-invite?token=${res.accept_token}`,
        });
      } else {
        toast({ title: "Invitation sent", description: `We emailed ${email.trim()}.` });
      }
      setEmail("");
      onChange();
    } catch (e) {
      toast({ title: "Could not send the invite", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="border rounded-xl p-5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Your team</h3>
          </div>
          <Badge variant="outline">
            {team.seats_used} / {team.seats_limit} seats · {team.plan_label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          People you add share your plan and your projects. A <strong>viewer</strong> can open
          and download reports; an <strong>editor</strong> can also create and generate them.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 mb-5">
          <Input
            type="email" placeholder="teammate@company.com" value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && invite()}
            disabled={seatsFull}
          />
          <Select value={role} onValueChange={setRole} disabled={seatsFull}>
            <SelectTrigger className="sm:w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={invite} disabled={busy || seatsFull} className="gap-1.5 shrink-0">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Invite
          </Button>
        </div>
        {seatsFull && (
          <p className="text-xs text-amber-600 dark:text-amber-500 -mt-3 mb-4">
            All seats are taken. Remove a member or upgrade your plan to add more.
          </p>
        )}

        <div className="divide-y">
          <MemberRow member={{ role: "owner", email: "You", full_name: null, is_owner: true }} isSelf />
          {team.members.map((m) => (
            <MemberRow key={m.user_id} member={m} onChange={onChange} />
          ))}
        </div>

        {team.pending_invites.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Pending invitations</p>
            <div className="divide-y">
              {team.pending_invites.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm truncate">{inv.email}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> invited as {inv.role} · expires {when(inv.expires_at)}
                    </p>
                  </div>
                  <Button
                    variant="ghost" size="sm" className="text-destructive shrink-0"
                    onClick={async () => {
                      try { await teamService.revokeInvite(inv.id); onChange(); }
                      catch (e) { toast({ title: e.message, variant: "destructive" }); }
                    }}
                  >
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {audit.length > 0 && (
        <div className="border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Recent activity</h3>
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {audit.map((a) => (
              <li key={a.id} className="flex items-baseline gap-2">
                <span className="text-muted-foreground/60 tabular-nums shrink-0">{when(a.created_at)}</span>
                <span>
                  <span className="text-foreground">{a.action.replace(/[._]/g, " ")}</span>
                  {a.target ? ` — ${a.target}` : ""}
                  {a.actor ? ` (by ${a.actor})` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function MemberRow({ member, isSelf, onChange }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const changeRole = async (newRole) => {
    setBusy(true);
    try { await teamService.setRole(member.user_id, newRole); onChange(); }
    catch (e) { toast({ title: e.message, variant: "destructive" }); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await teamService.removeMember(member.user_id); onChange(); }
    catch (e) { toast({ title: e.message, variant: "destructive" }); }
    finally { setBusy(false); }
  };

  return (
    <div className="flex items-center justify-between py-3 gap-3">
      <div className="min-w-0">
        <p className="text-sm truncate">
          {member.full_name || member.email}
          {isSelf && <span className="text-muted-foreground"> (you)</span>}
        </p>
        {member.full_name && !isSelf && (
          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isSelf ? (
          <RoleBadge role="owner" />
        ) : (
          <>
            <Select value={member.role} onValueChange={changeRole} disabled={busy}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                    onClick={remove} disabled={busy}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function UpsellCard({ planLabel }) {
  return (
    <div className="border rounded-xl p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-primary/10">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm">Team seats</p>
          <p className="text-xs text-muted-foreground">
            Invite colleagues to share your projects. Available on Professional and Enterprise
            {planLabel ? ` — you're on ${planLabel}.` : "."}
          </p>
        </div>
      </div>
      <Button asChild className="shrink-0"><Link to="/pricing">See plans</Link></Button>
    </div>
  );
}

/* ─────────────────────────── member: teams you belong to ─────────────────────────── */

function MembershipsCard({ memberships, onChange }) {
  const { toast } = useToast();
  if (!memberships.length) return null;

  return (
    <div className="border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Teams you're in</h3>
      </div>
      <div className="divide-y">
        {memberships.map((m) => (
          <div key={m.owner_user_id} className="flex items-center justify-between py-3 gap-3">
            <div className="min-w-0">
              <p className="text-sm truncate">{m.owner_name || m.owner_email}</p>
              <p className="text-xs text-muted-foreground truncate">{m.owner_email}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <RoleBadge role={m.role} />
              <Button
                variant="ghost" size="sm" className="gap-1.5"
                onClick={async () => {
                  try { await teamService.leaveTeam(m.owner_user_id); onChange(); toast({ title: "You left the team" }); }
                  catch (e) { toast({ title: e.message, variant: "destructive" }); }
                }}
              >
                <LogOut className="w-3.5 h-3.5" /> Leave
              </Button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Projects shared with you show up under <Link to="/dashboard" className="underline">My Reports</Link>.
      </p>
    </div>
  );
}
