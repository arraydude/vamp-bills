import { IconFileInvoice, IconLogout, IconReceipt } from "@tabler/icons-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { useState } from "react";

import { authClient } from "@/lib/auth-client.ts";

type NavItem = {
  to: "/bills";
  label: string;
  icon: React.ReactNode;
  matchPrefix: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    to: "/bills",
    label: "Bills",
    icon: <IconFileInvoice />,
    matchPrefix: "/bills",
  },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = () => {
    setSigningOut(true);
    authClient.signOut().finally(() => {
      window.location.href = "/login";
    });
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/bills" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <IconReceipt className="size-4" />
              </div>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">vamp-bills</span>
                <span className="text-muted-foreground truncate text-xs">Accounts payable</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {NAV_ITEMS.map((item) => (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.matchPrefix)}
                  tooltip={item.label}
                  render={<Link to={item.to} />}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={signingOut}>
          <IconLogout />
          {signingOut ? "Signing out..." : "Sign out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
