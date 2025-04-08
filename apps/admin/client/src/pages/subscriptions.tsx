import { AdminLayout } from "@/components/layouts/admin-layout";
import { Button } from "@/components/ui/button";

export default function SubscriptionsPage() {
  return (
    <AdminLayout title="Subscriptions">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h2 className="text-xl font-medium mb-4">Subscriptions Management</h2>
        <p className="text-neutral-600 mb-6">
          This page will display a list of all active and inactive subscriptions, allowing admins to manage customer subscription plans.
        </p>
        <Button>Coming Soon</Button>
      </div>
    </AdminLayout>
  );
}
