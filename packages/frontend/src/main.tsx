import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@workspace/ui/globals.css";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { authClient } from "@/lib/auth-client.ts";
import { queryClient } from "@/lib/query-client.ts";
import { TRPCProvider } from "@/lib/trpc.ts";
import { trpcClient } from "@/lib/trpc-client.ts";
import { router } from "@/router.ts";

function App() {
  const session = authClient.useSession();
  return (
    <RouterProvider
      router={router}
      context={{ auth: { data: session.data, isPending: session.isPending } }}
    />
  );
}

// biome-ignore lint/style/noNonNullAssertion: index.html guarantees #root exists
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
          <App />
        </TRPCProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
