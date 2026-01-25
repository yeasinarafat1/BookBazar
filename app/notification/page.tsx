import { getUserNotifications } from "@/lib/action/notification";
import NotificationList from "./client"; // Adjust path to where you saved the file above

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  // 1. Fetch real data from DB
  const notifications = await getUserNotifications();

  // 2. Pass to client component
  return <NotificationList initialData={notifications} />;
}