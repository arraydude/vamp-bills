import { useRouterState } from "@tanstack/react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@workspace/ui/components/breadcrumb";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";

const ROUTE_TITLES: Record<string, string> = {
  "/_app/bills": "Bills",
};

export function AppHeader() {
  const routeId = useRouterState({
    select: (s) => s.matches.at(-1)?.routeId,
  });
  const title = (routeId && ROUTE_TITLES[routeId]) ?? "";

  return (
    <header className="border-border flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
