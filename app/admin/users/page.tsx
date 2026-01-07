import { getAllUsers } from "@/lib/action/admin";
import { User } from "@/db/Schemas/user"; 
import UserActions from "./__component/UserAction"; 
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, CheckCircle, XCircle, User as UserIcon, Users } from "lucide-react";
import Header from "../__component/Header";
import SearchFilter from "../__component/SearchFilter";
import StatsSection from "../__component/StatsSection";

// Helper to filter users in memory
const filterUsers = (users: User[], query: string, status: string) => {
  let filtered = users;

  // 1. Filter by Search Query
  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter((user) =>
      (user.name && user.name.toLowerCase().includes(lowerQuery)) ||
      (user.email && user.email.toLowerCase().includes(lowerQuery))
    );
  }

  // 2. Filter by Status (Mixed logic: Role vs Verification Status)
  if (status && status !== 'all') {
    if (status === 'admin') {
      filtered = filtered.filter(u => u.role === 'admin');
    } else if (status === 'verified') {
      filtered = filtered.filter(u => u.verification_status === 'verified');
    } else if (status === 'unverified') {
      filtered = filtered.filter(u => u.verification_status === 'unverified');
    }
  }

  return filtered;
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const query = params.search || "";
  const statusFilter = params.status || "all";

  // 1. Fetch ALL users
  const allUsers = await getAllUsers(); 

  // 2. Calculate Stats
  const total = allUsers.length;
  const admins = allUsers.filter(u => u.role === 'admin').length;
  const verified = allUsers.filter(u => u.verification_status === 'verified').length;
  const unverified = allUsers.filter(u => u.verification_status === 'unverified').length;

  // 3. Configure Stats Items
  const statsItems = [
    { 
      title: "Total Users", 
      count: total, 
      Icon: Users, 
      variant: "default" as const 
    },
    { 
      title: "Admins", 
      count: admins, 
      Icon: Shield, 
      variant: "pending" as const // Amber color
    },
    { 
      title: "Verified", 
      count: verified, 
      Icon: CheckCircle, 
      variant: "approved" as const 
    },
    { 
      title: "Unverified", 
      count: unverified, 
      Icon: XCircle, 
      variant: "rejected" as const 
    },
  ];

  // 4. Define Status Options for the Dropdown
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "admin", label: "Admin" },
    { value: "verified", label: "Verified" },
    { value: "unverified", label: "Unverified" },
  ];

  // 5. Filter data for the Table View
  const filteredUsers = filterUsers(allUsers, query, statusFilter);

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="space-y-4">
        <Header 
            title="User Management" 
            subtitle="Manage roles and verification status" 
        />
        
        <StatsSection items={statsItems} />
        
        {/* Pass status options to the reusable filter */}
        <SearchFilter status={statusOptions} />
      </div>

      {/* Table Section */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No users found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    {/* User Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user.profile_pic ? (
                          <img
                            src={user.profile_pic}
                            alt={user.name || "User"}
                            className="w-10 h-10 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
                            <UserIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{user.name || "No name"}</p>
                            {user.role === 'admin' && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 gap-0.5 border-primary/30 text-primary bg-primary/5">
                                <Shield className="w-3 h-3" /> Admin
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.verification_status === 'verified' ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 flex w-fit items-center gap-1 border-emerald-200">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex w-fit items-center gap-1">
                            <XCircle className="w-3 h-3" /> Unverified
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Joined Date */}
                    <TableCell className="text-muted-foreground">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </TableCell>

                    {/* Actions - Client Component */}
                    <TableCell className="text-right">
                      <UserActions user={user} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}