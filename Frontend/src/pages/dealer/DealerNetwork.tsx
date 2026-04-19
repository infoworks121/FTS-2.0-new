import { useState, useEffect } from "react";

import { 
  Users, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowUpRight, 
  UserCheck, 
  Clock, 
  Briefcase,
  ExternalLink,
  ChevronRight,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function DealerNetwork() {

  const [network, setNetwork] = useState<any[]>([]);
  const [directory, setDirectory] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("subdivision");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [networkRes, directoryRes] = await Promise.all([
          api.get("/dealer/network"),
          api.get("/dealer/district-directory")
        ]);
        
        setNetwork(networkRes.data.network || []);
        setKpis(networkRes.data.kpis);
        setDirectory(directoryRes.data.directory || []);
      } catch (error) {
        console.error("Error fetching network data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredNetwork = network.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone.includes(searchQuery)
  );

  const filteredDirectory = directory.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.district_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            Node Network
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage subdivision associates and connect with district leadership.</p>
        </div>

        {/* KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-indigo-600 text-white overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                <Users className="h-24 w-24" />
             </div>
             <CardContent className="p-6 relative">
              <div className="flex items-center gap-2 text-indigo-100 text-xs font-bold uppercase tracking-widest mb-4">
                <Users className="h-3.5 w-3.5" /> Total Associates
              </div>
              <div className="text-4xl font-black">{loading ? <Skeleton className="h-10 w-20 bg-indigo-500/50" /> : kpis?.total_members || 0}</div>
              <p className="text-indigo-200 text-sm mt-2 font-medium">Members in your subdivision</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                <UserCheck className="h-24 w-24" />
             </div>
             <CardContent className="p-6 relative">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
                <UserCheck className="h-3.5 w-3.5 text-emerald-500" /> Active Now
              </div>
              <div className="text-4xl font-black text-slate-900">{loading ? <Skeleton className="h-10 w-20 bg-slate-100" /> : kpis?.active_members || 0}</div>
              <p className="text-slate-500 text-sm mt-2 font-medium">Approved & Operational</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                <ArrowUpRight className="h-24 w-24" />
             </div>
             <CardContent className="p-6 relative">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
                <ArrowUpRight className="h-3.5 w-3.5 text-blue-500" /> Network Sales
              </div>
              <div className="text-4xl font-black text-slate-900">
                {loading ? <Skeleton className="h-10 w-32 bg-slate-100" /> : `₹${(kpis?.mtd_sales || 0).toLocaleString()}`}
              </div>
              <p className="text-slate-500 text-sm mt-2 font-medium text-blue-600 font-bold">MTD Aggregated Performance</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="subdivision" onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <TabsList className="bg-slate-100 p-1 h-12 rounded-xl">
              <TabsTrigger value="subdivision" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold text-sm">
                Subdivision Associates
              </TabsTrigger>
              <TabsTrigger value="directory" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold text-sm">
                District Directory
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder={activeTab === "subdivision" ? "Search associates..." : "Search core body members..."} 
                className="pl-10 h-11 border-slate-200 rounded-xl bg-white shadow-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="subdivision" className="animate-in fade-in-50 duration-500">
            <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-100">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-slate-600 uppercase text-[10px] tracking-widest py-4 pl-6">Member Details</TableHead>
                    <TableHead className="font-bold text-slate-600 uppercase text-[10px] tracking-widest py-4">Business Unit</TableHead>
                    <TableHead className="font-bold text-slate-600 uppercase text-[10px] tracking-widest py-4 text-center">Contact</TableHead>
                    <TableHead className="font-bold text-slate-600 uppercase text-[10px] tracking-widest py-4 text-right">Performance</TableHead>
                    <TableHead className="font-bold text-slate-600 uppercase text-[10px] tracking-widest py-4 text-center pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5} className="py-8 px-6"><Skeleton className="h-12 w-full rounded-xl" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredNetwork.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-20 text-center">
                        <Users className="h-12 w-12 mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold">No associates found</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredNetwork.map((member) => (
                    <TableRow key={member.id} className="group hover:bg-slate-50/50 transition-colors">
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-sm group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1">{member.name}</div>
                            <div className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                              <Briefcase className="h-2.5 w-2.5" /> {member.role_label}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 font-bold text-sm text-slate-600">
                        {member.business_name || "Personal Portfolio"}
                        <div className="text-[10px] text-slate-400 capitalize">{member.businessman_type?.replace('_', ' ') || 'Registered Associate'}</div>
                      </TableCell>
                      <TableCell className="py-4">
                         <div className="flex flex-col items-center gap-1.5">
                            <a href={`tel:${member.phone}`} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors inline-block tooltip" title={member.phone}>
                              <Phone className="h-3.5 w-3.5" />
                            </a>
                            <a href={`mailto:${member.email}`} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors inline-block tooltip" title={member.email}>
                              <Mail className="h-3.5 w-3.5" />
                            </a>
                         </div>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                         <div className="font-black text-slate-900">₹{parseFloat(member.mtd_sales).toLocaleString()}</div>
                         <div className="text-[10px] font-bold text-emerald-500 uppercase">MTD Earning Focus</div>
                      </TableCell>
                      <TableCell className="py-4 text-center pr-6">
                        <Badge className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border-0",
                          member.is_active && member.is_approved ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : 
                          !member.is_approved ? "bg-orange-100 text-orange-700 hover:bg-orange-200" :
                          "bg-red-100 text-red-700 hover:bg-red-200"
                        )}>
                          {member.is_active && member.is_approved ? "Active" : !member.is_approved ? "Pending" : "Suspended"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="directory" className="animate-in fade-in-50 duration-500">
            <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-100">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-slate-600 uppercase text-[10px] tracking-widest py-4 pl-6">Leader Profile</TableHead>
                    <TableHead className="font-bold text-slate-600 uppercase text-[10px] tracking-widest py-4">District Hub</TableHead>
                    <TableHead className="font-bold text-slate-600 uppercase text-[10px] tracking-widest py-4">Designation</TableHead>
                    <TableHead className="font-bold text-slate-600 uppercase text-[10px] tracking-widest py-4 text-center pr-6">Direct Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={4} className="py-8 px-6"><Skeleton className="h-12 w-full rounded-xl" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredDirectory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-20 text-center">
                        <MapPin className="h-12 w-12 mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold">No district leadership found</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredDirectory.map((leader) => (
                    <TableRow key={leader.id} className="group hover:bg-slate-50/50 transition-colors">
                      <TableCell className="py-6 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 p-[2px]">
                            <div className="w-full h-full rounded-lg bg-white flex items-center justify-center font-black text-indigo-600">
                              {leader.profile_photo_url ? (
                                <img src={leader.profile_photo_url} alt={leader.name} className="w-full h-full rounded-lg object-cover" />
                              ) : (
                                leader.name.charAt(0)
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-base">{leader.name}</div>
                            <div className="text-xs text-slate-500 font-medium">Verified Core Body Member</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="flex items-center gap-2 font-bold text-slate-700">
                          <MapPin className="h-4 w-4 text-indigo-500" />
                          {leader.district_name}
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700 font-bold px-3 py-1">
                          {leader.role_label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-6 pr-6">
                        <div className="flex justify-center gap-3">
                          <Button variant="outline" size="sm" className="rounded-xl font-bold border-slate-200 hover:bg-indigo-600 hover:text-white transition-all group/call" asChild>
                            <a href={`tel:${leader.phone}`}>
                              <Phone className="h-3.5 w-3.5 mr-2" /> {leader.phone}
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" className="rounded-xl font-bold text-slate-400 hover:text-indigo-600 p-2" asChild title={leader.email}>
                            <a href={`mailto:${leader.email}`}>
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
}
