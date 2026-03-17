import { Wallet, Clock3, CheckCircle2, Info } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatCurrency,
  ReferralEarningStatus,
  ReferralEarningStatusBadge,
  ReferralRuleIndicators,
} from "@/components/businessman/ReferralPrimitives";

type OrderType = "B2B" | "B2C";

type EarningRow = {
  id: string;
  orderId: string;
  referralName: string;
  orderType: OrderType;
  grossOrderValue: number;
  referralPercentage: number;
  earnedAmount: number;
  status: ReferralEarningStatus;
};

const EARNING_ROWS: EarningRow[] = [
  {
    id: "RE-001",
    orderId: "ORD-884201",
    referralName: "Subhajit Das",
    orderType: "B2C",
    grossOrderValue: 32400,
    referralPercentage: 2,
    earnedAmount: 648,
    status: "Pending",
  },
  {
    id: "RE-002",
    orderId: "ORD-884118",
    referralName: "Priya Koley",
    orderType: "B2B",
    grossOrderValue: 210000,
    referralPercentage: 1.5,
    earnedAmount: 3150,
    status: "Credited",
  },
  {
    id: "RE-003",
    orderId: "ORD-883990",
    referralName: "Nirmal Sen",
    orderType: "B2B",
    grossOrderValue: 124000,
    referralPercentage: 1.5,
    earnedAmount: 1860,
    status: "Credited",
  },
  {
    id: "RE-004",
    orderId: "ORD-883744",
    referralName: "Mina Pal",
    orderType: "B2C",
    grossOrderValue: 18200,
    referralPercentage: 2,
    earnedAmount: 364,
    status: "Reversed",
  },
];

export default function ReferralEarningsPage() {
  const total = EARNING_ROWS.reduce((sum, row) => sum + row.earnedAmount, 0);
  const pending = EARNING_ROWS.filter((row) => row.status === "Pending").reduce((sum, row) => sum + row.earnedAmount, 0);
  const paid = EARNING_ROWS.filter((row) => row.status === "Credited").reduce((sum, row) => sum + row.earnedAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Referral Earnings</h1>
        <p className="text-sm text-muted-foreground">Read-only earnings generated from referrals. This is not wallet balance.</p>
      </div>

      <ReferralRuleIndicators />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KPICard title="Total Referral Earnings" value={formatCurrency(total)} icon={Wallet} variant="trust" />
        <KPICard title="Pending Earnings" value={formatCurrency(pending)} icon={Clock3} variant="warning" />
        <KPICard title="Paid Earnings" value={formatCurrency(paid)} icon={CheckCircle2} variant="profit" />
      </div>

      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Referral earnings are credited only after order completion and return window closure.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Earnings List (Read-only)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:hidden">
            <TooltipProvider>
              {EARNING_ROWS.map((row) => (
                <div key={row.id} className="rounded-md border bg-card p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{row.referralName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{row.orderId}</p>
                    </div>
                    {row.status === "Pending" ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex items-center gap-1.5">
                            <ReferralEarningStatusBadge status={row.status} />
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          Awaiting order completion, fraud checks, and return-window closure.
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <ReferralEarningStatusBadge status={row.status} />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <p><span className="text-muted-foreground">Type:</span> {row.orderType}</p>
                    <p><span className="text-muted-foreground">Percent:</span> <span className="font-mono">{row.referralPercentage}%</span></p>
                    <p><span className="text-muted-foreground">Gross:</span> <span className="font-mono">{formatCurrency(row.grossOrderValue)}</span></p>
                    <p><span className="text-muted-foreground">Earned:</span> <span className="font-mono">{formatCurrency(row.earnedAmount)}</span></p>
                  </div>
                </div>
              ))}
            </TooltipProvider>
          </div>

          <div className="hidden md:block rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Referral Name</TableHead>
                  <TableHead>Order Type</TableHead>
                  <TableHead>Gross Order Value</TableHead>
                  <TableHead>Referral Percentage</TableHead>
                  <TableHead>Earned Amount</TableHead>
                  <TableHead>Earning Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TooltipProvider>
                  {EARNING_ROWS.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs">{row.orderId}</TableCell>
                      <TableCell>{row.referralName}</TableCell>
                      <TableCell>{row.orderType}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(row.grossOrderValue)}</TableCell>
                      <TableCell className="font-mono">{row.referralPercentage}%</TableCell>
                      <TableCell className="font-mono">{formatCurrency(row.earnedAmount)}</TableCell>
                      <TableCell>
                        {row.status === "Pending" ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-flex items-center gap-1.5">
                                <ReferralEarningStatusBadge status={row.status} />
                                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              Awaiting order completion, fraud checks, and return-window closure.
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <ReferralEarningStatusBadge status={row.status} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TooltipProvider>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

