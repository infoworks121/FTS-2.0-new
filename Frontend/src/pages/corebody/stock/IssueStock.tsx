import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { navItems } from "@/pages/CoreBodyDashboard";

type RecipientType = "Dealer" | "Businessman";

const hasIssueAuthority = true; // Core Body A only (permission-based)

const recipients = [
  { id: "RCP-001", type: "Dealer" as RecipientType, name: "Arjun Traders", status: "Active" as const },
  { id: "RCP-002", type: "Dealer" as RecipientType, name: "Kumar Dist.", status: "Inactive" as const },
  { id: "RCP-003", type: "Businessman" as RecipientType, name: "Mehta Supply", status: "Active" as const },
  { id: "RCP-004", type: "Businessman" as RecipientType, name: "Priya Agencies", status: "Active" as const },
];

const products = [
  { id: "PRD-001", category: "Seeds", name: "Hybrid Rice Seed", availableStock: 580, unitType: "Bag" },
  { id: "PRD-002", category: "Fertilizer", name: "NPK 20:20:20", availableStock: 320, unitType: "Sack" },
  { id: "PRD-003", category: "Equipment", name: "Sprayer Pump", availableStock: 95, unitType: "Piece" },
  { id: "PRD-004", category: "Pesticide", name: "Bio Shield", availableStock: 210, unitType: "Bottle" },
];

export default function IssueStock() {
  const [recipientType, setRecipientType] = useState<RecipientType>("Dealer");
  const [recipientSearch, setRecipientSearch] = useState("");
  const [recipientId, setRecipientId] = useState("");

  const [productCategory, setProductCategory] = useState("all");
  const [productId, setProductId] = useState("");

  const [quantity, setQuantity] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [internalNote, setInternalNote] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);

  const recipientOptions = useMemo(() => {
    const q = recipientSearch.trim().toLowerCase();
    return recipients.filter(
      (r) => r.type === recipientType && (!q || r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
    );
  }, [recipientSearch, recipientType]);

  const selectedRecipient = recipients.find((r) => r.id === recipientId);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), []);

  const productOptions = useMemo(() => {
    if (productCategory === "all") return products;
    return products.filter((p) => p.category === productCategory);
  }, [productCategory]);

  const selectedProduct = products.find((p) => p.id === productId);
  const qty = Number(quantity || 0);

  const validateBeforeConfirm = () => {
    if (!hasIssueAuthority) {
      toast.error("You do not have permission to issue stock. Core Body A access is required.");
      return false;
    }
    if (!selectedRecipient) {
      toast.error("Select a recipient before issuing stock.");
      return false;
    }
    if (selectedRecipient.status !== "Active") {
      toast.error("Recipient is inactive. Stock can only be issued to active recipients.");
      return false;
    }
    if (!selectedProduct) {
      toast.error("Select a product to continue.");
      return false;
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error("Enter a valid quantity greater than zero.");
      return false;
    }
    if (qty > selectedProduct.availableStock) {
      toast.error("Quantity exceeds available stock.");
      return false;
    }
    return true;
  };

  const handleReset = () => {
    setRecipientType("Dealer");
    setRecipientSearch("");
    setRecipientId("");
    setProductCategory("all");
    setProductId("");
    setQuantity("");
    setIssueDate(new Date().toISOString().slice(0, 10));
    setInternalNote("");
  };

  const handleIssue = () => {
    const auditRef = `AUD-${Date.now()}`;
    toast.success(`Stock issued successfully. Audit Ref: ${auditRef}`);
    handleReset();
    setConfirmOpen(false);
  };

  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel="Core Body — District North">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Issue Stock</h1>
          <p className="text-sm text-muted-foreground">
            Controlled stock issuance to Dealers and Businessmen with immutable audit records.
          </p>
        </div>

        {!hasIssueAuthority && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6 text-sm text-destructive">
              You do not have stock issuance permission. This module is available only to Core Body A.
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Section A: Recipient Selection</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Recipient Type</Label>
              <Select value={recipientType} onValueChange={(v) => {
                setRecipientType(v as RecipientType);
                setRecipientId("");
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dealer">Dealer</SelectItem>
                  <SelectItem value="Businessman">Businessman</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search Recipient</Label>
              <Input
                placeholder="Search by name or recipient ID"
                value={recipientSearch}
                onChange={(e) => setRecipientSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Recipient Name</Label>
              <Select value={recipientId} onValueChange={setRecipientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {recipientOptions.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} ({r.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3 flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={selectedRecipient?.status === "Active" ? "default" : "secondary"}>
                {selectedRecipient?.status || "Not selected"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Section B: Product Selection</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Product Category</Label>
              <Select value={productCategory} onValueChange={(v) => {
                setProductCategory(v);
                setProductId("");
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Product Name</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {productOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Available Stock (Read-only)</Label>
              <Input readOnly value={selectedProduct?.availableStock ?? "—"} className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>Unit Type</Label>
              <Input readOnly value={selectedProduct?.unitType ?? "—"} className="bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Section C: Issue Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Quantity to Issue</Label>
              <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              <p className="text-xs text-muted-foreground">Validation: quantity must not exceed available stock.</p>
            </div>

            <div className="space-y-2">
              <Label>Issue Date</Label>
              <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </div>

            <div className="md:col-span-3 space-y-2">
              <Label>Optional Internal Note</Label>
              <Textarea
                placeholder="Internal context for operations team (optional)"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="sticky bottom-4 z-10 border-primary/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
          <CardHeader>
            <CardTitle className="text-sm">Section D: Action Panel</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Stock movement will update inventory and create immutable audit entries.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>Reset</Button>
              <Button
                onClick={() => {
                  if (validateBeforeConfirm()) setConfirmOpen(true);
                }}
                disabled={!hasIssueAuthority}
              >
                Issue Stock
              </Button>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Stock Issuance</AlertDialogTitle>
              <AlertDialogDescription>
                This action will move stock and create ledger + audit records. Please confirm before submitting.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="rounded-md border p-3 text-xs space-y-1">
              <p><span className="text-muted-foreground">Recipient:</span> {selectedRecipient?.name}</p>
              <p><span className="text-muted-foreground">Product:</span> {selectedProduct?.name}</p>
              <p><span className="text-muted-foreground">Quantity:</span> {qty}</p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleIssue}>Confirm & Issue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}

