import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface KYCDocument {
  id: string;
  doc_type: string;
  status: string;
  review_note?: string;
  reviewed_at?: string;
  uploaded_at: string;
}

export default function KYCManagement() {
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [docType, setDocType] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const response = await api.get('/kyc/status');
      setDocuments(response.data);
    } catch (error) {
      toast.error('Failed to fetch KYC documents');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
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
      toast.success("File uploaded to server");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/kyc/upload', {
        doc_type: docType,
        doc_url: docUrl,
        doc_number: docNumber,
      });
      toast.success('KYC document uploaded successfully');
      setDocType('');
      setDocUrl('');
      setDocNumber('');
      fetchKYCStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload KYC Document</CardTitle>
          <CardDescription>Upload your identity documents for verification</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <Label>Document Type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pan">PAN Card</SelectItem>
                  <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                  <SelectItem value="photo">Profile Photo</SelectItem>
                  <SelectItem value="address_proof">Address Proof</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Document Image / PDF</Label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  required={!docUrl}
                />
                {isUploading && (
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
                {docUrl && !isUploading && (
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                    ✓ Ready to submit: {docUrl.split('/').pop()}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>Document Number (Optional)</Label>
              <Input
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="Enter document number"
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your KYC Documents</CardTitle>
          <CardDescription>View status of your uploaded documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.length === 0 ? (
              <p className="text-muted-foreground">No documents uploaded yet</p>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{doc.doc_type.toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                    {doc.review_note && (
                      <p className="text-sm text-muted-foreground mt-1">Note: {doc.review_note}</p>
                    )}
                  </div>
                  {getStatusBadge(doc.status)}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
