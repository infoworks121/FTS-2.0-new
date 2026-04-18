import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowDownCircle, History, Landmark, Search, Filter } from "lucide-react";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: string;
  transaction_type: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  description: string;
  created_at: string;
}

export default function InvestWallet() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balanceRes, ledgerRes] = await Promise.all([
        api.get("/admin/wallet/invest/balance"),
        api.get("/admin/wallet/invest/ledger")
      ]);
      setBalance(parseFloat(balanceRes.data.balance));
      setTransactions(ledgerRes.data.transactions);
    } catch (error) {
      console.error("Error fetching invest wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    tx.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 container mx-auto px-4 py-8">
      {/* Header & Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 overflow-hidden border-none bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white shadow-xl shadow-indigo-100">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Wallet className="h-32 w-32" />
            </div>
            <div className="flex flex-col justify-between h-full space-y-8">
              <div>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-3 py-1 mb-4 backdrop-blur-md">
                  CENTRAL PLATFORM WALLET
                </Badge>
                <h1 className="text-4xl font-extrabold tracking-tight">Superadmin Invest Wallet</h1>
                <p className="text-indigo-100/80 mt-2 max-w-md">
                  Centralized vault holding all product advance payments and businessman investments across the platform.
                </p>
              </div>
              
              <div className="flex items-end gap-6">
                <div>
                  <p className="text-sm font-medium text-indigo-100/60 uppercase tracking-widest mb-1">Total Assets</p>
                  <div className="text-5xl font-black">
                    ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                
                <div className="flex gap-2 pb-1">
                  <div className="h-12 w-[1px] bg-white/20 mx-2" />
                  <div>
                    <p className="text-[10px] font-bold text-indigo-100/60 uppercase mb-1">Status</p>
                    <Badge className="bg-green-400/20 text-green-300 border-none px-2 py-0.5 pointer-events-none">
                      Operational
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm border border-indigo-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Landmark className="h-5 w-5 text-indigo-600" />
              Quick Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
              <span className="text-sm text-indigo-700 font-medium">Investments Processed</span>
              <span className="font-bold text-indigo-900">{transactions.length}</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
              <span className="text-sm text-emerald-700 font-medium">Current Month Growth</span>
              <span className="font-bold text-emerald-800">+12.5%</span>
            </div>
            <div className="pt-4 border-t border-indigo-50 mt-4 space-y-2">
              <p className="text-[11px] text-muted-foreground italic">
                * This wallet exclusively holds advance payments that are restricted for platform liquidity.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ledger Section */}
      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-50 bg-gray-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <History className="h-6 w-6 text-indigo-600" />
                Investment Ledger
              </CardTitle>
              <CardDescription>Real-time audit trail of all incoming investments</CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search user or amount..." 
                  className="pl-10 h-10 border-gray-200 focus:ring-indigo-500 rounded-lg shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="h-10 gap-2 border-gray-200 shadow-sm rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="border-none">
                  <TableHead className="w-[200px] font-bold text-gray-600">DATE & TIME</TableHead>
                  <TableHead className="font-bold text-gray-600">DESCRIPTION</TableHead>
                  <TableHead className="font-bold text-gray-600 text-right">AMOUNT</TableHead>
                  <TableHead className="font-bold text-gray-600 text-right">BALANCE AFTER</TableHead>
                  <TableHead className="w-[120px] text-center font-bold text-gray-600">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell colSpan={5} className="h-16 bg-gray-50/20" />
                    </TableRow>
                  ))
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No transactions found for this search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-indigo-50/30 transition-colors border-b border-gray-50 last:border-none">
                      <TableCell className="font-medium text-gray-600">
                        {new Date(tx.created_at).toLocaleDateString("en-IN", { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                        <span className="block text-[10px] text-gray-400 uppercase font-black tracking-tighter mt-0.5">
                          {new Date(tx.created_at).toLocaleTimeString("en-IN", { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-semibold text-gray-800">{tx.description}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-1 uppercase tracking-widest">REF: {tx.id.substring(0, 8)}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-base font-bold text-indigo-700">
                          +₹{parseFloat(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-medium text-gray-700">
                          ₹{parseFloat(tx.balance_after).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-emerald-100 text-emerald-700 border-none shadow-sm hover:bg-emerald-200 transition-all font-bold text-[10px]">
                          <ArrowDownCircle className="h-3 w-3 mr-1" />
                          SUCCESS
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
