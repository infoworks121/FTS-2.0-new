import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { navItems } from "@/pages/CoreBodyDashboard";
import { Wallet, Users, ShieldCheck, CircleAlert, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const DISTRICT_NAME = "District North";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function WalletSummary() {
  const [isLoading, setIsLoading] = useState(true);
  const [walletData, setWalletData] = useState<any>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/wallet/me");
      setWalletData(response.data.wallet);
    } catch (error) {
      console.error("Error fetching wallet summary:", error);
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const walletCards = [
    {
      name: "Main Wallet",
      balance: walletData?.main_balance || 0,
      status: walletData?.is_frozen ? "Restricted" : "Active",
      icon: Wallet,
      color: "text-blue-600",
    },
    {
      name: "Referral Wallet",
      balance: walletData?.referral_balance || 0,
      status: "Active",
      icon: Users,
      color: "text-green-600",
    },
    {
      name: "Income Cap Used",
      balance: walletData?.income_cap_used || 0,
      status: "Info",
      icon: ShieldCheck,
      color: "text-purple-600",
    },
  ];

  const quickNotices = [];
  if (walletData?.is_frozen) {
    quickNotices.push({ message: "Wallet is currently frozen. Contact support.", tone: "danger" as const });
  }
  if (walletData?.income_cap_used > 500000) { // Example threshold
    quickNotices.push({ message: "Income cap nearing limit (Threshold: ₹5,00,000)", tone: "warning" as const });
  }

  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel={`Core Body — ${DISTRICT_NAME}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Wallet Summary</h1>
            <p className="text-sm text-muted-foreground">
              Banking-grade district wallet visibility. All values are system-generated, read-only, and audit-safe.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {walletCards.map((wallet) => {
            const Icon = wallet.icon;
            return (
              <Card key={wallet.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${wallet.color}`} />
                      {wallet.name}
                    </CardTitle>
                    <Badge variant={wallet.status === "Active" ? "secondary" : wallet.status === "Info" ? "outline" : "destructive"}>
                      {wallet.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-mono text-2xl font-semibold tracking-tight">
                    {isLoading ? "---" : formatCurrency(parseFloat(wallet.balance.toString()))}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Read-only ledger balance. Manual edit/transfer disabled.</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Notices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickNotices.length > 0 ? (
              quickNotices.map((notice, idx) => (
                <div
                  key={`${notice.message}-${idx}`}
                  className={`rounded-md border p-3 text-sm flex items-start gap-2 ${
                    notice.tone === "danger"
                      ? "border-red-500/30 bg-red-500/5 text-red-600"
                      : "border-amber-500/30 bg-amber-500/5 text-amber-600"
                  }`}
                >
                  <CircleAlert className="h-4 w-4 mt-0.5" />
                  <span>{notice.message}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground italic">No urgent account notices at this time.</div>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-700 flex gap-3">
            <Info className="h-5 w-5 flex-shrink-0" />
            <div>
                <p className="font-semibold">Core Body Remittance Notice</p>
                <p className="mt-1">
                    Daily earnings are automatically reconciled at 12:00 AM. 
                    Main balance includes all confirmed order shares and performance bonuses.
                </p>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
import { Info } from "lucide-react";


