import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  trend?: {
    value: string;
    isPositive: boolean;
    text: string;
  };
  className?: string;
}

export function DashboardCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  trend,
  className,
}: DashboardCardProps) {
  return (
    <div className={cn(
      "dashboard-card bg-white rounded-lg shadow-sm p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-1",
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-neutral-500 text-sm mb-1">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          {trend && (
            <p className={cn(
              "text-xs mt-2 flex items-center",
              trend.isPositive ? "text-green-500" : "text-amber-500"
            )}>
              <span className="material-icons text-xs mr-1">
                {trend.isPositive ? "trending_up" : "trending_flat"}
              </span>
              <span>{trend.text}</span>
            </p>
          )}
        </div>
        <div className={cn("rounded-full p-3", iconBgColor, iconColor)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
