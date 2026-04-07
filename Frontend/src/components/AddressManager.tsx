import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Trash2, Home, Building2, Briefcase, Star, Loader2 } from "lucide-react";
import { addressApi, UserAddress } from "@/lib/addressApi";
import { MapAddressPicker } from "./MapAddressPicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export function AddressManager() {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    label: "",
    street_address: "",
    city: "",
    state: "",
    pincode: "",
    is_default: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressApi.getAddresses();
      setAddresses(data);
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      toast({ title: "Error", description: "Failed to load addresses", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addressApi.addAddress(formData);
      toast({ title: "Success", description: "Address added successfully" });
      setIsDialogOpen(false);
      setFormData({ label: "", street_address: "", city: "", state: "", pincode: "", is_default: false });
      fetchAddresses();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add address", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await addressApi.deleteAddress(id);
      toast({ title: "Deleted", description: "Address removed" });
      fetchAddresses();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete address", variant: "destructive" });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressApi.setDefault(id);
      toast({ title: "Success", description: "Default address updated" });
      fetchAddresses();
    } catch (error) {
      toast({ title: "Error", description: "Failed to set default address", variant: "destructive" });
    }
  };

  const getIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("home")) return <Home className="h-4 w-4" />;
    if (l.includes("office") || l.includes("work")) return <Briefcase className="h-4 w-4" />;
    if (l.includes("warehouse") || l.includes("shop")) return <Building2 className="h-4 w-4" />;
    return <MapPin className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Delivery Addresses
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Delivery Address</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Left Side: Map Picker */}
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  Visual Selector
                </Label>
                <div className="rounded-xl overflow-hidden border shadow-sm">
                  <MapAddressPicker 
                    onAddressSelect={(data) => {
                      setFormData(prev => ({
                        ...prev,
                        street_address: data.street,
                        city: data.city,
                        state: data.state,
                        pincode: data.pincode
                      }));
                      toast({ title: "Address Fetched", description: "Location details updated from map." });
                    }}
                  />
                </div>
              </div>

              {/* Right Side: Form Fields */}
              <form onSubmit={handleAddAddress} className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Address Details</Label>
                <div className="space-y-4 p-1">
                  <div className="space-y-2">
                    <Label htmlFor="label">Address Label (e.g. Home, Warehouse)</Label>
                    <Input
                      id="label"
                      placeholder="Main Office"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      placeholder="123, Business Park, Sector 5"
                      value={formData.street_address}
                      onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="Kolkata"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="West Bengal"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        placeholder="700001"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                       <input 
                        type="checkbox" 
                        id="is_default" 
                        checked={formData.is_default} 
                        onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                       />
                       <Label htmlFor="is_default" className="text-sm cursor-pointer font-medium">Set as Default</Label>
                    </div>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-base font-semibold transition-all">
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Save Address
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : addresses.length === 0 ? (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 opacity-60">
            <MapPin className="h-10 w-10 mb-2" />
            <p className="text-sm">No delivery addresses saved yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <Card key={addr.id} className={`relative transition-all ${addr.is_default ? "border-primary/50 shadow-sm" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-full ${addr.is_default ? "bg-primary/10 text-primary" : "bg-muted"}`}>
                      {getIcon(addr.label)}
                    </div>
                    <span className="font-semibold text-sm">{addr.label}</span>
                    {addr.is_default && (
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-primary/5 text-primary border-primary/20">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {!addr.is_default && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSetDefault(addr.id)} title="Set as default">
                        <Star className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(addr.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm space-y-0.5 text-muted-foreground mt-1">
                  <p className="text-foreground">{addr.street_address}</p>
                  <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
