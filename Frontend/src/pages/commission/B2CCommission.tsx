import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CommissionLayout,
  PercentageCard,
  PercentageSummary,
  ProfitFlowVisualization,
  RuleHistoryTable,
  ChangePreview,
} from "@/components/commission";
import { Info, Wallet, Users, Shield, Percent, Building2, Package } from "lucide-react";

interface B2CCommissionData {
  trustFund: number;
  admin: number;
  company: number;
  stockPoint: number;
  referral: number;
}

const initialData: B2CCommissionData = {
  trustFund: 5,
  admin: 8,
  company: 25,
  stockPoint: 12,
  referral: 10,
};

const historyData = [
  {
    id: "1",
    version: 2,
    effectiveFrom: "2025-11-01",
    effectiveTo: "—",
    status: "active" as const,
    changes: "Added stock point commission tier",
    changedBy: "Admin",
    changedAt: "2025-10-28 16:00",
    details: [
      { field: "Stock Point", oldValue: "0%", newValue: "12%" },
    ],
  },
  {
    id: "2",
    version: 1,
    effectiveFrom: "2025-06-01",
    effectiveTo: "2025-10-31",
    status: "archived" as const,
    changes: "Initial B2C commission structure",
    changedBy: "Admin",
    changedAt: "2025-05-25 10:30",
    details: [],
  },
];

export default function B2CCommission() {
  const [data, setData] = useState<B2CCommissionData>(initialData);
  const [originalData] = useState<B2CCommissionData>(initialData);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const total =
    data.trustFund +
    data.admin +
    data.company +
    data.stockPoint +
    data.referral;

  const updateField = (
    field: keyof B2CCommissionData,
    value: number
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const getChanges = (): ChangePreview[] => {
    const changes: ChangePreview[] = [];
    
    if (data.trustFund !== originalData.trustFund) {
      changes.push({
        field: "Trust Fund",
        oldValue: `${originalData.trustFund}%`,
        newValue: `${data.trustFund}%`,
      });
    }
    if (data.admin !== originalData.admin) {
      changes.push({
        field: "Admin",
        oldValue: `${originalData.admin}%`,
        newValue: `${data.admin}%`,
      });
    }
    if (data.company !== originalData.company) {
      changes.push({
        field: "Company",
        oldValue: `${originalData.company}%`,
        newValue: `${data.company}%`,
      });
    }
    if (data.stockPoint !== originalData.stockPoint) {
      changes.push({
        field: "Stock Point",
        oldValue: `${originalData.stockPoint}%`,
        newValue: `${data.stockPoint}%`,
      });
    }
    if (data.referral !== originalData.referral) {
      changes.push({
        field: "Referral",
        oldValue: `${originalData.referral}%`,
        newValue: `${data.referral}%`,
      });
    }
    
    return changes;
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
    }, 1500);
  };

  const handleReset = () => {
    setData(initialData);
    setHasChanges(false);
  };

  const flows = [
    { label: "Trust Fund", percentage: data.trustFund, color: "trust" as const },
    { label: "Admin", percentage: data.admin, color: "admin" as const },
    { label: "Company", percentage: data.company, color: "company" as const },
    { label: "Stock Point", percentage: data.stockPoint, color: "reserve" as const },
    { label: "Referral", percentage: data.referral, color: "profit" as const },
  ];

  return (
    <CommissionLayout
      title="B2C Commission Structure"
      description="Configure customer-facing profit distribution"
      status="active"
      lastUpdated={{ by: "Admin", time: "2025-10-28 16:00" }}
      onSave={handleSave}
      onReset={handleReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
      changes={getChanges()}
      historySection={
        <RuleHistoryTable history={historyData} title="" />
      }
    >
      {/* Current Active Rule Summary */}
      <Card className="border-profit/30 bg-profit/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Wallet className="h-4 w-4 text-profit" />
              Current Active Rule Summary
            </CardTitle>
            <Badge variant="outline" className="text-profit border-profit/30">
              v2 (Active)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Trust Fund</span>
              <p className="font-mono font-bold text-trust">{data.trustFund}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Admin</span>
              <p className="font-mono font-bold text-admin">{data.admin}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Company</span>
              <p className="font-mono font-bold text-company">{data.company}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Stock Point</span>
              <p className="font-mono font-bold text-reserve">{data.stockPoint}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Referral</span>
              <p className="font-mono font-bold text-profit">{data.referral}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Allocation Bar */}
      <ProfitFlowVisualization totalProfit={total} flows={flows} />

      {/* B2C Commission Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Profit Distribution Configuration
          </CardTitle>
          <CardDescription>
            Configure how customer transaction profits are distributed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PercentageCard
              label="Trust Fund"
              value={data.trustFund}
              onChange={(v) => updateField("trustFund", v)}
              tooltip="Percentage allocated to trust fund for customer safety"
              variant="trust"
            />
            <PercentageCard
              label="Admin"
              value={data.admin}
              onChange={(v) => updateField("admin", v)}
              tooltip="Administrative fee for platform management"
              variant="admin"
            />
            <PercentageCard
              label="Company"
              value={data.company}
              onChange={(v) => updateField("company", v)}
              tooltip="Company's share of B2C profit"
              variant="company"
            />
            <PercentageCard
              label="Stock Point"
              value={data.stockPoint}
              onChange={(v) => updateField("stockPoint", v)}
              tooltip="Commission for stock point fulfillment"
              variant="reserve"
            />
            <PercentageCard
              label="Referral"
              value={data.referral}
              onChange={(v) => updateField("referral", v)}
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

      {/* Stock Point Dependency Info */}
      <Card className="border-reserve/30 bg-reserve/5">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-reserve" />
            Stock Point Dependency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Stock Point Commission</span>
              <Badge variant="outline">{data.stockPoint}%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Minimum Order Value</span>
              <span className="font-mono">₹500</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">SLA Requirement</span>
              <span className="font-mono">24 hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Inventory Required</span>
              <span className="font-mono">Yes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rule Priority */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Rule Priority</CardTitle>
          <CardDescription>How rules are applied when multiple conditions match</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3 p-2 rounded bg-muted/30">
              <span className="font-mono text-xs text-muted-foreground">01</span>
              <span className="text-card-foreground">Stock Point Order (Highest Priority)</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded bg-muted/30">
              <span className="font-mono text-xs text-muted-foreground">02</span>
              <span className="text-card-foreground">Referral Commission</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded bg-muted/30">
              <span className="font-mono text-xs text-muted-foreground">03</span>
              <span className="text-card-foreground">Company & Admin Share</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded bg-muted/30">
              <span className="font-mono text-xs text-muted-foreground">04</span>
              <span className="text-card-foreground">Trust Fund Allocation</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </CommissionLayout>
  );
}
