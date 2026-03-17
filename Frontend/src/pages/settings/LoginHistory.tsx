import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function LoginHistory() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const res = await api.get('/login-attempts/my-attempts');
      setAttempts(res.data);
    } catch (err) {
      toast.error('Failed to load login history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Login History</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-4">
          {attempts.map((attempt) => (
            <Card key={attempt.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    {attempt.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    {attempt.success ? 'Successful Login' : 'Failed Login'}
                  </CardTitle>
                  <Badge variant={attempt.success ? 'default' : 'destructive'}>
                    {attempt.panel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Target:</strong> {attempt.target}</p>
                  <p><strong>IP:</strong> {attempt.ip_address}</p>
                  <p><strong>Time:</strong> {new Date(attempt.attempted_at).toLocaleString()}</p>
                  {!attempt.success && attempt.failure_reason && (
                    <p className="text-red-500"><strong>Reason:</strong> {attempt.failure_reason}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
