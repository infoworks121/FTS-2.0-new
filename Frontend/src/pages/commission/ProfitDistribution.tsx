import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CommissionLayout,
  RuleHistoryTable,
} from "@/components/commission";
import { 
  GitMerge, 
  Wallet, 
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Lock,
  Eye,
  RefreshCw
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export default function ProfitDistribution() {
  const [isLoading, setIsLoading] = useState(true);
  const [rules, setRules] = useState<any[]>([]);
  const [distributions, setDistributions] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rulesRes, distRes, overviewRes] = await Promise.all([
        api.get("/wallet/admin/profit-rules"),
        api.get("/wallet/admin/profit-distributions"),
        api.get("/wallet/admin/overview")
      ]);
      setRules(rulesRes.data.rules);
      setDistributions(distRes.data.distributions);
      setOverview(overviewRes.data);
    } catch (error) {
      console.error("Error fetching profit distribution data:", error);
      toast({
        title: "Error",
        description: "Failed to load distribution data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const b2bRule = rules.find(r => r.channel === 'B2B') || {};
  const b2cRule = rules.find(r => r.channel === 'B2C') || {};

  return (
    <CommissionLayout
      title="Profit Distribution Engine"
      description="Central orchestration of all profit flows"
      status="active"
      lastUpdated={{ by: "System", time: new Date().toLocaleString() }}
      onSave={() => {}}
      onReset={() => {}}
      isSaving={false}
      hasChanges={false}
      changes={[]}
      historySection={
        <RuleHistoryTable history={[]} title="Recent Policy Changes" />
      }
    >
      {/* Master Flowchart View */}
      <Card className="border-profit/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <GitMerge className="h-5 w-5" />
              Master Flowchart View
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          <CardDescription>
            Visual overview of profit distribution paths
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-8 py-6">
            <div className="flex flex-col items-center gap-2">
              <div className="px-6 py-3 rounded-lg border-2 border-primary bg-primary/10 text-primary font-semibold">
                Total Profit Pool
              </div>
            </div>
            
            <ArrowDown className="h-6 w-6 text-muted-foreground" />
            
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-3">
                <div className="px-6 py-3 rounded-lg border-2 border-profit bg-profit/10 text-profit">
                  <div className="font-semibold">B2B (Share)</div>
                  <div className="text-2xl font-bold">{b2bRule.fts_share_pct || 0}%</div>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <div className="px-6 py-3 rounded-lg border-2 border-company bg-company/10 text-company">
                  <div className="font-semibold">B2C (Share)</div>
                  <div className="text-2xl font-bold">{b2cRule.fts_share_pct || 0}%</div>
                </div>
              </div>
            </div>
            
            <ArrowDown className="h-6 w-6 text-muted-foreground" />
            
            <div className="grid grid-cols-5 gap-4 w-full max-w-4xl">
              {[
                { label: "Referral", color: "profit", icon: "💰" },
                { label: "Trust", color: "trust", icon: "🛡️" },
                { label: "Company", color: "company", icon: "🏢" },
                { label: "Admin", color: "admin", icon: "⚙️" },
                { label: "Stock Point", color: "reserve", icon: "📦" },
              ].map((node) => (
                <div
                  key={node.label}
                  className={`p-4 rounded-lg border text-center border-${node.color}/30 bg-${node.color}/5`}
                >
                  <div className="text-2xl mb-1">{node.icon}</div>
                  <div className={`text-sm font-semibold text-${node.color}`}>{node.label}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rule Mapping Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Active Distribution Rules
          </CardTitle>
          <CardDescription>
            Current ledger splits for different transaction channels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase">Channel</TableHead>
                <TableHead className="text-xs font-semibold uppercase text-right">FTS Share</TableHead>
                <TableHead className="text-xs font-semibold uppercase text-right">Trust Fund</TableHead>
                <TableHead className="text-xs font-semibold uppercase text-right">Company</TableHead>
                <TableHead className="text-xs font-semibold uppercase text-right">Core Body</TableHead>
                <TableHead className="text-xs font-semibold uppercase text-right">Reserve</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">
                    <Badge variant="outline" className={rule.channel === 'B2B' ? 'bg-profit/10 text-profit' : 'bg-company/10 text-company'}>
                      {rule.channel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">{rule.fts_share_pct}%</TableCell>
                  <TableCell className="text-right font-mono">{rule.trust_fund_pct}%</TableCell>
                  <TableCell className="text-right font-mono">{rule.company_pct}%</TableCell>
                  <TableCell className="text-right font-mono">{rule.core_body_pool_pct}%</TableCell>
                  <TableCell className="text-right font-mono">{rule.company_reserve_pct}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Distributions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recent Profit Distributions
            </CardTitle>
            <Badge variant="secondary">Audit Trail</Badge>
          </div>
          <CardDescription>
            Live log of the last 50 profit distribution events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase">Order #</TableHead>
                <TableHead className="text-xs font-semibold uppercase">Channel</TableHead>
                <TableHead className="text-xs font-semibold uppercase text-right">Total Profit</TableHead>
                <TableHead className="text-xs font-semibold uppercase text-right">Trust Amt</TableHead>
                <TableHead className="text-xs font-semibold uppercase text-right">Admin Amt</TableHead>
                <TableHead className="text-xs font-semibold uppercase">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distributions.map((dist) => (
                <TableRow key={dist.id}>
                  <TableCell className="font-medium">{dist.order_number}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{dist.rule_channel}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">₹{parseFloat(dist.total_profit).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-trust">₹{parseFloat(dist.trust_fund_amount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-admin">₹{parseFloat(dist.admin_amount).toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(dist.processed_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {distributions.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No distributions recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Wallet Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Ecosystem Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-900/50">
              <p className="text-xs text-muted-foreground mb-1">Company Pool</p>
              <p className="text-xl font-bold">₹{overview ? parseFloat(overview.company_pool).toLocaleString() : "0"}</p>
            </div>
            <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-900/50">
              <p className="text-xs text-muted-foreground mb-1">Trust Fund</p>
              <p className="text-xl font-bold text-trust">₹{overview ? parseFloat(overview.trust_fund).toLocaleString() : "0"}</p>
            </div>
            <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-900/50">
              <p className="text-xs text-muted-foreground mb-1">Reserve Fund</p>
              <p className="text-xl font-bold text-reserve">₹{overview ? parseFloat(overview.reserve_fund).toLocaleString() : "0"}</p>
            </div>
            <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-900/50">
              <p className="text-xs text-muted-foreground mb-1">Withdrawals (Paid)</p>
              <p className="text-xl font-bold text-admin">₹{overview ? parseFloat(overview.total_withdrawals_paid).toLocaleString() : "0"}</p>
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-2 p-3 rounded-lg border border-muted bg-muted/30 text-muted-foreground text-sm">
            <Lock className="h-4 w-4" />
            <span>All profit calculations are immutable and follow the configured rule history</span>
          </div>
        </CardContent>
      </Card>
    </CommissionLayout>
  );
}

