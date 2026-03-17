import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { CheckCircle, XCircle } from 'lucide-react';

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
  const [reviewNote, setReviewNote] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingKYC();
  }, []);

  const fetchPendingKYC = async () => {
    try {
      const response = await api.get('/kyc/pending');
      setPendingKYC(response.data);
    } catch (error) {
      toast.error('Failed to fetch pending KYC');
    }
  };

  const handleReview = async (docId: string, status: 'approved' | 'rejected') => {
    if (!reviewNote.trim()) {
      toast.error('Please provide a review note');
      return;
    }

    setLoading(true);
    try {
      await api.post('/kyc/review', {
        doc_id: docId,
        status,
        note: reviewNote,
      });
      toast.success(`KYC ${status} successfully`);
      setReviewNote('');
      setSelectedDoc(null);
      fetchPendingKYC();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Review failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending KYC Reviews</CardTitle>
          <CardDescription>Review and approve/reject user KYC documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {pendingKYC.length === 0 ? (
              <p className="text-muted-foreground">No pending KYC documents</p>
            ) : (
              pendingKYC.map((kyc) => (
                <div key={kyc.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{kyc.full_name}</p>
                      <p className="text-sm text-muted-foreground">{kyc.phone} • {kyc.email}</p>
                      <p className="text-sm mt-2">
                        <Badge>{kyc.doc_type.toUpperCase()}</Badge>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploaded: {new Date(kyc.uploaded_at).toLocaleString()}
                      </p>
                    </div>
                    <a
                      href={kyc.doc_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Document
                    </a>
                  </div>

                  {selectedDoc === kyc.id ? (
                    <div className="space-y-3">
                      <div>
                        <Label>Review Note</Label>
                        <Textarea
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          placeholder="Enter review comments..."
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleReview(kyc.id, 'approved')}
                          disabled={loading}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReview(kyc.id, 'rejected')}
                          disabled={loading}
                          variant="destructive"
                          className="flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedDoc(null);
                            setReviewNote('');
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={() => setSelectedDoc(kyc.id)}>Review</Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
