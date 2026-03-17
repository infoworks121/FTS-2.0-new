import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, Network, Undo2 } from "lucide-react";

export type ReferralMemberStatus = "Active" | "Inactive" | "Suspended";
export type ReferralEarningStatus = "Pending" | "Credited" | "Reversed";
export type ReferralLedgerEvent = "Credit" | "Reversal";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export function ReferralMemberStatusBadge({ status }: { status: ReferralMemberStatus }) {
  const styles: Record<ReferralMemberStatus, string> = {
    Active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    Inactive: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    Suspended: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  };

  return <Badge className={cn("font-medium", styles[status])}>{status}</Badge>;
}

export function ReferralEarningStatusBadge({ status }: { status: ReferralEarningStatus }) {
  const styles: Record<ReferralEarningStatus, string> = {
    Pending: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    Credited: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    Reversed: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  };

  return <Badge className={cn("font-medium", styles[status])}>{status}</Badge>;
}

export function ReferralLedgerEventBadge({ event }: { event: ReferralLedgerEvent }) {
  const styles: Record<ReferralLedgerEvent, string> = {
    Credit: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    Reversal: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  };

  return <Badge className={cn("font-medium", styles[event])}>{event}</Badge>;
}

export function ReferralRuleIndicators() {
  const rules = [
    { icon: Network, label: "Single-level referral only", tone: "text-blue-700 dark:text-blue-400" },
    { icon: ShieldCheck, label: "No multi-level commissions", tone: "text-slate-700 dark:text-slate-300" },
    { icon: ShieldAlert, label: "Earnings subject to fraud checks", tone: "text-amber-700 dark:text-amber-400" },
    { icon: Undo2, label: "Reversal on refund", tone: "text-rose-700 dark:text-rose-400" },
  ];

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        {rules.map((rule) => (
          <div key={rule.label} className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2.5 py-1 text-xs">
            <rule.icon className={cn("h-3.5 w-3.5", rule.tone)} />
            <span className="text-muted-foreground">{rule.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

