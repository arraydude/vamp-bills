import { IconFileInvoice, IconMoon, IconReceipt, IconSun, IconUsers } from "@tabler/icons-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { DropdownMenuGroup, DropdownMenuItem } from "@workspace/ui/components/dropdown-menu";
import { Kbd } from "@workspace/ui/components/kbd";
import { NavUser } from "@workspace/ui/components/nav-user";
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
  const { signOut } = useAuth();
  const { data: session } = authClient.useSession();
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

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
        {session?.user && (
          <NavUser
            user={{
              name: session.user.name as string,
              email: session.user.email as string,
            }}
            onSignOut={() => void signOut()}
          >
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setTheme(isDark ? "light" : "dark")}>
                {isDark ? <IconSun className="size-4" /> : <IconMoon className="size-4" />}
                <span className="flex-1">Toggle theme</span>
                <Kbd>D</Kbd>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </NavUser>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
