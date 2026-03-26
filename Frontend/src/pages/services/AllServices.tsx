import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { serviceApi } from "@/lib/serviceApi";

export default function AllServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await serviceApi.getAll();
      setServices(data.services || []);
    } catch {
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Catalog</h1>
          <p className="text-muted-foreground mt-1">
            Manage your available services, pricing, and booking modes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/admin/services/new")}
          >
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Services List Card */}
      <Card>
        <CardHeader>
          <CardTitle>All Services</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Tag className="h-12 w-12 mb-4 opacity-20" />
              <p>No services found in catalog.</p>
              <Button variant="link" onClick={() => navigate("/admin/services/new")}>
                Create your first service
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="p-3 font-medium rounded-tl-md">Name / SKU</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Delivery</th>
                    <th className="p-3 font-medium">Duration</th>
                    <th className="p-3 font-medium text-right">Selling Price</th>
                    <th className="p-3 font-medium text-center rounded-tr-md">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-muted/50">
                      <td className="p-3">
                        <div className="font-medium">{service.name}</div>
                        <div className="text-xs text-muted-foreground">{service.sku}</div>
                      </td>
                      <td className="p-3 capitalize">{service.service_type || '-'}</td>
                      <td className="p-3 capitalize">{service.delivery_mode || '-'}</td>
                      <td className="p-3">{service.duration_minutes ? `${service.duration_minutes} min` : '-'}</td>
                      <td className="p-3 text-right font-medium">₹{service.selling_price}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
