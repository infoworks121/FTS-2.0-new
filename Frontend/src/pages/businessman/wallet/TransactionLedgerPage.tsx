import { useEffect, useState } from "react";
import { Search, RefreshCw, FileDown, Package, Truck, CheckCircle2, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const ITEMS_PER_PAGE = 15;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function TransactionLedgerPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [txnType, setTxnType] = useState<string>("all");
  const [query, setQuery] = useState("");
  const { toast } = useToast();

  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [orderDetail, setOrderDetail] = useState<any>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit: ITEMS_PER_PAGE,
      };
      if (txnType !== "all") params.type = txnType.toLowerCase();

      const response = await api.get("/wallet/me/transactions", { params });
      setTransactions(response.data.transactions);
      setTotalCount(response.data.total);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load ledger records",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    setIsDetailLoading(true);
    try {
        const response = await api.get(`/orders/${orderId}`);
        setOrderDetail(response.data);
    } catch (error) {
        console.error("Error fetching order details:", error);
        toast({
            title: "Unavailable",
            description: "Full order details could not be retrieved",
            variant: "destructive"
        });
    } finally {
        setIsDetailLoading(false);
    }
  };

  const handleRowClick = (txn: any) => {
    setSelectedTxn(txn);
    setOrderDetail(null);
    if (txn.source_type === 'order_payment' && txn.source_ref_id) {
        fetchOrderDetails(txn.source_ref_id);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, txnType]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

  // Local filtering for Search Query (Txn ID)
  const filteredTransactions = transactions.filter(t => 
    !query.trim() || t.id.toString().includes(query.trim())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Transaction Ledger</h1>
          <p className="text-sm text-muted-foreground">
            Complete immutable wallet history. This ledger is read-only, audit-safe, and sourced from backend records.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                Export Ledger
            </Button>
            <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <Select value={txnType} onValueChange={(v) => { setPage(1); setTxnType(v); }}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
                <SelectItem value="Debit">Debit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Search Transaction ID</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ID..."
                className="pl-8 font-mono"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            Ledger Entries
            <Badge variant="outline" className="font-mono">Live Audit Trail</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="w-[120px]">TXN ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source / Note</TableHead>
                  <TableHead>Amount (+ / −)</TableHead>
                  <TableHead>Balance After</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">Synchronizing with ledger...</p>
                        </TableCell>
                    </TableRow>
                ) : filteredTransactions.map((txn) => {
                  const type = (txn.txn_type || txn.transaction_type || '').toLowerCase();
                  const isCredit = type === 'credit';
                  return (
                    <TableRow 
                        key={txn.id} 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleRowClick(txn)}
                    >
                      <TableCell className="font-mono text-xs">
                        {new Date(txn.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs truncate max-w-[120px]">TXN-{txn.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={isCredit ? "border-emerald-500/40 text-emerald-500" : "border-rose-500/40 text-rose-500"}
                        >
                           {(txn.txn_type || txn.transaction_type || 'unknown').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="font-medium capitalize">{txn.source_type?.replace('_', ' ')}</div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                            {txn.items_summary || txn.description}
                        </div>
                      </TableCell>
                      <TableCell className={`font-mono font-bold ${isCredit ? "text-emerald-500" : "text-rose-500"}`}>
                        {isCredit ? "+" : "-"} {formatCurrency(parseFloat(txn.amount))}
                      </TableCell>
                      <TableCell className="font-mono">{formatCurrency(parseFloat(txn.balance_after || 0))}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Settled</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!isLoading && filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                      No matching records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">
                Showing {filteredTransactions.length} of {totalCount} records • Click any row for details
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <div className="text-xs font-medium">Page {page} of {totalPages}</div>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTxn} onOpenChange={(open) => !open && setSelectedTxn(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Transaction Detail</DialogTitle>
                <DialogDescription className="font-mono text-xs">
                    TXN-{selectedTxn?.id}
                </DialogDescription>
            </DialogHeader>

            {selectedTxn && (
                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/30 p-4 border border-border/50">
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">Amount</Label>
                            <p className={`text-lg font-bold ${(selectedTxn.txn_type || selectedTxn.transaction_type) === 'credit' ? "text-emerald-500" : "text-rose-500"}`}>
                                {(selectedTxn.txn_type || selectedTxn.transaction_type) === 'credit' ? "+" : "-"} {formatCurrency(parseFloat(selectedTxn.amount))}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">Date & Time</Label>
                            <p className="text-sm font-medium">{new Date(selectedTxn.created_at).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">Source</Label>
                            <p className="text-sm font-medium capitalize">{selectedTxn.source_type?.replace('_', ' ')}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">Post-Balance</Label>
                            <p className="text-sm font-medium">{formatCurrency(parseFloat(selectedTxn.balance_after))}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold flex items-center gap-2">
                            <Package className="h-3 w-3" />
                            Activity Details
                        </h4>
                        <p className="text-sm text-card-foreground bg-muted/10 p-3 rounded border border-dashed">
                            {selectedTxn.description || "No description provided."}
                        </p>
                    </div>

                    {selectedTxn.source_type === 'order_payment' && (
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold flex items-center gap-2 text-primary">
                                    <Truck className="h-3 w-3" />
                                    Order Fulfillment Status
                                </h4>
                                {isDetailLoading && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
                            </div>

                            {!isDetailLoading && orderDetail ? (
                                <div className="space-y-6">
                                    {/* Order Status Stepper */}
                                    <div className="relative flex justify-between items-center px-8">
                                        <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-muted -translate-y-1/2 z-0" />
                                        {[
                                            { status: 'pending', icon: Clock, label: 'Placed' },
                                            { status: 'assigned', icon: MapPin, label: 'Assigned' },
                                            { status: 'dispatched', icon: Truck, label: 'Dispatched' },
                                            { status: 'delivered', icon: CheckCircle2, label: 'Delivered' }
                                        ].map((step, idx) => {
                                            const statuses = ['pending', 'assigned', 'accepted', 'dispatched', 'delivered'];
                                            const currentIdx = statuses.indexOf(orderDetail.order.status.toLowerCase());
                                            const stepIdx = statuses.indexOf(step.status);
                                            const isDone = currentIdx >= stepIdx;
                                            const isCurrent = orderDetail.order.status.toLowerCase() === step.status;

                                            return (
                                                <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 bg-background transition-colors ${
                                                        isDone ? "border-primary text-primary" : "border-muted text-muted-foreground"
                                                    } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}>
                                                        <step.icon className="h-4 w-4" />
                                                    </div>
                                                    <span className={`text-[10px] font-medium ${isDone ? "text-foreground" : "text-muted-foreground"}`}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Item List */}
                                    <div className="space-y-3">
                                        <h5 className="text-[10px] font-bold uppercase text-muted-foreground">Items in this order</h5>
                                        <div className="rounded-md border divide-y bg-muted/5">
                                            {orderDetail.items.map((item: any) => (
                                                <div key={item.id} className="p-3 flex justify-between items-center text-sm">
                                                    <div>
                                                        <p className="font-medium">{item.product_name}</p>
                                                        {item.variant_name && <p className="text-[10px] text-muted-foreground">{item.variant_name}</p>}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-mono">{item.quantity} x {formatCurrency(item.unit_price)}</p>
                                                        <p className="text-xs font-bold">{formatCurrency(item.total_price)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Link */}
                                    <Button variant="outline" className="w-full text-xs" onClick={() => window.location.href = `/businessman/orders`}>
                                        Manage Orders
                                    </Button>
                                </div>
                            ) : !isDetailLoading && (
                                <p className="text-xs text-muted-foreground text-center py-4 bg-muted/20 rounded border border-dashed">
                                    Click "Manage Orders" to see full tracking for Order #{selectedTxn.source_ref_id?.slice(0, 8)}...
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


