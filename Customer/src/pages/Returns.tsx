import { useState } from "react";
import { RotateCcw, CheckCircle, Circle, XCircle, ArrowLeft, Upload, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { orders, formatINR } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const mockReturns = [
  { id: "ret_001", orderNumber: "FTS-284650", item: "Organic Neem Oil Pesticide (1L)", type: "Refund", status: "approved" as const, date: "2024-03-14", amount: 320 },
  { id: "ret_002", orderNumber: "FTS-284500", item: "NPK 19:19:19 Fertilizer (25kg)", type: "Replace", status: "pending" as const, date: "2024-03-18", amount: 890 },
];

const statusMap = {
  pending: { class: "status-pending", label: "Pending" },
  approved: { class: "status-success", label: "Approved" },
  rejected: { class: "status-destructive", label: "Rejected" },
};

export default function Returns() {
  const [tab, setTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);

  const filtered = mockReturns.filter(r => tab === "all" || r.status === tab);

  if (showForm) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        <button onClick={() => { setShowForm(false); setStep(1); }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-default">
          <ArrowLeft className="h-4 w-4" /> Back to Returns
        </button>
        <h1 className="text-xl font-bold">Raise Return</h1>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className={cn("flex-1 h-1.5 rounded-full", step >= s ? "bg-primary" : "bg-muted")} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Select Items</h2>
            {orders[1].items.map((item, i) => (
              <label key={i} className="card-base p-4 flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="rounded" defaultChecked />
                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                  <img src={item.product.thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-medium">{item.product.name}</span>
              </label>
            ))}
            <Button className="rounded-lg" onClick={() => setStep(2)}>Continue</Button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Reason & Details</h2>
            <select className="w-full border rounded-lg p-3 bg-card text-sm">
              <option>Damaged Product</option><option>Wrong Item</option><option>Not as Described</option><option>Changed Mind</option><option>Missing Parts</option>
            </select>
            <textarea className="w-full border rounded-lg p-3 bg-card text-sm min-h-[100px]" placeholder="Additional notes..." />
            <div className="card-base p-4 border-dashed flex flex-col items-center gap-2 cursor-pointer">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Upload photos (optional)</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-lg" onClick={() => setStep(1)}>Back</Button>
              <Button className="rounded-lg" onClick={() => setStep(3)}>Continue</Button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Review & Submit</h2>
            <div className="card-base p-4 space-y-2 text-sm">
              <p><span className="text-muted-foreground">Type:</span> Refund</p>
              <p><span className="text-muted-foreground">Reason:</span> Damaged Product</p>
              <p><span className="text-muted-foreground">Expected Refund:</span> <span className="font-mono text-profit font-semibold">{formatINR(12500)}</span></p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-lg" onClick={() => setStep(2)}>Back</Button>
              <Button className="rounded-lg" onClick={() => { toast.success("Return request submitted"); setShowForm(false); setStep(1); }}>Submit Return</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Returns</h1>
        <Button className="rounded-lg" onClick={() => setShowForm(true)}>Raise Return</Button>
      </div>

      <div className="flex gap-2 mb-6">
        {["all", "pending", "approved", "rejected"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-4 py-2 rounded-full text-sm font-medium transition-default capitalize", tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(ret => (
          <div key={ret.id} className="card-base p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-medium">{ret.orderNumber}</span>
                <span className={statusMap[ret.status].class}>{statusMap[ret.status].label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{ret.item}</p>
              <p className="text-xs text-muted-foreground mt-1">Type: {ret.type} · {ret.date}</p>
            </div>
            <span className="font-mono font-semibold">{formatINR(ret.amount)}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <RotateCcw className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="font-medium">No returns found</p>
          </div>
        )}
      </div>
    </div>
  );
}
