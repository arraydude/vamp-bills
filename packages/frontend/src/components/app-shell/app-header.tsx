import { Link, useMatches } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import { Fragment } from "react";

export function AppHeader() {
  const matches = useMatches();

  const crumbs = matches
    .filter((m) => m.staticData?.getTitle)
    .map((m) => ({ title: m.staticData.getTitle!(), path: m.pathname }));

  return (
    <header
      data-slot="app-header"
      className="border-border flex h-14 shrink-0 items-center gap-2 border-b px-4"
    >
      <SidebarTrigger />
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <Fragment key={crumb.path}>
                {i > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link to={crumb.path} />}>{crumb.title}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
