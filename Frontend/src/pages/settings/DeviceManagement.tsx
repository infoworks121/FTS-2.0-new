import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/lib/api';
import { DeviceCard } from '@/components/devices';
import { ShieldCheck, ShieldAlert, Monitor, LogOut, Info } from 'lucide-react';

interface Device {
  id: string;
  device_fingerprint: string;
  device_type: string;
  os: string;
  browser: string;
  first_seen_at: string;
  last_seen_at: string;
  is_flagged: boolean;
  flag_reason?: string;
}

export default function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setFetching(true);
    try {
      const response = await api.get('/devices');
      setDevices(response.data);
    } catch (error) {
      toast.error('Failed to fetch devices');
    } finally {
      setFetching(false);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    setLoading(true);
    try {
      await api.delete(`/devices/${deviceId}`);
      toast.success('Device removed successfully');
      fetchDevices();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove device');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Device Management</h1>
        <p className="text-muted-foreground text-lg">Manage and monitor devices authorized to access your account.</p>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-background to-emerald-500/5 border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Security Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">Secure</div>
            <p className="text-xs text-emerald-600/70 mt-1">
              Your account is currently accessed by {devices.length} authorized {devices.length === 1 ? 'device' : 'devices'}.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <LogOut className="h-4 w-4 text-blue-500" /> Account Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{devices.length} Active</div>
            <p className="text-xs text-blue-600/70 mt-1">
              Unrecognized devices should be removed immediately.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" /> Authorized Devices
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {fetching ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-32 w-full bg-accent/20 animate-pulse rounded-xl border border-border/50" />
            ))
          ) : devices.length === 0 ? (
            <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center bg-accent/5">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Monitor className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="font-semibold">No Devices Registered</h4>
              <p className="text-sm text-muted-foreground max-w-[200px] mt-1">Your current device will be registered upon your next interaction.</p>
            </Card>
          ) : (
            devices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onRemove={handleRemoveDevice}
                loading={loading}
              />
            ))
          )}
        </div>
      </div>

      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex gap-3">
         <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
         <div className="text-xs text-amber-700 leading-relaxed">
           <span className="font-semibold block mb-1">Security Tip:</span>
           If you see a device you don't recognize, click the "Remove" icon to immediately de-authorize it. This will prevent any further access from that device until you log in again.
         </div>
      </div>
    </div>
  );
}
