import { useMemo, useState } from "react";
import {
  ReportDataTable,
  ReportFilterBar,
  ReportPageHeader,
  ReportSummaryCards,
} from "@/components/corebody/reports/ReportPrimitives";
import { Badge } from "@/components/ui/badge";

type DealerStatus = "Excellent" | "Stable" | "Watch";

type DealerPerformanceRow = {
  dealerName: string;
  ordersHandled: number;
  totalVolume: number;
  slaScore: number;
  performanceStatus: DealerStatus;
};

const DISTRICT_NAME = "District North";

const rows: DealerPerformanceRow[] = [
  { dealerName: "Arjun Traders", ordersHandled: 58, totalVolume: 242000, slaScore: 95, performanceStatus: "Excellent" },
  { dealerName: "Priya Agencies", ordersHandled: 46, totalVolume: 186500, slaScore: 89, performanceStatus: "Stable" },
  { dealerName: "Mehta Supply", ordersHandled: 52, totalVolume: 205300, slaScore: 91, performanceStatus: "Excellent" },
  { dealerName: "Kumar Distribution", ordersHandled: 28, totalVolume: 110400, slaScore: 79, performanceStatus: "Watch" },
  { dealerName: "Sunrise Agro", ordersHandled: 34, totalVolume: 128900, slaScore: 84, performanceStatus: "Stable" },
  { dealerName: "Rural Connect", ordersHandled: 16, totalVolume: 64200, slaScore: 72, performanceStatus: "Watch" },
];

const currency = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function DealerPerformanceReport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dealer, setDealer] = useState("all");

  const [appliedDealer, setAppliedDealer] = useState("all");

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (appliedDealer !== "all" && row.dealerName !== appliedDealer) return false;
      return true;
    });
  }, [appliedDealer]);

  const totalDealers = filtered.length;
  const activeDealers = filtered.filter((row) => row.ordersHandled > 0).length;
  const avgSla = filtered.length ? (filtered.reduce((sum, row) => sum + row.slaScore, 0) / filtered.length).toFixed(1) : "0.0";
  const totalOrderVolume = filtered.reduce((sum, row) => sum + row.totalVolume, 0);

  const dealerOptions = [
    { label: "All", value: "all" },
    ...rows.map((row) => ({ label: row.dealerName, value: row.dealerName })),
  ];

  const applyFilter = () => {
    setAppliedDealer(dealer);
  };

  const clearFilter = () => {
    setFromDate("");
    setToDate("");
    setDealer("all");
    setAppliedDealer("all");
  };

  return (
    <div className="space-y-6">
      <ReportPageHeader title="Dealer Performance Report" districtName={DISTRICT_NAME} onExport={() => undefined} />

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
          { label: "Total Dealers", value: totalDealers },
          { label: "Active Dealers", value: activeDealers, tone: "success" },
          { label: "Avg SLA Score", value: `${avgSla}%`, tone: Number(avgSla) < 80 ? "warning" : "neutral" },
          { label: "Total Order Volume", value: currency(totalOrderVolume) },
        ]}
      />

      <ReportDataTable
        emptyMessage="No dealer performance rows found for the selected filter view."
        data={filtered}
        columns={[
          { key: "dealer", header: "Dealer Name", sortable: true, sortAccessor: (row) => row.dealerName, render: (row) => row.dealerName },
          { key: "orders", header: "Orders Handled", sortable: true, className: "font-mono", sortAccessor: (row) => row.ordersHandled, render: (row) => row.ordersHandled },
          { key: "volume", header: "Total Volume", sortable: true, className: "font-mono", sortAccessor: (row) => row.totalVolume, render: (row) => currency(row.totalVolume) },
          { key: "sla", header: "SLA Score", sortable: true, className: "font-mono", sortAccessor: (row) => row.slaScore, render: (row) => `${row.slaScore}%` },
          {
            key: "status",
            header: "Performance Status",
            sortable: true,
            sortAccessor: (row) => row.performanceStatus,
            render: (row) => {
              const className =
                row.performanceStatus === "Excellent"
                  ? "border-emerald-500/40 text-emerald-600"
                  : row.performanceStatus === "Stable"
                    ? "border-blue-500/40 text-blue-600"
                    : "border-amber-500/40 text-amber-600";
              return (
                <Badge variant="outline" className={className}>
                  {row.performanceStatus}
                </Badge>
              );
            },
          },
        ]}
      />
    </div>
  );
}
