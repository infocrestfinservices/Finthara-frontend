import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import PasswordInput from "@/components/PasswordInput";

export default function Login() {
  const { login, completeTwoFactorLogin } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Where to land after login. Only an in-app relative path is honoured, so this can't be
  // turned into an open redirect.
  const nextParam = params.get("next") || "";
  const afterLogin = nextParam.startsWith("/") && !nextParam.startsWith("//")
    ? nextParam : "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Set once login() comes back asking for a second factor instead of a session — see
  // AuthContext.login(). Rendering the code form is what "being on step 2" means here.
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState("");

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await completeTwoFactorLogin(challenge, code);
      window.location.href = afterLogin;
    } catch (err) {
      setError(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  if (challenge) {
    return (
      <AuthLayout
        icon={LogIn}
        title="Enter your code"
        subtitle="Open your authenticator app, or use a backup code"
        footer={
          <button
            type="button"
            className="text-primary font-medium hover:underline"
            onClick={() => { setChallenge(null); setCode(""); setError(""); }}
          >
            Back to login
          </button>
        }
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">6-digit code or backup code</Label>
            <Input
              id="code"
              autoFocus
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-12 text-center text-lg tracking-widest"
              required
            />
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Verify
          </Button>
        </form>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result?.requires_2fa) {
        setChallenge(result.challenge_token);
        setLoading(false);
        return;
      }
      window.location.href = afterLogin;
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("verify your email")) {
        setError(
          <div className="flex flex-col gap-2">
            <span>{err.message}</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-1"
              onClick={(e) => {
                e.preventDefault();
                navigate("/verify-email", { state: { email } });
              }}
            >
              Verify Email Now
            </Button>
          </div>
        );
      } else {
        setError(err.message || "Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in to your Finthara account"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full h-12 font-medium"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}