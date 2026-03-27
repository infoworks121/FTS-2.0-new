import { useEffect, useState } from "react";
import { Search, RefreshCw, FileDown } from "lucide-react";
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
                  <TableHead>Transaction ID</TableHead>
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
                  const isCredit = txn.txn_type === 'credit';
                  return (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-xs">
                        {new Date(txn.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs">TXN-{txn.id}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={isCredit ? "border-emerald-500/40 text-emerald-500" : "border-rose-500/40 text-rose-500"}
                        >
                          {txn.txn_type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="capitalize">{txn.source_type?.replace('_', ' ')}</span>
                        {txn.description && <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{txn.description}</p>}
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
                Showing {filteredTransactions.length} of {totalCount} records
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <div className="text-xs font-medium">Page {page} of {totalPages}</div>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


