import { Clock } from "lucide-react";

export default function DealerFulfillmentHistory() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fulfillment History</h1>
      <p className="text-muted-foreground">Complete record of your past B2B order fulfillments.</p>
      <div className="p-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground">
         <Clock className="h-12 w-12 mb-4 opacity-20" />
         <p>Order History coming soon...</p>
      </div>
    </div>
  );
}
