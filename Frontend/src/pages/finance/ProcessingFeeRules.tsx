import React, { useState } from "react";
import FinanceLayout from "@/components/finance/FinanceLayout";
import FeeRuleCard from "@/components/finance/FeeRuleCard";
import { Button } from "@/components/ui/button";
import { Plus, Download, History, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FeeRule {
  id: string;
  feeType: "flat" | "percentage";
  feeValue: number;
  applicableWallets: string[];
  minimumFee?: number;
  maximumFee?: number;
  effectiveFrom: string;
  status: "active" | "disabled" | "scheduled";
  version: number;
}

const mockFeeRules: FeeRule[] = [
  {
    id: "FEE-V3",
    feeType: "percentage",
    feeValue: 0.1,
    applicableWallets: ["Main Wallet", "Referral Wallet", "Core Body Wallet"],
    minimumFee: 10,
    maximumFee: 100,
    effectiveFrom: "2026-01-01",
    status: "active",
    version: 3,
  },
  {
    id: "FEE-V2",
    feeType: "flat",
    feeValue: 25,
    applicableWallets: ["Main Wallet"],
    effectiveFrom: "2025-07-01",
    status: "disabled",
    version: 2,
  },
  {
    id: "FEE-V1",
    feeType: "percentage",
    feeValue: 0.5,
    applicableWallets: ["Main Wallet", "Referral Wallet"],
    minimumFee: 5,
    maximumFee: 50,
    effectiveFrom: "2025-01-01",
    status: "disabled",
    version: 1,
  },
];

export default function ProcessingFeeRules() {
  const [rules, setRules] = useState<FeeRule[]>(mockFeeRules);

  const stats = [
    { label: "Current Fee", value: "0.1%", type: "neutral" as const, icon: "neutral" as const },
    { label: "Min Fee", value: "₹10", type: "neutral" as const, icon: "neutral" as const },
    { label: "Max Fee", value: "₹100", type: "neutral" as const, icon: "neutral" as const },
    { label: "Active Rules", value: "1", type: "positive" as const, icon: "up" as const },
  ];

  const handleToggle = (id: string, enabled: boolean) => {
    console.log("Toggle rule:", id, enabled);
  };

  return (
    <FinanceLayout
      title="Processing Fee Rules"
      description="Platform fee management for withdrawals"
      icon="fee"
      stats={stats}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              ✓ Active: 0.1% (Min ₹10, Max ₹100)
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
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Fee Policy Notice</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                Processing fees must comply with payment gateway regulations and RBI guidelines. 
                Unauthorized fee changes may result in regulatory action. All changes require 
                finance team approval.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <FeeRuleCard
              key={rule.id}
              id={rule.id}
              feeType={rule.feeType}
              feeValue={rule.feeValue}
              applicableWallets={rule.applicableWallets}
              minimumFee={rule.minimumFee}
              maximumFee={rule.maximumFee}
              effectiveFrom={rule.effectiveFrom}
              status={rule.status}
              version={rule.version}
              onToggle={(enabled) => handleToggle(rule.id, enabled)}
              onEdit={() => console.log("Edit rule:", rule.id)}
              onViewHistory={() => console.log("View history:", rule.id)}
            />
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span><strong>Fee Calculation:</strong> (Withdrawal Amount × 0.1%) with Min ₹10 and Max ₹100</span>
          <span>Rule changes apply to future transactions only</span>
        </div>
      </div>
    </FinanceLayout>
  );
}
