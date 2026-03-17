import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RuleStatusBadge } from "./RuleStatusBadge";
import { Lock, Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface RuleHistoryItem {
  id: string;
  version: number;
  effectiveFrom: string;
  effectiveTo?: string;
  status: "active" | "scheduled" | "archived";
  changes: string;
  changedBy: string;
  changedAt: string;
  details?: {
    field: string;
    oldValue: string | number;
    newValue: string | number;
  }[];
}

interface RuleHistoryTableProps {
  history: RuleHistoryItem[];
  title?: string;
}

export function RuleHistoryTable({ history, title = "Rule History" }: RuleHistoryTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
        </div>
        <span className="text-xs text-muted-foreground">Read-only</span>
      </div>
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Version</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Effective From</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Effective To</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Changes</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Changed By</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item) => (
              <TableRow key={item.id} className="border-border hover:bg-muted/50">
                <TableCell className="font-mono text-sm text-card-foreground">v{item.version}</TableCell>
                <TableCell>
                  <RuleStatusBadge 
                    status={item.status} 
                    scheduledDate={item.status === "scheduled" ? item.effectiveFrom : undefined}
                  />
                </TableCell>
                <TableCell className="text-sm text-card-foreground">{item.effectiveFrom}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.effectiveTo || "—"}
                </TableCell>
                <TableCell className="text-sm text-card-foreground">{item.changes}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.changedBy}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.changedAt}</TableCell>
                <TableCell>
                  {item.details && item.details.length > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="p-1 hover:bg-muted rounded">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="w-80">
                          <div className="space-y-2">
                            <p className="font-semibold text-xs uppercase tracking-wider">Change Details</p>
                            {item.details.map((detail, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{detail.field}:</span>
                                <span className="font-mono">
                                  {detail.oldValue} → {detail.newValue}
                                </span>
                              </div>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {history.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Lock className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No rule history available</p>
        </div>
      )}
    </div>
  );
}
