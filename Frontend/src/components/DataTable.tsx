import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  accessorKey?: string;
  cell?: (props: { row: { original: T } }) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  loading?: boolean;
  noDataMessage?: string;
}

export function DataTable<T extends Record<string, any>>({ 
  columns, 
  data, 
  title,
  loading = false,
  noDataMessage = "No data found."
}: DataTableProps<T>) {
  return (
    <div className="rounded-lg border border-border bg-card transition-colors duration-300">
      {title && (
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {columns.map((col, i) => (
                <TableHead key={i} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-sm font-medium text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span>Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-sm font-medium text-muted-foreground italic">
                  {noDataMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, ri) => (
                <TableRow key={ri} className="border-border hover:bg-muted/50">
                  {columns.map((col, ci) => {
                    let content: React.ReactNode = "";
                    
                    if (col.cell) {
                      content = col.cell({ row: { original: row } });
                    } else if (col.accessorKey) {
                      content = String(row[col.accessorKey] ?? "");
                    } else if (col.accessor) {
                      content = typeof col.accessor === "function" 
                        ? col.accessor(row) 
                        : String(row[col.accessor as keyof T] ?? "");
                    }
                    
                    return (
                      <TableCell key={ci} className={col.className}>
                        {content}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <p className="text-xs text-muted-foreground">Showing {data.length} entries</p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronLeft className="h-3.5 w-3.5" /></Button>
          <span className="text-xs font-medium text-muted-foreground px-2">Page 1</span>
          <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronRight className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    </div>
  );
}
