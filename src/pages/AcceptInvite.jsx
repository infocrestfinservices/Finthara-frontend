/**
 * AcceptInvite.jsx — landing page for a team invitation link (/accept-invite?token=…).
 *
 * Public route. If the visitor is signed in, we accept the invite straight away. If not,
 * we ask them to sign in (or sign up) with the address the invite was sent to — a brand
 * new account is also added to the team automatically once its email is verified
 * (backend: team_service.claim_pending_for), so this page mostly matters for people who
 * already have an account.
 */
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Users, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { teamService } from "@/api/teamService";

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth } = useAuth();

  const [state, setState] = useState({ status: "idle", message: "", team: null });

  useEffect(() => {
    if (isLoadingAuth || !token || !isAuthenticated || state.status !== "idle") return;
    setState({ status: "working", message: "", team: null });
    teamService
      .acceptInvite(token)
      .then((m) =>
        setState({
          status: "done",
          team: m.owner_name || m.owner_email,
          message: `You're now a ${m.role} on ${m.owner_name || m.owner_email}'s team.`,
        }))
      .catch((e) => setState({ status: "error", message: e.message, team: null }));
  }, [isAuthenticated, isLoadingAuth, token, state.status]);

  if (!token) {
    return (
      <AuthLayout icon={XCircle} title="Invalid link"
                  subtitle="This invitation link is missing its token.">
        <Button asChild className="w-full"><Link to="/">Go home</Link></Button>
      </AuthLayout>
    );
  }

  if (isLoadingAuth || state.status === "working") {
    return (
      <AuthLayout icon={Users} title="Joining the team…">
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AuthLayout>
    );
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent(`/accept-invite?token=${token}`);
    return (
      <AuthLayout
        icon={Users}
        title="You've been invited to a team"
        subtitle="Sign in with the email address this invite was sent to, then open this link again."
      >
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link to={`/login?next=${next}`}>Sign in</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/register">Create an account</Link>
          </Button>
          <p className="text-xs text-muted-foreground text-center pt-1">
            New here? Sign up with the invited address — you'll be added to the team
            automatically once your email is verified.
          </p>
        </div>
      </AuthLayout>
    );
  }

  if (state.status === "done") {
    return (
      <AuthLayout icon={CheckCircle2} title="You're on the team" subtitle={state.message}>
        <Button className="w-full" onClick={() => navigate("/dashboard")}>
          Go to My Reports
        </Button>
      </AuthLayout>
    );
  }

  if (state.status === "error") {
    return (
      <AuthLayout icon={XCircle} title="Couldn't accept the invitation" subtitle={state.message}>
        <Button asChild variant="outline" className="w-full"><Link to="/profile">Go to your profile</Link></Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon={Users} title="Team invitation">
      <div className="flex justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    </AuthLayout>
  );
}
