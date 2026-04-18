import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Trash2, 
  AlertTriangle, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Clock, 
  Globe, 
  ShieldCheck,
  Zap
} from 'lucide-react';

interface DeviceCardProps {
  device: {
    id: string;
    device_fingerprint: string;
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
  const currentBrowser = navigator.userAgent;
  const isCurrentDevice = device.device_fingerprint === currentBrowser;

  const getDeviceIcon = () => {
    const type = device.device_type?.toLowerCase();
    if (type?.includes('mobile')) return <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500"><Smartphone className="h-6 w-6" /></div>;
    if (type?.includes('tablet')) return <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Tablet className="h-6 w-6" /></div>;
    return <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Monitor className="h-6 w-6" /></div>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={`group relative overflow-hidden transition-all hover:shadow-lg ${isCurrentDevice ? 'border-primary/40 bg-primary/5' : 'bg-card hover:border-primary/20'}`}>
      {isCurrentDevice && (
        <div className="absolute top-0 right-0">
          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Zap className="h-3 w-3" /> Current Device
          </div>
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            {getDeviceIcon()}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h4 className="font-bold text-lg text-foreground uppercase tracking-tight">
                  {device.device_type || 'Unknown Device'}
                </h4>
                {device.is_flagged && (
                  <Badge variant="destructive" className="flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="h-3 w-3" /> Flagged
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-primary/60" />
                  <span>{device.browser} on {device.os}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary/60" />
                  <span>Last seen: {formatDate(device.last_seen_at)}</span>
                </div>
              </div>

              {device.flag_reason && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                   <AlertTriangle className="h-4 w-4 text-red-500" />
                   <p className="text-xs text-red-600 font-medium leading-none">
                     Security Flag: {device.flag_reason}
                   </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCurrentDevice && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemove(device.id)}
                disabled={loading}
                className="text-red-500 hover:text-white hover:bg-red-500 border-red-500/20 gap-2 transition-all"
              >
                <Trash2 className="h-4 w-4" /> 
                <span className="hidden sm:inline">De-authorize</span>
              </Button>
            )}
            {isCurrentDevice && (
              <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-600">Active Session</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
