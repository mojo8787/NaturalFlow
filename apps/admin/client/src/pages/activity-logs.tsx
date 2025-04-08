import { AdminLayout } from "@/components/layouts/admin-layout";
import { Button } from "@/components/ui/button";

export default function ActivityLogsPage() {
  return (
    <AdminLayout title="Activity Logs">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h2 className="text-xl font-medium mb-4">Admin Activity Logs</h2>
        <p className="text-neutral-600 mb-6">
          This page displays a comprehensive log of all admin activities, providing an audit trail for security and accountability purposes.
        </p>
        <Button>Coming Soon</Button>
      </div>
    </AdminLayout>
  );
}
