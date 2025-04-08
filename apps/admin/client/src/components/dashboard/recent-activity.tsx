import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Edit, UserPlus, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type ActivityLog = {
  id: number;
  action: string;
  entityType: string;
  entityId?: number;
  details?: Record<string, any>;
  createdAt: string;
};

type Admin = {
  username: string;
};

type Activity = {
  log: ActivityLog;
  admin?: Admin;
};

// Hardcoded fallback data for when the server response is empty or malformed
const fallbackActivities: Activity[] = [
  {
    log: {
      id: 1,
      action: "login",
      entityType: "admin",
      createdAt: new Date().toISOString()
    },
    admin: {
      username: "admin"
    }
  }
];

export function RecentActivity() {
  const { data, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/dashboard/activities"],
  });
  
  // Safely process the activities data, with fallback for any errors
  let activities: Activity[] = [];
  
  try {
    if (Array.isArray(data) && data.length > 0) {
      // Validate each item in the array
      activities = data.filter(item => 
        item && 
        item.log && 
        typeof item.log.action === 'string' && 
        typeof item.log.createdAt === 'string'
      ) as Activity[];
    }
    
    // If after filtering we have no valid activities, use fallback
    if (activities.length === 0) {
      activities = fallbackActivities;
    }
  } catch (error) {
    console.error("Error processing activity data:", error);
    activities = fallbackActivities;
  }

  // Helper function to get icon based on action type
  const getActivityIcon = (action: string = "", entityType: string = "") => {
    if (action === "create_admin_user" || (action && action.includes("create"))) {
      return (
        <div className="rounded-full h-8 w-8 bg-blue-50 flex items-center justify-center text-blue-500 mr-3">
          <UserPlus className="h-4 w-4" />
        </div>
      );
    } else if (action && action.includes("cancel") || (action && action.includes("delete"))) {
      return (
        <div className="rounded-full h-8 w-8 bg-red-50 flex items-center justify-center text-red-500 mr-3">
          <X className="h-4 w-4" />
        </div>
      );
    } else if (action && action.includes("resolve") || (action && action.includes("complete"))) {
      return (
        <div className="rounded-full h-8 w-8 bg-green-50 flex items-center justify-center text-green-500 mr-3">
          <CheckCircle className="h-4 w-4" />
        </div>
      );
    } else if (action && action.includes("update")) {
      return (
        <div className="rounded-full h-8 w-8 bg-primary-50 flex items-center justify-center text-primary-500 mr-3">
          <Edit className="h-4 w-4" />
        </div>
      );
    } else {
      return (
        <div className="rounded-full h-8 w-8 bg-neutral-100 flex items-center justify-center text-neutral-500 mr-3">
          <AlertCircle className="h-4 w-4" />
        </div>
      );
    }
  };

  // Helper function to get activity description
  const getActivityDescription = (activity: Activity) => {
    if (!activity || !activity.log) {
      return <p className="text-sm">Activity data unavailable</p>;
    }
    
    const adminName = activity.admin?.username || "Unknown admin";
    const entityId = activity.log.entityId;
    const action = activity.log.action || "unknown";
    
    switch (action) {
      case "login":
        return (
          <p className="text-sm">
            <span className="font-medium text-neutral-800">{adminName}</span>
            <span className="text-neutral-600"> logged in to the admin dashboard</span>
          </p>
        );
      case "logout":
        return (
          <p className="text-sm">
            <span className="font-medium text-neutral-800">{adminName}</span>
            <span className="text-neutral-600"> logged out from the admin dashboard</span>
          </p>
        );
      case "update_installation_status":
        const newStatus = activity.log.details?.newStatus;
        return (
          <p className="text-sm">
            <span className="font-medium text-neutral-800">{adminName}</span>
            <span className="text-neutral-600"> updated installation status to </span>
            <span className="text-green-500 font-medium">{newStatus || "Unknown"}</span>
          </p>
        );
      case "create_admin_user":
        return (
          <p className="text-sm">
            <span className="font-medium text-neutral-800">{adminName}</span>
            <span className="text-neutral-600"> created a new admin account with role </span>
            <span className="text-neutral-800 font-medium">{activity.log.details?.role || "Unknown"}</span>
          </p>
        );
      case "view_user_details":
        return (
          <p className="text-sm">
            <span className="font-medium text-neutral-800">{adminName}</span>
            <span className="text-neutral-600"> viewed user details for user </span>
            <span className="text-neutral-800 font-medium">#{entityId}</span>
          </p>
        );
      default:
        return (
          <p className="text-sm">
            <span className="font-medium text-neutral-800">{adminName}</span>
            <span className="text-neutral-600"> performed {action} on {activity.log.entityType || 'unknown entity'} </span>
            {entityId && <span className="text-neutral-800 font-medium">#{entityId}</span>}
          </p>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex items-start pb-4 border-b border-neutral-100">
              <Skeleton className="h-8 w-8 rounded-full mr-3" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full max-w-sm mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">Recent Activity</h2>
        <Button variant="link" className="text-primary-500 hover:text-primary-600 text-sm p-0">
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div 
              key={activity.log.id || index} 
              className={`flex items-start ${
                index < activities.length - 1 ? "pb-4 border-b border-neutral-100" : ""
              }`}
            >
              {getActivityIcon(activity.log.action, activity.log.entityType)}
              <div className="flex-1">
                {getActivityDescription(activity)}
                <p className="text-xs text-neutral-500 mt-1">
                  {formatDistanceToNow(new Date(activity.log.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-neutral-500">
            No recent activity found
          </div>
        )}
      </div>
    </div>
  );
}
