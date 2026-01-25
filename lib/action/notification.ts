"use server";

import { db } from "@/db/drizzle";
import { notificationsTable, notificationTypeEnum } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { getLoggedInUser } from "./user";
import { and, desc, eq } from "drizzle-orm";

// Type definition for the input to ensure type safety
type CreateNotificationParams = {
  userId: string;
  type: (typeof notificationTypeEnum.enumValues)[number]; // distinct union of your enum values
  title: string;
  message: string;
  link?: string;
  resourceId?: string; // ID of the Book or Contract related to this notification
};

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  link,
  resourceId,
}: CreateNotificationParams) => {
  try {
    await db.insert(notificationsTable).values({
      userId,
      type,
      title,
      message,
      link,
      resourceId,
      isRead: false, // Default to unread
    });

    // Revalidate the notifications path so the user sees it immediately if they are on that page
    revalidatePath("/notifications"); 
    
    // Optional: Revalidate the root layout if you have a notification bell in the header
    // revalidatePath("/", "layout"); 

    return { success: true };
  } catch (error) {
    console.error("Failed to create notification:", error);
    // We generally don't want to throw an error here to the user, 
    // as a failed notification shouldn't break the main action (like buying a book).
    return { success: false, error: "Failed to create notification" };
  }
};


export const getUserNotifications = async () => {
  try {
    const { user } = await getLoggedInUser();
    
    if (!user) {
      return [];
    }

    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, user.id))
      .orderBy(desc(notificationsTable.createdAt));

    return notifications;

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

// 2. Mark a single notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.id, notificationId));
    
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error marking notification read:", error);
    return { success: false };
  }
};

// 3. Mark ALL notifications as read for the user
export const markAllNotificationsAsRead = async () => {
  try {
    const { user } = await getLoggedInUser();
    if (!user) return { success: false };

    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(
        and(
          eq(notificationsTable.userId, user.id),
          eq(notificationsTable.isRead, false) // Only update unread ones for efficiency
        )
      );
    
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error marking all read:", error);
    return { success: false };
  }
};

// 4. (Optional) Get unread count only - useful for the Bell icon badge
export const getUnreadNotificationCount = async () => {
  try {
    const { user } = await getLoggedInUser();
    if (!user) return 0;

    const notifications = await db
      .select({ id: notificationsTable.id })
      .from(notificationsTable)
      .where(
        and(
          eq(notificationsTable.userId, user.id),
          eq(notificationsTable.isRead, false)
        )
      );

    return notifications.length;
  } catch (error) {
    return 0;
  }
};