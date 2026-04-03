import Sidebar from "@/components/Sidebar";
import DashboardLayout from "@/components/DashboardLayout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <DashboardLayout>{children}</DashboardLayout>
    </>
  );
}
