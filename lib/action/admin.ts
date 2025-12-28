"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function checkIsAdmin() {
  try {
    // 1. Get current logged-in user
    const user = await currentUser();

    if (!user) {
      return { isAdmin: false, error: "Not logged in" };
    }

    // 2. Fetch user from DB
    const dbUser = await db
      .select({ role: usersTable.role }) // We only need the 'role' column
      .from(usersTable)
      .where(eq(usersTable.clerkId, user.id))
      .limit(1);
console.log("DB User Role Check:", dbUser);
    // 3. Check the role
    if (dbUser.length > 0 && dbUser[0].role === 'admin') {
      return { isAdmin: true };
    }

    return { isAdmin: false };

  } catch (error) {
    console.error("Error checking admin status:", error);
    return { isAdmin: false, error: "Database error" };
  }
}
export const getAllUsers = async () => {
  try {
    const users = await db.select().from(usersTable);
    return users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw new Error("Failed to fetch users");
  }
};

export const changeUserRole = async (userId: string, newRole: string) => {
  try {
    await db
      .update(usersTable)
      .set({ role: newRole })
      .where(eq(usersTable.id, userId));
  } catch (error) {
    console.error("Error changing user role:", error);
    throw new Error("Failed to change user role");
  }
};