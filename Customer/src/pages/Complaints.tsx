import { useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const mockComplaints = [
  { id: "CMP-001", orderNumber: "FTS-284650", category: "Product Quality", status: "open" as const, date: "2024-03-20", description: "Product received was damaged." },
  { id: "CMP-002", orderNumber: "FTS-284500", category: "Delivery", status: "resolved" as const, date: "2024-03-10", description: "Late delivery by 3 days." },
  { id: "CMP-003", orderNumber: "FTS-284400", category: "Wrong Item", status: "in-progress" as const, date: "2024-03-15", description: "Received wrong product variant." },
];

const statusMap = {
  "open": { class: "status-warning", label: "Open" },
  "in-progress": { class: "status-primary", label: "In Progress" },
  "resolved": { class: "status-success", label: "Resolved" },
};

export default function Complaints() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Complaints</h1>
        <Button className="rounded-lg" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Raise Complaint
        </Button>
      </div>

      {showForm && (
        <div className="card-base p-5 mb-6 space-y-4 animate-fade-in">
          <h2 className="font-semibold">New Complaint</h2>
          <select className="w-full border rounded-lg p-3 bg-card text-sm">
            <option value="">Link to order...</option>
            <option>FTS-284910</option><option>FTS-284832</option><option>FTS-284750</option>
          </select>
          <select className="w-full border rounded-lg p-3 bg-card text-sm">
            <option value="">Category...</option>
            <option>Delivery</option><option>Product Quality</option><option>Payment</option><option>Wrong Item</option><option>Support</option><option>Other</option>
          </select>
          <textarea className="w-full border rounded-lg p-3 bg-card text-sm min-h-[100px]" placeholder="Describe your issue (min 20 characters)..." />
          <Button className="rounded-lg" onClick={() => { setShowForm(false); toast.success("Complaint submitted"); }}>Submit Complaint</Button>
        </div>
      )}

      <div className="space-y-3">
        {mockComplaints.map(c => (
          <div key={c.id} className="card-base p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-medium">{c.id}</span>
                  <span className={statusMap[c.status].class}>{statusMap[c.status].label}</span>
                </div>
                <p className="text-sm">{c.description}</p>
                <p className="text-xs text-muted-foreground mt-1">Order: {c.orderNumber} · {c.category} · {c.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
