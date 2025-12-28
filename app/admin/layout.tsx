import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkIsAdmin } from "@/lib/action/admin";
import { AdminHeader } from "@/components/AdminHeader";


export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 1. SECURITY CHECK (Server Side)
  const { isAdmin } = await checkIsAdmin();

  // 2. Access Denied State
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access the admin dashboard.
            </p>
          </div>

          <Button asChild className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 3. Render Dashboard (If Allowed)
  return (
    <div className="min-h-screen bg-muted/40">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}