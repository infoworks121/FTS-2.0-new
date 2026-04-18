import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { navItems } from "@/pages/CoreBodyDashboard";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search, FileDown } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const DISTRICT_NAME = "District North";
const ITEMS_PER_PAGE = 10;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function EarningsLedger() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [txnType, setTxnType] = useState<string>("all");
  const { toast } = useToast();

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit: ITEMS_PER_PAGE,
      };
      if (txnType !== "all") params.type = txnType;

      const response = await api.get("/wallet/me/transactions", { params });
      setTransactions(response.data.transactions);
      setTotalCount(response.data.total);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load ledger entries",
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

  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel={`Core Body — ${DISTRICT_NAME}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Earnings Ledger</h1>
            <p className="text-sm text-muted-foreground">
              Immutable earnings history for district finance visibility. Entries are ledger-backed and non-editable.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filter & Search</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select value={txnType} onValueChange={(v) => { setPage(1); setTxnType(v); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="credit">Earnings (Credit)</SelectItem>
                  <SelectItem value="debit">Withdrawals/Fees (Debit)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Additional filters can be added here */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Ledger Entries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">Fetching ledger records...</p>
                      </TableCell>
                    </TableRow>
                  ) : transactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-xs">
                        {new Date(txn.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {txn.source_type?.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">
                        {txn.description || "N/A"}
                      </TableCell>
                      <TableCell className={`font-mono font-bold ${['credit', 'deposit'].includes(txn.txn_type) ? 'text-green-600' : 'text-red-600'}`}>
                        {['credit', 'deposit'].includes(txn.txn_type) ? '+' : '-'}{formatCurrency(parseFloat(txn.amount))}
                      </TableCell>
                      <TableCell className="capitalize">{['credit', 'deposit'].includes(txn.txn_type) ? 'credit' : txn.txn_type}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Confirmed</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                        No ledger entries found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {transactions.length} of {totalCount} records
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed bg-muted/20">
          <CardHeader>
            <CardTitle className="text-sm">Financial Integrity Notice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              This ledger is a real-time representation of your account activity. All transactions are logged with 
              cryptographic links to their source (orders, referrals, or system adjustments) to ensure absolute auditability.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}


