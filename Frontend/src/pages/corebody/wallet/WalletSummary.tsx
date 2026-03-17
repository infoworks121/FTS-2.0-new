import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { navItems } from "@/pages/CoreBodyDashboard";
import { Wallet, Users, ShieldCheck, CircleAlert } from "lucide-react";

type WalletStatus = "Active" | "Restricted";

type WalletCardData = {
  name: string;
  balance: number;
  updatedAt: string;
  status: WalletStatus;
  icon: React.ComponentType<{ className?: string }>;
};

const DISTRICT_NAME = "District North";

const walletCards: WalletCardData[] = [
  {
    name: "Main Wallet",
    balance: 248500,
    updatedAt: "2026-02-22 10:42 AM",
    status: "Active",
    icon: Wallet,
  },
  {
    name: "Referral Wallet",
    balance: 46200,
    updatedAt: "2026-02-22 10:42 AM",
    status: "Active",
    icon: Users,
  },
  {
    name: "Trust Wallet",
    balance: 93500,
    updatedAt: "2026-02-22 10:42 AM",
    status: "Restricted",
    icon: ShieldCheck,
  },
];

const earningOverview = [
  { label: "Total Lifetime Earnings", amount: 1842500 },
  { label: "Earnings This Month", amount: 184200 },
  { label: "Withdrawn Amount", amount: 721000 },
  { label: "Pending Amount", amount: 36500 },
];

const quickNotices = [
  { message: "Cap nearing limit", tone: "warning" as const },
  { message: "Withdrawal under review", tone: "neutral" as const },
  { message: "Earnings paused due to cap", tone: "danger" as const },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function WalletSummary() {
  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel={`Core Body — ${DISTRICT_NAME}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Wallet Summary</h1>
          <p className="text-sm text-muted-foreground">
            Banking-grade district wallet visibility. All values are system-generated, read-only, and audit-safe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {walletCards.map((wallet) => {
            const Icon = wallet.icon;
            return (
              <Card key={wallet.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {wallet.name}
                    </CardTitle>
                    <Badge variant={wallet.status === "Active" ? "secondary" : "destructive"}>
                      {wallet.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-mono text-2xl font-semibold tracking-tight">{formatCurrency(wallet.balance)}</p>
                  <p className="text-xs text-muted-foreground">Last updated: {wallet.updatedAt}</p>
                  <p className="text-[11px] text-muted-foreground">Read-only ledger balance. Manual edit/transfer disabled.</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Earnings Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {earningOverview.map((kpi) => (
                <div key={kpi.label} className="rounded-md border p-4">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="mt-1 font-mono text-lg font-semibold">{formatCurrency(kpi.amount)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Notices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickNotices.map((notice, idx) => (
              <div
                key={`${notice.message}-${idx}`}
                className={`rounded-md border p-3 text-sm flex items-start gap-2 ${
                  notice.tone === "danger"
                    ? "border-red-500/30 bg-red-500/5"
                    : notice.tone === "warning"
                    ? "border-amber-500/30 bg-amber-500/5"
                    : ""
                }`}
              >
                <CircleAlert className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span>{notice.message}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

