import { createRoute, redirect, useNavigate } from "@tanstack/react-router";
import { LoginForm } from "@workspace/ui/components/login-form";
import { useState } from "react";
import { z } from "zod";

import { authClient } from "@/lib/auth-client.ts";
import { rootRoute } from "@/routes/root.tsx";

function sanitizeRedirect(value: string | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/bills";
  return value;
}

const loginSearchSchema = z.object({
  mode: z.enum(["login", "signup"]).optional().catch(undefined),
  redirect: z.string().optional().catch(undefined),
});

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: (search): z.output<typeof loginSearchSchema> => loginSearchSchema.parse(search),
  beforeLoad: async ({ context, search }) => {
    const target = sanitizeRedirect(search.redirect);
    let authenticated = !!context.auth.data;
    if (!authenticated) {
      const { data } = await authClient.getSession();
      authenticated = !!data;
    }
    if (authenticated) {
      throw redirect({ to: target });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const { mode = "login", redirect: redirectParam } = loginRoute.useSearch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const target = sanitizeRedirect(redirectParam);

  const handleSubmit = async (data: { email: string; password: string; name?: string }) => {
    setError(null);
    setIsPending(true);
    try {
      if (mode === "signup") {
        const { error: signUpError } = await authClient.signUp.email({
          name: data.name ?? "",
          email: data.email,
          password: data.password,
        });
        if (signUpError) {
          setError(signUpError.message ?? "Sign up failed");
          return;
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email: data.email,
          password: data.password,
        });
        if (signInError) {
          setError(signInError.message ?? "Sign in failed");
          return;
        }
      }
      window.location.href = target;
      return;
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  const handleGoogleSignIn = () => {
    authClient.signIn.social({ provider: "google", callbackURL: target });
  };

  const handleModeChange = (newMode: "login" | "signup") => {
    setError(null);
    navigate({ to: "/login", search: { mode: newMode, redirect: redirectParam } });
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm
          mode={mode}
          onSubmit={handleSubmit}
          onGoogleSignIn={handleGoogleSignIn}
          onModeChange={handleModeChange}
          isPending={isPending}
          error={error}
        />
      </div>
    </div>
  );
}
