import { getAllUsers } from "@/lib/action/admin";
import { User } from "@/db/schema";
import SearchInput from "./__component/SearchInput"; // Use your existing SearchInput
import UserActions from "./__component/UserAction"; // Import the client component above
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
import { Shield, CheckCircle, XCircle, User as UserIcon } from "lucide-react";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  // 1. Await params in Next.js 15+
  const params = await searchParams;
  const query = params.search || "";

  // 2. Fetch data (Server Side Filtering)
  // Ensure getAllUsers performs the filtering: .where(ilike(users.name, `%${query}%`))
  const users: User[] = await getAllUsers(query );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <p className="text-muted-foreground">Manage roles and verification status</p>
        </div>
        <SearchInput />
      </div>

      {/* Table Section - Rendered on Server */}
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
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
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