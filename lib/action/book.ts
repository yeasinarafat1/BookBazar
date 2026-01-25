'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteImage, uploadImage } from "./upload";
import { booksTable, savedTable, usersTable } from "@/db/schema";
import { db } from "@/db/drizzle";
import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq, getTableColumns, gte, ilike, lte, or, SQL } from "drizzle-orm";
import { getPublicIdFromUrl } from "../utils";
import { getLoggedInUser } from "./user";
import { BookFilters } from "@/types";
import slugify from "slugify";
import { nanoid } from "nanoid";
import { createNotification } from "./notification";

export async function createListing(formData: FormData) {
  // 1. Authenticate User
  const {user} = await getLoggedInUser();
  const slugRaw = slugify(formData.get("title") as string, { lower: true, strict: true });
const uniqueSlug = `${slugRaw}-${nanoid(8)}`;
  
  if (!user) {
    throw new Error("You must be logged in to sell a book.");
  }

  // 2. Extract Data
  const title = formData.get("title") as string;
  const author = formData.get("author") as string;
  const whatsapp = formData.get("whatsapp") as string;
  const phone = formData.get("phone") as string;
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
      sellerId: user.id, 
      slug: uniqueSlug,
      sellerName: user.name || "Unknown Seller",
      sellerWhatsapp: whatsapp,
      sellerPhone: phone || null,
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
    // 1. Fetch the book FIRST to get the sellerId and title
    const bookResult = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.id, bookId))
      .limit(1);

    const book = bookResult[0];

    if (!book) {
      throw new Error("Book not found");
    }

    // 2. Update the status in Database
    await db
      .update(booksTable)
      .set({ status: newStatus as any }) 
      .where(eq(booksTable.id, bookId));

    // 3. 🎉 Send Notification based on status
    if (newStatus === 'approved') {
      await createNotification({
        userId: book.sellerId,
        type: 'book_approved',
        title: 'Book Approved! ✅',
        message: `Your listing "${book.title}" has been approved and is now live.`,
        link: `/book/${book.slug}`, // Link to the live book page
        resourceId: book.id,
      });
    } else if (newStatus === 'rejected') {
      await createNotification({
        userId: book.sellerId,
        type: 'book_rejected',
        title: 'Book Rejected ❌',
        message: `Your listing "${book.title}" was rejected. Please review our guidelines.`,
        resourceId: book.id,
      });
    }

    // 4. Refresh pages
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
export const getBookBySlug = async (slug: string) => {
  try {
    const result = await db
      .select({
        // 2. Use getTableColumns() instead of spreading the table directly
        ...getTableColumns(booksTable),
        
        // Your custom seller object
        seller: {
          id: usersTable.id,
          name: usersTable.name,
          username: usersTable.username,
          email: usersTable.email,
          whatsapp: booksTable.sellerWhatsapp,
          profilePic: usersTable.profile_pic,
          verificationStatus: usersTable.verification_status,
        }
      })
      .from(booksTable)
      .leftJoin(usersTable, eq(booksTable.sellerId, usersTable.id))
      .where(eq(booksTable.slug, slug));
      
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching book:", error);
    return null; 
  }
};

export const deleteBook = async (bookId: string) => {
  try {
    // A. Fetch the book first to get the images
    const book = await getBookById(bookId);

    if (!book) {
      throw new Error("Book not found");
    }

    // B. Delete images from Cloudinary (if any exist)
    if (book.images && book.images.length > 0) {
      // Create an array of delete promises
      const deletePromises = book.images.map((imageUrl) => {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) {
          return deleteImage(publicId);
        }
        return Promise.resolve(false);
      });

      // Execute all Cloudinary deletions in parallel
      // We use Promise.allSettled so one failure doesn't stop the others
      await Promise.allSettled(deletePromises);
    }

    // C. Delete the record from the Database
    await db.delete(booksTable).where(eq(booksTable.id, bookId));
    
    // D. Revalidate paths to update UI
    revalidatePath("/browse"); // Adjust to your main listing page
    revalidatePath("/admin/books"); // Adjust to your admin page

    return { success: true };

  } catch (error) {
    console.error("Error deleting book:", error);
    throw new Error("Failed to delete book");
  }
};

export const getVerifiedAndUnsoldBooks = async (filters?: BookFilters) => {
  try {
    // 2. Explicitly type this array as SQL[]
    const conditions: SQL[] = [
      eq(booksTable.status, "approved"),
      eq(booksTable.isSold, false),
    ];

    if (filters) {
      // 1. Search Query
      if (filters.searchQuery) {
        const searchStr = `%${filters.searchQuery}%`;
        conditions.push(
          or(
            ilike(booksTable.title, searchStr),
            ilike(booksTable.author, searchStr)
          )! // 3. The '!' assertion might be needed if TS thinks 'or' can return undefined
        );
      }

      // 2. Category
      if (filters.category) {
        conditions.push(eq(booksTable.category, filters.category));
      }

      // 3. Condition
      if (filters.condition) {
        conditions.push(eq(booksTable.condition, filters.condition));
      }

      // 4. Price Range
      if (filters.minPrice !== undefined) {
        conditions.push(gte(booksTable.price, filters.minPrice));
      }
      if (filters.maxPrice !== undefined) {
        conditions.push(lte(booksTable.price, filters.maxPrice));
      }

      // 5. Semester
      if (filters.semester !== undefined) {
        conditions.push(eq(booksTable.semester, filters.semester.toString()));
      }

      // 6. Featured
      if (filters.featured) {
        conditions.push(eq(booksTable.isFeatured, true));
      }
    }

    const books = await db
      .select()
      .from(booksTable)
      .where(and(...conditions,
          eq(booksTable.status, "approved"),
          eq(booksTable.isSold, false)
        ))
      .orderBy(desc(booksTable.createdAt));

    return books;
  } catch (error) {
    console.error("Error fetching verified books:", error);
    return [];
  }
};
export const toggleBookFeatured = async (bookId: string, currentStatus: boolean) => {
  try {
    await db
      .update(booksTable)
      .set({ isFeatured: !currentStatus })
      .where(eq(booksTable.id, bookId));
      
    revalidatePath("/admin/books"); // adjust path to where your table lives
    return { success: true };
  } catch (error) {
    console.error("Error toggling featured status:", error);
    return { success: false, error: "Failed to update featured status" };
  }
};
export const getFeaturedBooks = async (limit:number) => {
  try {
    const books = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.isFeatured, true))
      .limit(limit);
    return books;
  } catch (error) {
    console.error("Error fetching featured books:", error);
    throw new Error("Failed to fetch featured books");
  }
};
export const getRecentBooks = async (limit: number = 4) => {
  try {
    const books = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.status, "approved"))
      .orderBy(desc(booksTable.createdAt))
      .limit(limit);
    return books;
  } catch (error) {
    console.error("Error fetching recent books:", error);
    throw new Error("Failed to fetch recent books");
  }
};

export const getSellerUnsoldBooks = async (sellerId: string) => {
  try {
    const books = await db
      .select({
        id: booksTable.id,
        title: booksTable.title,
        price: booksTable.price,
        image: booksTable.images, // We need the first image for the thumbnail
      })
      .from(booksTable)
      .where(
        and(
          eq(booksTable.sellerId, sellerId),
          eq(booksTable.isSold, false),
          eq(booksTable.status, "approved") // Only show approved books
        )
      );

    return books.map(b => ({
      ...b,
      image: b.image[0] // Simplify to just one image
    }));
  } catch (error) {
    console.error("Error fetching seller inventory:", error);
    return [];
  }
};

export const getUserPurchasedBookIds = async (userId: string) => {
  try {
   const books = await db
      .select()
      .from(booksTable)
      .where(
        and(
          eq(booksTable.buyerId, userId),
          eq(booksTable.status, "approved")
        )
      )
      .orderBy(desc(booksTable.createdAt))
      
    return books;
  
  } catch (error) {
    console.error("Error fetching saved book IDs:", error);
    return [];
  }
};