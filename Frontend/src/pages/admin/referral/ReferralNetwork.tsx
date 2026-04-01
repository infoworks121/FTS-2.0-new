import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Search, Filter, Download, ArrowRight, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/KPICard";
import referralApi from "@/lib/api/referral";

export default function ReferralNetwork() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ["admin-referrals"],
    queryFn: referralApi.adminGetList,
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-referral-stats"],
    queryFn: referralApi.adminGetStats,
  });

  const filteredReferrals = referrals.filter(ref => 
    ref.referrer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.referred_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.referrer_phone.includes(searchTerm) ||
    ref.referred_phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Referral Network</h1>
          <p className="text-muted-foreground">
            Manage and monitor user referral relationships across the platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard 
          title="Total Referrals" 
          value={stats?.total_referrals?.toString() || "0"} 
          icon={UserPlus} 
          variant="default"
        />
        <KPICard 
          title="Conversion Rate" 
          value="12.5%" 
          icon={Users} 
          variant="profit"
          change="+2.1%"
          changeType="positive"
        />
        <KPICard 
          title="Platform Payouts" 
          value={`₹${Number(stats?.total_commissions_paid || 0).toLocaleString()}`} 
          icon={Users} 
          variant="warning"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>All Referral Connections</CardTitle>
              <CardDescription>
                Showing a log of who referred whom.
              </CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search referrer or referred..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Referrer (Invited By)</TableHead>
                  <TableHead className="text-center w-10"></TableHead>
                  <TableHead>Referred User (New Member)</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : filteredReferrals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No referral records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReferrals.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(row.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{row.referrer_name}</span>
                          <span className="text-xs text-muted-foreground">{row.referrer_phone}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{row.referred_name}</span>
                          <span className="text-xs text-muted-foreground">{row.referred_phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {row.referred_role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          Completed
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
