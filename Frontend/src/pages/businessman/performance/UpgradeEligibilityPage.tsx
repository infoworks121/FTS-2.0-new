import { ArrowUpCircle, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ReadOnlyPerformanceNotice,
  RequirementProgressRow,
  RequirementStateBadge,
  eligibilityRequirements,
} from "@/components/businessman/PerformancePrimitives";

export default function UpgradeEligibilityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Upgrade Eligibility</h1>
        <p className="text-sm text-muted-foreground">
          Eligibility visibility for role progression. Decision authority remains with Admin and Core Body.
        </p>
      </div>

      <ReadOnlyPerformanceNotice />

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Eligibility Status</p>
            <p className="text-sm font-semibold inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-amber-500" /> Not Eligible Yet
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current Role</p>
            <p className="text-sm font-semibold">Businessman</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Possible Upgrade Path</p>
            <p className="text-sm font-semibold inline-flex items-center gap-1.5">
              <ArrowUpCircle className="h-4 w-4 text-primary" /> Senior Businessman
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Requirement Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {eligibilityRequirements.map((req) => (
            <div key={req.id} className="rounded-md border p-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{req.label}</p>
                <p className="text-xs text-muted-foreground">
                  Current: {req.current} • Target: {req.target}
                </p>
              </div>
              <RequirementStateBadge state={req.state} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Progress & Missing Signals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {eligibilityRequirements.map((req) => (
            <RequirementProgressRow
              key={req.id}
              label={req.label}
              current={req.current}
              target={req.target}
              progress={req.progress}
              state={req.state}
              hint={req.missingHint}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

