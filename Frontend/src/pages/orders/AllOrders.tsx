import { useMemo, useState } from "react";
import { Download, Eye, PackageCheck, Search, ShoppingCart, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/KPICard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UnifiedOrder, unifiedOrders } from "./orderData";

const orderTypeClass: Record<string, string> = {
  B2B: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  B2C: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  Bulk: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

const paymentStatusClass: Record<string, string> = {
  Paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "Partially Paid": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Pending: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  Refunded: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export default function AllOrders() {
  const [search, setSearch] = useState("");
  const [orderType, setOrderType] = useState("all");
  const [orderStatus, setOrderStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<UnifiedOrder | null>(null);

  const filteredOrders = useMemo(() => {
    return unifiedOrders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.toLowerCase().includes(search.toLowerCase());
      const matchesType = orderType === "all" || order.orderType === orderType;
      const matchesStatus = orderStatus === "all" || order.orderStatus === orderStatus;
      const matchesDate = dateFilter === "all" || order.createdDate === dateFilter;
      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [dateFilter, orderStatus, orderType, search]);

  const totalValue = filteredOrders.reduce((sum, order) => sum + order.orderValue, 0);
  const paidOrders = filteredOrders.filter((o) => o.paymentStatus === "Paid").length;
  const pendingOps = filteredOrders.filter((o) => o.orderStatus !== "Delivered").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">All Orders</h1>
          <p className="text-sm text-muted-foreground">Operational visibility for all order flows across businesses</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Total Orders" value={String(filteredOrders.length)} icon={ShoppingCart} variant="default" />
        <KPICard title="Order Value" value={`₹${totalValue.toLocaleString("en-IN")}`} icon={Wallet} variant="trust" />
        <KPICard title="Paid Orders" value={String(paidOrders)} icon={PackageCheck} variant="profit" />
        <KPICard title="Open Operations" value={String(pendingOps)} icon={Eye} variant="warning" />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID / User"
              className="pl-8"
            />
          </div>
          <Select value={orderType} onValueChange={setOrderType}>
            <SelectTrigger>
              <SelectValue placeholder="Order Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="B2B">B2B</SelectItem>
              <SelectItem value="B2C">B2C</SelectItem>
              <SelectItem value="Bulk">Bulk</SelectItem>
            </SelectContent>
          </Select>
          <Select value={orderStatus} onValueChange={setOrderStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Order Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="In Transit">In Transit</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              {Array.from(new Set(unifiedOrders.map((o) => o.createdDate))).map((date) => (
                <SelectItem key={date} value={date}>
                  {date}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Order Type</TableHead>
                <TableHead>Customer / Businessman</TableHead>
                <TableHead>District</TableHead>
                <TableHead className="text-right">Order Value</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer" onClick={() => setSelectedOrder(order)}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <Badge className={orderTypeClass[order.orderType]}>{order.orderType}</Badge>
                  </TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.district}</TableCell>
                  <TableCell className="text-right font-mono">₹{order.orderValue.toLocaleString("en-IN")}</TableCell>
                  <TableCell>
                    <Badge className={paymentStatusClass[order.paymentStatus]}>{order.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell>{order.orderStatus}</TableCell>
                  <TableCell>{order.createdDate}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent className="sm:max-w-xl">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle>Order Detail • {selectedOrder.id}</SheetTitle>
                <SheetDescription>Operational detail drawer (financial values are read-only)</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-3 text-sm">
                <div className="rounded-md border p-3">
                  <p><span className="font-semibold">Order Type:</span> {selectedOrder.orderType}</p>
                  <p><span className="font-semibold">Customer:</span> {selectedOrder.customer}</p>
                  <p><span className="font-semibold">District:</span> {selectedOrder.district}</p>
                  <p><span className="font-semibold">Payment Mode:</span> {selectedOrder.paymentMode}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p><span className="font-semibold">Order Value:</span> ₹{selectedOrder.orderValue.toLocaleString("en-IN")}</p>
                  <p><span className="font-semibold">Payment Status:</span> {selectedOrder.paymentStatus}</p>
                  <p><span className="font-semibold">Referral Impact:</span> {selectedOrder.referralImpact}</p>
                </div>
                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="font-semibold text-amber-700 dark:text-amber-300">Finance Safety Guardrail</p>
                  <p className="text-muted-foreground">Ledger entries are immutable and cannot be edited from this view.</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

