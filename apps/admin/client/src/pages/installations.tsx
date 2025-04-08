import { AdminLayout } from "@/components/layouts/admin-layout";
import { Button } from "@/components/ui/button";

export default function InstallationsPage() {
  return (
    <AdminLayout title="Installations">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h2 className="text-xl font-medium mb-4">Installations Management</h2>
        <p className="text-neutral-600 mb-6">
          This page will allow technicians and admins to view and manage all installation requests, schedule appointments, and update installation statuses.
        </p>
        <Button>Coming Soon</Button>
      </div>
    </AdminLayout>
  );
}
