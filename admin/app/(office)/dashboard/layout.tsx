import Sidenav from "@/components/home/Sidenav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex-1">
      <div className="flex w-64">
        <Sidenav />
      </div>
      <div className="flex-1 lg:ml-64">
      {children}
      </div>
    </div>
  );
}