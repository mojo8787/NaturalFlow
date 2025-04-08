import { DashboardCard } from "@/components/ui/dashboard-card";
import { Users, Receipt, Wrench, Headphones } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardStats = {
  totalUsers: number;
  activeSubscriptions: number;
  pendingInstallations: number;
  openTickets: number;
};

export function DashboardStats() {
  const { data: stats = { 
    totalUsers: 0, 
    activeSubscriptions: 0,
    pendingInstallations: 0,
    openTickets: 0
  }, isLoading } = useQuery<DashboardStats>({ 
    queryKey: ["/api/admin/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-20 mt-2" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <DashboardCard
        title="Total Users"
        value={stats?.totalUsers || 0}
        icon={<Users className="h-5 w-5" />}
        iconBgColor="bg-primary-50"
        iconColor="text-primary"
        trend={{
          value: "12%",
          isPositive: true,
          text: "12% increase",
        }}
      />
      
      <DashboardCard
        title="Active Subscriptions"
        value={stats?.activeSubscriptions || 0}
        icon={<Receipt className="h-5 w-5" />}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-500"
        trend={{
          value: "8%",
          isPositive: true,
          text: "8% increase",
        }}
      />
      
      <DashboardCard
        title="Pending Installations"
        value={stats?.pendingInstallations || 0}
        icon={<Wrench className="h-5 w-5" />}
        iconBgColor="bg-amber-50"
        iconColor="text-amber-500"
        trend={{
          value: "",
          isPositive: false,
          text: "Needs attention",
        }}
      />
      
      <DashboardCard
        title="Open Support Tickets"
        value={stats?.openTickets || 0}
        icon={<Headphones className="h-5 w-5" />}
        iconBgColor="bg-red-50"
        iconColor="text-red-500"
        trend={{
          value: "",
          isPositive: false,
          text: "5 high priority",
        }}
      />
    </div>
  );
}
