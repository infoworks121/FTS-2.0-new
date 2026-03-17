import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CommissionLayout,
  PercentageCard,
  RuleHistoryTable,
  ChangePreview,
} from "@/components/commission";
import { 
  Info, 
  Shield, 
  Wallet, 
  Lock, 
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock
} from "lucide-react";

interface TrustFundData {
  trustPercentage: number;
  autoCreditEnabled: boolean;
  minBalanceThreshold: number;
  usageRestrictions: {
    refunds: boolean;
    chargebacks: boolean;
    fraud: boolean;
    emergencies: boolean;
  };
}

const initialData: TrustFundData = {
  trustPercentage: 5,
  autoCreditEnabled: true,
  minBalanceThreshold: 100000,
  usageRestrictions: {
    refunds: true,
    chargebacks: true,
    fraud: true,
    emergencies: true,
  },
};

const historyData = [
  {
    id: "1",
    version: 2,
    effectiveFrom: "2025-10-01",
    effectiveTo: "—",
    status: "active" as const,
    changes: "Updated trust percentage and auto-credit rules",
    changedBy: "Admin",
    changedAt: "2025-09-25 11:00",
    details: [
      { field: "Trust Percentage", oldValue: "3%", newValue: "5%" },
    ],
  },
  {
    id: "2",
    version: 1,
    effectiveFrom: "2025-06-01",
    effectiveTo: "2025-09-30",
    status: "archived" as const,
    changes: "Initial trust fund rules",
    changedBy: "Admin",
    changedAt: "2025-05-28 09:00",
    details: [],
  },
];

// Legal notices
const legalNotices = [
  "Trust fund is held in a separate escrow account",
  "Subject to quarterly financial audits",
  "Governed by platform terms of service",
  "Regulatory compliance maintained",
];

// Audit references
const auditReferences = [
  { id: "AUD-2025-Q4-001", date: "2025-12-15", status: "Verified" },
  { id: "AUD-2025-Q3-002", date: "2025-09-15", status: "Verified" },
  { id: "AUD-2025-Q2-003", date: "2025-06-15", status: "Verified" },
];

export default function TrustFundRules() {
  const [data, setData] = useState<TrustFundData>(initialData);
  const [originalData] = useState<TrustFundData>(initialData);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (
    field: keyof TrustFundData | `usageRestrictions.${keyof TrustFundData["usageRestrictions"]}`,
    value: number | boolean
  ) => {
    setData((prev) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof TrustFundData] as any),
            [child]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
    setHasChanges(true);
  };

  const getChanges = (): ChangePreview[] => {
    const changes: ChangePreview[] = [];
    
    if (data.trustPercentage !== originalData.trustPercentage) {
      changes.push({
        field: "Trust Percentage",
        oldValue: `${originalData.trustPercentage}%`,
        newValue: `${data.trustPercentage}%`,
      });
    }
    if (data.autoCreditEnabled !== originalData.autoCreditEnabled) {
      changes.push({
        field: "Auto Credit",
        oldValue: originalData.autoCreditEnabled ? "Enabled" : "Disabled",
        newValue: data.autoCreditEnabled ? "Enabled" : "Disabled",
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

  return (
    <CommissionLayout
      title="Trust Fund Rules"
      description="Configure trust & safety fund logic"
      status="active"
      lastUpdated={{ by: "Admin", time: "2025-09-25 11:00" }}
      onSave={handleSave}
      onReset={handleReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
      changes={getChanges()}
      historySection={
        <RuleHistoryTable history={historyData} title="" />
      }
    >
      {/* Trust Fund Overview */}
      <Card className="border-trust/30 bg-trust/5">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-trust" />
            Trust Fund Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Current Balance</span>
              <p className="font-mono font-bold text-lg text-trust">₹8,90,000</p>
            </div>
            <div>
              <span className="text-muted-foreground">Trust Rate</span>
              <p className="font-mono font-bold text-lg">{data.trustPercentage}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Threshold</span>
              <p className="font-mono font-bold text-lg">₹{data.minBalanceThreshold.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status</span>
              <p className="font-bold text-profit flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Active
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Percentage Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Trust Percentage Configuration
          </CardTitle>
          <CardDescription>
            Set the percentage of each transaction allocated to trust fund
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <PercentageCard
            label="Trust Fund Percentage"
            value={data.trustPercentage}
            onChange={(v) => updateField("trustPercentage", v)}
            tooltip="Percentage of each transaction allocated to trust fund"
            variant="trust"
            max={20}
          />
          
          <Separator />
          
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div className="space-y-1">
              <Label className="text-base font-medium">Auto Credit Rules</Label>
              <p className="text-sm text-muted-foreground">
                Automatically credit trust fund from each transaction
              </p>
            </div>
            <Switch
              checked={data.autoCreditEnabled}
              onCheckedChange={(checked) => updateField("autoCreditEnabled", checked)}
            />
          </div>
          
          {data.autoCreditEnabled && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-trust/30 bg-trust/5 text-trust text-sm">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>Trust fund will be automatically credited from all transactions</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trust Wallet Mapping */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Trust Wallet Mapping
          </CardTitle>
          <CardDescription>
            View trust fund wallet configuration (read-only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-trust/30 bg-trust/5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Wallet ID</Label>
                <p className="font-mono text-sm mt-1">wallet_trust_001</p>
              </div>
              <div className="p-4 rounded-lg border border-trust/30 bg-trust/5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Account Type</Label>
                <p className="text-sm mt-1">Escrow Account</p>
              </div>
              <div className="p-4 rounded-lg border border-trust/30 bg-trust/5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Bank</Label>
                <p className="text-sm mt-1">State Bank of India</p>
              </div>
              <div className="p-4 rounded-lg border border-trust/30 bg-trust/5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">IFSC</Label>
                <p className="font-mono text-sm mt-1">SBIN0001234</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 rounded-lg border border-muted bg-muted/30 text-muted-foreground text-sm">
              <Lock className="h-4 w-4" />
              <span>Wallet details are read-only and cannot be modified</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Restrictions (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Usage Restrictions (Read-only)
          </CardTitle>
          <CardDescription>
            Approved use cases for trust fund withdrawals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(data.usageRestrictions).map(([key, enabled]) => (
              <div 
                key={key} 
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <span className="capitalize text-sm">{key} Coverage</span>
                <Badge 
                  variant={enabled ? "default" : "secondary"}
                  className={enabled ? "bg-trust/10 text-trust" : ""}
                >
                  {enabled ? "Allowed" : "Not Allowed"}
                </Badge>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg border border-warning/30 bg-warning/10 text-warning text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>Trust fund usage requires board approval for amounts above ₹5,00,000</span>
          </div>
        </CardContent>
      </Card>

      {/* Legal Notices */}
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Legal Notices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {legalNotices.map((notice, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-trust flex-shrink-0 mt-0.5" />
                {notice}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Audit Reference IDs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Audit References
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {auditReferences.map((ref) => (
              <div 
                key={ref.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm">{ref.id}</span>
                  <span className="text-xs text-muted-foreground">{ref.date}</span>
                </div>
                <Badge variant="outline" className="bg-trust/10 text-trust border-trust/20">
                  {ref.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </CommissionLayout>
  );
}
