import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User, MapPin, Shield, Settings, Lock, Camera, Plus, Trash2,
  Package, RotateCcw, MessageSquare, Wallet, Users, Bell, ChevronRight,
  Heart, LogOut, CreditCard, HelpCircle, FileText, Star, Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currentUser, addresses, formatINR, orders, notifications } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const accountSections = [
  {
    title: "MY ORDERS",
    items: [
      { icon: Package, label: "Orders", desc: "Track, return, or buy again", path: "/orders" },
      { icon: RotateCcw, label: "Returns", desc: "Manage your returns", path: "/returns" },
      { icon: MessageSquare, label: "Complaints", desc: "Raise or track complaints", path: "/complaints" },
    ]
  },
  {
    title: "PAYMENTS & WALLET",
    items: [
      { icon: Wallet, label: "Wallet", desc: "Balance, transactions & withdraw", path: "/wallet" },
      { icon: Users, label: "Referrals", desc: "Earn from referrals", path: "/referrals" },
    ]
  },
  {
    title: "MY ACCOUNT",
    items: [
      { icon: User, label: "Profile Information", desc: "Name, email, phone", tab: "personal" },
      { icon: MapPin, label: "Manage Addresses", desc: "Saved delivery addresses", tab: "addresses" },
      { icon: Shield, label: "KYC Documents", desc: "Identity verification", tab: "kyc" },
      { icon: Bell, label: "Notifications", desc: "Alerts & updates", path: "/notifications" },
      { icon: Settings, label: "Preferences", desc: "Categories & notifications", tab: "preferences" },
      { icon: Lock, label: "Security", desc: "Password & sessions", tab: "security" },
    ]
  },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const activeOrders = orders.filter(o => !["delivered", "cancelled", "returned"].includes(o.status)).length;
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const handleItemClick = (item: { path?: string; tab?: string }) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.tab) {
      setActiveTab(item.tab);
    }
  };

  // If a tab is active, show tab content
  if (activeTab) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="grid md:grid-cols-[280px_1fr] gap-6">
          {/* Left - Profile card + menu */}
          <ProfileSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onNavigate={navigate}
            activeOrders={activeOrders}
            unreadNotifs={unreadNotifs}
          />

          {/* Right - Tab content */}
          <div className="animate-fade-in">
            {activeTab === "personal" && <PersonalInfoTab />}
            {activeTab === "addresses" && <AddressesTab />}
            {activeTab === "kyc" && <KycTab />}
            {activeTab === "preferences" && <PreferencesTab />}
            {activeTab === "security" && <SecurityTab />}
          </div>
        </div>
      </div>
    );
  }

  // Default: Flipkart-style account overview
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="grid md:grid-cols-[280px_1fr] gap-6">
        {/* Left - Profile card */}
        <ProfileSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onNavigate={navigate}
          activeOrders={activeOrders}
          unreadNotifs={unreadNotifs}
        />

        {/* Right - Overview cards */}
        <div className="space-y-5 animate-fade-in">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Orders", value: String(orders.length), icon: Package, color: "text-primary", bg: "bg-primary/10", path: "/orders" },
              { label: "Active", value: String(activeOrders), icon: CreditCard, color: "text-warning", bg: "bg-warning/10", path: "/orders" },
              { label: "Wallet", value: formatINR(currentUser.walletBalance), icon: Wallet, color: "text-profit", bg: "bg-profit/10", path: "/wallet" },
              { label: "Notifications", value: String(unreadNotifs), icon: Bell, color: "text-trust", bg: "bg-trust/10", path: "/notifications" },
            ].map(stat => (
              <Link key={stat.label} to={stat.path}
                className="card-base p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-2", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <p className="text-lg font-bold font-mono">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </Link>
            ))}
          </div>

          {/* Account Sections */}
          {accountSections.map(section => (
            <div key={section.title} className="card-base overflow-hidden">
              <div className="px-5 py-3 border-b bg-muted/30">
                <h3 className="text-xs font-bold text-muted-foreground tracking-wider">{section.title}</h3>
              </div>
              <div className="divide-y">
                {section.items.map(item => (
                  <button
                    key={item.label}
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-all duration-200 text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/8 group-hover:bg-primary/15 flex items-center justify-center transition-colors shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Logout */}
          <button
            className="card-base w-full p-4 flex items-center gap-3 text-destructive hover:bg-destructive/5 transition-all duration-200 group"
            onClick={async () => { await signOut(); navigate("/login"); }}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-semibold text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== Profile Sidebar ===== */
function ProfileSidebar({ activeTab, onTabChange, onNavigate, activeOrders, unreadNotifs }: {
  activeTab: string | null;
  onTabChange: (tab: string | null) => void;
  onNavigate: (path: string) => void;
  activeOrders: number;
  unreadNotifs: number;
}) {
  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <div className="card-base p-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-primary text-xl font-bold">{currentUser.name.charAt(0)}</span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
              <Camera className="h-3 w-3" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base truncate">{currentUser.name}</h2>
            <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
            <p className="text-xs text-muted-foreground">{currentUser.phone}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Referral Code</p>
          <p className="font-mono font-bold text-primary text-sm">{currentUser.referralCode}</p>
        </div>
      </div>

      {/* Navigation Menu (desktop only) */}
      <div className="card-base overflow-hidden hidden md:block">
        <nav className="divide-y">
          <button
            onClick={() => onTabChange(null)}
            className={cn("w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-all text-left",
              activeTab === null && "bg-primary/5 border-l-3 border-l-primary text-primary font-semibold"
            )}
          >
            <User className="h-4 w-4" />
            <span>Account Overview</span>
          </button>
          {[
            { tab: "personal", icon: User, label: "Profile Information" },
            { tab: "addresses", icon: MapPin, label: "Manage Addresses" },
            { tab: "kyc", icon: Shield, label: "KYC Documents" },
            { tab: "preferences", icon: Settings, label: "Preferences" },
            { tab: "security", icon: Lock, label: "Security" },
          ].map(item => (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className={cn("w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-all text-left",
                activeTab === item.tab && "bg-primary/5 border-l-3 border-l-primary text-primary font-semibold"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          ))}
          <div className="px-4 py-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Quick Links</p>
          </div>
          {[
            { path: "/orders", icon: Package, label: "My Orders", badge: activeOrders > 0 ? String(activeOrders) : undefined },
            { path: "/wallet", icon: Wallet, label: "Wallet" },
            { path: "/referrals", icon: Users, label: "Referrals" },
            { path: "/notifications", icon: Bell, label: "Notifications", badge: unreadNotifs > 0 ? String(unreadNotifs) : undefined },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-all text-left"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

/* ===== Tab Content Components ===== */

function PersonalInfoTab() {
  return (
    <div className="card-base p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Personal Information</h2>
        <Button variant="outline" size="sm">Edit</Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="text-xs text-muted-foreground font-medium block mb-1.5">Full Name</label><Input defaultValue={currentUser.name} className="rounded-xl border-2" /></div>
        <div><label className="text-xs text-muted-foreground font-medium block mb-1.5">Email</label><Input defaultValue={currentUser.email} className="rounded-xl border-2" /></div>
        <div>
          <label className="text-xs text-muted-foreground font-medium block mb-1.5">Phone</label>
          <Input defaultValue={currentUser.phone} className="rounded-xl border-2" disabled />
          <p className="text-[10px] text-muted-foreground mt-1">OTP required to change</p>
        </div>
        <div><label className="text-xs text-muted-foreground font-medium block mb-1.5">PAN Number</label><Input placeholder="ABCDE1234F" className="rounded-xl border-2 font-mono" /></div>
        <div><label className="text-xs text-muted-foreground font-medium block mb-1.5">City</label><Input defaultValue={currentUser.city} className="rounded-xl border-2" /></div>
        <div><label className="text-xs text-muted-foreground font-medium block mb-1.5">Pincode</label><Input defaultValue={currentUser.pincode} className="rounded-xl border-2 font-mono" /></div>
      </div>
      <Button onClick={() => toast.success("Profile updated")} className="shadow-lg">Save Changes</Button>
    </div>
  );
}

function AddressesTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Manage Addresses</h2>
        <Button variant="outline"><Plus className="h-4 w-4" /> Add New</Button>
      </div>
      {addresses.map(addr => (
        <div key={addr.id} className="card-base p-5 flex items-start justify-between hover:shadow-md transition-all duration-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <p className="font-bold text-sm">{addr.name}</p>
              {addr.isDefault && <span className="status-primary">Default</span>}
            </div>
            <p className="text-sm text-muted-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
            <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} — <span className="font-mono">{addr.pincode}</span></p>
            <p className="text-sm text-muted-foreground mt-1">{addr.phone}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Edit</Button>
            <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function KycTab() {
  return (
    <div className="card-base p-6 space-y-5">
      <h2 className="font-bold text-lg">KYC Documents</h2>
      {[
        { name: "Aadhaar Card", status: "approved" as const },
        { name: "PAN Card", status: "pending" as const },
        { name: "Address Proof", status: "rejected" as const, reason: "Document not clearly visible" },
      ].map(doc => (
        <div key={doc.name} className="flex items-center justify-between p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
          <div>
            <p className="font-semibold text-sm">{doc.name}</p>
            {doc.reason && <p className="text-xs text-destructive mt-0.5">{doc.reason}</p>}
          </div>
          <div className="flex items-center gap-2.5">
            <span className={doc.status === "approved" ? "status-success" : doc.status === "pending" ? "status-warning" : "status-destructive"}>
              {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
            </span>
            <Button size="sm" variant="outline">Upload</Button>
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> Aadhaar number is securely hashed, never stored raw</p>
    </div>
  );
}

function PreferencesTab() {
  return (
    <div className="card-base p-6 space-y-6">
      <div>
        <h2 className="font-bold text-lg mb-4">Preferred Categories</h2>
        <div className="flex flex-wrap gap-2.5">
          {["Seeds", "Fertilizers", "Farm Tools", "AgriTech", "Services"].map(cat => (
            <button key={cat} className="px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200 hover:border-primary hover:text-primary hover:bg-primary/5">{cat}</button>
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-bold text-lg mb-4">Notification Preferences</h2>
        <div className="space-y-4">
          {["Order Updates", "Referral Earnings", "Promotions"].map(pref => (
            <div key={pref} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors">
              <span className="text-sm font-medium">{pref}</span>
              <div className="flex gap-4">
                {["SMS", "Email", "Push"].map(ch => (
                  <label key={ch} className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded accent-primary w-3.5 h-3.5" /> {ch}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-5">
      <div className="card-base p-6 space-y-4">
        <h2 className="font-bold text-lg">Change Password</h2>
        <Input type="password" placeholder="Current password" className="rounded-xl border-2" />
        <Input type="password" placeholder="New password" className="rounded-xl border-2" />
        <Input type="password" placeholder="Confirm new password" className="rounded-xl border-2" />
        <Button onClick={() => toast.success("Password updated")} className="shadow-lg">Update Password</Button>
      </div>
      <div className="card-base p-6">
        <h2 className="font-bold text-lg mb-4">Active Sessions</h2>
        {[
          { device: "Chrome on Windows", ip: "103.45.xx.xx", last: "Now" },
          { device: "Safari on iPhone", ip: "103.45.xx.xx", last: "2 hours ago" },
        ].map((session, i) => (
          <div key={i} className="flex items-center justify-between py-3.5 border-b last:border-0">
            <div>
              <p className="text-sm font-semibold">{session.device}</p>
              <p className="text-xs text-muted-foreground">{session.ip} · {session.last}</p>
            </div>
            <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/5">Revoke</Button>
          </div>
        ))}
        <Button variant="outline" className="mt-4 text-destructive border-destructive/30 hover:bg-destructive/5 w-full">
          <LogOut className="h-4 w-4" /> Logout All Devices
        </Button>
      </div>
    </div>
  );
}
