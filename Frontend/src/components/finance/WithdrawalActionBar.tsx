import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WithdrawalRequest {
  id: string;
  userName: string;
  walletType: string;
  requestedAmount: number;
  tds: number;
  processingFee: number;
  netPayable: number;
  requestDate: string;
  riskLevel?: "low" | "medium" | "high";
}

interface WithdrawalActionBarProps {
  selectedRequests: string[];
  requests: WithdrawalRequest[];
  onApprove: (ids: string[]) => void;
  onReject: (ids: string[]) => void;
  onViewDetails: (id: string) => void;
  onExport?: () => void;
  isProcessing?: boolean;
}

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const riskStyles = {
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function WithdrawalActionBar({
  selectedRequests,
  requests,
  onApprove,
  onReject,
  onViewDetails,
  onExport,
  isProcessing = false,
}: WithdrawalActionBarProps) {
  const selectedTotal = requests
    .filter((r) => selectedRequests.includes(r.id))
    .reduce((sum, r) => sum + r.netPayable, 0);

  const hasHighRisk = requests
    .filter((r) => selectedRequests.includes(r.id))
    .some((r) => r.riskLevel === "high");

  return (
    <div className="sticky bottom-4 z-10">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Selection Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedRequests.length === requests.length && requests.length > 0}
                onChange={() => {
                  if (selectedRequests.length === requests.length) {
                    onApprove([]); // This will clear selection in parent
                  } else {
                    onApprove(requests.map((r) => r.id));
                  }
                }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedRequests.length} selected
              </span>
            </div>

            {selectedRequests.length > 0 && (
              <>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total:
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    ₹{formatAmount(selectedTotal)}
                  </span>
                </div>

                {hasHighRisk && (
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Contains High Risk
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}

            {selectedRequests.length > 0 && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:hover:bg-red-900/20"
                        onClick={() => onReject(selectedRequests)}
                        disabled={isProcessing}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reject selected requests</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => onApprove(selectedRequests)}
                        disabled={isProcessing || hasHighRisk}
                      >
                        {isProcessing ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve All
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {hasHighRisk 
                        ? "High risk requests require manual review" 
                        : "Approve all selected requests"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
        </div>

        {/* Warning Notice */}
        {selectedRequests.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span>
                All approval actions are logged permanently. Ensure proper verification before processing payouts.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple Checkbox component
function Checkbox({ 
  checked, 
  onChange 
}: { 
  checked: boolean; 
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
        checked
          ? "bg-blue-600 border-blue-600"
          : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
      )}
    >
      {checked && (
        <svg
          className="w-3 h-3 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </button>
  );
}
