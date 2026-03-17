import { Badge } from "@/components/ui/badge";

export type BulkLifecycleStatus = "Pending" | "Approved" | "Rejected" | "Negotiation";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export function BulkOrderStatusBadge({ status }: { status: BulkLifecycleStatus }) {
  if (status === "Approved") {
    return <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Approved</Badge>;
  }

  if (status === "Rejected") {
    return <Badge className="bg-red-600 text-white hover:bg-red-600">Rejected</Badge>;
  }

  if (status === "Negotiation") {
    return <Badge className="bg-blue-600 text-white hover:bg-blue-600">Negotiation</Badge>;
  }

  return <Badge className="bg-amber-500 text-black hover:bg-amber-500">Pending</Badge>;
}

export function LoggedBadge() {
  return <Badge variant="outline" className="border-primary/30 text-primary">Logged</Badge>;
}

