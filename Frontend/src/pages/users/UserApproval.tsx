import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { api } from "@/lib/api";

export default function UserApprovalPage() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPendingUsers = async () => {
    try {
      const response = await api.get("/admin/pending-users");
      setPendingUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      toast({ title: "Error", description: "Failed to fetch pending users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await api.post(`/admin/approve-user/${userId}`);
      toast({ title: "Success", description: "User approved successfully" });
      fetchPendingUsers();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to approve user", variant: "destructive" });
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await api.delete(`/admin/reject-user/${userId}`);
      toast({ title: "Success", description: "User rejected and removed" });
      fetchPendingUsers();
    } catch (error: any) {
      console.error("Reject error:", error);
      toast({ title: "Error", description: error.response?.data?.message || "Failed to reject user", variant: "destructive" });
    }
  };

  const coreBodyUsers = pendingUsers.filter((u: any) => 
    ["core_body_a", "core_body_b", "dealer"].includes(u.role_code)
  );
  const businessmanUsers = pendingUsers.filter((u: any) => u.role_code === "businessman");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">User Approval</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Core Body / Dealer Approvals ({coreBodyUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : coreBodyUsers.length === 0 ? (
            <p className="text-slate-500">No pending Core Body/Dealer users</p>
          ) : (
            <div className="space-y-4">
              {coreBodyUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{user.full_name}</p>
                    <p className="text-sm text-slate-600">{user.email} | {user.phone}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge>{user.role_code}</Badge>
                      {user.district_name && <Badge variant="outline">{user.district_name}</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(user.id)}>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(user.id)}>
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Businessman Approvals ({businessmanUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : businessmanUsers.length === 0 ? (
            <p className="text-slate-500">No pending Businessman users</p>
          ) : (
            <div className="space-y-4">
              {businessmanUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{user.full_name}</p>
                    <p className="text-sm text-slate-600">{user.email} | {user.phone}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge>{user.role_code}</Badge>
                      {user.businessman_type && <Badge variant="outline">{user.businessman_type}</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(user.id)}>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(user.id)}>
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
