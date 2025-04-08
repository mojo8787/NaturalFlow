import { AdminLayout } from "@/components/layouts/admin-layout";
import { Button } from "@/components/ui/button";

export default function AdminUsersPage() {
  return (
    <AdminLayout title="Admin Users">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h2 className="text-xl font-medium mb-4">Admin User Management</h2>
        <p className="text-neutral-600 mb-6">
          This page allows super administrators to manage admin accounts, assign roles, and control access permissions within the admin dashboard.
        </p>
        <Button>Coming Soon</Button>
      </div>
    </AdminLayout>
  );
}
