import { createRoute, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { LoginForm } from "@workspace/ui/components/login-form";
import { useEffect, useState } from "react";
import { z } from "zod";

import { authClient } from "@/lib/auth-client.ts";
import { rootRoute } from "@/routes/root.tsx";

function sanitizeRedirect(value: string | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/bills";
  return value;
}

const loginSearchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
});

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: (search): z.output<typeof loginSearchSchema> => loginSearchSchema.parse(search),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isPending) return;
    if (context.auth.data) {
      throw redirect({ to: sanitizeRedirect(search.redirect) });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const { redirect: redirectParam } = loginRoute.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const target = sanitizeRedirect(redirectParam);

  useEffect(() => {
    if (authSuccess && session) {
      router.invalidate().then(() => {
        navigate({ to: target });
      });
    }
  }, [authSuccess, session, router, navigate, target]);

  const handleSubmit = async (data: { email: string; password: string }) => {
    setError(null);
    setIsPending(true);
    try {
      const { error: signInError } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });
      if (signInError) {
        setError(signInError.message ?? "Sign in failed");
        setIsPending(false);
        return;
      }
      setAuthSuccess(true);
    } catch {
      setError("An unexpected error occurred");
      setIsPending(false);
    }
  };

  const handleGoogleSignIn = () => {
    authClient.signIn.social({ provider: "google", callbackURL: target });
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm
          onSubmit={handleSubmit}
          onGoogleSignIn={handleGoogleSignIn}
          isPending={isPending}
          error={error}
        />
      </div>
    </div>
  );
}
