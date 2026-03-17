import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { DeviceCard } from '@/components/devices';

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

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await api.get('/devices');
      setDevices(response.data);
    } catch (error) {
      toast.error('Failed to fetch devices');
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to remove this device?')) return;

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Devices</CardTitle>
          <CardDescription>Manage devices that have accessed your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.length === 0 ? (
              <p className="text-muted-foreground">No devices found</p>
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
        </CardContent>
      </Card>
    </div>
  );
}
