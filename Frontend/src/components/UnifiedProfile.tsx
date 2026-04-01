import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, Settings, DollarSign, TrendingUp, AlertTriangle, 
  Calendar, CheckCircle, Clock, Building2, CreditCard, Target,
  MapPin, Users, BarChart3, Package, Lock, ShieldCheck, ChevronRight
} from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import walletApi from "@/lib/walletApi";

export default function UnifiedProfile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [pinValue, setPinValue] = useState("");
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchDashboard();
  }, []);

  const fetchProfile = async () => {
    try {
      // Always try to load from localStorage first (registration data)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log('Loading profile from localStorage:', userData);
        const profileFromStorage = {
          id: userData.id || 1,
          full_name: userData.full_name || userData.name || userData.fullName,
          email: userData.email,
          phone: userData.phone,
          role_code: userData.role_code || userData.role,
          district_name: userData.district_name || userData.district,
          district_id: userData.district_id,
          is_active: userData.is_active !== false,
          created_at: userData.created_at || new Date().toISOString(),
          updated_at: userData.updated_at || new Date().toISOString(),
          investment_amount: userData.investment_amount || userData.investmentAmount || 0,
          installment_count: userData.installment_count || userData.installmentCount || 1,
          business_name: userData.business_name || userData.businessName,
          business_address: userData.business_address || userData.businessAddress,
          gst_number: userData.gst_number || userData.gstNumber,
          pan_number: userData.pan_number || userData.panNumber,
          bank_account: userData.bank_account || userData.bankAccount,
          ifsc_code: userData.ifsc_code || userData.ifscCode,
          monthly_target: userData.monthly_target || userData.monthlyTarget,
          shop_name: userData.shop_name || userData.shopName,
          shop_address: userData.shop_address || userData.shopAddress,
          shop_type: userData.shop_type || userData.shopType,
          warehouse_address: userData.warehouse_address || userData.warehouseAddress,
          storage_capacity: userData.storage_capacity || userData.storageCapacity
        };
        setProfile(profileFromStorage);
        setFormData(profileFromStorage);
        return;
      }

      // Fallback to API if no localStorage data
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No user data found');
      }

      // Try unified endpoint first, fallback to role-specific
      let response = await fetch('http://localhost:5000/api/profile/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        // Fallback to corebody profile endpoint
        response = await fetch('http://localhost:5000/api/corebody-profile/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setFormData(data.profile);
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Show mock data on error
      const mockProfile = {
        id: 1,
        full_name: "Sample User",
        email: "user@example.com",
        phone: "+1234567890",
        role_code: "core_body_a",
        district_name: "Sample District",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setProfile(mockProfile);
      setFormData(mockProfile);
    }
  };

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Mock dashboard data
        const mockStats = {
          earnings: {
            ytd: 250000,
            mtd: 45000,
            annual_cap: 500000,
            monthly_cap: 50000,
            annual_utilization: 50,
            monthly_utilization: 90,
            cap_hit: false
          },
          investment: {
            total_amount: 50000,
            installments: 2,
            per_installment: 25000
          }
        };
        setStats(mockStats);
        setLoading(false);
        return;
      }

      // Try unified endpoint first, fallback to role-specific
      let response = await fetch('http://localhost:5000/api/profile/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        // Fallback to corebody dashboard endpoint
        response = await fetch('http://localhost:5000/api/corebody-profile/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPin = async () => {
    if (pinValue.length !== 6) {
      toast({ title: "Invalid PIN", description: "PIN must be 6 digits", variant: "destructive" });
      return;
    }
    setIsSubmittingPin(true);
    try {
      await walletApi.setTransactionPin(pinValue);
      toast({ title: "Success", description: "Transaction PIN set successfully" });
      setPinValue("");
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to set PIN", variant: "destructive" });
    } finally {
      setIsSubmittingPin(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({ title: "Success", description: "Profile updated successfully" });
        setEditing(false);
        fetchProfile();
        fetchDashboard();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    }
  };

  const handlePayInstallment = async (installmentNo) => {
    const paymentRef = prompt('Enter payment reference:');
    if (!paymentRef) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/corebody-profile/installment/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          installment_no: installmentNo, 
          payment_ref: paymentRef 
        })
      });

      if (response.ok) {
        toast({ title: "Success", description: "Installment payment recorded" });
        fetchProfile();
      }
    } catch (error) {
      console.error('Error paying installment:', error);
      toast({ title: "Error", description: "Failed to record payment", variant: "destructive" });
    }
  };

  const getRoleDisplayName = (roleCode) => {
    const roleMap = {
      'admin': 'System Administrator',
      'core_body_a': 'Core Body Type A',
      'core_body_b': 'Core Body Type B',
      'dealer': 'Dealer',
      'businessman': 'Businessman',
      'stock_point': 'Stock Point',
      'retailer': 'Retailer'
    };
    return roleMap[roleCode] || roleCode;
  };

  const getRoleColor = (roleCode) => {
    const colorMap = {
      'admin': 'bg-blue-100 text-blue-800',
      'core_body_a': 'bg-green-100 text-green-800',
      'core_body_b': 'bg-purple-100 text-purple-800',
      'dealer': 'bg-orange-100 text-orange-800',
      'businessman': 'bg-indigo-100 text-indigo-800',
      'stock_point': 'bg-yellow-100 text-yellow-800',
      'retailer': 'bg-pink-100 text-pink-800'
    };
    return colorMap[roleCode] || 'bg-gray-100 text-gray-800';
  };

  const renderDashboardStats = () => {
    if (!stats) return null;

    const { role_code } = profile;

    if (['core_body_a', 'core_body_b', 'dealer'].includes(role_code)) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">YTD Earnings</p>
                  <p className="text-2xl font-bold">₹{stats.earnings?.ytd?.toLocaleString() || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              {stats.earnings?.annual_cap && (
                <div className="mt-2">
                  <Progress value={stats.earnings.annual_utilization} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.earnings.annual_utilization}% of annual cap
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">MTD Earnings</p>
                  <p className="text-2xl font-bold">₹{stats.earnings?.mtd?.toLocaleString() || 0}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              {stats.earnings?.monthly_cap && (
                <div className="mt-2">
                  <Progress value={stats.earnings.monthly_utilization} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.earnings.monthly_utilization}% of monthly cap
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Investment</p>
                  <p className="text-2xl font-bold">₹{stats.investment?.total_amount?.toLocaleString() || 0}</p>
                </div>
                <AlertTriangle className={`w-8 h-8 ${stats.earnings?.cap_hit ? 'text-red-600' : 'text-gray-400'}`} />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.investment?.installments || 0} installments
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (role_code === 'businessman') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">YTD Sales</p>
                  <p className="text-2xl font-bold">₹{stats.sales?.ytd?.toLocaleString() || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">MTD Sales</p>
                  <p className="text-2xl font-bold">₹{stats.sales?.mtd?.toLocaleString() || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Commission Earned</p>
                  <p className="text-2xl font-bold">₹{stats.sales?.commission_earned?.toLocaleString() || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Target Achievement</p>
                  <p className="text-2xl font-bold">{stats.sales?.target_achievement || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (role_code === 'retailer') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">YTD Sales</p>
                  <p className="text-2xl font-bold">₹{stats.sales?.ytd?.toLocaleString() || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">MTD Sales</p>
                  <p className="text-2xl font-bold">₹{stats.sales?.mtd?.toLocaleString() || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Commission Earned</p>
                  <p className="text-2xl font-bold">₹{stats.sales?.commission_earned?.toLocaleString() || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Target Achievement</p>
                  <p className="text-2xl font-bold">{stats.sales?.target_achievement || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (role_code === 'admin') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">
                    {Object.values(stats.users || {}).reduce((a, b) => a + b, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold">{stats.pendingApprovals || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Districts</p>
                  <p className="text-2xl font-bold">{stats.activeDistricts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Businessmen</p>
                  <p className="text-2xl font-bold">{stats.users?.businessman || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return null;
  };

  const renderProfileFields = () => {
    if (!profile) return null;

    const { role_code } = profile;
    const fields = [];

    // Common fields for all roles
    fields.push(
      <div key="full_name">
        <Label htmlFor="full_name">Full Name</Label>
        {editing ? (
          <Input
            id="full_name"
            value={formData.full_name || ''}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900">{profile.full_name}</p>
        )}
      </div>,
      <div key="email">
        <Label>Email</Label>
        <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
      </div>,
      <div key="phone">
        <Label htmlFor="phone">Phone</Label>
        {editing ? (
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900">{profile.phone}</p>
        )}
      </div>,
      <div key="district">
        <Label>District</Label>
        <p className="mt-1 text-sm text-gray-900">{profile.district_name}</p>
      </div>,
      <div key="role">
        <Label>Role</Label>
        <p className="mt-1 text-sm text-gray-900">{getRoleDisplayName(profile.role_code)}</p>
      </div>,
      <div key="status">
        <Label>Status</Label>
        <Badge variant={profile.is_active ? "default" : "secondary"}>
          {profile.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>,
      <div key="created_at">
        <Label>Account Created</Label>
        <p className="mt-1 text-sm text-gray-900">
          {new Date(profile.created_at).toLocaleDateString()}
        </p>
      </div>,
      <div key="updated_at">
        <Label>Last Updated</Label>
        <p className="mt-1 text-sm text-gray-900">
          {new Date(profile.updated_at).toLocaleDateString()}
        </p>
      </div>
    );

    // Role-specific fields
    if (['core_body_a', 'core_body_b', 'dealer'].includes(role_code)) {
      fields.push(
        <div key="investment_amount">
          <Label htmlFor="investment_amount">Investment Amount</Label>
          {editing ? (
            <Input
              id="investment_amount"
              type="number"
              value={formData.investment_amount || ''}
              onChange={(e) => setFormData({...formData, investment_amount: parseFloat(e.target.value)})}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">₹{profile.investment_amount?.toLocaleString()}</p>
          )}
        </div>,
        <div key="installment_count">
          <Label htmlFor="installment_count">Installments</Label>
          {editing ? (
            <Input
              id="installment_count"
              type="number"
              min="1"
              max="4"
              value={formData.installment_count || ''}
              onChange={(e) => setFormData({...formData, installment_count: parseInt(e.target.value)})}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profile.installment_count}</p>
          )}
        </div>
      );
    }

    if (role_code === 'businessman') {
      fields.push(
        <div key="business_name">
          <Label htmlFor="business_name">Business Name</Label>
          {editing ? (
            <Input
              id="business_name"
              value={formData.business_name || ''}
              onChange={(e) => setFormData({...formData, business_name: e.target.value})}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profile.business_name}</p>
          )}
        </div>,
        <div key="business_address">
          <Label htmlFor="business_address">Business Address</Label>
          {editing ? (
            <Textarea
              id="business_address"
              value={formData.business_address || ''}
              onChange={(e) => setFormData({...formData, business_address: e.target.value})}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profile.business_address}</p>
          )}
        </div>,
        <div key="gst_number">
          <Label htmlFor="gst_number">GST Number</Label>
          {editing ? (
            <Input
              id="gst_number"
              value={formData.gst_number || ''}
              onChange={(e) => setFormData({...formData, gst_number: e.target.value})}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profile.gst_number}</p>
          )}
        </div>,
        <div key="pan_number">
          <Label htmlFor="pan_number">PAN Number</Label>
          {editing ? (
            <Input
              id="pan_number"
              value={formData.pan_number || ''}
              onChange={(e) => setFormData({...formData, pan_number: e.target.value})}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profile.pan_number}</p>
          )}
        </div>,
        <div key="bank_account">
          <Label htmlFor="bank_account">Bank Account</Label>
          {editing ? (
            <Input
              id="bank_account"
              value={formData.bank_account || ''}
              onChange={(e) => setFormData({...formData, bank_account: e.target.value})}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profile.bank_account}</p>
          )}
        </div>,
        <div key="ifsc_code">
          <Label htmlFor="ifsc_code">IFSC Code</Label>
          {editing ? (
            <Input
              id="ifsc_code"
              value={formData.ifsc_code || ''}
              onChange={(e) => setFormData({...formData, ifsc_code: e.target.value})}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profile.ifsc_code}</p>
          )}
        </div>,
        <div key="monthly_target">
          <Label htmlFor="monthly_target">Monthly Target</Label>
          {editing ? (
            <Input
              id="monthly_target"
              type="number"
              value={formData.monthly_target || ''}
              onChange={(e) => setFormData({...formData, monthly_target: parseFloat(e.target.value)})}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">₹{profile.monthly_target?.toLocaleString()}</p>
          )}
        </div>
      );
    }

    if (role_code === 'retailer') {
      fields.push(
        <div key="shop_name">
          <Label htmlFor="shop_name">Shop Name</Label>
          {editing ? (
            <Input
              id="shop_name"
              value={formData.shop_name || ''}
              onChange={(e) => setFormData({...formData, shop_name: e.target.value})}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profile.shop_name}</p>
          )}
        </div>,
        <div key="shop_address">
          <Label htmlFor="shop_address">Shop Address</Label>
          {editing ? (
            <Textarea
              id="shop_address"
              value={formData.shop_address || ''}
              onChange={(e) => setFormData({...formData, shop_address: e.target.value})}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profile.shop_address}</p>
          )}
        </div>,
        <div key="shop_type">
          <Label htmlFor="shop_type">Shop Type</Label>
          {editing ? (
            <Input
              id="shop_type"
              value={formData.shop_type || ''}
              onChange={(e) => setFormData({...formData, shop_type: e.target.value})}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profile.shop_type}</p>
          )}
        </div>,
        <div key="retailer_gst">
          <Label htmlFor="gst_number">GST Number</Label>
          {editing ? (
            <Input
              id="gst_number"
              value={formData.gst_number || ''}
              onChange={(e) => setFormData({...formData, gst_number: e.target.value})}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profile.gst_number}</p>
          )}
        </div>,
        <div key="retailer_pan">
          <Label htmlFor="pan_number">PAN Number</Label>
          {editing ? (
            <Input
              id="pan_number"
              value={formData.pan_number || ''}
              onChange={(e) => setFormData({...formData, pan_number: e.target.value})}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profile.pan_number}</p>
          )}
        </div>,
        <div key="retailer_bank">
          <Label htmlFor="bank_account">Bank Account</Label>
          {editing ? (
            <Input
              id="bank_account"
              value={formData.bank_account || ''}
              onChange={(e) => setFormData({...formData, bank_account: e.target.value})}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profile.bank_account}</p>
          )}
        </div>,
        <div key="retailer_ifsc">
          <Label htmlFor="ifsc_code">IFSC Code</Label>
          {editing ? (
            <Input
              id="ifsc_code"
              value={formData.ifsc_code || ''}
              onChange={(e) => setFormData({...formData, ifsc_code: e.target.value})}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profile.ifsc_code}</p>
          )}
        </div>
      );
    }

    if (role_code === 'stock_point') {
      fields.push(
        <div key="warehouse_address">
          <Label htmlFor="warehouse_address">Warehouse Address</Label>
          {editing ? (
            <Textarea
              id="warehouse_address"
              value={formData.warehouse_address || ''}
              onChange={(e) => setFormData({...formData, warehouse_address: e.target.value})}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profile.warehouse_address}</p>
          )}
        </div>,
        <div key="storage_capacity">
          <Label htmlFor="storage_capacity">Storage Capacity</Label>
          {editing ? (
            <Input
              id="storage_capacity"
              type="number"
              value={formData.storage_capacity || ''}
              onChange={(e) => setFormData({...formData, storage_capacity: parseFloat(e.target.value)})}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profile.storage_capacity}</p>
          )}
        </div>
      );
    }

    return fields;
  };

  if (loading) {
    return <div className="p-6 text-center py-20">Loading profile...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{getRoleDisplayName(profile?.role_code)} Profile</h1>
        {profile && (
          <Badge className={getRoleColor(profile.role_code)}>
            <User className="w-4 h-4 mr-1" />
            {getRoleDisplayName(profile.role_code)}
          </Badge>
        )}
      </div>

      {/* Dashboard Stats */}
      {renderDashboardStats()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-400" />
                Profile Information
              </CardTitle>
              <Button 
                variant={editing ? "default" : "outline"} 
                size="sm"
                onClick={() => editing ? handleSave() : setEditing(true)}
              >
                {editing ? "Save Changes" : "Edit Profile"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {renderProfileFields()}
              </div>

              {editing && (
                <div className="flex gap-2 pt-6 mt-6 border-t">
                  <Button onClick={handleSave}>Save Profile</Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Installments for Core Body/Dealer */}
          {profile?.installments && profile.installments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  Investment Installments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.installments.map((installment) => (
                    <div key={installment.installment_no} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {installment.status === 'paid' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-orange-600" />
                        )}
                        <div>
                          <p className="font-medium">Installment {installment.installment_no}</p>
                          <p className="text-sm text-gray-600">₹{installment.amount?.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {installment.status === 'paid' ? (
                          <div className="flex flex-col items-end">
                            <Badge variant="outline" className="bg-green-50 text-green-700 h-5">Paid</Badge>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">
                              {new Date(installment.paid_date).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => handlePayInstallment(installment.installment_no)}
                          >
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest font-black text-slate-900">
                <Lock className="w-4 h-4 text-emerald-600" />
                Security & PIN
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Transaction PIN</Label>
                <p className="text-xs text-muted-foreground leading-relaxed">Required for secure withdrawals and payouts. Use a unique 6-digit number.</p>
                <div className="flex justify-center py-6 bg-slate-50 border border-slate-100 rounded-2xl group focus-within:ring-2 ring-emerald-500/20 transition-all">
                  <InputOTP maxLength={6} value={pinValue} onChange={setPinValue}>
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={0} className="rounded-lg h-10 w-10 border-slate-300 font-bold" />
                      <InputOTPSlot index={1} className="rounded-lg h-10 w-10 border-slate-300 font-bold" />
                      <InputOTPSlot index={2} className="rounded-lg h-10 w-10 border-slate-300 font-bold" />
                      <InputOTPSlot index={3} className="rounded-lg h-10 w-10 border-slate-300 font-bold" />
                      <InputOTPSlot index={4} className="rounded-lg h-10 w-10 border-slate-300 font-bold" />
                      <InputOTPSlot index={5} className="rounded-lg h-10 w-10 border-slate-300 font-bold" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <Button 
                className="w-full gap-2 h-12 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold transition-all shadow-lg shadow-slate-900/10" 
                onClick={handleSetPin} 
                disabled={isSubmittingPin || pinValue.length !== 6}
              >
                {isSubmittingPin ? <ShieldCheck className="w-4 h-4 animate-pulse" /> : <ShieldCheck className="w-4 h-4" />}
                {isSubmittingPin ? "Securing Account..." : "Update PIN Securely"}
              </Button>
            </CardContent>
          </Card>

          {profile?.role_code !== 'admin' && (
            <Card className="border-emerald-100 bg-emerald-50/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <CardHeader>
                <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-800 flex items-center gap-2">
                   <Users className="w-4 h-4 text-emerald-600" />
                   Official Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-emerald-800/80 leading-relaxed font-medium">
                  Facing issues? Your dedicated Support Officer is ready to assist you with account verification and inquiries.
                </p>
                <Button variant="link" className="px-0 h-auto text-emerald-600 font-black uppercase tracking-widest text-[10px] hover:text-emerald-700 hover:no-underline flex items-center gap-1 group">
                  Contact Now <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}