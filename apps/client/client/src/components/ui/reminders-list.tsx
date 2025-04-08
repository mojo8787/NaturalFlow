import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Bell, Check, Clock } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

type Reminder = {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  scheduledDate: string;
  status: string;
  createdAt: string;
};

interface RemindersListProps {
  limit?: number;
  className?: string;
}

export function RemindersList({ limit = 5, className = "" }: RemindersListProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState<number | null>(null);
  
  const { data: reminders, isLoading, error } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
    staleTime: 1000 * 60, // 1 minute
  });
  
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/reminders/${id}/status`, { status: "read" });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({
        title: t("reminder_marked_read"),
        description: t("reminder_marked_read_desc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-medium">{t("reminders")}</h3>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-1/4" />
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`border rounded-lg p-4 ${className}`}>
        <p className="text-red-500">{t("error_loading_reminders")}</p>
      </div>
    );
  }
  
  // Sort reminders by date (most recent first) and limit to requested number
  const sortedReminders = [...(reminders || [])]
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
    .slice(0, limit);
  
  if (!sortedReminders.length) {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-medium mb-4">{t("reminders")}</h3>
        <div className="border rounded-lg p-4 text-center text-muted-foreground">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>{t("no_reminders")}</p>
        </div>
      </div>
    );
  }
  
  const getStatusBadge = (status: string) => {
    if (status === "read") {
      return <Badge variant="outline"><Check className="w-3 h-3 mr-1" /> {t("read")}</Badge>;
    } else if (status === "sent") {
      return <Badge variant="secondary">{t("sent")}</Badge>;
    } else {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> {t("pending")}</Badge>;
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case "welcome":
        return "border-green-200 bg-green-50";
      case "installation":
        return "border-blue-200 bg-blue-50";
      case "maintenance":
        return "border-amber-200 bg-amber-50";
      case "payment":
        return "border-purple-200 bg-purple-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium">{t("reminders")}</h3>
      
      {sortedReminders.map((reminder) => (
        <div 
          key={reminder.id} 
          className={`border-2 rounded-lg p-4 ${getTypeColor(reminder.type)}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{reminder.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {format(new Date(reminder.scheduledDate), "PPP")}
              </p>
            </div>
            {getStatusBadge(reminder.status)}
          </div>
          
          <div className={`mt-2 ${expanded === reminder.id ? 'block' : 'line-clamp-2'}`}>
            <p className="text-sm">{reminder.message}</p>
          </div>
          
          <div className="flex justify-between mt-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpanded(expanded === reminder.id ? null : reminder.id)}
            >
              {expanded === reminder.id ? t("show_less") : t("show_more")}
            </Button>
            
            {reminder.status !== "read" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => markAsReadMutation.mutate(reminder.id)}
                disabled={markAsReadMutation.isPending}
              >
                <Check className="w-4 h-4 mr-1" /> {t("mark_as_read")}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}