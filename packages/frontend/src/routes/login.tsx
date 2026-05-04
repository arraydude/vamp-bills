import { createRoute, redirect, useNavigate } from "@tanstack/react-router";
import { LoginForm } from "@workspace/ui/components/login-form";
import { z } from "zod";

import { useAuth } from "@/lib/use-auth.ts";
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
  const { signIn, signInWithGoogle, isTransitioning, error } = useAuth();
  const target = sanitizeRedirect(redirectParam);

  const handleSubmit = async (data: { email: string; password: string }) => {
    const { ok } = await signIn(data);
    if (ok) navigate({ to: target });
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm
          onSubmit={handleSubmit}
          onGoogleSignIn={() => signInWithGoogle({ callbackURL: target })}
          isPending={isTransitioning}
          error={error}
        />
      </div>
    </div>
  );
}
