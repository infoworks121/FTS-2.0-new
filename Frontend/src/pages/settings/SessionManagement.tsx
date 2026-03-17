import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Monitor, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function SessionManagement() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/sessions');
      setSessions(res.data);
    } catch (err) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId) => {
    try {
      await api.delete(`/sessions/${sessionId}`);
      toast.success('Session revoked');
      fetchSessions();
    } catch (err) {
      toast.error('Failed to revoke session');
    }
  };

  const revokeAll = async () => {
    try {
      await api.delete('/sessions');
      toast.success('All sessions revoked');
      fetchSessions();
    } catch (err) {
      toast.error('Failed to revoke sessions');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Active Sessions</h1>
        <Button variant="destructive" onClick={revokeAll}>Revoke All Sessions</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    {session.user_agent?.includes('Mobile') ? <Smartphone /> : <Monitor />}
                    {session.panel}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => revokeSession(session.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>IP:</strong> {session.ip_address}</p>
                  <p><strong>Device:</strong> {session.user_agent}</p>
                  <p><strong>Created:</strong> {new Date(session.created_at).toLocaleString()}</p>
                  <p><strong>Expires:</strong> {new Date(session.expires_at).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
