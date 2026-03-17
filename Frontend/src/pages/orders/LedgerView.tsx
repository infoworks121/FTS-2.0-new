import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileLock2, Landmark } from "lucide-react";
import { ledgerEntries } from "./orderData";

export default function LedgerView() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Ledger View</h1>
          <p className="text-sm text-muted-foreground">Immutable financial truth layer with wallet-wise running balance and references</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />CSV</Button>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Main Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono font-bold">₹9,12,500</p>
            <p className="text-xs text-muted-foreground">Running balance from immutable entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Referral Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono font-bold">₹1,20,340</p>
            <p className="text-xs text-muted-foreground">Auto-adjusted by refund reversals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Trust Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono font-bold">₹4,35,600</p>
            <p className="text-xs text-muted-foreground">Order-linked trust allocations</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline"><FileLock2 className="mr-1 h-3 w-3" />Immutable</Badge>
          <Badge variant="outline"><Landmark className="mr-1 h-3 w-3" />Audit Ready</Badge>
          <span>No edit/delete controls available</span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entry ID</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Reference ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Running Balance</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledgerEntries.map((entry) => (
                <TableRow key={entry.entryId}>
                  <TableCell className="font-medium">{entry.entryId}</TableCell>
                  <TableCell>{entry.wallet}</TableCell>
                  <TableCell>{entry.referenceId}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell className="text-right font-mono">{entry.credit ? `₹${entry.credit.toLocaleString("en-IN")}` : "—"}</TableCell>
                  <TableCell className="text-right font-mono">{entry.debit ? `₹${entry.debit.toLocaleString("en-IN")}` : "—"}</TableCell>
                  <TableCell className="text-right font-mono">₹{entry.runningBalance.toLocaleString("en-IN")}</TableCell>
                  <TableCell>{entry.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

