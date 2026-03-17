import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InventoryConfirmDialog,
  InventoryProductCombobox,
  InventorySlaBanner,
  inventoryLedger,
  inventoryProducts,
} from "@/components/businessman/StockInventoryPrimitives";

type Source = "Core Body" | "Admin" | "Purchase";
type Reason = "Order Fulfilment" | "Transfer" | "Adjustment";

export default function StockInOutPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"in" | "out">("in");

  const [inProduct, setInProduct] = useState(inventoryProducts[0].name);
  const [inQuantity, setInQuantity] = useState(1);
  const [inSource, setInSource] = useState<Source>("Core Body");
  const [inReference, setInReference] = useState("");
  const [inRemarks, setInRemarks] = useState("");

  const [outProduct, setOutProduct] = useState(inventoryProducts[1].name);
  const [outQuantity, setOutQuantity] = useState(1);
  const [outReason, setOutReason] = useState<Reason>("Order Fulfilment");
  const [outOrderId, setOutOrderId] = useState("");
  const [outReference, setOutReference] = useState("");
  const [outRemarks, setOutRemarks] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedOutStock = useMemo(
    () => inventoryProducts.find((item) => item.name === outProduct)?.currentStock ?? 0,
    [outProduct]
  );

  const inError = useMemo(() => {
    if (!inProduct) return "Product selection is required.";
    if (!Number.isFinite(inQuantity) || inQuantity <= 0) return "Quantity must be greater than zero.";
    if (inQuantity > 100000) return "Quantity overflow risk detected. Keep quantity within safe operational limit.";
    return "";
  }, [inProduct, inQuantity]);

  const outError = useMemo(() => {
    if (!outProduct) return "Product selection is required.";
    if (!Number.isFinite(outQuantity) || outQuantity <= 0) return "Quantity must be greater than zero.";
    if (outQuantity > 100000) return "Quantity overflow risk detected. Keep quantity within safe operational limit.";
    if (outQuantity > selectedOutStock) return "Stock Out quantity exceeds available stock. Submission blocked for inventory safety.";
    if (outReason === "Order Fulfilment" && !outOrderId.trim()) return "Linked Order ID is mandatory for Order Fulfilment stock out.";
    return "";
  }, [outOrderId, outProduct, outQuantity, outReason, selectedOutStock]);

  const activeError = tab === "in" ? inError : outError;

  const handleSubmit = () => {
    const movementType = tab === "in" ? "Stock In" : "Stock Out";
    const product = tab === "in" ? inProduct : outProduct;
    const qty = tab === "in" ? inQuantity : outQuantity;

    const simulatedLedgerCount = inventoryLedger.length + 1;
    toast({
      title: `${movementType} submitted`,
      description: `${product} • Qty ${qty}. Ledger updated (entry #${simulatedLedgerCount}). This action is immutable.`,
    });

    setConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Stock In / Stock Out</h1>
        <p className="text-sm text-muted-foreground">Controlled stock movement entry with validation, confirmation, and immutable ledger behavior.</p>
      </div>

      <InventorySlaBanner />

      <Tabs value={tab} onValueChange={(value) => setTab(value as "in" | "out")}>
        <TabsList className="grid w-full grid-cols-2 md:w-[360px]">
          <TabsTrigger value="in">Stock In</TabsTrigger>
          <TabsTrigger value="out">Stock Out</TabsTrigger>
        </TabsList>

        <TabsContent value="in" className="mt-4">
          <div className="rounded-md border p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Product</Label>
              <InventoryProductCombobox value={inProduct} onValueChange={setInProduct} />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" value={inQuantity} min={1} onChange={(e) => setInQuantity(Number(e.target.value || 0))} />
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={inSource} onValueChange={(v: Source) => setInSource(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Core Body">Core Body</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Purchase">Purchase</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reference Number (Optional)</Label>
              <Input value={inReference} onChange={(e) => setInReference(e.target.value)} placeholder="IN-REF-001" />
            </div>
            <div className="space-y-2">
              <Label>Remarks (Optional)</Label>
              <Textarea value={inRemarks} onChange={(e) => setInRemarks(e.target.value)} rows={3} placeholder="Operational note" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="out" className="mt-4">
          <div className="rounded-md border p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Product</Label>
              <InventoryProductCombobox value={outProduct} onValueChange={setOutProduct} />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" value={outQuantity} min={1} onChange={(e) => setOutQuantity(Number(e.target.value || 0))} />
              <p className="text-xs text-muted-foreground">Available: {selectedOutStock}</p>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={outReason} onValueChange={(v: Reason) => setOutReason(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Order Fulfilment">Order Fulfilment</SelectItem>
                  <SelectItem value="Transfer">Transfer</SelectItem>
                  <SelectItem value="Adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Linked Order ID (if applicable)</Label>
              <Input value={outOrderId} onChange={(e) => setOutOrderId(e.target.value)} placeholder="ORD-991023" />
            </div>
            <div className="space-y-2">
              <Label>Reference Number (Optional)</Label>
              <Input value={outReference} onChange={(e) => setOutReference(e.target.value)} placeholder="OUT-REF-001" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Remarks (Optional)</Label>
              <Textarea value={outRemarks} onChange={(e) => setOutRemarks(e.target.value)} rows={3} placeholder="Operational note" />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="rounded-md border border-dashed p-3">
        <p className="text-xs text-muted-foreground">
          Inventory write rules: No negative quantities, no overflow, confirmation required before submission, and no delete option after posting.
        </p>
      </div>

      {activeError && <p className="text-xs text-red-500">{activeError}</p>}

      <div className="flex justify-end">
        <Button disabled={!!activeError} onClick={() => setConfirmOpen(true)}>
          Submit {tab === "in" ? "Stock In" : "Stock Out"}
        </Button>
      </div>

      <InventoryConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Confirm ${tab === "in" ? "Stock In" : "Stock Out"} submission`}
        description={
          tab === "in"
            ? `${inProduct} • Qty ${inQuantity} • Source ${inSource}. This operation updates inventory ledger permanently.`
            : `${outProduct} • Qty ${outQuantity} • Reason ${outReason}. This operation updates inventory ledger permanently.`
        }
        confirmLabel="Confirm & Post"
        onConfirm={handleSubmit}
      />
    </div>
  );
}

