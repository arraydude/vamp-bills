import { IconArrowLeft, IconLogout, IconPlus } from "@tabler/icons-react";
import { AppSidebar } from "@workspace/ui/components/app-sidebar";
import { Badge } from "@workspace/ui/components/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { LoginForm } from "@workspace/ui/components/login-form";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@workspace/ui/components/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { toast } from "sonner";

import { usePath } from "./use-path.ts";

const BILLS = [
  { vendor: "Acme Inc.", invoice: "INV-001", status: "Awaiting approval", amount: "$1,240.00" },
  { vendor: "Globex", invoice: "INV-002", status: "Approved", amount: "$420.00" },
  { vendor: "Initech", invoice: "INV-003", status: "Awaiting approval", amount: "$3,890.50" },
  { vendor: "Umbrella Corp.", invoice: "INV-004", status: "Approved", amount: "$78.00" },
];

export function App() {
  const { path, navigate } = usePath();

  if (path === "/login") return <LoginView onBack={() => navigate("/")} />;
  return <AppView onSignOut={() => navigate("/login")} />;
}

function AppView({ onSignOut }: { onSignOut: () => void }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Bills</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ms-auto flex items-center gap-2">
            <Dialog>
              <DialogTrigger
                render={
                  <Button size="sm">
                    <IconPlus />
                    New bill
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New bill</DialogTitle>
                  <DialogDescription>
                    Dummy modal — bill intake (manual / CSV / AI fill) ships in a follow-up PR.
                  </DialogDescription>
                </DialogHeader>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="vendor">Vendor</FieldLabel>
                    <Input id="vendor" placeholder="Acme Inc." />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="amount">Amount (USD)</FieldLabel>
                    <Input id="amount" type="number" placeholder="0.00" />
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline">Cancel</Button>} />
                  <DialogClose
                    render={
                      <Button onClick={() => toast.success("Bill saved as draft")}>Save</Button>
                    }
                  />
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="outline" onClick={onSignOut}>
              <IconLogout />
              Sign out
            </Button>
          </div>
        </header>

        <div className="p-6">
          <Tabs defaultValue="awaiting">
            <TabsList>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
              <TabsTrigger value="awaiting">Awaiting approval</TabsTrigger>
              <TabsTrigger value="payment">Awaiting payment</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="awaiting" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {BILLS.map((b) => (
                    <TableRow key={b.invoice}>
                      <TableCell>{b.vendor}</TableCell>
                      <TableCell>{b.invoice}</TableCell>
                      <TableCell>
                        <Badge variant={b.status === "Approved" ? "default" : "secondary"}>
                          {b.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{b.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="drafts" className="mt-4 text-sm text-muted-foreground">
              No drafts.
            </TabsContent>
            <TabsContent value="payment" className="mt-4 text-sm text-muted-foreground">
              No bills awaiting payment.
            </TabsContent>
            <TabsContent value="history" className="mt-4 text-sm text-muted-foreground">
              No history yet.
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function LoginView({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="mb-3 flex justify-start">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <IconArrowLeft />
            Back to app
          </Button>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
