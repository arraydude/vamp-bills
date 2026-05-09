import {
  IconFileInvoice,
  IconLogout,
  IconMoon,
  IconReceipt,
  IconSun,
  IconUsers,
} from "@tabler/icons-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Kbd } from "@workspace/ui/components/kbd";
import { Separator } from "@workspace/ui/components/separator";
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

import { useTheme } from "@/components/theme-provider.tsx";
import { authClient } from "@/lib/auth-client.ts";
import { useAuth } from "@/lib/use-auth.ts";

type NavItem = {
  to: "/bills" | "/vendors";
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
  {
    to: "/vendors",
    label: "Vendors",
    icon: <IconUsers />,
    matchPrefix: "/vendors",
  },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { signOut, isTransitioning } = useAuth();
  const { data: session } = authClient.useSession();
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  const handleSignOut = () => {
    void signOut();
  };

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/bills" />}>
              <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <IconReceipt className="size-6" />
              </div>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">vamp-bills</span>
                <span className="text-muted-foreground truncate text-xs">
                  Manage bills, vendors, and payments
                </span>
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
        <div className="flex items-center justify-between px-1">
          <Button variant="ghost" size="icon-sm" onClick={toggleTheme}>
            {isDark ? <IconSun className="size-4" /> : <IconMoon className="size-4" />}
          </Button>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Toggle theme <Kbd>D</Kbd>
          </span>
        </div>
        <Separator />
        {session?.user && (
          <div className="flex items-center gap-2 px-1 py-1">
            <Avatar className="size-7">
              <AvatarFallback className="text-xs">
                {(session.user.name as string)
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">{session.user.name as string}</span>
              <span className="truncate text-xs text-muted-foreground">
                {session.user.email as string}
              </span>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={isTransitioning}>
          <IconLogout />
          {isTransitioning ? "Signing out..." : "Sign out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
