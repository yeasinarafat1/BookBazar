"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getLoggedInUser() {
  try {
    // 1. Check if user is logged in via Clerk
    const user = await currentUser();

    if (!user) {
      // User is not logged in
      return { isAuthenticated: false, user: null };
    }

    // 2. Query the database using the Clerk ID
    const dbUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, user.id))
      .limit(1);

    // 3. Return the result
    if (dbUser.length > 0) {
      return { isAuthenticated: true, user: dbUser[0] };
    } else {
      // User is logged in to Clerk, but record is missing in DB (Rare edge case)
      return { isAuthenticated: true, user: null };
    }

  } catch (error) {
    console.error("Error fetching user data:", error);
    return { isAuthenticated: false, user: null, error: "Database error" };
  }
}