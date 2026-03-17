import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BulkOrderStatusBadge, LoggedBadge, formatCurrency } from "@/components/businessman/BulkOrderPrimitives";

type PaymentStatus = "Pending" | "Paid";
type FulfilmentStatus = "Queued" | "In Transit" | "Delivered";

type ApprovedRow = {
  orderId: string;
  product: string;
  approvedPrice: number;
  quantity: number;
  supplier: "Admin" | "Core Body" | "Stock Point";
  paymentStatus: PaymentStatus;
  fulfilmentStatus: FulfilmentStatus;
};

const rows: ApprovedRow[] = [
  {
    orderId: "BO-260222-003",
    product: "Premium Wheat Seed",
    approvedPrice: 1345,
    quantity: 420,
    supplier: "Core Body",
    paymentStatus: "Pending",
    fulfilmentStatus: "Queued",
  },
  {
    orderId: "BO-260221-012",
    product: "Nitro Boost Fertilizer",
    approvedPrice: 950,
    quantity: 350,
    supplier: "Stock Point",
    paymentStatus: "Paid",
    fulfilmentStatus: "In Transit",
  },
  {
    orderId: "BO-260220-016",
    product: "Smart Drip Kit",
    approvedPrice: 6075,
    quantity: 95,
    supplier: "Admin",
    paymentStatus: "Paid",
    fulfilmentStatus: "Delivered",
  },
];

export default function ApprovedBulkOrdersPage() {
  const totalApprovedValue = rows.reduce((acc, row) => acc + row.approvedPrice * row.quantity, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Approved Bulk Orders</h1>
        <p className="text-sm text-muted-foreground">Admin-approved orders ready for payment and fulfilment execution.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Approved Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold font-mono">{rows.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Approved Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold font-mono text-right">{formatCurrency(totalApprovedValue)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Execution Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Approved Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Fulfilment Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.orderId} className={row.paymentStatus === "Pending" ? "bg-amber-500/5" : ""}>
                    <TableCell className="font-mono text-xs">{row.orderId}</TableCell>
                    <TableCell>{row.product}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(row.approvedPrice)}</TableCell>
                    <TableCell className="text-right font-mono">{row.quantity}</TableCell>
                    <TableCell>{row.supplier}</TableCell>
                    <TableCell>
                      {row.paymentStatus === "Pending" ? (
                        <span className="text-amber-500 text-xs font-medium">Pending</span>
                      ) : (
                        <span className="text-emerald-500 text-xs font-medium">Paid</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.fulfilmentStatus === "Delivered" ? (
                        <BulkOrderStatusBadge status="Approved" />
                      ) : row.fulfilmentStatus === "In Transit" ? (
                        <BulkOrderStatusBadge status="Negotiation" />
                      ) : (
                        <BulkOrderStatusBadge status="Pending" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2 items-center">
                        <Button size="sm" disabled={row.paymentStatus === "Paid"}>Proceed to Payment</Button>
                        <Button size="sm" variant="outline">View Invoice</Button>
                        <Button size="sm" variant="ghost">Track Fulfilment</Button>
                        <LoggedBadge />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">Approved pricing is locked and read-only. Negotiation is disabled at this stage.</p>
        </CardContent>
      </Card>
    </div>
  );
}

