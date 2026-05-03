import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { useTRPC } from "@/lib/trpc.ts";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const trpc = useTRPC();
  const health = useQuery(trpc.health.queryOptions());

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">vamp-bills</h1>
          <p>Phase 3: frontend wired to backend via tRPC.</p>
          <Button className="mt-2">Button</Button>
        </div>

        <div className="font-mono text-xs">
          {health.isPending && <span className="text-muted-foreground">loading /trpc/health…</span>}
          {health.error && <span className="text-destructive">error: {health.error.message}</span>}
          {health.data && (
            <span>
              health: ok={String(health.data.ok)} ts={health.data.ts}
            </span>
          )}
        </div>

        <div className="text-muted-foreground font-mono text-xs">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
    </div>
  );
}
