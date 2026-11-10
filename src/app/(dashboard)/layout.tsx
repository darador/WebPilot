import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#070b12]">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-64 flex flex-col min-h-screen">
        <main className="flex-1 pb-12">{children}</main>
      </div>
    </div>
  );
}
