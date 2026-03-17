import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type RequestStatus = "Pending" | "Approved" | "Rejected";
type SettlementStatus = "Open" | "Partially Settled" | "Settled" | "Overdue";
type PurchaseType = "Direct" | "Advance";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export function PurchaseTypeBadge({ type }: { type: PurchaseType }) {
  return (
    <Badge
      variant="outline"
      className={type === "Direct" ? "border-emerald-500/40 text-emerald-500" : "border-amber-500/40 text-amber-500"}
    >
      {type}
    </Badge>
  );
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  if (status === "Approved") {
    return <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Approved</Badge>;
  }

  if (status === "Rejected") {
    return <Badge className="bg-red-600 text-white hover:bg-red-600">Rejected</Badge>;
  }

  return <Badge className="bg-amber-500 text-black hover:bg-amber-500">Pending</Badge>;
}

export function SettlementStatusBadge({ status }: { status: SettlementStatus }) {
  if (status === "Settled") {
    return <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Settled</Badge>;
  }

  if (status === "Overdue") {
    return <Badge className="bg-red-600 text-white hover:bg-red-600">Overdue</Badge>;
  }

  if (status === "Partially Settled") {
    return <Badge className="bg-amber-500 text-black hover:bg-amber-500">Partially Settled</Badge>;
  }

  return <Badge variant="secondary">Open</Badge>;
}

export function DisabledReason({ reason }: { reason?: string }) {
  if (!reason) return null;
  return <p className="text-xs text-red-500 mt-2">{reason}</p>;
}

interface FinanceConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
}

export function FinanceConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
}: FinanceConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onConfirm}>{confirmLabel}</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

