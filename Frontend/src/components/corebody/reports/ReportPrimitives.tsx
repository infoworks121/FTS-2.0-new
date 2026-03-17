import { ReactNode, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownAZ, ArrowUpAZ, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricTone = "neutral" | "success" | "warning" | "danger";

const metricToneClass: Record<MetricTone, string> = {
  neutral: "border-border",
  success: "border-emerald-500/30",
  warning: "border-amber-500/30",
  danger: "border-red-500/30",
};

export function ReportPageHeader({
  title,
  districtName,
  onExport,
}: {
  title: string;
  districtName: string;
  onExport: (format: "pdf" | "csv") => void;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">District: {districtName} • Read-only monitoring and export view</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onExport("pdf")}>
          <Download className="h-3.5 w-3.5" /> PDF
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onExport("csv")}>
          <Download className="h-3.5 w-3.5" /> CSV
        </Button>
      </div>
    </div>
  );
}

export function ReportFilterBar({
  fromDate,
  toDate,
  dealerValue,
  dealerOptions,
  onFromDateChange,
  onToDateChange,
  onDealerChange,
  onClear,
  onApply,
}: {
  fromDate: string;
  toDate: string;
  dealerValue?: string;
  dealerOptions?: Array<{ label: string; value: string }>;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onDealerChange?: (value: string) => void;
  onClear: () => void;
  onApply: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Filter View</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="space-y-2">
          <Label>From</Label>
          <Input type="date" value={fromDate} onChange={(e) => onFromDateChange(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>To</Label>
          <Input type="date" value={toDate} onChange={(e) => onToDateChange(e.target.value)} />
        </div>
        {dealerOptions && onDealerChange ? (
          <div className="space-y-2">
            <Label>Dealer / Businessman</Label>
            <Select value={dealerValue ?? "all"} onValueChange={onDealerChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {dealerOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="xl:col-span-1" />
        )}
        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-2 xl:justify-end">
          <Button variant="outline" className="w-full md:w-auto" onClick={onClear}>
            Clear Filter
          </Button>
          <Button className="w-full md:w-auto" onClick={onApply}>
            Apply Filter
          </Button>
        </div>
      </CardContent>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">Filters affect only visible rows; source records remain unchanged.</p>
      </CardContent>
    </Card>
  );
}

export function ReportSummaryCards({ cards }: { cards: Array<{ label: string; value: ReactNode; hint?: string; tone?: MetricTone }> }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className={cn(metricToneClass[card.tone ?? "neutral"])}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{card.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-bold">{card.value}</p>
            {card.hint && <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

type SortDirection = "asc" | "desc";

type ReportColumn<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  sortAccessor?: (row: T) => string | number;
  render: (row: T) => ReactNode;
};

export function ReportDataTable<T>({
  columns,
  data,
  loading,
  emptyMessage,
  pageSize = 8,
}: {
  columns: ReportColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage: string;
  pageSize?: number;
}) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    setPage(1);
  }, [data.length]);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((column) => column.key === sortKey);
    if (!col) return data;
    const accessor = col.sortAccessor ?? ((row: T) => String(col.render(row)));
    return [...data].sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (typeof av === "number" && typeof bv === "number") {
        return sortDirection === "asc" ? av - bv : bv - av;
      }
      const cmp = String(av).localeCompare(String(bv), "en", { numeric: true, sensitivity: "base" });
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [columns, data, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pagedData = sortedData.slice(start, start + pageSize);

  const onSortClick = (column: ReportColumn<T>) => {
    if (!column.sortable) return;
    if (sortKey === column.key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(column.key);
    setSortDirection("asc");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Records</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className="whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSortClick(column)}
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                        column.sortable ? "hover:text-foreground" : "cursor-default"
                      )}
                    >
                      {column.header}
                      {column.sortable && sortKey === column.key && (sortDirection === "asc" ? <ArrowUpAZ className="h-3.5 w-3.5" /> : <ArrowDownAZ className="h-3.5 w-3.5" />)}
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: pageSize }).map((_, idx) => (
                    <TableRow key={`sk-${idx}`}>
                      <TableCell colSpan={columns.length}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : pagedData.map((row, idx) => (
                    <TableRow key={`row-${idx}`}>
                      {columns.map((column) => (
                        <TableCell key={`${column.key}-${idx}`} className={column.className}>
                          {column.render(row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
              {!loading && pagedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Showing {pagedData.length} of {sortedData.length} records</p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={safePage <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
              <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Prev
            </Button>
            <span className="text-xs text-muted-foreground">Page {safePage} / {totalPages}</span>
            <Button size="sm" variant="outline" disabled={safePage >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
              Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

