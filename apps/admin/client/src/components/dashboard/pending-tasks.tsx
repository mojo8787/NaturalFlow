import { Button } from "@/components/ui/button";
import { ChevronRight, AlertTriangle, Wrench, Wallet, FileText } from "lucide-react";
import { Link } from "wouter";

// Note: In a real implementation, this would fetch data from the API
// For now showing static UI based on design
export function PendingTasks() {
  const pendingTasks = [
    {
      id: 1,
      type: "installation",
      title: "Schedule installation for James Evans",
      dueDate: "Due in 2 days",
      priority: "normal",
      link: "/installations",
    },
    {
      id: 2,
      type: "ticket",
      title: "Respond to high priority ticket #4391",
      dueDate: "Overdue by 1 day",
      priority: "high",
      link: "/support-tickets",
    },
    {
      id: 3,
      type: "billing",
      title: "Review billing issue for customer #1284",
      dueDate: "Due today",
      priority: "normal",
      link: "/users",
    },
    {
      id: 4,
      type: "report",
      title: "Prepare monthly service report",
      dueDate: "Due in 3 days",
      priority: "normal",
      link: "/settings",
    },
  ];

  // Function to get task icon based on type
  const getTaskIcon = (type: string, priority: string) => {
    switch (type) {
      case "installation":
        return (
          <div className="rounded-full h-8 w-8 bg-amber-50 flex items-center justify-center text-amber-500 mr-3">
            <Wrench className="h-4 w-4" />
          </div>
        );
      case "ticket":
        return (
          <div className="rounded-full h-8 w-8 bg-red-50 flex items-center justify-center text-red-500 mr-3">
            <AlertTriangle className="h-4 w-4" />
          </div>
        );
      case "billing":
        return (
          <div className="rounded-full h-8 w-8 bg-neutral-100 flex items-center justify-center text-neutral-500 mr-3">
            <Wallet className="h-4 w-4" />
          </div>
        );
      case "report":
        return (
          <div className="rounded-full h-8 w-8 bg-primary-50 flex items-center justify-center text-primary-500 mr-3">
            <FileText className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="rounded-full h-8 w-8 bg-neutral-100 flex items-center justify-center text-neutral-500 mr-3">
            <FileText className="h-4 w-4" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">Pending Tasks</h2>
        <Button variant="link" className="text-primary hover:text-primary/80 p-0">
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {pendingTasks.map((task, index) => (
          <div 
            key={task.id} 
            className={`flex items-center justify-between ${
              index < pendingTasks.length - 1 ? "pb-4 border-b border-neutral-100" : ""
            }`}
          >
            <div className="flex items-start">
              {getTaskIcon(task.type, task.priority)}
              <div>
                <p className="text-sm font-medium text-neutral-800">{task.title}</p>
                <p className={`text-xs mt-1 ${
                  task.priority === "high" && task.dueDate.includes("Overdue") 
                    ? "text-red-500" 
                    : "text-neutral-500"
                }`}>
                  {task.dueDate}
                </p>
              </div>
            </div>
            <Link href={task.link}>
              <Button size="icon" variant="ghost" className="text-primary hover:bg-primary-50 rounded-full">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
