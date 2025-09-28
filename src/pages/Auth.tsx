import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Video, User, Mail, Lock } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

type AuthMode = "signin" | "signup" | "forgot" | "reset";

export const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const showError = (msg: string) =>
    toast({ title: "Error", description: msg, variant: "destructive" });

  const showSuccess = (msg: string) =>
    toast({ title: "Success", description: msg });

  // Handle recovery links
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");

    if (type === "recovery" && accessToken) {
      setMode("reset");
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user && mode !== "reset") {
        navigate("/", { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user && mode !== "reset") {
        navigate("/", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, mode]);

  // === Supabase helpers ===
  const signUp = (email: string, password: string) =>
    supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password });

  const forgotPassword = (email: string) =>
    supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth` });

  const resetPassword = (password: string) =>
    supabase.auth.updateUser({ password });

  // === Submit ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "reset") {
        if (!password || password !== confirmPassword) {
          showError("Passwords must match and not be empty");
          return;
        }
        if (password.length < 6) {
          showError("Password must be at least 6 characters long");
          return;
        }
        const { error } = await resetPassword(password);
        if (error) return showError(error.message);

        showSuccess("Password updated successfully. Please sign in.");
        setMode("signin");
        setPassword("");
        setConfirmPassword("");
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }

      if (mode === "forgot") {
        if (!email) return showError("Please enter your email");
        const { error } = await forgotPassword(email);
        if (error) return showError(error.message);

        showSuccess("Check your email for a password reset link");
        setMode("signin");
        return;
      }

      if (!email || !password) return showError("Please fill in all fields");

      if (mode === "signup") {
        const { error } = await signUp(email, password);
        if (error) return showError(error.message);
        showSuccess("Check your email for the confirmation link");
      } else {
        const { error } = await signIn(email, password);
        if (error) return showError(error.message);
      }
    } catch {
      showError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // === Dynamic labels ===
  const titles: Record<AuthMode, string> = {
    signin: "Sign In",
    signup: "Sign Up",
    forgot: "Reset Password",
    reset: "Set New Password",
  };

  const descriptions: Record<AuthMode, string> = {
    signin: "Enter your credentials to access your account",
    signup: "Enter your details to create a new account",
    forgot: "Enter your email to receive a password reset link",
    reset: "Enter your new password and confirm it",
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Video className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold">EchoMind Meetings</h1>
          <p className="text-muted-foreground">{descriptions[mode]}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              {titles[mode]}
            </CardTitle>
            <CardDescription>{descriptions[mode]}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode !== "reset" && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              {(mode === "signin" || mode === "signup" || mode === "reset") && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center">
                    <Lock className="w-4 h-4 mr-2" /> Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === "reset" ? "new-password" : "current-password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              )}

              {mode === "reset" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center">
                    <Lock className="w-4 h-4 mr-2" /> Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Loading..." : titles[mode]}
              </Button>
            </form>

            <div className="mt-4 text-center space-y-2">
              {mode === "signin" && (
                <>
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-sm text-primary hover:underline block"
                  >
                    Don&apos;t have an account? Sign up
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-sm text-muted-foreground hover:text-primary hover:underline block"
                  >
                    Forgot your password?
                  </button>
                </>
              )}

              {mode === "signup" && (
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-sm text-primary hover:underline block"
                >
                  Already have an account? Sign in
                </button>
              )}

              {mode === "forgot" && (
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-sm text-primary hover:underline block"
                >
                  Back to sign in
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
