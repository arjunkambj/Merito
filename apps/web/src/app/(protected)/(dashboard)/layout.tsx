import type React from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashBoardHeader from "@/components/layout/DashBoardHeader";

interface DappLayoutProps {
  children: React.ReactNode;
}

export default async function DappLayout({ children }: DappLayoutProps) {
  return (
    <div className="flex max-h-dvh h-dvh flex-col text-foreground">
      <DashBoardHeader />
      <div className="flex flex-1 flex ">
        <DashboardSidebar className=" border-r border-default-200 h-full" />
        <main className="flex flex-1 flex-col overflow-auto">{children}</main>
      </div>
    </div>
  );
}
