import React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, ArrowDownLeft, FileText, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface LedgerTransaction {
  id: string;
  date: string;
  time: string;
  description: string;
  reference?: string;
  type: "credit" | "debit";
  amount: number;
  balance: number;
  status: "completed" | "pending" | "failed" | "reversed";
  user?: string;
  remarks?: string;
}

interface LedgerTableProps {
  transactions: LedgerTransaction[];
  title?: string;
  showExport?: boolean;
  showFilters?: boolean;
  onExport?: () => void;
  onRowClick?: (transaction: LedgerTransaction) => void;
  isLoading?: boolean;
}

const statusStyles: Record<string, string> = {
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  reversed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const formatAmount = (amount: number, type: "credit" | "debit") => {
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return type === "credit" ? `+₹${formatted}` : `-₹${formatted}`;
};

const formatBalance = (balance: number) => {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance);
};

export default function LedgerTable({
  transactions,
  title = "Transaction Ledger",
  showExport = true,
  showFilters = true,
  onExport,
  onRowClick,
  isLoading = false,
}: LedgerTableProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <Badge variant="outline" className="ml-2">
            {transactions.length} entries
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {showFilters && (
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          )}
          {showExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-gray-600 dark:text-gray-300">
                Date & Time
              </TableHead>
              <TableHead className="font-semibold text-gray-600 dark:text-gray-300">
                Description
              </TableHead>
              <TableHead className="font-semibold text-gray-600 dark:text-gray-300">
                Reference
              </TableHead>
              <TableHead className="font-semibold text-gray-600 dark:text-gray-300 text-right">
                Amount
              </TableHead>
              <TableHead className="font-semibold text-gray-600 dark:text-gray-300 text-right">
                Balance
              </TableHead>
              <TableHead className="font-semibold text-gray-600 dark:text-gray-300">
                Status
              </TableHead>
              <TableHead className="font-semibold text-gray-600 dark:text-gray-300">
                Remarks
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    Loading transactions...
                  </div>
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(transaction)}
                >
                  <TableCell className="py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {transaction.date}
                      </span>
                      <span className="text-xs text-gray-500">
                        {transaction.time}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {transaction.description}
                      </span>
                      {transaction.user && (
                        <span className="text-xs text-gray-500">
                          {transaction.user}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {transaction.reference || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {transaction.type === "credit" ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          transaction.type === "credit"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        )}
                      >
                        {formatAmount(transaction.amount, transaction.type)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      ₹{formatBalance(transaction.balance)}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge className={statusStyles[transaction.status]}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.remarks || "-"}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Audit Notice */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <FileText className="w-4 h-4 text-gray-500" />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This is a read-only ledger. All entries are immutable and permanently logged for audit purposes.
          Any modifications require proper authorization and will be tracked.
        </p>
      </div>
    </div>
  );
}
