import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, FileCheck, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { mockUsers, mockBooks, mockVerifications } from "@/constants";
import { getPendingVerificationCount, getUserAndVerfiedUserCount } from "@/lib/action/admin";

export default async function AdminOverviewPage() {
  const {userCount, verifiedUserCount} =await getUserAndVerfiedUserCount();
  const pendingVerificationCount = await getPendingVerificationCount();
  const stats = {
    totalUsers: mockUsers.length,
    verifiedUsers: mockUsers.filter((p) => p.is_verified).length,
    totalBooks: mockBooks.length,
    pendingBooks: mockBooks.filter((b) => b.status === "pending").length,
    approvedBooks: mockBooks.filter((b) => b.status === "approved").length,
    pendingVerifications: mockVerifications.filter((v) => v.status === "pending").length,
  };

  const statCards = [
    { title: "Total Users", value: userCount, icon: Users, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { title: "Verified Users", value: verifiedUserCount, icon: CheckCircle, color: "text-green-500", bgColor: "bg-green-500/10" },
    { title: "Total Books", value: stats.totalBooks, icon: BookOpen, color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { title: "Pending Books", value: stats.pendingBooks, icon: Clock, color: "text-orange-500", bgColor: "bg-orange-500/10" },
    { title: "Approved Books", value: stats.approvedBooks, icon: TrendingUp, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { title: "Pending Verifications", value: pendingVerificationCount, icon: FileCheck, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
        <p className="text-muted-foreground">Monitor your marketplace at a glance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}