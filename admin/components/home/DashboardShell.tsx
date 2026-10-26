"use client";

import { useState } from "react";
import Sidenav from "@/components/home/Sidenav";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30">
      <Sidenav
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <div
        className={cn(
          "pt-16 lg:pt-0 min-h-screen min-w-0 transition-[padding] duration-300 ease-in-out",
          sidebarCollapsed ? "lg:pl-0" : "lg:pl-64"
        )}
      >
        <div className="w-full max-w-full overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}
