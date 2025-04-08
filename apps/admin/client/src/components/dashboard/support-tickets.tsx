import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Ticket = {
  ticket: {
    id: number;
    subject: string;
    priority: string;
    status: string;
    createdAt: string;
  };
  user: {
    username: string;
    email: string;
  };
};

export function SupportTickets() {
  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/admin/tickets/open"],
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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket #</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(3).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Skeleton className="h-7 w-7 rounded-full" />
                      <Skeleton className="h-4 w-24 ml-2" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-16 ml-auto" />
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
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">Recent Support Tickets</h2>
        <Button variant="link" className="text-primary hover:text-primary/80 p-0">
          View All
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket #</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets?.length > 0 ? (
              tickets.map((item: any) => (
                <TableRow key={item.ticket.id}>
                  <TableCell>
                    <div className="text-sm font-medium text-primary">#{item.ticket.id}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-neutral-800">{item.ticket.subject}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-7 w-7 bg-primary-100 text-primary-500">
                        <AvatarFallback>{getInitials(item.user.username)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-2 text-sm text-neutral-800">{item.user.username}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-neutral-500">
                      {format(new Date(item.ticket.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.ticket.priority as any} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.ticket.status as any} />
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    <Button variant="link" className="text-primary hover:text-primary/80 ml-auto">View</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-neutral-500">
                  No open tickets found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
