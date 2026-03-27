import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CommissionLayout,
  PercentageCard,
  PercentageSummary,
  ProfitFlowVisualization,
  RuleHistoryTable,
} from "@/components/commission";
import { Wallet, Users, Percent, Building2, Package, RefreshCw, Info } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function B2CCommission() {
  const [isLoading, setIsLoading] = useState(true);
  const [rule, setRule] = useState<any>(null);
  const [originalRule, setOriginalRule] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/wallet/admin/profit-rules");
      const b2cRule = response.data.rules.find((r: any) => r.channel === 'B2C');
      if (b2cRule) {
        setRule(b2cRule);
        setOriginalRule(b2cRule);
      }
    } catch (error) {
      console.error("Error fetching B2C rules:", error);
      toast({
        title: "Error",
        description: "Failed to load B2C commission rules",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!rule) return <div className="p-8 text-center text-muted-foreground"><RefreshCw className="animate-spin h-8 w-8 mx-auto mb-2"/> Loading...</div>;

  const total =
    parseFloat(rule.trust_fund_pct) +
    parseFloat(rule.admin_pct) +
    parseFloat(rule.company_pct) +
    parseFloat(rule.stock_point_pct) +
    parseFloat(rule.referral_pct);

  const updateField = (field: string, value: number) => {
    setRule((prev: any) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (total !== 100) {
      toast({
        title: "Validation Error",
        description: "Total allocation must equal 100%",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await api.put(`/wallet/admin/profit-rules/${rule.id}`, rule);
      toast({
        title: "Success",
        description: "B2C Commission structure updated successfully",
      });
      setHasChanges(false);
      fetchData();
    } catch (error) {
      console.error("Error saving B2C rules:", error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setRule(originalRule);
    setHasChanges(false);
  };

  const flows = [
    { label: "Trust Fund", percentage: parseFloat(rule.trust_fund_pct), color: "trust" as const },
    { label: "Admin", percentage: parseFloat(rule.admin_pct), color: "admin" as const },
    { label: "Company", percentage: parseFloat(rule.company_pct), color: "company" as const },
    { label: "Stock Point", percentage: parseFloat(rule.stock_point_pct), color: "reserve" as const },
    { label: "Referral", percentage: parseFloat(rule.referral_pct), color: "profit" as const },
  ];

  return (
    <CommissionLayout
      title="B2C Commission Structure"
      description="Configure customer-facing profit distribution"
      status="active"
      lastUpdated={{ by: "System Admin", time: new Date(rule.created_at).toLocaleString() }}
      onSave={handleSave}
      onReset={handleReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
      changes={[]}
      historySection={
        <RuleHistoryTable history={[]} title="Amendment History" />
      }
    >
      <Card className="border-profit/30 bg-profit/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Wallet className="h-4 w-4 text-profit" />
              Current Active Configuration
            </CardTitle>
            <Badge variant="outline" className="text-profit border-profit/30">
              v{rule.id} (Live)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Trust Fund</span>
              <p className="font-mono font-bold text-trust">{rule.trust_fund_pct}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Admin Fee</span>
              <p className="font-mono font-bold text-admin">{rule.admin_pct}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Company Share</span>
              <p className="font-mono font-bold text-company">{rule.company_pct}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Stock Point</span>
              <p className="font-mono font-bold text-reserve">{rule.stock_point_pct}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Referral</span>
              <p className="font-mono font-bold text-profit">{rule.referral_pct}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProfitFlowVisualization totalProfit={total} flows={flows} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Profit Distribution Configuration
          </CardTitle>
          <CardDescription>
            Configure how customer transaction profits are distributed among stakeholders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PercentageCard
              label="Trust Fund"
              value={parseFloat(rule.trust_fund_pct)}
              onChange={(v) => updateField("trust_fund_pct", v)}
              tooltip="Percentage allocated to trust fund for customer safety"
              variant="trust"
            />
            <PercentageCard
              label="Platform Admin"
              value={parseFloat(rule.admin_pct)}
              onChange={(v) => updateField("admin_pct", v)}
              tooltip="Administrative fee for platform management"
              variant="admin"
            />
            <PercentageCard
              label="Company Direct"
              value={parseFloat(rule.company_pct)}
              onChange={(v) => updateField("company_pct", v)}
              tooltip="Company's share of B2C profit"
              variant="company"
            />
            <PercentageCard
              label="Stock Point Comms"
              value={parseFloat(rule.stock_point_pct)}
              onChange={(v) => updateField("stock_point_pct", v)}
              tooltip="Commission for stock point fulfillment"
              variant="reserve"
            />
            <PercentageCard
              label="Customer Referral"
              value={parseFloat(rule.referral_pct)}
              onChange={(v) => updateField("referral_pct", v)}
              tooltip="Referral bonus for customer referrals"
              variant="profit"
            />
          </div>

          <Separator />

          <PercentageSummary total={total} target={100} showWarning={true} />

          {total !== 100 && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-warning/30 bg-warning/10 text-warning text-sm">
              <Info className="h-4 w-4 flex-shrink-0" />
              <span>Total allocation must equal 100% for the rule to be valid</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-reserve/30 bg-reserve/5">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-reserve" />
            B2C Stock Point Logic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current Rate</span>
              <Badge variant="outline">{rule.stock_point_pct}%</Badge>
            </div>
            <div className="p-3 rounded-lg bg-white/50 border text-xs text-muted-foreground">
              Stock Point commission is calculated based on the total cart value of B2C orders fulfilled by the designated stockist.
            </div>
          </div>
        </CardContent>
      </Card>
    </CommissionLayout>
  );
}

