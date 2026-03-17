import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { navItems } from "@/pages/CoreBodyDashboard";
import {
  ReportDataTable,
  ReportFilterBar,
  ReportPageHeader,
  ReportSummaryCards,
} from "@/components/corebody/reports/ReportPrimitives";

type StockRow = {
  productName: string;
  productCategory: string;
  issuedQuantity: number;
  returnedQuantity: number;
  movementDate: string;
  dealer: string;
};

const DISTRICT_NAME = "District North";

const rows: StockRow[] = [
  { productName: "Solar Pump Controller", productCategory: "Electronics", issuedQuantity: 420, returnedQuantity: 22, movementDate: "2026-02-22", dealer: "Arjun Traders" },
  { productName: "Irrigation Valve Kit", productCategory: "Hardware", issuedQuantity: 300, returnedQuantity: 18, movementDate: "2026-02-21", dealer: "Priya Agencies" },
  { productName: "Agri Sensor Node", productCategory: "IoT", issuedQuantity: 180, returnedQuantity: 35, movementDate: "2026-02-21", dealer: "Mehta Supply" },
  { productName: "Fertilizer Dispenser", productCategory: "Machinery", issuedQuantity: 90, returnedQuantity: 6, movementDate: "2026-02-20", dealer: "Kumar Distribution" },
  { productName: "Water Level Gauge", productCategory: "IoT", issuedQuantity: 260, returnedQuantity: 10, movementDate: "2026-02-19", dealer: "Sunrise Agro" },
  { productName: "Soil Meter Kit", productCategory: "Electronics", issuedQuantity: 140, returnedQuantity: 14, movementDate: "2026-02-18", dealer: "Arjun Traders" },
];

export default function StockMovementReport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dealer, setDealer] = useState("all");

  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");
  const [appliedDealer, setAppliedDealer] = useState("all");

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const ts = new Date(row.movementDate).getTime();
      const matchesFrom = !appliedFromDate || ts >= new Date(appliedFromDate).getTime();
      const matchesTo = !appliedToDate || ts <= new Date(appliedToDate).getTime();
      const matchesDealer = appliedDealer === "all" || row.dealer === appliedDealer;
      return matchesFrom && matchesTo && matchesDealer;
    });
  }, [appliedDealer, appliedFromDate, appliedToDate]);

  const totalIssued = filtered.reduce((sum, row) => sum + row.issuedQuantity, 0);
  const totalReturned = filtered.reduce((sum, row) => sum + row.returnedQuantity, 0);
  const netMovement = totalIssued - totalReturned;
  const uniqueProducts = new Set(filtered.map((row) => row.productName)).size;

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
    <DashboardLayout role="corebody" navItems={navItems} roleLabel={`Core Body — ${DISTRICT_NAME}`}>
      <div className="space-y-6">
        <ReportPageHeader title="Stock Movement Report" districtName={DISTRICT_NAME} onExport={() => undefined} />

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
            { label: "Total Issued Quantity", value: totalIssued },
            { label: "Total Returned Quantity", value: totalReturned },
            { label: "Net Stock Movement", value: netMovement, tone: netMovement >= 0 ? "success" : "danger" },
            { label: "Unique Products", value: uniqueProducts, hint: "Filtered set" },
          ]}
        />

        <ReportDataTable
          emptyMessage="No stock movement records found for the selected filter view."
          data={filtered}
          columns={[
            { key: "product", header: "Product Name", sortable: true, sortAccessor: (row) => row.productName, render: (row) => row.productName },
            { key: "category", header: "Product Category", sortable: true, sortAccessor: (row) => row.productCategory, render: (row) => row.productCategory },
            { key: "issued", header: "Issued Quantity", sortable: true, className: "font-mono", sortAccessor: (row) => row.issuedQuantity, render: (row) => row.issuedQuantity },
            { key: "returned", header: "Returned Quantity", sortable: true, className: "font-mono", sortAccessor: (row) => row.returnedQuantity, render: (row) => row.returnedQuantity },
            {
              key: "net",
              header: "Net Quantity",
              sortable: true,
              className: "font-mono",
              sortAccessor: (row) => row.issuedQuantity - row.returnedQuantity,
              render: (row) => {
                const net = row.issuedQuantity - row.returnedQuantity;
                return <span className={net >= 0 ? "text-emerald-600" : "text-red-600"}>{net}</span>;
              },
            },
            { key: "date", header: "Movement Date", sortable: true, className: "font-mono text-xs", sortAccessor: (row) => row.movementDate, render: (row) => row.movementDate },
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
