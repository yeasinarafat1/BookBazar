"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Shield, CheckCircle, XCircle, User as UserIcon, Loader2 } from "lucide-react";
// IMPORT YOUR SERVER ACTION HERE
import { changeUserRole } from "@/lib/action/admin"; 
import { User } from "@/db/schema";


export default function UsersClient({ allUsers }: { allUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(allUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null); // Track loading state for specific user
  const { toast } = useToast();

  // Handle toggling between 'verified' and 'unverified'
  const toggleVerification = (userId: string, currentStatus: string | null) => {
    // You can implement a similar server action for this later
    const newStatus = currentStatus === "verified" ? "unverified" : "verified";
    
    setUsers(users.map(u => 
      u.id === userId ? { ...u, verification_status: newStatus } : u
    ));

    toast({ 
      title: newStatus === "verified" ? "User Verified" : "Verification Removed",
      description: `User status updated to ${newStatus} (Mock Action).` 
    });
  };

  // --- IMPLEMENTED SERVER ACTION HERE ---
  const toggleAdminRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    
    setLoadingId(userId); // Start loading

    try {
      // 1. Call the Server Action
      await changeUserRole(userId, newRole);

      // 2. Update Local State on Success
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));

      toast({ 
        title: "Success", 
        description: `User role updated to ${newRole}.` 
      });

    } catch (error) {
      console.error(error);
      toast({ 
        variant: "destructive",
        title: "Error", 
        description: "Failed to update user role." 
      });
    } finally {
      setLoadingId(null); // Stop loading
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <p className="text-muted-foreground">Manage roles and verification status</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
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
                      No users found
                    </TableCell>
                  </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    {/* User Info Cell */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
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
                        
                        {/* Name & Email */}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{user.name || "No name"}</p>
                            {/* Admin Badge */}
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

                    {/* Status Cell */}
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

                    {/* Joined Date Cell */}
                    <TableCell className="text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>

                    {/* Actions Cell */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={loadingId === user.id}>
                            {loadingId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          
                          {/* Verify / Unverify Action */}
                          <DropdownMenuItem onClick={() => toggleVerification(user.id, user.verification_status)}>
                            {user.verification_status === 'verified' ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" /> Revoke Verification
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" /> Verify User
                              </>
                            )}
                          </DropdownMenuItem>
                          
                          {/* Toggle Admin Action */}
                          <DropdownMenuItem onClick={() => toggleAdminRole(user.id, user.role)}>
                            <Shield className="mr-2 h-4 w-4" /> 
                            {user.role === 'admin' ? "Remove Admin Role" : "Make Admin"}
                          </DropdownMenuItem>

                        </DropdownMenuContent>
                      </DropdownMenu>
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