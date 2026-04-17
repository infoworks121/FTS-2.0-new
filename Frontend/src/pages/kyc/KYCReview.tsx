import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  FileText, 
  ExternalLink,
  Clock,
  User,
  Phone,
  Mail,
  RefreshCw,
  Eye,
  ShieldCheck,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PendingKYC {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email: string;
  doc_type: string;
  doc_url: string;
  status: string;
  uploaded_at: string;
}

export default function KYCReview() {
  const [pendingKYC, setPendingKYC] = useState<PendingKYC[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedKycUser, setSelectedKycUser] = useState<any>(null);
  const [kycDocs, setKycDocs] = useState<any[]>([]);
  const [selectedDocForReview, setSelectedDocForReview] = useState<any>(null);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewNote, setReviewNote] = useState("");

  useEffect(() => {
    fetchPendingKYC();
  }, []);

  const fetchPendingKYC = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const response = await api.get('/kyc/pending');
      setPendingKYC(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch pending KYC');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleReview = async (docId: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      await api.post('/kyc/review', {
        doc_id: docId,
        status,
        note: reviewNote,
      });
      toast.success(`Document ${status} successfully`);
      setReviewNote('');
      setSelectedDocForReview(null);
      // Refresh documents for this specific user to show updated status
      if (selectedKycUser) fetchUserKyc(selectedKycUser.user_id);
      // Also refresh the main list
      fetchPendingKYC();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Review failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserKyc = async (userId: string) => {
    try {
      setLoadingDocs(true);
      const res = await api.get(`/kyc/admin/user/${userId}`);
      setKycDocs(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch user documents");
    } finally {
      setLoadingDocs(false);
    }
  };

   const groupedUsers = useMemo(() => {
    const groups: Record<string, any> = {};
    
    pendingKYC.forEach(item => {
      if (!groups[item.user_id]) {
        groups[item.user_id] = {
          user_id: item.user_id,
          full_name: item.full_name,
          phone: item.phone,
          email: item.email,
          pending_count: 0,
          latest_upload: item.uploaded_at
        };
      }
      groups[item.user_id].pending_count += 1;
      if (new Date(item.uploaded_at) > new Date(groups[item.user_id].latest_upload)) {
        groups[item.user_id].latest_upload = item.uploaded_at;
      }
    });

    const userList = Object.values(groups);
    if (!searchQuery.trim()) return userList;
    
    const q = searchQuery.toLowerCase();
    return userList.filter((u: any) => 
      u.full_name?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  }, [pendingKYC, searchQuery]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-8 bg-background min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">KYC Verification</h1>
          <p className="text-muted-foreground mt-1 text-lg">Review and validate user identity documents</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10 border-border bg-card shadow-sm gap-2"
            onClick={() => fetchPendingKYC(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-600/80 uppercase tracking-wider">Pending Tasks</p>
                <p className="text-3xl font-bold text-foreground tabular-nums">{pendingKYC.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-600/80 uppercase tracking-wider">Verification Level</p>
                <p className="text-3xl font-bold text-foreground">High Trust</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary/80 uppercase tracking-wider">System Status</p>
                <p className="text-3xl font-bold text-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="border-border shadow-md overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b border-border bg-muted/30 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, phone or email..." 
                  className="pl-10 h-10 bg-background border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="h-10 gap-2 border-border">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
             </div>
            <p className="text-sm text-muted-foreground font-medium">
              Showing <span className="text-foreground font-bold">{groupedUsers.length}</span> users with pending verification
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                  <TableHead className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground py-5 pl-6">User Information</TableHead>
                  <TableHead className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground py-5 text-center">Pending Docs</TableHead>
                  <TableHead className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground py-5 text-center">Latest Activity</TableHead>
                  <TableHead className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground py-5 text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin opacity-40" />
                        <p className="text-sm text-muted-foreground font-medium">Fetching pending requests...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : groupedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <Badge variant="outline" className="h-12 w-12 rounded-full border-dashed p-0 flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 opacity-40" />
                        </Badge>
                        <p className="text-sm font-medium">No pending KYC documents found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  groupedUsers.map((user: any) => (
                    <TableRow key={user.user_id} className="hover:bg-muted/30 transition-colors group">
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                            {user.full_name?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground line-clamp-1">{user.full_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {user.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold px-3">
                            {user.pending_count} Pending
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-xs font-medium text-foreground">{formatDate(user.latest_upload).split(',')[0]}</span>
                          <span className="text-[10px] text-muted-foreground italic">{formatDate(user.latest_upload).split(',')[1]}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-right pr-6">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 border-primary/30 text-primary hover:bg-primary hover:text-white gap-2 transition-all shadow-sm"
                          onClick={() => {
                            setSelectedKycUser(user);
                            fetchUserKyc(user.user_id);
                            setIsReviewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-3 h-3" />
                          Review All
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border border-border shadow-2xl rounded-2xl gap-0">
          <DialogHeader className="p-6 bg-card border-b border-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-bold text-foreground">Verify User Documents</DialogTitle>
                <DialogDescription className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{selectedKycUser?.full_name}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-muted-foreground">{selectedKycUser?.phone}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-0 overflow-y-auto max-h-[75vh] bg-muted/10 divide-y divide-border/40">
            {loadingDocs ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <RefreshCw className="w-8 h-8 animate-spin opacity-20" />
                <p className="text-sm">Loading all documents...</p>
              </div>
            ) : (
              <>
                {/* Documents Table Interface */}
                <div className="bg-card p-4 border-b border-border shadow-inner">
                  <div className="rounded-xl border border-border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider">Document Type</TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-center">Uploaded On</TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-center">Status</TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-right pr-6">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kycDocs.map((doc) => (
                          <TableRow 
                            key={doc.id} 
                            className={`hover:bg-muted/30 transition-colors cursor-pointer ${selectedDocForReview?.id === doc.id ? 'bg-primary/5' : ''}`}
                            onClick={() => setSelectedDocForReview(doc)}
                          >
                            <TableCell className="py-3">
                              <div className="flex items-center gap-3">
                                <FileText className={`w-4 h-4 ${selectedDocForReview?.id === doc.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className={`text-sm font-semibold capitalize ${selectedDocForReview?.id === doc.id ? 'text-primary' : 'text-foreground'}`}>
                                  {doc.doc_type?.replace(/_/g, ' ')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center py-3">
                              <span className="text-xs text-muted-foreground">{formatDate(doc.uploaded_at).split(',')[0]}</span>
                            </TableCell>
                            <TableCell className="text-center py-3">
                              <Badge className={`text-[10px] uppercase tracking-tighter h-5 px-2 font-bold shadow-none ${
                                doc.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                doc.status === 'rejected' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                                'bg-amber-500/10 text-amber-600 border-amber-500/20'
                              }`}>
                                {doc.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right py-3 pr-6">
                              <Button 
                                variant={selectedDocForReview?.id === doc.id ? "default" : "outline"} 
                                size="sm" 
                                className="h-7 text-[10px] px-3 font-bold uppercase transition-all shadow-sm"
                              >
                                {doc.status === 'pending' ? 'Verify Now' : 'View Detail'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Selected Document Detailed Review Area */}
                {selectedDocForReview ? (
                  <div className="p-6 bg-background space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                        Reviewing: <span className="text-primary">{selectedDocForReview.doc_type?.replace(/_/g, ' ')}</span>
                      </h4>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                        {selectedDocForReview.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Document Preview */}
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-muted-foreground">Document Image</Label>
                        <div className="relative group rounded-xl border border-border overflow-hidden bg-muted aspect-video flex items-center justify-center">
                          {selectedDocForReview.doc_url?.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                            <img 
                              src={selectedDocForReview.doc_url} 
                              alt="KYC Preview" 
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground opacity-50">
                              <FileText className="w-12 h-12" />
                              <p className="text-xs">No direct preview available</p>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="secondary" size="sm" asChild className="h-8 gap-2">
                              <a href={selectedDocForReview.doc_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3.5 h-3.5" />
                                Full Size View
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Notes and Actions Area */}
                      <div className="flex flex-col gap-4">
                        <div className="space-y-2 flex-1">
                          <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-muted-foreground">Verification Notes (Optional)</Label>
                          <Textarea 
                            placeholder="Add internal feedback or reason (Visible to user if rejected)..."
                            className="bg-card border-border min-h-[140px] resize-none focus-visible:ring-primary text-sm shadow-sm"
                            value={reviewNote}
                            onChange={(e) => setReviewNote(e.target.value)}
                          />
                        </div>

                        {selectedDocForReview.status === 'pending' ? (
                          <div className="flex gap-2">
                            <Button 
                              variant="destructive" 
                              className="flex-1 h-10 font-bold uppercase text-[11px] gap-2 shadow-lg shadow-rose-500/20"
                              onClick={() => handleReview(selectedDocForReview.id, 'rejected')}
                              disabled={loading}
                            >
                              <XCircle className="w-4 h-4" /> Reject
                            </Button>
                            <Button 
                              className="flex-1 h-10 font-bold uppercase text-[11px] gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                              onClick={() => handleReview(selectedDocForReview.id, 'approved')}
                              disabled={loading}
                            >
                              <CheckCircle className="w-4 h-4" /> Approve
                            </Button>
                          </div>
                        ) : (
                          <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Previous Review Data</p>
                            <p className="text-sm font-medium italic text-muted-foreground">
                              {selectedDocForReview.review_note || "No review note provided."}
                            </p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-2">
                               <Clock className="w-3 h-3" /> Reviewed at: {formatDate(selectedDocForReview.reviewed_at || selectedDocForReview.uploaded_at)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground select-none">
                    <div className="w-16 h-16 rounded-full bg-muted border border-border border-dashed flex items-center justify-center">
                       <FileText className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-sm font-medium uppercase tracking-widest">Select a document above to verify</p>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="p-4 bg-muted/30 border-t border-border">
            <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground h-10" onClick={() => {
              setIsReviewDialogOpen(false);
              setSelectedDocForReview(null);
            }}>
              Close Document Manager
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
