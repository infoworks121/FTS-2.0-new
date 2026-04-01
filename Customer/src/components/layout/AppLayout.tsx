import { Outlet } from "react-router-dom";
import { TopNavbar } from "./TopNavbar";
import { MobileTabBar } from "./MobileTabBar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavbar />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      <MobileTabBar />
    </div>
  );
}
