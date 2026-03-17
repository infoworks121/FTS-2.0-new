import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { navItems } from "@/pages/CoreBodyDashboard";
import { CheckCircle2, Clock3, Dot, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CurrentStatus = "Active" | "Inactive";
type EligibilityStatus = "Eligible" | "Not Eligible" | "Under Review";
type RequirementState = "completed" | "pending" | "inReview";
type UpgradeType = "Automatic" | "Admin Approved";

type RequirementItem = {
  name: string;
  requiredValue: string;
  currentValue: string;
  status: RequirementState;
};

type UpgradeHistoryItem = {
  previousRole: "Core Body A" | "Core Body B" | "—";
  newRole: "Core Body A" | "Core Body B";
  upgradeType: UpgradeType;
  date: string;
  remarks: string;
};

type UpgradeSection = "current-role" | "eligibility" | "requirements" | "history";

const DISTRICT_NAME = "District North";
const ITEMS_PER_PAGE = 4;

const currentRoleDetails = {
  currentRole: "Core Body A" as const,
  districtName: DISTRICT_NAME,
  investmentAmount: "₹8,50,000",
  annualEarningCap: "₹30,00,000",
  monthlyEarningCap: "₹2,50,000",
  activationDate: "15 Jan 2024",
  currentStatus: "Active" as CurrentStatus,
};

const eligibilityDetails = {
  status: "Not Eligible" as EligibilityStatus,
  explanation: "Not eligible due to incomplete requirement checklist.",
  lastEvaluationDate: "22 Feb 2026, 10:40 AM",
};

const requirementsChecklist: RequirementItem[] = [
  { name: "Minimum investment requirement", requiredValue: "₹10,00,000", currentValue: "₹8,50,000", status: "pending" },
  { name: "Minimum active dealers/businessmen", requiredValue: "15 dealers / 50 businessmen", currentValue: "12 dealers / 45 businessmen", status: "pending" },
  { name: "Consistent activity record", requiredValue: "6 months continuous", currentValue: "6 months continuous", status: "completed" },
  { name: "No fraud or policy violations", requiredValue: "No open violations", currentValue: "No violations", status: "completed" },
  { name: "Earning cap compliance", requiredValue: "No cap breach in 3 months", currentValue: "Under current cycle review", status: "inReview" },
];

const upgradeHistory: UpgradeHistoryItem[] = [
  {
    previousRole: "Core Body B",
    newRole: "Core Body A",
    upgradeType: "Automatic",
    date: "15 Jan 2024",
    remarks: "Upgraded after system compliance evaluation.",
  },
  {
    previousRole: "—",
    newRole: "Core Body B",
    upgradeType: "Admin Approved",
    date: "10 Sep 2023",
    remarks: "Initial district activation.",
  },
  {
    previousRole: "Core Body B",
    newRole: "Core Body B",
    upgradeType: "Automatic",
    date: "01 Apr 2023",
    remarks: "No role change. Eligibility reevaluated.",
  },
  {
    previousRole: "Core Body B",
    newRole: "Core Body B",
    upgradeType: "Automatic",
    date: "01 Jan 2023",
    remarks: "No role change. Requirement carry-forward logged.",
  },
  {
    previousRole: "Core Body B",
    newRole: "Core Body B",
    upgradeType: "Automatic",
    date: "01 Oct 2022",
    remarks: "Compliance maintained, no upgrade triggered.",
  },
];

const sectionOptions: { key: UpgradeSection; label: string }[] = [
  { key: "current-role", label: "Current Role Details" },
  { key: "eligibility", label: "Upgrade Eligibility" },
  { key: "requirements", label: "Requirements Checklist" },
  { key: "history", label: "Upgrade History" },
];

const roleStatusClass: Record<CurrentStatus, string> = {
  Active: "border-slate-300 text-slate-700",
  Inactive: "border-slate-300 text-slate-500",
};

const eligibilityStatusClass: Record<EligibilityStatus, string> = {
  Eligible: "border-emerald-500/40 bg-emerald-500/5 text-emerald-700",
  "Not Eligible": "border-amber-500/40 bg-amber-500/5 text-amber-700",
  "Under Review": "border-slate-400/40 bg-slate-500/5 text-slate-700",
};

const requirementStatusBadge: Record<RequirementState, string> = {
  completed: "border-emerald-500/40 text-emerald-700",
  pending: "border-amber-500/40 text-amber-700",
  inReview: "border-slate-400/40 text-slate-700",
};

const getRequirementSymbol = (status: RequirementState) => {
  if (status === "completed") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />;
  }
  if (status === "pending") {
    return <XCircle className="h-4 w-4 text-amber-600" aria-hidden="true" />;
  }
  return <Clock3 className="h-4 w-4 text-slate-500" aria-hidden="true" />;
};

const getRequirementLabel = (status: RequirementState) => {
  if (status === "completed") return "✔ Completed";
  if (status === "pending") return "✖ Pending";
  return "⏳ Under Review";
};

export default function UpgradeStatus() {
  const [activeSection, setActiveSection] = useState<UpgradeSection>("current-role");
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(upgradeHistory.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const historyRows = useMemo(
    () => upgradeHistory.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE),
    [safePage]
  );

  const scrollToSection = (section: UpgradeSection) => {
    setActiveSection(section);
    const el = document.getElementById(section);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel={`Core Body — ${DISTRICT_NAME}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Upgrade Status</h1>
          <p className="text-sm text-muted-foreground">
            District-scoped, system-generated upgrade visibility. All fields are read-only and audit-safe.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {sectionOptions.map((option) => (
                <Button
                  key={option.key}
                  variant={activeSection === option.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => scrollToSection(option.key)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <section id="current-role" className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">Current Role Details</h2>
            <p className="text-xs text-muted-foreground">Present authority level and district configuration.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Current Role</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Badge variant="outline" className="w-fit border-slate-400 text-slate-800">
                  {currentRoleDetails.currentRole}
                </Badge>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Dot className="h-4 w-4" />
                  System-assigned role badge
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">District Name</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{currentRoleDetails.districtName}</p>
                <p className="text-xs text-muted-foreground mt-1">District-scoped data context</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className={roleStatusClass[currentRoleDetails.currentStatus]}>
                  {currentRoleDetails.currentStatus}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">Operational state. Manual edit disabled.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Investment Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-lg font-semibold">{currentRoleDetails.investmentAmount}</p>
                <p className="text-xs text-muted-foreground mt-1">System ledger value</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Earning Cap</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Annual</span>
                  <span className="font-mono">{currentRoleDetails.annualEarningCap}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monthly</span>
                  <span className="font-mono">{currentRoleDetails.monthlyEarningCap}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Activation Date</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{currentRoleDetails.activationDate}</p>
                <p className="text-xs text-muted-foreground mt-1">Recorded by system activation log</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="eligibility" className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">Upgrade Eligibility</h2>
            <p className="text-xs text-muted-foreground">Automated decision state for next role eligibility.</p>
          </div>

          <Card className={eligibilityStatusClass[eligibilityDetails.status]}>
            <CardContent className="pt-6 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Eligibility Status</p>
                <Badge variant="outline" className={eligibilityStatusClass[eligibilityDetails.status]}>
                  {eligibilityDetails.status}
                </Badge>
              </div>
              <p className="text-lg font-semibold">{eligibilityDetails.status}</p>
              <p className="text-sm">{eligibilityDetails.explanation}</p>
              <p className="text-xs text-muted-foreground">Last evaluation date: {eligibilityDetails.lastEvaluationDate}</p>
            </CardContent>
          </Card>
        </section>

        <section id="requirements" className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">Requirements Checklist</h2>
            <p className="text-xs text-muted-foreground">
              Auto-calculated compliance checklist. No manual updates are available.
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requirement</TableHead>
                      <TableHead>Required Value</TableHead>
                      <TableHead>Current Value</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requirementsChecklist.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="font-mono">{item.requiredValue}</TableCell>
                        <TableCell className="font-mono">{item.currentValue}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRequirementSymbol(item.status)}
                            <Badge variant="outline" className={requirementStatusBadge[item.status]}>
                              {getRequirementLabel(item.status)}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="history" className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">Upgrade History</h2>
            <p className="text-xs text-muted-foreground">Permanent, read-only role upgrade log for district audit traceability.</p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Previous Role</TableHead>
                      <TableHead>New Role</TableHead>
                      <TableHead>Upgrade Type</TableHead>
                      <TableHead>Upgrade Date</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyRows.map((entry, idx) => (
                      <TableRow key={`${entry.date}-${entry.newRole}-${idx}`}>
                        <TableCell>{entry.previousRole}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-slate-300 text-slate-800">
                            {entry.newRole}
                          </Badge>
                        </TableCell>
                        <TableCell>{entry.upgradeType}</TableCell>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell className="text-muted-foreground">{entry.remarks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Showing {historyRows.length} of {upgradeHistory.length} records
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Page {safePage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
