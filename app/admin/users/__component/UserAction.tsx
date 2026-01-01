"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { changeUserRole,  } from "@/lib/action/admin"; // Ensure you create toggleUserVerification
import { User } from "@/db/schema";

export default function UserActions({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRoleChange = async () => {
    if (loading) return;
    setLoading(true);
    const newRole = user.role === "admin" ? "user" : "admin";

    try {
      // Assuming your server action includes `revalidatePath('/admin/users')`
      await changeUserRole(user.id, newRole);
      toast({ title: "Success", description: `Role updated to ${newRole}` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update role" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationChange = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      // You need to create this server action similar to changeUserRole
    //   await toggleUserVerification(user.id, user.verification_status === "verified" ? "unverified" : "verified");
      toast({ title: "Success", description: "Verification status updated" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update status" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleVerificationChange}>
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

        <DropdownMenuItem onClick={handleRoleChange}>
          <Shield className="mr-2 h-4 w-4" />
          {user.role === 'admin' ? "Remove Admin Role" : "Make Admin"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}