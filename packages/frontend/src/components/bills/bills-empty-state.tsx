import { IconFileInvoice, IconInbox } from "@tabler/icons-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";

export type TabValue = "drafts" | "awaiting_approval" | "awaiting_payment" | "history";

const EMPTY_STATES: Record<
  TabValue,
  { icon: React.ReactNode; title: string; description: string }
> = {
  drafts: {
    icon: <IconFileInvoice />,
    title: "No draft bills",
    description: "Create a new bill to get started.",
  },
  awaiting_approval: {
    icon: <IconInbox />,
    title: "No bills awaiting approval",
    description: "Bills you submit will appear here.",
  },
  awaiting_payment: {
    icon: <IconInbox />,
    title: "No bills awaiting payment",
    description: "Approved bills will appear here.",
  },
  history: {
    icon: <IconInbox />,
    title: "No bill history yet",
    description: "Paid and archived bills will appear here.",
  },
};

export function BillsEmptyState({ tab }: { tab: TabValue }) {
  const { icon, title, description } = EMPTY_STATES[tab];
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
