import UnifiedProfile from "@/components/UnifiedProfile";

export default function CoreBodyProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your settings, addresses, and installments</p>
      </div>
      <UnifiedProfile variant="tabbed" />
    </div>
  );
}