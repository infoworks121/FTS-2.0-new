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
  Building2, 
  Wallet, 
  Lock, 
  TrendingUp,
  Calendar,
  Shield,
  ChevronRight
} from "lucide-react";

interface CompanyShareData {
  companyDirectShare: number;
  reserveFundRouting: number;
  upgradeFundingRouting: number;
  protected: boolean;
}

const initialData: CompanyShareData = {
  companyDirectShare: 35,
  reserveFundRouting: 20,
  upgradeFundingRouting: 10,
  protected: true,
};

const historyData = [
  {
    id: "1",
    version: 3,
    effectiveFrom: "2026-01-01",
    effectiveTo: "—",
    status: "active" as const,
    changes: "Increased company share and protected status",
    changedBy: "Admin",
    changedAt: "2025-12-28 15:00",
    details: [
      { field: "Company Direct Share", oldValue: "30%", newValue: "35%" },
    ],
  },
  {
    id: "2",
    version: 2,
    effectiveFrom: "2025-09-01",
    effectiveTo: "2025-12-31",
    status: "archived" as const,
    changes: "Added upgrade funding allocation",
    changedBy: "Admin",
    changedAt: "2025-08-25 10:30",
    details: [
      { field: "Upgrade Funding", oldValue: "0%", newValue: "10%" },
    ],
  },
];

// Monthly trend data
const monthlyTrends = [
  { month: "Aug", earnings: 450000 },
  { month: "Sep", earnings: 520000 },
  { month: "Oct", earnings: 480000 },
  { month: "Nov", earnings: 610000 },
  { month: "Dec", earnings: 550000 },
  { month: "Jan", earnings: 680000 },
];

// Protected rule info
const protectedInfo = {
  reason: "Company share is protected by board resolution",
  resolution: "BR-2025-089",
  approvedBy: "Board of Directors",
  approvedDate: "2025-12-15",
};

export default function CompanyShareRules() {
  const [data, setData] = useState<CompanyShareData>(initialData);
  const [originalData] = useState<CompanyShareData>(initialData);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (
    field: keyof CompanyShareData,
    value: number | boolean
  ) => {
    if (data.protected && field !== "protected") {
      // Cannot modify protected rules
      return;
    }
    setData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const getChanges = (): ChangePreview[] => {
    const changes: ChangePreview[] = [];
    
    if (data.companyDirectShare !== originalData.companyDirectShare) {
      changes.push({
        field: "Company Direct Share",
        oldValue: `${originalData.companyDirectShare}%`,
        newValue: `${data.companyDirectShare}%`,
      });
    }
    if (data.reserveFundRouting !== originalData.reserveFundRouting) {
      changes.push({
        field: "Reserve Fund",
        oldValue: `${originalData.reserveFundRouting}%`,
        newValue: `${data.reserveFundRouting}%`,
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

  const maxEarning = Math.max(...monthlyTrends.map(t => t.earnings));

  return (
    <CommissionLayout
      title="Company Share Rules"
      description="Control company earnings and fund allocation"
      status="active"
      lastUpdated={{ by: "Admin", time: "2025-12-28 15:00" }}
      onSave={handleSave}
      onReset={handleReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
      changes={getChanges()}
      historySection={
        <RuleHistoryTable history={historyData} title="" />
      }
    >
      {/* Company Earnings Summary */}
      <Card className="border-company/30 bg-company/5">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-company" />
            Company Earnings Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Current Share</span>
              <p className="font-mono font-bold text-lg text-company">{data.companyDirectShare}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Monthly Average</span>
              <p className="font-mono font-bold text-lg">₹5,48,333</p>
            </div>
            <div>
              <span className="text-muted-foreground">YTD Earnings</span>
              <p className="font-mono font-bold text-lg">₹43,20,000</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status</span>
              <p className="font-bold text-profit flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> Growing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Protected Rule Warning */}
      {data.protected && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-warning">
              <Shield className="h-4 w-4" />
              Protected Rule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="text-warning">{protectedInfo.reason}</p>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <span className="text-xs text-muted-foreground">Resolution</span>
                  <p className="font-mono">{protectedInfo.resolution}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Approved By</span>
                  <p>{protectedInfo.approvedBy}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company Direct Share */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Company Direct Share
          </CardTitle>
          <CardDescription>
            Company's primary earnings from transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <PercentageCard
            label="Company Direct Share"
            value={data.companyDirectShare}
            onChange={(v) => updateField("companyDirectShare", v)}
            tooltip="Company's direct earnings percentage"
            variant="company"
            max={100}
            locked={data.protected}
          />
          
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div className="space-y-1">
              <Label className="text-base font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Protected Rule
              </Label>
              <p className="text-sm text-muted-foreground">
                Prevent accidental modifications to company share
              </p>
            </div>
            <Switch
              checked={data.protected}
              onCheckedChange={(checked) => updateField("protected", checked)}
            />
          </div>
          
          {data.protected && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-warning/30 bg-warning/10 text-warning text-sm">
              <Lock className="h-4 w-4 flex-shrink-0" />
              <span>Company share is protected. Unlock to make changes.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reserve Fund Routing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Reserve Fund Routing
          </CardTitle>
          <CardDescription>
            How company portion is allocated to reserves
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PercentageCard
            label="Reserve Fund Allocation"
            value={data.reserveFundRouting}
            onChange={(v) => updateField("reserveFundRouting", v)}
            tooltip="Percentage of company share routed to reserve fund"
            variant="reserve"
            max={50}
            locked={data.protected}
          />
          <PercentageCard
            label="Upgrade Funding"
            value={data.upgradeFundingRouting}
            onChange={(v) => updateField("upgradeFundingRouting", v)}
            tooltip="Percentage for platform upgrades and development"
            variant="company"
            max={30}
            locked={data.protected}
          />
        </CardContent>
      </Card>

      {/* Monthly Trend Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Monthly Trend Preview
          </CardTitle>
          <CardDescription>Company earnings over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {monthlyTrends.map((trend, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-company/30 rounded-t transition-all duration-500 hover:bg-company/50"
                  style={{ 
                    height: `${(trend.earnings / maxEarning) * 100}%`,
                    minHeight: "20px"
                  }}
                />
                <span className="text-xs text-muted-foreground">{trend.month}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Growth</span>
            <span className="font-mono font-bold text-profit">+51% YoY</span>
          </div>
        </CardContent>
      </Card>

      {/* Admin Only Badge */}
      <Card className="border-admin/30 bg-admin/5">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-admin" />
            Admin Only Edit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Permission Level</span>
            <Badge className="bg-admin/10 text-admin border-admin/20">Super Admin Only</Badge>
          </div>
        </CardContent>
      </Card>
    </CommissionLayout>
  );
}
