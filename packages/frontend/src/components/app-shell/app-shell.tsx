import { Outlet } from "@tanstack/react-router";

import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar";
import { Toaster } from "@workspace/ui/components/sonner";

import { AppHeader } from "@/components/app-shell/app-header.tsx";
import { AppSidebar } from "@/components/app-shell/app-sidebar.tsx";

export function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="p-6">
          <Outlet />
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
