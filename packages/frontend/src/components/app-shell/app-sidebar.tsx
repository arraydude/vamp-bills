import {
  IconFileInvoice,
  IconMoon,
  IconReceipt,
  IconSun,
  IconUsers,
  IconUsersGroup,
} from "@tabler/icons-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { DropdownMenuItem } from "@workspace/ui/components/dropdown-menu";
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
import { useAuth } from "@/lib/use-auth.ts";

type NavItem = {
  to: "/bills" | "/vendors" | "/users";
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
  {
    to: "/users",
    label: "Users",
    icon: <IconUsersGroup />,
    matchPrefix: "/users",
  },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { signOut, session } = useAuth();
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
        {session && (
          <NavUser
            user={{
              name: session.user.name,
              email: session.user.email,
            }}
            onSignOut={() => void signOut()}
          >
            <DropdownMenuItem onClick={() => setTheme(isDark ? "light" : "dark")}>
              {isDark ? <IconSun className="size-4" /> : <IconMoon className="size-4" />}
              <span className="flex-1">Toggle theme</span>
              <Kbd>D</Kbd>
            </DropdownMenuItem>
          </NavUser>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
