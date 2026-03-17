import React, { useState } from "react";
import FinanceLayout from "@/components/finance/FinanceLayout";
import TDSConfigCard from "@/components/finance/TDSConfigCard";
import { Button } from "@/components/ui/button";
import { Plus, Download, History, Edit, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TDSRule {
  id: string;
  percentage: number;
  applicableWallets: string[];
  thresholdAmount: number;
  effectiveFrom: string;
  status: "active" | "scheduled" | "expired";
  version: number;
  createdBy?: string;
  createdAt?: string;
}

const mockTDSRules: TDSRule[] = [
  {
    id: "TDS-V3",
    percentage: 5,
    applicableWallets: ["Main Wallet", "Referral Wallet", "Core Body Wallet"],
    thresholdAmount: 0,
    effectiveFrom: "2026-01-01",
    status: "active",
    version: 3,
    createdBy: "System Admin",
    createdAt: "2025-12-15",
  },
  {
    id: "TDS-V2",
    percentage: 5,
    applicableWallets: ["Main Wallet", "Referral Wallet"],
    thresholdAmount: 10000,
    effectiveFrom: "2025-07-01",
    status: "expired",
    version: 2,
    createdBy: "System Admin",
    createdAt: "2025-06-20",
  },
  {
    id: "TDS-V1",
    percentage: 10,
    applicableWallets: ["Main Wallet"],
    thresholdAmount: 0,
    effectiveFrom: "2025-01-01",
    status: "expired",
    version: 1,
    createdBy: "System Admin",
    createdAt: "2024-12-15",
  },
];

export default function TDSConfiguration() {
  const [rules] = useState<TDSRule[]>(mockTDSRules);

  const stats = [
    { label: "Current TDS Rate", value: "5%", type: "neutral" as const, icon: "neutral" as const },
    { label: "Active Rules", value: "1", type: "positive" as const, icon: "up" as const },
    { label: "Scheduled Changes", value: "0", type: "neutral" as const, icon: "neutral" as const },
    { label: "Expired Rules", value: "2", type: "negative" as const, icon: "down" as const },
  ];

  const activeRule = rules.find(r => r.status === "active");

  return (
    <FinanceLayout
      title="TDS Configuration"
      description="Tax Deduction at Source compliance rules"
      icon="tds"
      stats={stats}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              ✓ Current Rate: 5%
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              All Wallets Covered
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><History className="w-4 h-4 mr-2" />View History</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />New Rule</Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-300">Legal Compliance Notice</h4>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                TDS rules are governed by income tax regulations (Section 194A, 194C, etc.). 
                Any changes require compliance team approval. Consult tax professionals before modification.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {rules.map((rule) => (
            <TDSConfigCard
              key={rule.id}
              id={rule.id}
              percentage={rule.percentage}
              applicableWallets={rule.applicableWallets}
              thresholdAmount={rule.thresholdAmount}
              effectiveFrom={rule.effectiveFrom}
              status={rule.status}
              version={rule.version}
              createdBy={rule.createdBy}
              createdAt={rule.createdAt}
              onEdit={() => console.log("Edit rule:", rule.id)}
              onViewHistory={() => console.log("View history:", rule.id)}
            />
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span><strong>Rule Version:</strong> {activeRule?.version || "N/A"} (Current)</span>
          <span>Rule changes apply to future transactions only</span>
        </div>
      </div>
    </FinanceLayout>
  );
}
