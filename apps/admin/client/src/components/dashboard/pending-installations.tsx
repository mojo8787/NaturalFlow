import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Installation = {
  installation: {
    id: number;
    status: string;
    address?: string;
    createdAt: string;
  };
  user: {
    username: string;
    email: string;
    address?: string;
  };
};

export function PendingInstallations() {
  const { data: installations = [], isLoading } = useQuery<Installation[]>({
    queryKey: ["/api/admin/installations/pending"],
  });

  const getInitials = (name: string = "") => {
    if (!name) return "NA";
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Date Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(3).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="ml-3">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">Pending Installations</h2>
        <Button variant="link" className="text-primary hover:text-primary/80 p-0">
          View All
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Date Requested</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {installations?.length > 0 ? (
              installations.map((item: any) => (
                <TableRow key={item.installation.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 bg-primary-100 text-primary-500">
                        <AvatarFallback>{getInitials(item.user.username)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-neutral-800">{item.user.username}</div>
                        <div className="text-xs text-neutral-500">{item.user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-neutral-800">
                      {item.installation.address || item.user.address || "No address provided"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-neutral-800">
                      {format(new Date(item.installation.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.installation.status as any} />
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="link" className="text-primary hover:text-primary/80">Schedule</Button>
                      <Button variant="link" className="text-neutral-500 hover:text-neutral-700">Details</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-neutral-500">
                  No pending installations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
