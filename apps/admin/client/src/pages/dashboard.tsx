import { AdminLayout } from "@/components/layouts/admin-layout";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { PendingTasks } from "@/components/dashboard/pending-tasks";
import { PendingInstallations } from "@/components/dashboard/pending-installations";
import { SupportTickets } from "@/components/dashboard/support-tickets";

export default function Dashboard() {
  return (
    <AdminLayout title="Dashboard">
      {/* Dashboard Statistics */}
      <DashboardStats />
      
      {/* Recent Activity and Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RecentActivity />
        <PendingTasks />
      </div>
      
      {/* Pending Installations */}
      <PendingInstallations />
      
      {/* Support Tickets */}
      <SupportTickets />
    </AdminLayout>
  );
}
