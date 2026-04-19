import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllDealersContent } from "./AllDealers";
import { AllBusinessmenContent } from "./AllBusinessmen";
import { AllCoreBodiesContent } from "./AllCoreBodiesContent";
import coreBodyApi from "@/lib/coreBodyApi";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const DISTRICT_NAME = "District North";

export default function CoreBodyAllUsers() {
  const [activeTab, setActiveTab] = useState("corebody");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ coreBodies: any[]; dealers: any[]; businessmen: any[] }>({
    coreBodies: [],
    dealers: [],
    businessmen: [],
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await coreBodyApi.getDirectoryUsers();
        setData({
          coreBodies: response.coreBodies || [],
          dealers: response.dealers || [],
          businessmen: response.businessmen || [],
        });
      } catch (error: any) {
        console.error("Error fetching directory users:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load directory data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight">User Directory</h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive overview of all participants in your district.
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            Syncing with database...
          </div>
        )}
      </div>

      <Tabs defaultValue="corebody" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="corebody">Core Body</TabsTrigger>
          <TabsTrigger value="dealers">Dealers</TabsTrigger>
          <TabsTrigger value="businessmen">Businessmen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="corebody" className="mt-6 border-none p-0 outline-none">
           {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-lg border border-dashed">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Loading member registry...</p>
              </div>
           ) : (
              <AllCoreBodiesContent data={data.coreBodies} />
           )}
        </TabsContent>

        <TabsContent value="dealers" className="mt-6 border-none p-0 outline-none">
           {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-lg border border-dashed">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Loading dealer registry...</p>
              </div>
           ) : (
              <AllDealersContent data={data.dealers} />
           )}
        </TabsContent>
        
        <TabsContent value="businessmen" className="mt-6 border-none p-0 outline-none">
           {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-lg border border-dashed">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Loading businessman registry...</p>
              </div>
           ) : (
              <AllBusinessmenContent data={data.businessmen} />
           )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
