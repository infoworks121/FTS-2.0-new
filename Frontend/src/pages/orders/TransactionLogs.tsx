import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Filter, Lock, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { transactionLogs } from "./orderData";

export default function TransactionLogs() {
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");
  const [wallet, setWallet] = useState("all");

  const rows = useMemo(() => {
    return transactionLogs.filter((t) => {
      const s = search.toLowerCase();
      const matchSearch =
        t.id.toLowerCase().includes(s) ||
        t.linkedOrderId.toLowerCase().includes(s) ||
        t.reference.toLowerCase().includes(s);
      const matchSource = source === "all" || t.source === source;
      const matchWallet = wallet === "all" || t.walletType === wallet;
      return matchSearch && matchSource && matchWallet;
    });
  }, [search, source, wallet]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Transaction Logs</h1>
          <p className="text-sm text-muted-foreground">Read-only visibility of all money movement linked to orders and refunds</p>
        </div>
        <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export Audit CSV</Button>
      </div>

      <div className="rounded-lg border bg-card p-4 space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" placeholder="Search Transaction ID / Order Ref / Entry Ref" />
          </div>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="Order">Order</SelectItem>
              <SelectItem value="Refund">Refund</SelectItem>
            </SelectContent>
          </Select>
          <Select value={wallet} onValueChange={setWallet}>
            <SelectTrigger><SelectValue placeholder="Wallet" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wallets</SelectItem>
              <SelectItem value="Main">Main</SelectItem>
              <SelectItem value="Referral">Referral</SelectItem>
              <SelectItem value="Trust">Trust</SelectItem>
              <SelectItem value="Reserve">Reserve</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline"><Lock className="mr-1 h-3 w-3" />Read-only</Badge>
          <Badge variant="outline"><Filter className="mr-1 h-3 w-3" />Advanced filters applied</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Wallet Type</TableHead>
                <TableHead>Credit / Debit</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Linked Order</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.id}</TableCell>
                  <TableCell>{row.source}</TableCell>
                  <TableCell>{row.walletType}</TableCell>
                  <TableCell>
                    <Badge variant={row.direction === "Credit" ? "default" : "secondary"}>{row.direction}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">₹{row.amount.toLocaleString("en-IN")}</TableCell>
                  <TableCell>{row.timestamp}</TableCell>
                  <TableCell>{row.linkedOrderId}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

