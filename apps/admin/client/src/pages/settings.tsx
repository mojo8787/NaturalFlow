import { AdminLayout } from "@/components/layouts/admin-layout";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <AdminLayout title="Settings">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h2 className="text-xl font-medium mb-4">System Settings</h2>
        <p className="text-neutral-600 mb-6">
          This page allows administrators to configure system settings, preferences, and global parameters for the admin dashboard.
        </p>
        <Button>Coming Soon</Button>
      </div>
    </AdminLayout>
  );
}
