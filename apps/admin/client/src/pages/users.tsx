import { useState } from "react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: users, isLoading } = useQuery({ queryKey: ["/api/admin/users"] });

  const filteredUsers = searchTerm
    ? users?.filter((user: any) => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : users;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  return (
    <AdminLayout title="Users">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" /> Filter
            </Button>
            <Button size="sm">
              <User className="h-4 w-4 mr-1" /> Add User
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-24 ml-3" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers?.length > 0 ? (
                  filteredUsers.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 bg-primary-100 text-primary-500">
                            <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                          </Avatar>
                          <div className="ml-3 font-medium">{user.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{user.address || "-"}</TableCell>
                      <TableCell>{user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/users/${user.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-neutral-500">
                      {searchTerm ? "No users found matching your search" : "No users found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
