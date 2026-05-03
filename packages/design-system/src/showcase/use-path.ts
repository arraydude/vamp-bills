import { useCallback, useEffect, useState } from "react";

// Minimal pathname-only router for the showcase. Two routes (/, /login) don't
// justify pulling in TanStack Router. Vite's dev server already falls back to
// index.html on unknown paths so deep links work.
export function usePath() {
  const [path, setPath] = useState<string>(() =>
    typeof window === "undefined" ? "/" : window.location.pathname,
  );

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((to: string) => {
    if (window.location.pathname === to) return;
    window.history.pushState({}, "", to);
    setPath(to);
  }, []);

  return { path, navigate };
}
