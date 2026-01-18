'use server'
import { db } from "@/db/drizzle";
import { booksTable, savedTable } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getLoggedInUser } from "./user";
import { revalidatePath } from "next/cache";

export const toggleSaveBook = async (bookId: string, pathToRevalidate?: string) => {
  const { user} = await getLoggedInUser();
  const userId = user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // 1. Check if the book is already saved by this user
    const existingSave = await db
      .select()
      .from(savedTable)
      .where(
        and(
          eq(savedTable.userId, userId),
          eq(savedTable.bookId, bookId)
        )
      )
      .limit(1);

    if (existingSave.length > 0) {
      // 2. If it exists, DELETE it (Unsave)
      await db
        .delete(savedTable)
        .where(
          and(
            eq(savedTable.userId, userId),
            eq(savedTable.bookId, bookId)
          )
        );
      
      if (pathToRevalidate) revalidatePath(pathToRevalidate);
      return { success: true, isSaved: false, message: "Removed from saved books" };
    } else {
      // 3. If it doesn't exist, INSERT it (Save)
      await db.insert(savedTable).values({
        userId: userId,
        bookId: bookId,
      });

      if (pathToRevalidate) revalidatePath(pathToRevalidate);
      return { success: true, isSaved: true, message: "Book saved successfully" };
    }

  } catch (error) {
    console.error("Error toggling save status:", error);
    return { success: false, error: "Failed to update saved status" };
  }
};

/**
 * Checks if a specific book is saved by the current user.
 * Useful for setting the initial state of the 'Heart' button.
 */
export const checkIsBookSaved = async (bookId: string) => {
  const { user } = await getLoggedInUser();
  const userId = user?.id;
  if (!userId) return false;

  const existingSave = await db
    .select()
    .from(savedTable)
    .where(
      and(
        eq(savedTable.userId, userId),
        eq(savedTable.bookId, bookId)
      )
    )
    .limit(1);

  return existingSave.length > 0;
};

export const getSavedBooks = async () => {
   const { user } = await getLoggedInUser();
  const userId = user?.id;

  if (!userId) {
    return [];
  }

  try {
    // Perform a join to get the book details for every saved record
    const result = await db
      .select()
      .from(savedTable)
      .innerJoin(booksTable, eq(savedTable.bookId, booksTable.id))
      .where(eq(savedTable.userId, userId))
      .orderBy(desc(savedTable.createdAt)); // Show recently saved first

    // The result comes back as [{ saved_table: {...}, books_table: {...} }]
    // We map it to return just the book data so it fits your BookCard component
    return result.map((row) => row.books_table);
    
  } catch (error) {
    console.error("Error fetching saved books:", error);
    return [];
  }
};
