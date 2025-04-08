import { AdminLayout } from "@/components/layouts/admin-layout";
import { Button } from "@/components/ui/button";

export default function SupportTicketsPage() {
  return (
    <AdminLayout title="Support Tickets">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h2 className="text-xl font-medium mb-4">Support Ticket Management</h2>
        <p className="text-neutral-600 mb-6">
          This page will provide support staff with tools to manage and respond to customer support tickets, prioritize issues, and track ticket resolution.
        </p>
        <Button>Coming Soon</Button>
      </div>
    </AdminLayout>
  );
}
