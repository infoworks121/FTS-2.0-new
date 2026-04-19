import { FileText } from "lucide-react";

export default function DealerTransactionHistory() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transaction History</h1>
      <p className="text-muted-foreground">Full ledger of your earnings, withdrawals, and balance updates.</p>
      <div className="p-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground">
         <FileText className="h-12 w-12 mb-4 opacity-20" />
         <p>Transaction records coming soon...</p>
      </div>
    </div>
  );
}
