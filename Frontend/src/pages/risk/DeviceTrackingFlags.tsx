import { useState } from "react";
import { Globe, History, MapPinned, ShieldAlert, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KPICard } from "@/components/KPICard";
import { AlertFirstHeader, InvestigationDrawer, RiskScoreBand, Severity, SeverityBadge } from "@/components/risk/RiskPrimitives";

type DeviceFlag = {
  deviceId: string;
  usersLinked: number;
  ordersCount: number;
  locationDrift: string;
  riskScore: number;
  severity: Severity;
};

const deviceFlags: DeviceFlag[] = [
  { deviceId: "DV-221910", usersLinked: 6, ordersCount: 34, locationDrift: "Kolkata → Jaipur", riskScore: 90, severity: "critical" },
  { deviceId: "DV-221771", usersLinked: 4, ordersCount: 19, locationDrift: "Pune → Delhi", riskScore: 76, severity: "high" },
  { deviceId: "DV-221704", usersLinked: 2, ordersCount: 11, locationDrift: "Hyderabad → Hyderabad", riskScore: 43, severity: "low" },
];

export default function DeviceTrackingFlags() {
  const [selected, setSelected] = useState<DeviceFlag | null>(null);
  const [blocked, setBlocked] = useState<Record<string, boolean>>({
    "DV-221910": true,
    "DV-221771": false,
    "DV-221704": false,
  });

  return (
    <div className="space-y-6">
      <AlertFirstHeader
        title="Device Tracking Flags"
        description="Monitor fingerprint-level behavior anomalies, location drift, and multi-account abuse from linked devices."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KPICard title="Flagged Devices" value="12" icon={Smartphone} variant="warning" />
        <KPICard title="High Drift" value="5" icon={MapPinned} variant="cap" subtitle="Cross-region in short time windows" />
        <KPICard title="Blocked Devices" value="3" icon={ShieldAlert} variant="warning" />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device ID</TableHead>
              <TableHead>Users Linked</TableHead>
              <TableHead>Orders Count</TableHead>
              <TableHead>Location Drift</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deviceFlags.map((row) => (
              <TableRow key={row.deviceId}>
                <TableCell className="font-medium">{row.deviceId}</TableCell>
                <TableCell className="font-mono">{row.usersLinked}</TableCell>
                <TableCell className="font-mono">{row.ordersCount}</TableCell>
                <TableCell>{row.locationDrift}</TableCell>
                <TableCell><RiskScoreBand score={row.riskScore} /></TableCell>
                <TableCell><SeverityBadge severity={row.severity} /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={blocked[row.deviceId]}
                      onCheckedChange={(checked) => setBlocked((prev) => ({ ...prev, [row.deviceId]: checked }))}
                    />
                    <Button size="sm" variant="outline" onClick={() => setSelected(row)}>View history</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <InvestigationDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={`Device History • ${selected?.deviceId ?? ""}`}
        subtitle="Heatmap summary, suspicious pattern alerts, and linked-user evidence"
      >
        {selected && (
          <>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-md border p-3 text-sm">
                <p className="font-semibold mb-1 flex items-center gap-1.5"><Globe className="h-4 w-4" /> Heatmap</p>
                <p className="text-muted-foreground">Primary activity around Kolkata cluster with sudden Rajasthan hop.</p>
              </div>
              <div className="rounded-md border p-3 text-sm">
                <p className="font-semibold mb-1 flex items-center gap-1.5"><ShieldAlert className="h-4 w-4" /> Suspicious pattern</p>
                <p className="text-muted-foreground">Multiple checkout attempts by newly-linked identities.</p>
              </div>
              <div className="rounded-md border p-3 text-sm">
                <p className="font-semibold mb-1 flex items-center gap-1.5"><History className="h-4 w-4" /> Device history</p>
                <p className="text-muted-foreground">7-day rolling trace retained for audit and replay.</p>
              </div>
            </div>
          </>
        )}
      </InvestigationDrawer>
    </div>
  );
}

