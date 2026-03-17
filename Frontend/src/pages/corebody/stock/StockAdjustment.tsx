import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { navItems } from "@/pages/CoreBodyDashboard";

type AdjustmentType = "Return" | "Damage" | "Correction";

const issueReferences = [
  { issueId: "ISS-240215-001", recipient: "Arjun Traders", product: "Hybrid Rice Seed", availableForAdjustment: 120 },
  { issueId: "ISS-240214-007", recipient: "Priya Agencies", product: "NPK 20:20:20", availableForAdjustment: 70 },
  { issueId: "ISS-240213-004", recipient: "Mehta Supply", product: "Bio Shield", availableForAdjustment: 50 },
];

export default function StockAdjustment() {
  const [issueId, setIssueId] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>("Return");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedIssue = useMemo(() => issueReferences.find((r) => r.issueId === issueId), [issueId]);
  const numericQuantity = Number(quantity || 0);

  const validate = () => {
    if (!selectedIssue) {
      toast.error("Select the original Issue ID first.");
      return false;
    }
    if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
      toast.error("Enter a valid quantity.");
      return false;
    }
    if (numericQuantity > selectedIssue.availableForAdjustment) {
      toast.error("Quantity exceeds eligible amount for this reference.");
      return false;
    }
    if (!reason.trim()) {
      toast.error("Reason is mandatory for all returns/adjustments.");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setIssueId("");
    setAdjustmentType("Return");
    setQuantity("");
    setReason("");
  };

  const submitAdjustment = () => {
    const auditRef = `AUD-ADJ-${Date.now()}`;
    toast.success(`Adjustment submitted. Immutable audit record created (${auditRef}).`);
    setConfirmOpen(false);
    resetForm();
  };

  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel="Core Body — District North">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Stock Return / Adjustment</h1>
          <p className="text-sm text-muted-foreground">
            Controlled return and correction workflow. Submitted adjustments are immutable and auditable.
          </p>
        </div>

        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-6 flex items-center justify-between gap-3 text-xs">
            <p className="text-amber-600 dark:text-amber-400">
              Warning: No edit/delete is allowed after submission. Every action is permanently logged.
            </p>
            <Badge variant="outline">Audit Strict</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Section A: Reference Selection</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Original Issue ID</Label>
              <Select value={issueId} onValueChange={setIssueId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select issue reference" />
                </SelectTrigger>
                <SelectContent>
                  {issueReferences.map((ref) => (
                    <SelectItem key={ref.issueId} value={ref.issueId}>
                      {ref.issueId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Recipient Name</Label>
              <Input readOnly value={selectedIssue?.recipient ?? "—"} className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Product</Label>
              <Input readOnly value={selectedIssue?.product ?? "—"} className="bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Section B: Adjustment Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Adjustment Type</Label>
              <Select value={adjustmentType} onValueChange={(v) => setAdjustmentType(v as AdjustmentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Return">Return</SelectItem>
                  <SelectItem value="Damage">Damage</SelectItem>
                  <SelectItem value="Correction">Correction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label>Reason (Mandatory)</Label>
              <Textarea
                placeholder="Document business reason for audit and compliance"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="sticky bottom-4 z-10 border-amber-500/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
          <CardHeader>
            <CardTitle className="text-sm">Section C: Action Panel</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              This action updates stock ledger and generates a non-editable audit entry.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (validate()) setConfirmOpen(true);
                }}
              >
                Submit Adjustment
              </Button>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Stock Adjustment</AlertDialogTitle>
              <AlertDialogDescription>
                After submission, this record is immutable and cannot be edited/deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="rounded-md border p-3 text-xs space-y-1">
              <p><span className="text-muted-foreground">Issue ID:</span> {selectedIssue?.issueId}</p>
              <p><span className="text-muted-foreground">Type:</span> {adjustmentType}</p>
              <p><span className="text-muted-foreground">Quantity:</span> {numericQuantity}</p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Back</AlertDialogCancel>
              <AlertDialogAction onClick={submitAdjustment}>Confirm Submission</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}

