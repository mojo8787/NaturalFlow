import { cn } from "@/lib/utils";

type StatusType = "pending" | "scheduled" | "in_progress" | "completed" | "cancelled" | 
                 "active" | "open" | "resolved" | "closed" | "high" | "medium" | "low";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-600";
      case "pending":
        return "bg-amber-50 text-amber-600";
      case "scheduled":
        return "bg-blue-50 text-blue-600";
      case "in_progress":
        return "bg-blue-50 text-blue-600";
      case "completed":
        return "bg-green-50 text-green-600";
      case "cancelled":
        return "bg-red-50 text-red-600";
      case "open":
        return "bg-neutral-100 text-neutral-600";
      case "resolved":
        return "bg-green-50 text-green-600";
      case "closed":
        return "bg-neutral-100 text-neutral-600";
      case "high":
        return "bg-red-50 text-red-600";
      case "medium":
        return "bg-amber-50 text-amber-600";
      case "low":
        return "bg-blue-50 text-blue-600";
      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };

  return (
    <span className={cn(
      "px-2 py-1 text-xs rounded-full inline-block",
      getStatusStyles(),
      className
    )}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  );
}
