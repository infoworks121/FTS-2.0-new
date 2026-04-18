import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FinanceLayout from "@/components/finance/FinanceLayout";
import { 
  Search, 
  RefreshCw, 
  Wallet, 
  ArrowUpRight,
  Shield,
  ShieldAlert,
  SearchX,
  History,
  Eye,
  ArrowDownLeft,
  Calendar,
  Landmark,
  Info as InfoIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import walletApi, { UserWalletBalance } from "@/lib/walletApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

export default function AllUserWallets() {
  const [users, setUsers] = useState<UserWalletBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();

  // History Modal State
  const [selectedUser, setSelectedUser] = useState<UserWalletBalance | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  const handleNavigateToUserSettings = (user: UserWalletBalance) => {
    if (user.role_code === 'businessman' || user.role_code === 'stock_point') {
      navigate(`/admin/users/businessmen/${user.user_id}/settings`);
    } else if (user.role_code === 'corebody' || user.role_code === 'core_body_a' || user.role_code === 'core_body_b' || user.role_code === 'dealer') {
      navigate(`/admin/users/corebody/${user.user_id}/settings`);
    }
  };

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const data = await walletApi.getAllUserWallets(searchTerm, page);
      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user wallets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserHistory = async (userId: string, p: number) => {
    setHistoryLoading(true);
    try {
      const data = await walletApi.getUserTransactions(userId, p);
      setTransactions(data.transactions);
      setHistoryTotal(data.total);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch transaction history",
        variant: "destructive",
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenHistory = (user: UserWalletBalance) => {
    setSelectedUser(user);
    setHistoryPage(1);
    setSummary(null);
    setIsHistoryOpen(true);
    fetchUserHistory(user.user_id, 1);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchWallets();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, page]);

  useEffect(() => {
    if (selectedUser && isHistoryOpen) {
      fetchUserHistory(selectedUser.user_id, historyPage);
    }
  }, [historyPage]);

  const getRoleBadge = (role: string, businessmanType?: string | null) => {
    switch (role) {
      case 'admin': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">Admin</Badge>;
      case 'core_body_a': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">CB-A</Badge>;
      case 'core_body_b': return <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100 border-none">CB-B</Badge>;
      case 'businessman': {
        if (businessmanType === 'retailer_a') return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Retailer A</Badge>;
        if (businessmanType === 'retailer_b') return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Retailer B</Badge>;
        if (businessmanType === 'stock_point') return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">Stock Point</Badge>;
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">{businessmanType ? businessmanType.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Businessman'}</Badge>;
      }
      case 'stock_point': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">Stock Point</Badge>;
      case 'dealer': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Dealer</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <FinanceLayout
      title="All User Wallets"
      description="Monitor and manage balances for all platform users"
      icon="wallet"
    >
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email or phone..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" onClick={fetchWallets} disabled={loading} className="flex-1 md:flex-none">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Information</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Main Balance</TableHead>
                  <TableHead className="text-right">Referral Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6} className="h-16 animate-pulse bg-muted/20" />
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <SearchX className="h-10 w-10 mb-2 opacity-20" />
                        <p>No users found matching your search</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleOpenHistory(user)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-blue-600 hover:underline decoration-blue-600/30">{user.full_name}</span>
                          <span className="text-xs text-muted-foreground">{user.email || user.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role_code, user.businessman_type)}</TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        ₹{parseFloat(user.main_balance.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        ₹{parseFloat(user.referral_balance.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        {user.main_frozen ? (
                          <Badge variant="destructive" className="flex items-center w-fit gap-1">
                            <ShieldAlert className="h-3 w-3" /> Frozen
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 flex items-center w-fit gap-1">
                            <Shield className="h-3 w-3" /> Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleOpenHistory(user)}
                            title="View Wallet Details"
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleNavigateToUserSettings(user)}
                            title="User Settings"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {total > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Showing {users.length} of {total} users</p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={users.length < 50} 
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction History Modal */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <History className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle>Wallet Transaction History</DialogTitle>
                  <DialogDescription>
                    Full financial audit for {selectedUser?.full_name}
                  </DialogDescription>
                </div>
              </div>

              {getRoleBadge(selectedUser?.role_code || '', selectedUser?.businessman_type)}
            </div>
          </DialogHeader>

          {/* Statistics Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-6 pt-4 bg-muted/20 border-b">
            <Card className="border-none shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Wallet className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">Total Balance</span>
                  <span className="text-lg font-mono font-bold">
                    ₹{summary ? parseFloat(summary.total_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-4 flex items-center gap-3 text-green-600">
                <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">Total Earnings</span>
                  <span className="text-lg font-mono font-bold">
                    ₹{summary ? parseFloat(summary.total_earnings).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-4 flex items-center gap-3 text-red-600">
                <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center">
                  <ArrowDownLeft className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">Withdrawals</span>
                  <span className="text-lg font-mono font-bold">
                    ₹{summary ? parseFloat(summary.total_withdrawals).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-4 flex items-center gap-3 text-blue-600">
                <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">Referral Share</span>
                  <span className="text-lg font-mono font-bold">
                    ₹{summary ? parseFloat(summary.referral_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-gradient-to-br from-violet-50 to-purple-50 border border-purple-100">
              <CardContent className="p-4 flex items-center gap-3 text-purple-700">
                <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Landmark className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-purple-600/60 tracking-wider leading-none mb-1">Total Invested</span>
                  <span className="text-lg font-mono font-bold whitespace-nowrap">
                    ₹{summary ? parseFloat(summary.total_invest_paid).toLocaleString('en-IN') : '0'} / ₹{summary ? parseFloat(summary.total_to_invest).toLocaleString('en-IN') : '0'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1 overflow-auto p-0">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[180px]">Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance After</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyLoading && transactions.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5} className="h-12 animate-pulse bg-muted/20" />
                    </TableRow>
                  ))
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No transactions found for this user.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium">{txn.created_at ? format(new Date(txn.created_at), 'dd MMM yyyy') : 'N/A'}</span>
                          <span className="text-[10px] text-muted-foreground">{txn.created_at ? format(new Date(txn.created_at), 'hh:mm:ss a') : ''}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {txn.wallet_type === 'invest' ? (
                          <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50 flex items-center w-fit gap-1 py-0">
                            <Landmark className="h-3 w-3" /> Investment
                          </Badge>
                        ) : ['credit', 'deposit'].includes(txn.txn_type) ? (
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 flex items-center w-fit gap-1 py-0">
                            <ArrowUpRight className="h-3 w-3" /> Credit
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 flex items-center w-fit gap-1 py-0">
                            <ArrowDownLeft className="h-3 w-3" /> Debit
                          </Badge>
                        )}
                        <span className="block text-[10px] text-muted-foreground mt-0.5 uppercase tracking-tighter">{txn.wallet_type || 'Main'}</span>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-slate-700">{txn.source_type?.replace(/_/g, ' ').toUpperCase()}</span>
                          <p className="text-xs text-muted-foreground leading-tight italic">{txn.description}</p>
                          {txn.items_summary && (
                             <div className="bg-slate-50 border border-slate-100 p-1 rounded mt-1">
                               <p className="text-[10px] text-slate-500">Items: {txn.items_summary}</p>
                             </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-mono font-bold ${txn.wallet_type === 'invest' ? 'text-purple-600' : ['credit', 'deposit'].includes(txn.txn_type) ? 'text-green-600' : 'text-red-600'}`}>
                        {['credit', 'deposit'].includes(txn.txn_type) ? '+' : '-'}₹{parseFloat(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {txn.wallet_type === 'invest' ? (
                          <span className="text-[10px] italic opacity-50">Flat (External)</span>
                        ) : (
                          `₹${parseFloat(txn.balance_after || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {historyTotal > 0 && (
            <div className="p-4 border-t flex items-center justify-between bg-muted/20">
              <span className="text-xs text-muted-foreground">Total {historyTotal} transactions</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 py-0"
                  disabled={historyPage === 1 || historyLoading}
                  onClick={() => setHistoryPage(p => p - 1)}
                >
                  Prev
                </Button>
                <div className="h-8 px-3 bg-white border rounded-md text-xs font-medium flex items-center gap-1">
                  <span>Page</span>
                  <span className="text-blue-600">{historyPage}</span>
                  <span className="text-muted-foreground">/</span>
                  <span>{Math.ceil(historyTotal / 20)}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 py-0"
                  disabled={transactions.length < 20 || historyLoading}
                  onClick={() => setHistoryPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </FinanceLayout>
  );
}

