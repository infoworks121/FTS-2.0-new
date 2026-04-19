import { Wallet } from "lucide-react";

export default function DealerWallet() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Earnings</h1>
      <p className="text-muted-foreground">Track your fulfillment commissions and wallet balance.</p>
      <div className="p-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground">
         <Wallet className="h-12 w-12 mb-4 opacity-20" />
         <p>Wallet & Earnings coming soon...</p>
      </div>
    </div>
  );
}
