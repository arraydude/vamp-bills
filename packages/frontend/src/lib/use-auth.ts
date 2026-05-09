import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client.ts";

type Intent = "sign-in" | "sign-out" | null;

export function useAuth() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [intent, setIntent] = useState<Intent>(null);
  const [error, setError] = useState<string | null>(null);
  const resolveRef = useRef<(() => void) | null>(null);

  // Once the nanostore reflects the expected post-transition state, invalidate
  // the router so beforeLoad guards re-evaluate against the fresh context.
  useEffect(() => {
    if (!intent) return;
    const settled = intent === "sign-in" ? !!session : !session;
    if (!settled) return;
    router.invalidate().finally(() => {
      resolveRef.current?.();
      resolveRef.current = null;
      setIntent(null);
    });
  }, [intent, session, router]);

  const signIn = async (input: { email: string; password: string }): Promise<{ ok: boolean }> => {
    setError(null);
    setIntent("sign-in");
    const { error: signInError } = await authClient.signIn.email(input);
    if (signInError) {
      setError(signInError.message ?? "Sign in failed");
      setIntent(null);
      return { ok: false };
    }
    await new Promise<void>((resolve) => {
      resolveRef.current = resolve;
    });
    return { ok: true };
  };

  const signOut = async (): Promise<void> => {
    setIntent("sign-out");
    await authClient.signOut();
    await new Promise<void>((resolve) => {
      resolveRef.current = resolve;
    });
  };

  const signUp = async (input: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ ok: boolean }> => {
    setError(null);
    setIntent("sign-in");
    const { error: signUpError } = await authClient.signUp.email(input);
    if (signUpError) {
      setError(signUpError.message ?? "Sign up failed");
      setIntent(null);
      return { ok: false };
    }
    await new Promise<void>((resolve) => {
      resolveRef.current = resolve;
    });
    return { ok: true };
  };

  const signInWithGoogle = (opts: { callbackURL?: string } = {}) =>
    authClient.signIn.social({ provider: "google", ...opts });

  return {
    session,
    sessionLoading,
    isTransitioning: intent !== null,
    error,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };
}
