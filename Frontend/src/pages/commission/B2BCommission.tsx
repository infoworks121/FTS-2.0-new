import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CommissionLayout,
  PercentageCard,
  PercentageSummary,
  FlowDiagram,
  RuleHistoryTable,
  ChangePreview,
} from "@/components/commission";
import { defaultB2BFlowNodes } from "@/components/commission/FlowDiagram";
import { Users, Building2, Shield, Percent, Wallet, Info } from "lucide-react";

interface B2BCommissionData {
  directReferral: number;
  companyFTS: number;
  trustFund: number;
  admin: number;
  companyPool: {
    reserve: number;
    upgradeFunding: number;
    operational: number;
  };
}

const initialData: B2BCommissionData = {
  directReferral: 15,
  companyFTS: 35,
  trustFund: 10,
  admin: 5,
  companyPool: {
    reserve: 20,
    upgradeFunding: 10,
    operational: 5,
  },
};

const historyData = [
  {
    id: "1",
    version: 3,
    effectiveFrom: "2026-01-01",
    effectiveTo: "—",
    status: "active" as const,
    changes: "Updated trust fund and admin percentages",
    changedBy: "Admin",
    changedAt: "2025-12-28 14:30",
    details: [
      { field: "Trust Fund", oldValue: "8%", newValue: "10%" },
      { field: "Admin", oldValue: "3%", newValue: "5%" },
    ],
  },
  {
    id: "2",
    version: 2,
    effectiveFrom: "2025-10-15",
    effectiveTo: "2025-12-31",
    status: "archived" as const,
    changes: "Increased company pool allocation",
    changedBy: "Admin",
    changedAt: "2025-10-14 09:15",
    details: [
      { field: "Company Pool Reserve", oldValue: "15%", newValue: "20%" },
    ],
  },
  {
    id: "3",
    version: 1,
    effectiveFrom: "2025-06-01",
    effectiveTo: "2025-10-14",
    status: "archived" as const,
    changes: "Initial B2B commission structure",
    changedBy: "Admin",
    changedAt: "2025-05-28 11:00",
    details: [],
  },
];

export default function B2BCommission() {
  const [data, setData] = useState<B2BCommissionData>(initialData);
  const [originalData] = useState<B2BCommissionData>(initialData);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const totalMain =
    data.directReferral +
    data.companyFTS +
    data.trustFund +
    data.admin;

  const totalPool =
    data.companyPool.reserve +
    data.companyPool.upgradeFunding +
    data.companyPool.operational;

  const updateField = (
    field: keyof B2BCommissionData,
    value: number
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const updatePoolField = (
    field: keyof B2BCommissionData["companyPool"],
    value: number
  ) => {
    setData((prev) => ({
      ...prev,
      companyPool: { ...prev.companyPool, [field]: value },
    }));
    setHasChanges(true);
  };

  const getChanges = (): ChangePreview[] => {
    const changes: ChangePreview[] = [];
    
    if (data.directReferral !== originalData.directReferral) {
      changes.push({
        field: "Direct Referral",
        oldValue: `${originalData.directReferral}%`,
        newValue: `${data.directReferral}%`,
      });
    }
    if (data.companyFTS !== originalData.companyFTS) {
      changes.push({
        field: "Company (FTS)",
        oldValue: `${originalData.companyFTS}%`,
        newValue: `${data.companyFTS}%`,
      });
    }
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
    
    return changes;
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
    }, 1500);
  };

  const handleReset = () => {
    setData(initialData);
    setHasChanges(false);
  };

  // Flow nodes with current values
  const flowNodes = [
    { ...defaultB2BFlowNodes[0], value: 100 },
    { ...defaultB2BFlowNodes[1], value: data.directReferral },
    { ...defaultB2BFlowNodes[2], value: data.companyFTS },
    { ...defaultB2BFlowNodes[3], value: data.trustFund },
    { ...defaultB2BFlowNodes[4], value: data.admin },
  ];

  return (
    <CommissionLayout
      title="B2B Commission Structure"
      description="Define how B2B profit is split between stakeholders"
      status="active"
      lastUpdated={{ by: "Admin", time: "2025-12-28 14:30" }}
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
              v3 (Active)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Direct Referral</span>
              <p className="font-mono font-bold text-profit">{data.directReferral}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Company (FTS)</span>
              <p className="font-mono font-bold text-company">{data.companyFTS}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Trust Fund</span>
              <p className="font-mono font-bold text-trust">{data.trustFund}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Admin</span>
              <p className="font-mono font-bold text-admin">{data.admin}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Flow Diagram */}
      <FlowDiagram
        title="Profit Distribution Flow"
        nodes={flowNodes}
        connections={[
          { from: "total", to: "direct" },
          { from: "direct", to: "company" },
          { from: "company", to: "trust" },
          { from: "trust", to: "admin" },
        ]}
      />

      {/* Total Profit Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Total Profit Allocation (100%)
          </CardTitle>
          <CardDescription>
            Configure the main profit distribution percentages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PercentageCard
              label="Direct Referral"
              value={data.directReferral}
              onChange={(v) => updateField("directReferral", v)}
              tooltip="Percentage of profit shared with the referring businessman"
              variant="profit"
            />
            <PercentageCard
              label="Company (FTS)"
              value={data.companyFTS}
              onChange={(v) => updateField("companyFTS", v)}
              tooltip="Company's direct share of B2B profit"
              variant="company"
            />
            <PercentageCard
              label="Trust Fund"
              value={data.trustFund}
              onChange={(v) => updateField("trustFund", v)}
              tooltip="Allocated to trust fund for safety and security"
              variant="trust"
            />
            <PercentageCard
              label="Admin"
              value={data.admin}
              onChange={(v) => updateField("admin", v)}
              tooltip="Administrative fee for platform management"
              variant="admin"
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

      {/* Company Pool Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Pool Breakdown
          </CardTitle>
          <CardDescription>
            How the company portion (FTS) is further distributed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PercentageCard
              label="Reserve Fund"
              value={data.companyPool.reserve}
              onChange={(v) => updatePoolField("reserve", v)}
              tooltip="Emergency reserve for company operations"
              variant="reserve"
            />
            <PercentageCard
              label="Upgrade Funding"
              value={data.companyPool.upgradeFunding}
              onChange={(v) => updatePoolField("upgradeFunding", v)}
              tooltip="Funding for platform upgrades and development"
              variant="company"
            />
            <PercentageCard
              label="Operational"
              value={data.companyPool.operational}
              onChange={(v) => updatePoolField("operational", v)}
              tooltip="Day-to-day operational expenses"
              variant="default"
            />
          </div>

          <Separator />

          <PercentageSummary
            total={totalPool}
            target={100}
            showWarning={true}
          />

          <div className="flex items-center gap-2 p-3 rounded-lg border border-muted bg-muted/30 text-muted-foreground text-sm">
            <Info className="h-4 w-4 flex-shrink-0" />
            <span>Applies to: New Transactions Only</span>
          </div>
        </CardContent>
      </Card>
    </CommissionLayout>
  );
}
