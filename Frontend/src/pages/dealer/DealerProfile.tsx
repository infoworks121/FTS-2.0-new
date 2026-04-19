import UnifiedProfile from "@/components/UnifiedProfile";

export default function DealerProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your settings and addresses</p>
      </div>
      <UnifiedProfile variant="tabbed" />
    </div>
  );
}