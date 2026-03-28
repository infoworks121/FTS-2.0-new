import React, { useState, useEffect } from "react";
import FinanceLayout from "@/components/finance/FinanceLayout";
import { 
  Search, 
  RefreshCw, 
  Wallet, 
  ArrowUpRight,
  Shield,
  ShieldAlert,
  SearchX
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

export default function AllUserWallets() {
  const [users, setUsers] = useState<UserWalletBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const { toast } = useToast();

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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchWallets();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, page]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">Admin</Badge>;
      case 'core_body_a': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">CB-A</Badge>;
      case 'core_body_b': return <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100 border-none">CB-B</Badge>;
      case 'businessman': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Businessman</Badge>;
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
          <Button variant="outline" onClick={fetchWallets} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
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
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.full_name}</span>
                          <span className="text-xs text-muted-foreground">{user.email || user.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role_code)}</TableCell>
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
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
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
    </FinanceLayout>
  );
}
