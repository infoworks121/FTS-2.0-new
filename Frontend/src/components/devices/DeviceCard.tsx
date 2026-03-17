import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, AlertTriangle, Monitor, Smartphone, Tablet } from 'lucide-react';

interface DeviceCardProps {
  device: {
    id: string;
    device_type: string;
    os: string;
    browser: string;
    first_seen_at: string;
    last_seen_at: string;
    is_flagged: boolean;
    flag_reason?: string;
  };
  onRemove: (id: string) => void;
  loading?: boolean;
}

export default function DeviceCard({ device, onRemove, loading }: DeviceCardProps) {
  const getDeviceIcon = () => {
    const type = device.device_type?.toLowerCase();
    if (type?.includes('mobile')) return <Smartphone className="h-5 w-5" />;
    if (type?.includes('tablet')) return <Tablet className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  return (
    <Card className={device.is_flagged ? 'border-red-500 bg-red-50' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">{getDeviceIcon()}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{device.device_type || 'Unknown Device'}</p>
                {device.is_flagged && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Flagged
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {device.browser} • {device.os}
              </p>
              <div className="text-xs text-muted-foreground mt-2 space-y-1">
                <p>First seen: {new Date(device.first_seen_at).toLocaleString()}</p>
                <p>Last seen: {new Date(device.last_seen_at).toLocaleString()}</p>
              </div>
              {device.flag_reason && (
                <p className="text-sm text-red-600 mt-2 font-medium">
                  Reason: {device.flag_reason}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(device.id)}
            disabled={loading}
            className="text-red-600 hover:text-red-700 hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
