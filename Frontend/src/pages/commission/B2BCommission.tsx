import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CommissionLayout,
  PercentageCard,
  PercentageSummary,
  FlowDiagram,
  RuleHistoryTable,
} from "@/components/commission";
import { defaultB2BFlowNodes } from "@/components/commission/FlowDiagram";
import { Building2, Percent, Wallet, Info, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export default function B2BCommission() {
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
      const b2bRule = response.data.rules.find((r: any) => r.channel === 'B2B');
      if (b2bRule) {
        setRule(b2bRule);
        setOriginalRule(b2bRule);
      }
    } catch (error) {
      console.error("Error fetching B2B rules:", error);
      toast({
        title: "Error",
        description: "Failed to load B2B commission rules",
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

  const totalMain =
    parseFloat(rule.referral_share_pct) +
    parseFloat(rule.fts_share_pct) +
    parseFloat(rule.trust_fund_pct) +
    parseFloat(rule.admin_pct) +
    parseFloat(rule.core_body_pool_pct);

  const updateField = (field: string, value: number) => {
    setRule((prev: any) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (totalMain !== 100) {
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
        description: "B2B Commission structure updated successfully",
      });
      setHasChanges(false);
      fetchData(); // Refresh to get the new ID and updated history (if UI supported history)
    } catch (error) {
      console.error("Error saving B2B rules:", error);
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

  const flowNodes = [
    { ...defaultB2BFlowNodes[0], value: 100 },
    { ...defaultB2BFlowNodes[1], value: parseFloat(rule.referral_share_pct) },
    { ...defaultB2BFlowNodes[2], value: parseFloat(rule.fts_share_pct) },
    { ...defaultB2BFlowNodes[3], value: parseFloat(rule.trust_fund_pct) },
    { ...defaultB2BFlowNodes[4], value: parseFloat(rule.admin_pct) },
  ];

  return (
    <CommissionLayout
      title="B2B Commission Structure"
      description="Define how B2B profit is split between stakeholders"
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
              Current Active Rule Configuration
            </CardTitle>
            <Badge variant="outline" className="text-profit border-profit/30">
              v{rule.id} (Live)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Direct Referral</span>
              <p className="font-mono font-bold text-profit">{rule.referral_share_pct}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Company (FTS)</span>
              <p className="font-mono font-bold text-company">{rule.fts_share_pct}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Trust Fund</span>
              <p className="font-mono font-bold text-trust">{rule.trust_fund_pct}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Admin Fee</span>
              <p className="font-mono font-bold text-admin">{rule.admin_pct}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Core Body Pool</span>
              <p className="font-mono font-bold text-purple-600">{rule.core_body_pool_pct}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <FlowDiagram
        title="Profit Distribution Visualizer"
        nodes={flowNodes}
        connections={[
          { from: "total", to: "direct" },
          { from: "direct", to: "company" },
          { from: "company", to: "trust" },
          { from: "trust", to: "admin" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Profit Allocation Matrix (Must = 100%)
          </CardTitle>
          <CardDescription>
            Configure the main profit distribution percentages for all B2B transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PercentageCard
              label="Direct Referral Share"
              value={parseFloat(rule.referral_share_pct)}
              onChange={(v) => updateField("referral_share_pct", v)}
              tooltip="Percentage of profit shared with the referring businessman"
              variant="profit"
            />
            <PercentageCard
              label="Company (FTS) Direct"
              value={parseFloat(rule.fts_share_pct)}
              onChange={(v) => updateField("fts_share_pct", v)}
              tooltip="Company's direct share of B2B profit"
              variant="company"
            />
            <PercentageCard
              label="Trust Fund Allocation"
              value={parseFloat(rule.trust_fund_pct)}
              onChange={(v) => updateField("trust_fund_pct", v)}
              tooltip="Allocated to trust fund for safety and security"
              variant="trust"
            />
            <PercentageCard
              label="Administrative Fee"
              value={parseFloat(rule.admin_pct)}
              onChange={(v) => updateField("admin_pct", v)}
              tooltip="Administrative fee for platform management"
              variant="admin"
            />
            <PercentageCard
              label="Core Body Pool"
              value={parseFloat(rule.core_body_pool_pct)}
              onChange={(v) => updateField("core_body_pool_pct", v)}
              tooltip="Share distributed to Core Body Pool"
              variant="default"
            />
          </div>

          <Separator />

          <PercentageSummary
            total={totalMain}
            target={100}
            showWarning={true}
          />

          {totalMain !== 100 && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-warning/30 bg-warning/10 text-warning text-sm">
              <Info className="h-4 w-4 flex-shrink-0" />
              <span>Total allocation must equal 100% for the rule to be valid</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Portion Details
          </CardTitle>
          <CardDescription>
            Further breakdown of the FTS portion for internal funds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PercentageCard
              label="Company Direct Profit"
              value={parseFloat(rule.company_pct)}
              onChange={(v) => updateField("company_pct", v)}
              tooltip="Net profit retained by company"
              variant="company"
            />
            <PercentageCard
              label="Company Reserve Fund"
              value={parseFloat(rule.company_reserve_pct)}
              onChange={(v) => updateField("company_reserve_pct", v)}
              tooltip="Allocated to company emergency reserve"
              variant="reserve"
            />
          </div>

          <Separator />

          <div className="flex items-center gap-2 p-3 rounded-lg border border-muted bg-muted/30 text-muted-foreground text-sm">
            <Info className="h-4 w-4 flex-shrink-0" />
            <span>Updates affect new orders immediately. Past orders remain unchanged.</span>
          </div>
        </CardContent>
      </Card>
    </CommissionLayout>
  );
}

