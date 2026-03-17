import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { Download, FileLock2, Fingerprint, ShieldCheck, Timer } from "lucide-react";

export type ActionType = "Create" | "Update" | "Approve" | "Freeze";
export type LedgerDirection = "Credit" | "Debit";
export type AccessResult = "Success" | "Failed";

export function MonospaceId({ value, className }: { value: string; className?: string }) {
  return <span className={cn("font-mono text-xs tracking-tight", className)}>{value}</span>;
}

export function IntegrityBadge() {
  return (
    <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
      <ShieldCheck className="h-3 w-3" />
      Cryptographically Verifiable
    </Badge>
  );
}

export function ReadonlyAuditStrip() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <Badge variant="outline" className="gap-1"><FileLock2 className="h-3 w-3" />Read-only UI</Badge>
      <Badge variant="outline" className="gap-1"><Fingerprint className="h-3 w-3" />Tamper-proof records</Badge>
      <Badge variant="outline" className="gap-1"><Timer className="h-3 w-3" />Time-range mandatory for export</Badge>
      <IntegrityBadge />
    </div>
  );
}

export function ExportButtons({ disabled }: { disabled: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" disabled={disabled}>
        <Download className="mr-2 h-4 w-4" />CSV
      </Button>
      <Button variant="outline" size="sm" disabled={disabled}>
        <Download className="mr-2 h-4 w-4" />PDF
      </Button>
    </div>
  );
}

export function ActionTypeBadge({ action }: { action: ActionType }) {
  const styles: Record<ActionType, string> = {
    Create: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    Update: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    Approve: "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300",
    Freeze: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  };

  return <Badge variant="outline" className={styles[action]}>{action}</Badge>;
}

export function CreditDebitBadge({ direction }: { direction: LedgerDirection }) {
  const isCredit = direction === "Credit";
  return (
    <Badge
      variant="outline"
      className={cn(
        isCredit
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
      )}
    >
      {direction}
    </Badge>
  );
}

export function AccessResultBadge({ result }: { result: AccessResult }) {
  const isSuccess = result === "Success";
  return (
    <Badge
      variant="outline"
      className={cn(
        isSuccess
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      )}
    >
      {result}
    </Badge>
  );
}

export function AuditPagination({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (next: number) => void;
}) {
  if (total <= 1) return null;

  return (
    <Pagination className="justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onChange(Math.max(1, page - 1));
            }}
            className={page === 1 ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>

        {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              href="#"
              isActive={page === p}
              onClick={(e) => {
                e.preventDefault();
                onChange(p);
              }}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onChange(Math.min(total, page + 1));
            }}
            className={page === total ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

