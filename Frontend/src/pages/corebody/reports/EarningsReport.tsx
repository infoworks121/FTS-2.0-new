import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { navItems } from "@/pages/CoreBodyDashboard";
import {
  ReportDataTable,
  ReportFilterBar,
  ReportPageHeader,
  ReportSummaryCards,
} from "@/components/corebody/reports/ReportPrimitives";
import { Badge } from "@/components/ui/badge";

type EarningSource = "Order" | "Distribution" | "Referral";
type WalletType = "Main" | "Referral" | "Reserve";

type EarningsRow = {
  date: string;
  source: EarningSource;
  referenceId: string;
  amount: number;
  walletType: WalletType;
  capImpact: boolean;
  dealer: string;
};

const DISTRICT_NAME = "District North";
const CAP_LIMIT = 250000;

const rows: EarningsRow[] = [
  { date: "2026-02-22", source: "Order", referenceId: "ORD-990012", amount: 18500, walletType: "Main", capImpact: true, dealer: "Arjun Traders" },
  { date: "2026-02-21", source: "Distribution", referenceId: "DST-228901", amount: 8600, walletType: "Main", capImpact: true, dealer: "Priya Agencies" },
  { date: "2026-02-21", source: "Referral", referenceId: "REF-883112", amount: 2400, walletType: "Referral", capImpact: false, dealer: "Mehta Supply" },
  { date: "2026-02-20", source: "Order", referenceId: "ORD-990004", amount: 15300, walletType: "Main", capImpact: true, dealer: "Arjun Traders" },
  { date: "2026-02-20", source: "Distribution", referenceId: "DST-228877", amount: 11200, walletType: "Reserve", capImpact: false, dealer: "Kumar Distribution" },
  { date: "2026-02-19", source: "Order", referenceId: "ORD-989950", amount: 9900, walletType: "Main", capImpact: true, dealer: "Sunrise Agro" },
  { date: "2026-02-18", source: "Referral", referenceId: "REF-883005", amount: 2100, walletType: "Referral", capImpact: false, dealer: "Arjun Traders" },
  { date: "2026-02-18", source: "Order", referenceId: "ORD-989901", amount: 17300, walletType: "Main", capImpact: true, dealer: "Priya Agencies" },
  { date: "2026-02-17", source: "Distribution", referenceId: "DST-228820", amount: 7600, walletType: "Reserve", capImpact: false, dealer: "Rural Connect" },
];

const currency = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function EarningsReport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dealer, setDealer] = useState("all");

  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");
  const [appliedDealer, setAppliedDealer] = useState("all");

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const ts = new Date(row.date).getTime();
      const matchesFrom = !appliedFromDate || ts >= new Date(appliedFromDate).getTime();
      const matchesTo = !appliedToDate || ts <= new Date(appliedToDate).getTime();
      const matchesDealer = appliedDealer === "all" || row.dealer === appliedDealer;
      return matchesFrom && matchesTo && matchesDealer;
    });
  }, [appliedDealer, appliedFromDate, appliedToDate]);

  const totalEarnings = filtered.reduce((sum, row) => sum + row.amount, 0);
  const capUsed = filtered.filter((r) => r.capImpact).reduce((sum, row) => sum + row.amount, 0);
  const remainingCap = Math.max(CAP_LIMIT - capUsed, 0);

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
        <ReportPageHeader title="Earnings Report" districtName={DISTRICT_NAME} onExport={() => undefined} />

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
            { label: "Total Earnings", value: currency(totalEarnings), hint: "Filtered period" },
            { label: "Cap Used", value: currency(capUsed), hint: "Cap-impact entries", tone: "warning" },
            { label: "Remaining Cap", value: currency(remainingCap), hint: `Limit ${currency(CAP_LIMIT)}`, tone: remainingCap < CAP_LIMIT * 0.2 ? "danger" : "success" },
            { label: "Wallet Entries", value: filtered.length, hint: "Immutable rows" },
          ]}
        />

        <ReportDataTable
          emptyMessage="No earnings entries found for the selected filter view."
          data={filtered}
          columns={[
            { key: "date", header: "Date", sortable: true, className: "font-mono text-xs", sortAccessor: (row) => row.date, render: (row) => row.date },
            { key: "source", header: "Source", sortable: true, sortAccessor: (row) => row.source, render: (row) => row.source },
            { key: "ref", header: "Reference ID", sortable: true, className: "font-mono text-xs", sortAccessor: (row) => row.referenceId, render: (row) => row.referenceId },
            { key: "amount", header: "Amount", sortable: true, className: "font-mono", sortAccessor: (row) => row.amount, render: (row) => currency(row.amount) },
            { key: "wallet", header: "Wallet Type", sortable: true, sortAccessor: (row) => row.walletType, render: (row) => row.walletType },
            {
              key: "capImpact",
              header: "Cap Impact",
              sortable: true,
              sortAccessor: (row) => Number(row.capImpact),
              render: (row) => (
                <Badge variant="outline" className={row.capImpact ? "border-amber-500/40 text-amber-600" : "border-emerald-500/40 text-emerald-600"}>
                  {row.capImpact ? "Yes" : "No"}
                </Badge>
              ),
            },
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
