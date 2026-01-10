'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadImage } from "./upload";
import { booksTable } from "@/db/schema";
import { db } from "@/db/drizzle";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function createListing(formData: FormData) {
  // 1. Authenticate User
  const user = await currentUser();
  
  if (!user) {
    throw new Error("You must be logged in to sell a book.");
  }

  // 2. Extract Data
  const title = formData.get("title") as string;
  const author = formData.get("author") as string;
  const category = formData.get("category") as string;
  const condition = formData.get("condition") as string;
  const price = formData.get("price") as string;
  const location = formData.get("location") as string;
  const description = formData.get("description") as string;
  const semester = formData.get("semester") as string;
  
  // Extract all files with the key 'images'
  const imageFiles = formData.getAll("images") as File[];

  if (!title || !author || !price || imageFiles.length === 0) {
    throw new Error("Missing required fields");
  }

  try {
    // 3. Upload Images to Cloudinary
    // We map over the files and use your existing uploadImage function
    const uploadPromises = imageFiles.map(async (file) => {
      const imageFormData = new FormData();
      imageFormData.append("file", file);
      
      const result = await uploadImage(imageFormData);
      return result?.url; // Return just the URL
    });

    // Wait for all uploads to finish
    const uploadedUrls = (await Promise.all(uploadPromises)).filter(
      (url): url is string => url !== undefined && url !== null
    );

    if (uploadedUrls.length === 0) {
      throw new Error("Failed to upload images");
    }

    // 4. Insert into Database
    await db.insert(booksTable).values({
      sellerId: user.id, // Using Clerk User ID
      title,
      author,
      category,
      condition,
      price: parseInt(price), // Convert string to integer
      location,
      description: description || null,
      semester: semester || null,
      images: uploadedUrls, // Storing array of strings
      status: "pending",
      isSold: false,
    });

    // 5. Revalidate Cache
    revalidatePath("/"); // Update home page
    revalidatePath("/browse"); // Update browse page

  } catch (error) {
    console.error("Create listing error:", error);
    throw new Error("Failed to create listing");
  }

  // 6. Redirect (must be outside try/catch)
  redirect("/");
}
export const getAllBooks = async () => {
  try {
    const books = await db.select().from(booksTable).orderBy(booksTable.createdAt);
    return books;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw new Error("Failed to fetch books");
  }
};
export const updateBookStatus = async (bookId: string, newStatus: string) => {
  try {
    await db
      .update(booksTable)
      .set({ status: newStatus })
      .where(eq(booksTable.id, bookId)); // 3. Correct usage: eq(column, value)

    // 4. Refresh pages so the UI updates immediately
    revalidatePath("/admin/books"); 
    revalidatePath("/browse");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating book status:", error);
    throw new Error("Failed to update book status");
  }
};
export const getUserBook = async (userId: string) => {
  try {
    const books = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.sellerId, userId));
    return books;
  } catch (error) {
    console.error("Error fetching user's books:", error);
    throw new Error("Failed to fetch user's books");
  }
};

export const getBookById = async (bookId: string) => {
  try {
    const book = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.id, bookId));
      
    return book[0] || null;
  } catch (error) {
    // If the query fails (e.g., invalid ID format), we treat it as "not found"
    return null; 
  }
};