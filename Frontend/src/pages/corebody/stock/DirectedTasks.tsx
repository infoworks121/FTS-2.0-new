import React, { useState, useEffect } from "react";
import { 
  Truck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Package,
  MapPin,
  Clock,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/lib/api";

export default function DirectedTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await api.get('/stock/allocation/directed-requests');
      setTasks(response.data.requests || []);
    } catch (error) {
      toast.error("Failed to load directed tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async (taskId: string) => {
    try {
      // In a real app, we might need a formal dispatch endpoint for these
      // For now, we reuse createPhysicalTransfer logic or a status update
      await api.put(`/stock/allocation/receive/${taskId}`, { status: 'dispatched' });
      toast.success("Stock dispatched to local dealer!");
      loadTasks();
    } catch (error) {
       // If the receiver endpoint is only for 'receive', let's assume update status exists
       try {
          await api.patch(`/stock/allocation/${taskId}/status`, { status: 'dispatched' });
          toast.success("Stock dispatched!");
          loadTasks();
       } catch (err) {
          toast.error("Failed to dispatch stock");
       }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Directed Tasks</h1>
        <p className="text-muted-foreground">
          Stock replenishment requests directed to you by the Central Administration.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center animate-pulse">Checking for tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="p-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mb-4 opacity-20" />
          <p>You have no pending directed tasks from Admin.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <Card key={task.id} className="border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 bg-blue-50/30">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">
                    ADMIN REQUEST
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    {new Date(task.created_at).toLocaleDateString()}
                  </Badge>
                </div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  {task.product_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Quantity to Send:</span>
                  <span className="text-lg font-bold text-orange-600">{task.quantity} Bosta</span>
                </div>
                
                <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-100">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">{task.dealer_name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{task.subdivision_id}</p>
                    </div>
                  </div>
                </div>

                {task.note && (
                  <div className="flex items-start gap-2 p-2 bg-orange-50 rounded text-[11px] text-orange-800">
                    <Info className="h-3 w-3 mt-0.5" />
                    <p><b>Admin Note:</b> {task.note}</p>
                  </div>
                )}

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  onClick={() => handleDispatch(task.id)}
                >
                  Dispatch Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
