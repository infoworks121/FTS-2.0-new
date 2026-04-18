import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api, { IMAGE_BASE_URL } from '@/lib/api';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  FileText, 
  Upload, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  Mail,
  Phone
} from 'lucide-react';

interface KYCDocument {
  id: string;
  doc_type: string;
  status: string;
  doc_url: string;
  review_note?: string;
  reviewed_at?: string;
  uploaded_at: string;
}

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
  is_approved: boolean;
  is_active: boolean;
}

export default function KYCManagement() {
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [docType, setDocType] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kycRes, profileRes] = await Promise.all([
        api.get('/kyc/status'),
        api.get('/auth/me')
      ]);
      setDocuments(kycRes.data);
      setProfile(profileRes.data);
    } catch (error) {
      toast.error('Failed to fetch verification data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Max 5MB allowed.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percent);
        }
      });
      setDocUrl(response.data.url);
      toast.success("File uploaded successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docType || !docUrl) {
      toast.error("Please select document type and upload a file");
      return;
    }

    setLoading(true);
    try {
      await api.post('/kyc/upload', {
        doc_type: docType,
        doc_url: docUrl,
        doc_number: docNumber,
      });
      toast.success('KYC document submitted for review');
      setDocType('');
      setDocUrl('');
      setDocNumber('');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1"><CheckCircle2 className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1"><Clock className="h-3 w-3" /> Pending Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'pan': return <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><FileText className="h-5 w-5" /></div>;
      case 'aadhaar': return <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><ShieldCheck className="h-5 w-5" /></div>;
      default: return <div className="p-2 bg-slate-500/10 rounded-lg text-slate-500"><FileText className="h-5 w-5" /></div>;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">KYC & Verification</h1>
        <p className="text-muted-foreground text-lg">Manage your identity documents and account verification status.</p>
      </div>

      {/* Account Verification Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-background to-accent/20 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {profile?.is_approved ? (
                <span className="text-emerald-500">Fully Verified</span>
              ) : (
                <span className="text-amber-500">Pending Verification</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-accent/20 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">Verified</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-accent/20 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Phone className="h-4 w-4" /> Phone Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">Verified</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" /> Upload New Document
              </CardTitle>
              <CardDescription>Submit a high-quality copy of your ID</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select value={docType} onValueChange={setDocType}>
                    <SelectTrigger className="bg-accent/5">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pan">PAN Card</SelectItem>
                      <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                      <SelectItem value="voter_id">Voter ID</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Document Photo / PDF</Label>
                  <div className="group relative border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-all bg-accent/5">
                    <Input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium">Click to upload or drag & drop</p>
                      <p className="text-xs">PNG, JPG or PDF up to 5MB</p>
                    </div>
                  </div>
                  
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center">Uploading: {uploadProgress}%</p>
                    </div>
                  )}
                  
                  {docUrl && !isUploading && (
                    <div className="flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-in fade-in slide-in-from-top-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs text-emerald-600 font-medium truncate flex-1">{docUrl.split('/').pop()}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setDocUrl('')}>
                         <ShieldAlert className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Document ID Number</Label>
                  <Input
                    className="bg-accent/5"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="e.g. ABCDE1234F"
                  />
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" type="submit" disabled={loading || isUploading}>
                  {loading ? 'Processing...' : 'Submit for Verification'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex gap-3">
             <ShieldAlert className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
             <div className="text-xs text-blue-700 leading-relaxed">
               <span className="font-semibold block mb-1">Verification Guidelines:</span>
               • Ensure the document is clearly visible and not cut off.<br/>
               • Use original documents rather than photocopies.<br/>
               • Verification typically takes 24-48 business hours.
             </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Your Documents
            </h3>
            <Badge variant="outline" className="font-normal text-muted-foreground">
              Total: {documents.length}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading && documents.length === 0 ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-24 w-full bg-accent/20 animate-pulse rounded-xl border border-border/50" />
              ))
            ) : documents.length === 0 ? (
              <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center bg-accent/5">
                <div className="p-4 bg-muted rounded-full mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="font-semibold">No Documents Yet</h4>
                <p className="text-sm text-muted-foreground max-w-[200px] mt-1">Please upload your ID documents to start the verification process.</p>
              </Card>
            ) : (
              documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-card border border-border/60 rounded-xl hover:border-primary/30 hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2"
                >
                  <div className="flex items-start gap-4">
                    {getDocIcon(doc.doc_type)}
                    <div>
                      <h4 className="font-bold text-foreground flex items-center gap-2 uppercase">
                        {doc.doc_type.replace('_', ' ')}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Uploaded on {new Date(doc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {doc.review_note && (
                        <div className="mt-3 p-2 bg-rose-500/5 border border-rose-500/10 rounded-lg">
                          <p className="text-[11px] text-rose-500 font-medium">Note: {doc.review_note}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 flex items-center justify-between sm:flex-col sm:items-end gap-3">
                    {getStatusBadge(doc.status)}
                    <a 
                      href={`${IMAGE_BASE_URL}${doc.doc_url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 font-medium bg-primary/5 px-2 py-1 rounded"
                    >
                      View File <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
