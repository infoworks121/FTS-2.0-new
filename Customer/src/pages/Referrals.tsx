import { Copy, Share2, Users, IndianRupee, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currentUser, referrals, formatINR } from "@/lib/mockData";
import { toast } from "sonner";

const earningsHistory = [
  { user: "User ***123", date: "2024-03-10", amount: 500, status: "released" as const, holdUntil: "" },
  { user: "User ***456", date: "2024-02-28", amount: 350, status: "released" as const, holdUntil: "" },
  { user: "User ***789", date: "2024-03-18", amount: 200, status: "pending" as const, holdUntil: "2024-04-18" },
  { user: "User ***012", date: "2024-01-20", amount: 150, status: "released" as const, holdUntil: "" },
];

const statusMap = {
  pending: { class: "status-warning", label: "Pending" },
  released: { class: "status-success", label: "Released" },
  reversed: { class: "status-destructive", label: "Reversed" },
};

export default function Referrals() {
  const totalEarned = referrals.reduce((s, r) => s + r.earned, 0);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">Referrals</h1>

      {/* Hero card */}
      <div className="card-base p-6 border-primary/20 bg-primary/5 text-center">
        <p className="text-sm text-muted-foreground mb-2">Your Referral Code</p>
        <div className="inline-flex items-center gap-3 mb-4">
          <code className="font-mono text-3xl font-bold text-primary tracking-wider">{currentUser.referralCode}</code>
        </div>
        <div className="flex justify-center gap-3">
          <Button className="rounded-lg" onClick={() => { navigator.clipboard.writeText(currentUser.referralCode); toast.success("Code copied!"); }}>
            <Copy className="h-4 w-4 mr-1" /> Copy
          </Button>
          <Button variant="outline" className="rounded-lg">
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Referrals", value: String(referrals.length), icon: Users, color: "text-primary" },
          { label: "Total Earned", value: formatINR(totalEarned), icon: IndianRupee, color: "text-profit" },
          { label: "Pending", value: formatINR(200), icon: Clock, color: "text-warning" },
          { label: "Paid Out", value: formatINR(totalEarned - 200), icon: CheckCircle, color: "text-profit" },
        ].map(stat => (
          <div key={stat.label} className="card-base p-4 text-center">
            <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
            <p className="text-lg font-bold font-mono">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="card-base p-5">
        <h2 className="font-semibold mb-4">How It Works</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: 1, title: "Share Code", desc: "Share your unique referral code" },
            { num: 2, title: "Friend Joins", desc: "They sign up using your code" },
            { num: 3, title: "Friend Orders", desc: "They place their first order" },
            { num: 4, title: "You Earn", desc: "Get commission on their orders" },
          ].map(step => (
            <div key={step.num} className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mx-auto mb-2">{step.num}</div>
              <p className="font-medium text-sm">{step.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings table */}
      <div className="card-base p-5">
        <h2 className="font-semibold mb-4">Earnings History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted-foreground border-b">
              <th className="pb-2 font-medium">User</th><th className="pb-2 font-medium">Date</th><th className="pb-2 font-medium">Amount</th><th className="pb-2 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {earningsHistory.map((e, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-3">{e.user}</td>
                  <td className="py-3 text-muted-foreground">{e.date}</td>
                  <td className="py-3 font-mono font-medium">{formatINR(e.amount)}</td>
                  <td className="py-3"><span className={statusMap[e.status].class}>{statusMap[e.status].label}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* My Network */}
      <div className="card-base p-5">
        <h2 className="font-semibold mb-4">My Network</h2>
        <div className="space-y-3">
          {referrals.map(ref => (
            <div key={ref.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-default">
              <div>
                <p className="text-sm font-medium">{ref.maskedName}</p>
                <p className="text-xs text-muted-foreground">Joined {ref.joinedDate} · {ref.ordersPlaced} orders</p>
              </div>
              <span className="font-mono text-sm text-profit font-medium">+{formatINR(ref.earned)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
