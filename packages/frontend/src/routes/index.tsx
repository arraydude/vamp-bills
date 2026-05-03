import {
  IconBrandGithub,
  IconCircleCheckFilled,
  IconCircleDashed,
  IconCircleXFilled,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { buttonVariants } from "@workspace/ui/components/button";
import { useTRPC } from "@/lib/trpc.ts";

export const Route = createFileRoute("/")({ component: Home });

const REPO_URL = "https://github.com/arraydude/vamp-bills";

const STACK = [
  { layer: "Frontend", value: "React 19 · Vite 8 · TanStack Router/Query" },
  { layer: "API", value: "tRPC 11 (end-to-end typesafe)" },
  { layer: "Backend", value: "Express 5 · BetterAuth · Drizzle ORM" },
  { layer: "Database", value: "Postgres (Neon in prod, Docker locally)" },
  { layer: "Hosting", value: "Vercel (frontend + serverless function)" },
];

function Home() {
  const trpc = useTRPC();
  const health = useQuery(trpc.health.queryOptions());

  return (
    <div className="bg-background text-foreground min-h-svh">
      <div className="mx-auto flex min-h-svh max-w-2xl flex-col px-6 py-12 sm:py-20">
        <header className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-mono tracking-wide">vamp-bills</span>
          <HealthBadge state={healthState(health)} ts={health.data?.ts} />
        </header>

        <main className="mt-16 flex flex-1 flex-col gap-10">
          <section className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Bill Pay-style accounts payable, in miniature.
            </h1>
            <p className="text-muted-foreground max-w-prose text-sm leading-relaxed sm:text-base">
              A take-home demo modeled on Ramp Bill Pay. Single-tenant, three intake methods
              (manual, CSV, AI invoice fill), and a deliberately small bill / payment lifecycle. The
              UI is intentionally bare — the work that matters is the data model and the type-safe
              seam between client and server.
            </p>
          </section>

          <section className="flex flex-wrap items-center gap-3">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ size: "lg" })}
            >
              <IconBrandGithub className="size-4" />
              View source
            </a>
            <span className="text-muted-foreground text-xs">
              Press <Kbd>d</Kbd> to toggle dark mode
            </span>
          </section>

          <section className="flex flex-col gap-1">
            <h2 className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
              Stack
            </h2>
            <dl className="grid grid-cols-1 gap-y-1 text-sm sm:grid-cols-[8rem_1fr] sm:gap-x-6">
              {STACK.map((row) => (
                <div key={row.layer} className="contents">
                  <dt className="text-muted-foreground font-mono text-xs sm:pt-0.5">{row.layer}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </main>

        <footer className="text-muted-foreground mt-16 flex items-center justify-between font-mono text-xs">
          <span>Phase 5 · live on Vercel</span>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            arraydude/vamp-bills
          </a>
        </footer>
      </div>
    </div>
  );
}

type HealthState = "loading" | "ok" | "error";

function healthState(query: ReturnType<typeof useQuery>): HealthState {
  if (query.isPending) return "loading";
  if (query.error) return "error";
  return "ok";
}

function HealthBadge({ state, ts }: { state: HealthState; ts?: number }) {
  const Icon =
    state === "loading"
      ? IconCircleDashed
      : state === "ok"
        ? IconCircleCheckFilled
        : IconCircleXFilled;

  const tone =
    state === "loading"
      ? "text-muted-foreground"
      : state === "ok"
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-destructive";

  const label =
    state === "loading"
      ? "checking backend…"
      : state === "ok"
        ? `backend healthy${ts ? ` · ts=${ts}` : ""}`
        : "backend unreachable";

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono ${tone}`}>
      <Icon className={`size-3.5 ${state === "loading" ? "animate-spin" : ""}`} />
      {label}
    </span>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="bg-muted text-muted-foreground inline-flex h-5 min-w-5 items-center justify-center rounded border px-1.5 font-mono text-[10px]">
      {children}
    </kbd>
  );
}
