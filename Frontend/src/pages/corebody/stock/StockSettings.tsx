import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

const StockSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Stock Issuance Settings</h1>
        <p className="text-sm text-muted-foreground">Admin-defined issuance controls and limits (read-only)</p>
      </div>

      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-500/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold">Read-Only Settings</p>
              <p>These settings are defined by Admin and cannot be modified at Core Body level.</p>
            </div>
            <Badge variant="outline" className="ml-auto">Immutable Controls</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Issuance Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Max Issue Per Transaction</div>
              <div className="text-2xl font-bold">500 units</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Daily Issuance Limit</div>
              <div className="text-2xl font-bold">2,000 units</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Allowed Recipient Roles</div>
              <div className="flex gap-2">
                <Badge>Dealer</Badge>
                <Badge>Businessman</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Return & Adjustment Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Max Adjustment Window</div>
              <div className="text-2xl font-bold">30 days</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Allowed Adjustment Types</div>
              <div className="flex gap-2">
                <Badge variant="outline">Return</Badge>
                <Badge variant="outline">Damage</Badge>
                <Badge variant="outline">Correction</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-muted rounded-lg">
            <div className="font-semibold mb-2">Admin-Defined Rules</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>All stock movements must be approved within 24 hours</li>
              <li>Adjustments require mandatory reason documentation</li>
              <li>Audit trail is maintained for all transactions</li>
              <li>Stock issuance is restricted to Core Body A only</li>
            </ul>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold">Effective Date:</span>
            <span>January 1, 2024</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockSettings;
