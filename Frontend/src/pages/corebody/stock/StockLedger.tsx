import { useEffect, useState } from "react";
import { coreBodyApi, StockLedgerEntry } from "@/lib/coreBodyApi";
import { DataTable } from "@/components/DataTable";
import { KPICard } from "@/components/KPICard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, History, ArrowDownCircle, ArrowUpCircle, Info, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function StockLedger() {
  const [ledger, setLedger] = useState<StockLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        setLoading(true);
        const data = await coreBodyApi.getCoreBodyStockLedger();
        setLedger(data.ledger);
      } catch (error) {
        console.error("Error fetching stock ledger:", error);
        toast.error("Failed to load stock ledger data");
      } finally {
        setLoading(false);
      }
    };
    fetchLedger();
  }, []);

  const filteredLedger = ledger.filter(
    (entry) =>
      entry.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.product_sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.transaction_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalMovements: ledger.length,
    todayMovements: ledger.filter(
      (e) => new Date(e.created_at).toDateString() === new Date().toDateString()
    ).length,
    totalIn: ledger.filter((e) => Number(e.quantity) > 0).length,
    totalOut: ledger.filter((e) => Number(e.quantity) < 0).length,
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'stock_issue_out':
        return { label: "TRANSFER OUT", color: "bg-red-500/10 text-red-500 border-red-500/20" };
      case 'stock_issue_in':
        return { label: "TRANSFER IN", color: "bg-green-500/10 text-green-500 border-green-500/20" };
      case 'stock_adjustment':
        return { label: "ADJUSTMENT", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
      default:
        return { label: type.toUpperCase().replace(/_/g, ' '), color: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Stock Ledger</h1>
        <p className="text-muted-foreground">
          Complete audit trail of all historical stock movements and transactions.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Logs"
          value={String(stats.totalMovements)}
          icon={History}
          variant="default"
        />
        <KPICard
          title="Today's Activity"
          value={String(stats.todayMovements)}
          icon={Info}
          variant="profit"
        />
        <KPICard
          title="Inbound Events"
          value={String(stats.totalIn)}
          icon={ArrowDownCircle}
          variant="default"
          subtitle="Stock receipts"
        />
        <KPICard
          title="Outbound Events"
          value={String(stats.totalOut)}
          icon={ArrowUpCircle}
          variant="risk"
          subtitle="Dispatches to dealers"
        />
      </div>

      {/* Filters and Search */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by product, SKU or type..."
                className="pl-9 bg-background/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 border border-border/50 text-xs font-medium">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Auto-refresh: <span className="text-profit font-bold">Enabled</span></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Table */}
      <div className="rounded-lg border border-border bg-card">
        <DataTable
          loading={loading}
          columns={[
            {
              header: "Timestamp",
              accessor: (row: StockLedgerEntry) => (
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{new Date(row.created_at).toLocaleDateString()}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{new Date(row.created_at).toLocaleTimeString()}</span>
                </div>
              ),
            },
            {
              header: "Product Detail",
              accessor: (row: StockLedgerEntry) => (
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-foreground">{row.product_name}</span>
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{row.product_sku}</span>
                    {row.variant_name && (
                      <Badge variant="outline" className="text-[8px] py-0 h-3 leading-none bg-blue-500/5">
                        {row.variant_name}
                      </Badge>
                    )}
                  </div>
                </div>
              ),
            },
            {
              header: "Transaction Type",
              accessor: (row: StockLedgerEntry) => {
                const badge = getTransactionBadge(row.transaction_type);
                return (
                  <Badge className={`py-0 text-[10px] uppercase font-bold border ${badge.color}`}>
                    {badge.label}
                  </Badge>
                );
              },
            },
            {
              header: "Quantity",
              accessor: (row: StockLedgerEntry) => (
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-black font-mono tracking-tighter ${Number(row.quantity) >= 0 ? 'text-profit' : 'text-risk'}`}>
                    {Number(row.quantity) > 0 ? '+' : ''}{Number(row.quantity).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">{row.unit || 'units'}</span>
                </div>
              ),
            },
            {
              header: "Movement Note",
              accessor: (row: StockLedgerEntry) => (
                <div className="max-w-[200px]">
                  <p className="text-xs text-muted-foreground italic line-clamp-2">
                    {row.note || "No additional notes provided."}
                  </p>
                </div>
              ),
            },
          ]}
          data={filteredLedger}
        />
      </div>
    </div>
  );
}
