"use client";

/**
 * Legacy wrapper — dashboard pages use DashboardShell via
 * app/(office)/dashboard/layout.tsx. Kept for any non-dashboard callers.
 */
import DashboardShell from "@/components/home/DashboardShell";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function AdminLayout({ children, className }: AdminLayoutProps) {
  return (
    <DashboardShell>
      <div className={cn(className)}>{children}</div>
    </DashboardShell>
  );
}
