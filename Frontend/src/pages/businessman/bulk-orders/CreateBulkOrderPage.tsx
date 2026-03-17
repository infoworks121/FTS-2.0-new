import { useMemo, useState } from "react";
import { AlertTriangle, Info, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/components/businessman/BulkOrderPrimitives";

type Product = {
  id: string;
  name: string;
  category: "Seeds" | "Fertilizer" | "Equipment" | "Pesticide";
  marketPrice: number;
  marginPercent: number;
};

const productRows: Product[] = [
  { id: "PRD-1001", name: "Premium Wheat Seed", category: "Seeds", marketPrice: 1400, marginPercent: 11 },
  { id: "PRD-1002", name: "Nitro Boost Fertilizer", category: "Fertilizer", marketPrice: 980, marginPercent: 13 },
  { id: "PRD-1003", name: "Smart Drip Kit", category: "Equipment", marketPrice: 6200, marginPercent: 9 },
  { id: "PRD-1004", name: "Shield Pro Pesticide", category: "Pesticide", marketPrice: 1720, marginPercent: 12 },
];

export default function CreateBulkOrderPage() {
  const [category, setCategory] = useState<"all" | Product["category"]>("all");
  const [productId, setProductId] = useState(productRows[0].id);
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState("kg");
  const [requestedPrice, setRequestedPrice] = useState(0);
  const [deliveryType, setDeliveryType] = useState("Stock Point");
  const [notes, setNotes] = useState("");

  const filteredProducts = useMemo(
    () => productRows.filter((item) => category === "all" || item.category === category),
    [category]
  );

  const selected = productRows.find((item) => item.id === productId) ?? productRows[0];
  const usedPrice = requestedPrice > 0 ? requestedPrice : selected.marketPrice;
  const estimatedMargin = Math.round(usedPrice * quantity * (selected.marginPercent / 100));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Create Bulk Order</h1>
          <p className="text-sm text-muted-foreground">Initiate large-volume B2B request with negotiated pricing routed to Admin.</p>
        </div>
        <Badge variant="outline" className="border-blue-500/40 text-blue-500">Pricing subject to approval</Badge>
      </div>

      <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
        <p className="text-xs text-amber-500">Submitted pricing does not imply approval. Final commercial terms are locked by Admin after review.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Bulk Order Form</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category Filter</Label>
            <Select value={category} onValueChange={(v: "all" | Product["category"]) => setCategory(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Seeds">Seeds</SelectItem>
                <SelectItem value="Fertilizer">Fertilizer</SelectItem>
                <SelectItem value="Equipment">Equipment</SelectItem>
                <SelectItem value="Pesticide">Pesticide</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Product Selection</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {filteredProducts.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value || 0))} />
          </div>

          <div className="space-y-2">
            <Label>Unit</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="bag">bag</SelectItem>
                <SelectItem value="litre">litre</SelectItem>
                <SelectItem value="set">set</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Suggested Market Price (Read-only)</Label>
            <Input value={formatCurrency(selected.marketPrice)} disabled />
          </div>

          <div className="space-y-2">
            <Label>Requested Price (Optional)</Label>
            <Input
              type="number"
              min={0}
              placeholder="Leave blank to use market price"
              value={requestedPrice || ""}
              onChange={(e) => setRequestedPrice(Number(e.target.value || 0))}
            />
          </div>

          <div className="space-y-2">
            <Label>Delivery Preference</Label>
            <Select value={deliveryType} onValueChange={setDeliveryType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Stock Point">Stock Point</SelectItem>
                <SelectItem value="Direct Pickup">Direct pickup</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add requirement notes for Admin/Core Body review"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Estimated Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-lg text-muted-foreground">{formatCurrency(estimatedMargin)}</p>
            <p className="text-xs text-muted-foreground mt-1">Not Final</p>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Submission Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-blue-500" />
              <p>Negotiation starts after submission. No instant approval path is available for bulk orders.</p>
            </div>
            <p>After Admin approval, pricing and quantity are locked and cannot be edited in this panel.</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button>Submit for Negotiation</Button>
        <Button variant="outline" className="gap-1.5"><Save className="h-4 w-4" /> Save as Draft</Button>
      </div>
    </div>
  );
}

