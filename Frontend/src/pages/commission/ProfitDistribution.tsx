import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CommissionLayout,
  RuleHistoryTable,
  ChangePreview,
} from "@/components/commission";
import { 
  Info, 
  GitMerge, 
  Wallet, 
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Settings,
  Lock,
  Eye
} from "lucide-react";

interface DistributionConfig {
  b2bRouting: {
    enabled: boolean;
    percentage: number;
  };
  b2cRouting: {
    enabled: boolean;
    percentage: number;
  };
  walletMapping: {
    referral: string;
    trust: string;
    reserve: string;
    operational: string;
  };
  capEnforcement: boolean;
  excessProfitRouting: "reserve" | "trust" | "company";
}

const initialData: DistributionConfig = {
  b2bRouting: {
    enabled: true,
    percentage: 40,
  },
  b2cRouting: {
    enabled: true,
    percentage: 60,
  },
  walletMapping: {
    referral: "wallet_referral_001",
    trust: "wallet_trust_001",
    reserve: "wallet_reserve_001",
    operational: "wallet_operational_001",
  },
  capEnforcement: true,
  excessProfitRouting: "reserve",
};

const historyData = [
  {
    id: "1",
    version: 2,
    effectiveFrom: "2026-01-01",
    effectiveTo: "—",
    status: "active" as const,
    changes: "Enabled cap enforcement and updated routing ratios",
    changedBy: "Admin",
    changedAt: "2025-12-28 10:00",
    details: [
      { field: "B2B Routing", oldValue: "50%", newValue: "40%" },
      { field: "B2C Routing", oldValue: "50%", newValue: "60%" },
      { field: "Cap Enforcement", oldValue: "Disabled", newValue: "Enabled" },
    ],
  },
  {
    id: "2",
    version: 1,
    effectiveFrom: "2025-06-01",
    effectiveTo: "2025-12-31",
    status: "archived" as const,
    changes: "Initial profit distribution engine setup",
    changedBy: "Admin",
    changedAt: "2025-05-20 14:30",
    details: [],
  },
];

// Profit flow paths visualization
const profitPaths = [
  {
    id: "b2b",
    name: "B2B Transactions",
    percentage: 40,
    color: "bg-profit",
    flows: [
      { step: "Direct Referral", percentage: 15 },
      { step: "Company (FTS)", percentage: 35 },
      { step: "Trust Fund", percentage: 10 },
      { step: "Admin", percentage: 5 },
    ],
    enabled: true,
  },
  {
    id: "b2c",
    name: "B2C Transactions",
    percentage: 60,
    color: "bg-company",
    flows: [
      { step: "Trust Fund", percentage: 5 },
      { step: "Admin", percentage: 8 },
      { step: "Company", percentage: 25 },
      { step: "Stock Point", percentage: 12 },
      { step: "Referral", percentage: 10 },
    ],
    enabled: true,
  },
];

// Ledger preview data
const ledgerPreview = [
  { wallet: "Referral Wallet", balance: "₹12,45,000", transactions: 1245, status: "Active" },
  { wallet: "Trust Wallet", balance: "₹8,90,000", transactions: 890, status: "Active" },
  { wallet: "Reserve Fund", balance: "₹15,60,000", transactions: 560, status: "Active" },
  { wallet: "Operational", balance: "₹4,20,000", transactions: 420, status: "Active" },
];

export default function ProfitDistribution() {
  const [data, setData] = useState<DistributionConfig>(initialData);
  const [originalData] = useState<DistributionConfig>(initialData);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (path: string, value: any) => {
    setData((prev) => {
      const keys = path.split(".");
      const updated = { ...prev };
      let current: any = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
    setHasChanges(true);
  };

  const getChanges = (): ChangePreview[] => {
    const changes: ChangePreview[] = [];
    
    if (data.b2bRouting.percentage !== originalData.b2bRouting.percentage) {
      changes.push({
        field: "B2B Routing %",
        oldValue: `${originalData.b2bRouting.percentage}%`,
        newValue: `${data.b2bRouting.percentage}%`,
      });
    }
    if (data.capEnforcement !== originalData.capEnforcement) {
      changes.push({
        field: "Cap Enforcement",
        oldValue: originalData.capEnforcement ? "Enabled" : "Disabled",
        newValue: data.capEnforcement ? "Enabled" : "Disabled",
      });
    }
    if (data.excessProfitRouting !== originalData.excessProfitRouting) {
      changes.push({
        field: "Excess Routing",
        oldValue: originalData.excessProfitRouting,
        newValue: data.excessProfitRouting,
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
      title="Profit Distribution Engine"
      description="Central orchestration of all profit flows"
      status="active"
      lastUpdated={{ by: "Admin", time: "2025-12-28 10:00" }}
      onSave={handleSave}
      onReset={handleReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
      changes={getChanges()}
      historySection={
        <RuleHistoryTable history={historyData} title="" />
      }
    >
      {/* Master Flowchart View */}
      <Card className="border-profit/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GitMerge className="h-5 w-5" />
            Master Flowchart View
          </CardTitle>
          <CardDescription>
            Visual overview of profit distribution paths
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Main routing split */}
          <div className="flex flex-col items-center gap-8 py-6">
            {/* Entry Point */}
            <div className="flex flex-col items-center gap-2">
              <div className="px-6 py-3 rounded-lg border-2 border-primary bg-primary/10 text-primary font-semibold">
                Total Profit Pool
              </div>
            </div>
            
            <ArrowDown className="h-6 w-6 text-muted-foreground" />
            
            {/* B2B/B2C Split */}
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-3">
                <div className={`
                  px-6 py-3 rounded-lg border-2 transition-all
                  ${data.b2bRouting.enabled 
                    ? "border-profit bg-profit/10 text-profit" 
                    : "border-muted bg-muted/30 text-muted-foreground"}
                `}>
                  <div className="font-semibold">B2B</div>
                  <div className="text-2xl font-bold">{data.b2bRouting.percentage}%</div>
                </div>
                <Switch
                  checked={data.b2bRouting.enabled}
                  onCheckedChange={(v) => updateField("b2bRouting.enabled", v)}
                />
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <div className={`
                  px-6 py-3 rounded-lg border-2 transition-all
                  ${data.b2cRouting.enabled 
                    ? "border-company bg-company/10 text-company" 
                    : "border-muted bg-muted/30 text-muted-foreground"}
                `}>
                  <div className="font-semibold">B2C</div>
                  <div className="text-2xl font-bold">{data.b2cRouting.percentage}%</div>
                </div>
                <Switch
                  checked={data.b2cRouting.enabled}
                  onCheckedChange={(v) => updateField("b2cRouting.enabled", v)}
                />
              </div>
            </div>
            
            <ArrowDown className="h-6 w-6 text-muted-foreground" />
            
            {/* Distribution Nodes */}
            <div className="grid grid-cols-5 gap-4 w-full max-w-4xl">
              {[
                { label: "Referral", color: "profit", icon: "💰" },
                { label: "Trust", color: "trust", icon: "🛡️" },
                { label: "Company", color: "company", icon: "🏢" },
                { label: "Admin", color: "admin", icon: "⚙️" },
                { label: "Stock Point", color: "reserve", icon: "📦" },
              ].map((node) => (
                <div
                  key={node.label}
                  className={`
                    p-4 rounded-lg border text-center
                    border-${node.color}/30 bg-${node.color}/5
                  `}
                >
                  <div className="text-2xl mb-1">{node.icon}</div>
                  <div className={`text-sm font-semibold text-${node.color}`}>{node.label}</div>
                  <div className="text-xs text-muted-foreground">Wallet</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Validation */}
          <div className={`
            flex items-center justify-center gap-2 p-3 rounded-lg border
            ${data.b2bRouting.percentage + data.b2cRouting.percentage === 100 
              ? "border-profit/30 bg-profit/5 text-profit" 
              : "border-warning/30 bg-warning/5 text-warning"}
          `}>
            {data.b2bRouting.percentage + data.b2cRouting.percentage === 100 ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              Total Routing: {data.b2bRouting.percentage + data.b2cRouting.percentage}% 
              {data.b2bRouting.percentage + data.b2cRouting.percentage === 100 ? " (Valid)" : " (Must equal 100%)"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Rule Mapping Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Rule Mapping Panel
          </CardTitle>
          <CardDescription>
            Map transaction types to distribution rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase">Transaction Type</TableHead>
                <TableHead className="text-xs font-semibold uppercase">Route</TableHead>
                <TableHead className="text-xs font-semibold uppercase">Allocation</TableHead>
                <TableHead className="text-xs font-semibold uppercase">Status</TableHead>
                <TableHead className="text-xs font-semibold uppercase">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profitPaths.map((path) => (
                <TableRow key={path.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${path.color}`} />
                      {path.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {path.flows.map(f => f.step).join(" → ")}
                  </TableCell>
                  <TableCell className="font-mono">{path.percentage}%</TableCell>
                  <TableCell>
                    <Badge 
                      variant={path.enabled ? "default" : "secondary"}
                      className={path.enabled ? "bg-profit/10 text-profit" : ""}
                    >
                      {path.enabled ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button className="p-1 hover:bg-muted rounded">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button className="p-1 hover:bg-muted rounded">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Wallet Mapping */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Mapping
          </CardTitle>
          <CardDescription>
            Configure which wallets receive profit allocations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(data.walletMapping).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label className="text-sm font-medium capitalize">{key} Wallet</Label>
                <Input
                  value={value}
                  onChange={(e) => updateField(`walletMapping.${key}`, e.target.value)}
                  className="font-mono text-sm"
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  System-generated wallet identifier
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg border border-muted bg-muted/30 text-muted-foreground text-sm">
            <Lock className="h-4 w-4" />
            <span>Wallet IDs are system-generated and cannot be modified</span>
          </div>
        </CardContent>
      </Card>

      {/* Cap Enforcement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cap Enforcement</CardTitle>
          <CardDescription>
            Control how earnings caps are enforced across the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div className="space-y-1">
              <Label className="text-base font-medium">Enable Cap Enforcement</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, earnings will be capped at configured limits
              </p>
            </div>
            <Switch
              checked={data.capEnforcement}
              onCheckedChange={(checked) => updateField("capEnforcement", checked)}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <Label className="text-sm font-medium">Excess Profit Routing</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Where to route profits that exceed cap limits
            </p>
            <div className="grid grid-cols-3 gap-3">
              {(["reserve", "trust", "company"] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => updateField("excessProfitRouting", option)}
                  className={`
                    p-3 rounded-lg border text-center transition-all
                    ${data.excessProfitRouting === option
                      ? "border-profit bg-profit/10 text-profit"
                      : "border-border hover:border-muted-foreground"}
                  `}
                >
                  <span className="capitalize font-medium">{option}</span>
                  <span className="block text-xs text-muted-foreground">Fund</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Read-only Ledger Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Ledger Preview (Read-only)
            </CardTitle>
            <Badge variant="secondary">Live Data</Badge>
          </div>
          <CardDescription>
            Current wallet balances across the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase">Wallet</TableHead>
                <TableHead className="text-xs font-semibold uppercase">Balance</TableHead>
                <TableHead className="text-xs font-semibold uppercase">Transactions</TableHead>
                <TableHead className="text-xs font-semibold uppercase">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledgerPreview.map((item) => (
                <TableRow key={item.wallet}>
                  <TableCell className="font-medium">{item.wallet}</TableCell>
                  <TableCell className="font-mono">{item.balance}</TableCell>
                  <TableCell className="font-mono">{item.transactions}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-profit/10 text-profit border-profit/20">
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </CommissionLayout>
  );
}
