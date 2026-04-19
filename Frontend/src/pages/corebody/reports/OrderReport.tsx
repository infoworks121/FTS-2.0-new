import { useMemo, useState } from "react";
import {
  ReportDataTable,
  ReportFilterBar,
  ReportPageHeader,
  ReportSummaryCards,
} from "@/components/corebody/reports/ReportPrimitives";
import { OrderStatusBadge } from "@/components/corebody/orders/OrdersPrimitives";
import { Badge } from "@/components/ui/badge";

type OrderType = "B2B" | "Internal";
type OrderStatus = "Completed" | "Awaiting Dispatch" | "In Transit";

type OrderRow = {
  orderId: string;
  orderType: OrderType;
  dealer: string;
  orderValue: number;
  status: OrderStatus;
  completionDate: string;
};

const DISTRICT_NAME = "District North";

const rows: OrderRow[] = [
  { orderId: "ORD-260222-012", orderType: "B2B", dealer: "Arjun Traders", orderValue: 128000, status: "Completed", completionDate: "2026-02-22" },
  { orderId: "ORD-260222-011", orderType: "Internal", dealer: "North Stock Hub", orderValue: 94400, status: "In Transit", completionDate: "2026-02-22" },
  { orderId: "ORD-260221-010", orderType: "B2B", dealer: "Mehta Supply", orderValue: 83000, status: "Awaiting Dispatch", completionDate: "2026-02-21" },
  { orderId: "ORD-260221-009", orderType: "Internal", dealer: "Priya Agencies", orderValue: 76800, status: "Completed", completionDate: "2026-02-21" },
  { orderId: "ORD-260220-008", orderType: "B2B", dealer: "Kumar Distribution", orderValue: 140500, status: "Completed", completionDate: "2026-02-20" },
  { orderId: "ORD-260219-007", orderType: "B2B", dealer: "Sunrise Agro", orderValue: 53400, status: "In Transit", completionDate: "2026-02-19" },
  { orderId: "ORD-260218-006", orderType: "Internal", dealer: "Rural Connect", orderValue: 48600, status: "Awaiting Dispatch", completionDate: "2026-02-18" },
];

const currency = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function OrderReport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dealer, setDealer] = useState("all");

  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");
  const [appliedDealer, setAppliedDealer] = useState("all");

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const ts = new Date(row.completionDate).getTime();
      const matchesFrom = !appliedFromDate || ts >= new Date(appliedFromDate).getTime();
      const matchesTo = !appliedToDate || ts <= new Date(appliedToDate).getTime();
      const matchesDealer = appliedDealer === "all" || row.dealer === appliedDealer;
      return matchesFrom && matchesTo && matchesDealer;
    });
  }, [appliedDealer, appliedFromDate, appliedToDate]);

  const totalOrders = filtered.length;
  const completedOrders = filtered.filter((row) => row.status === "Completed").length;
  const pendingOrders = filtered.filter((row) => row.status !== "Completed").length;
  const totalOrderValue = filtered.reduce((sum, row) => sum + row.orderValue, 0);

  const dealerOptions = [
    { label: "All", value: "all" },
    ...Array.from(new Set(rows.map((row) => row.dealer))).map((name) => ({ label: name, value: name })),
  ];

  const applyFilter = () => {
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setAppliedDealer(dealer);
  };

  const clearFilter = () => {
    setFromDate("");
    setToDate("");
    setDealer("all");
    setAppliedFromDate("");
    setAppliedToDate("");
    setAppliedDealer("all");
  };

  return (
    <div className="space-y-6">
      <ReportPageHeader title="Order Report" districtName={DISTRICT_NAME} onExport={() => undefined} />

      <ReportFilterBar
        fromDate={fromDate}
        toDate={toDate}
        dealerValue={dealer}
        dealerOptions={dealerOptions}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onDealerChange={setDealer}
        onApply={applyFilter}
        onClear={clearFilter}
      />

      <ReportSummaryCards
        cards={[
          { label: "Total Orders", value: totalOrders },
          { label: "Completed Orders", value: completedOrders, tone: "success" },
          { label: "Pending Orders", value: pendingOrders, tone: pendingOrders > 0 ? "warning" : "neutral" },
          { label: "Total Order Value", value: currency(totalOrderValue) },
        ]}
      />

      <ReportDataTable
        emptyMessage="No order records found for the selected filter view."
        data={filtered}
        columns={[
          { key: "id", header: "Order ID", sortable: true, className: "font-mono text-xs", sortAccessor: (row) => row.orderId, render: (row) => row.orderId },
          {
            key: "type",
            header: "Order Type",
            sortable: true,
            sortAccessor: (row) => row.orderType,
            render: (row) => (
              <Badge variant="outline" className={row.orderType === "B2B" ? "border-blue-500/40 text-blue-600" : "border-purple-500/40 text-purple-600"}>
                {row.orderType}
              </Badge>
            ),
          },
          { key: "dealer", header: "Dealer / Businessman", sortable: true, sortAccessor: (row) => row.dealer, render: (row) => row.dealer },
          { key: "value", header: "Order Value", sortable: true, className: "font-mono", sortAccessor: (row) => row.orderValue, render: (row) => currency(row.orderValue) },
          { key: "status", header: "Status", sortable: true, sortAccessor: (row) => row.status, render: (row) => <OrderStatusBadge status={row.status} /> },
          { key: "date", header: "Completion Date", sortable: true, className: "font-mono text-xs", sortAccessor: (row) => row.completionDate, render: (row) => row.completionDate },
        ]}
      />
    </div>
  );
}
