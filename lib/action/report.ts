"use server";

import { db } from "@/db/drizzle";
import { reportMessagesTable, reportsTable, usersTable } from "@/db/schema"; 
import { booksTable } from "@/db/schema"; 
import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { getLoggedInUser } from "./user";
import { uploadImage } from "./upload";
import { createNotification } from "./notification";

/**
 * 1. Search Users
 * Returns: id, username, profile_pic, name
 */
export const searchUsers = async (query: string) => {
  try {
    // If query is empty, return empty array or top 10 recent users
    if (!query) return [];

    const users = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        profile_pic: usersTable.profile_pic, // Maps to DB column 'profile_pic'
        name: usersTable.name,
      })
      .from(usersTable)
      .where(
        or(
          ilike(usersTable.name, `%${query}%`),
          ilike(usersTable.username, `%${query}%`)
        )
      )
      .limit(10); // Limit results for performance

    return users;

  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
};

/**
 * 2. Search Books
 * Returns: id, title, cover_pic, slug
 */
export const searchBooks = async (query: string) => {
  try {
    if (!query) return [];

    const books = await db
      .select({
        id: booksTable.id,
        title: booksTable.title,
        slug: booksTable.slug,
        // Assuming 'images' is an array column in your DB
        images: booksTable.images, 
      })
      .from(booksTable)
      .where(ilike(booksTable.title, `%${query}%`))
      .limit(10);

    // Map the result to match the requested 'cover_pic' structure
    // We take the first image from the array as the cover
    const formattedBooks = books.map((book) => ({
      id: book.id,
      title: book.title,
      slug: book.slug,
      cover_pic: book.images && book.images.length > 0 ? book.images[0] : null,
    }));

    return formattedBooks;

  } catch (error) {
    console.error("Error searching books:", error);
    return [];
  }
};


export const submitReport = async (formData: FormData) => {
  try {
    // 1. Authenticate User
    const { user } = await getLoggedInUser();
    
    if (!user) {
      return { success: false, message: "You must be logged in to submit a report." };
    }

    // 2. Extract Text Data
    const type = formData.get("type") as "user" | "book" | "other";
    const reason = formData.get("reason") as string;
    
    // 3. Parse Target IDs
    let targetUserIds: string[] = [];
    let targetBookIds: string[] = [];

    try {
      const userIdsRaw = formData.get("targetUserIds");
      const bookIdsRaw = formData.get("targetBookIds");
      
      if (userIdsRaw) targetUserIds = JSON.parse(userIdsRaw as string);
      if (bookIdsRaw) targetBookIds = JSON.parse(bookIdsRaw as string);
    } catch (e) {
      console.error("Error parsing target IDs", e);
      return { success: false, message: "Invalid data format." };
    }

    // 4. Handle Image Uploads using your existing action
    const rawFiles = formData.getAll("images") as File[];
    const evidenceImages: string[] = [];

    // Process uploads sequentially to ensure we don't overwhelm the connection
    // or use Promise.all if you prefer speed.
    const uploadPromises = rawFiles.map(async (file) => {
      // Skip empty files
      if (file.size === 0) return;

      // Create a new FormData for the single file expected by uploadImage
      const singleImageFormData = new FormData();
      singleImageFormData.append("file", file);

      try {
        const result = await uploadImage(singleImageFormData);
        if (result && result.url) {
          return result.url;
        }
      } catch (uploadError) {
        console.error("Failed to upload specific image:", uploadError);
        return null; 
      }
    });

    // Wait for all uploads to finish
    const results = await Promise.all(uploadPromises);
    
    // Filter out failed uploads (nulls) and undefined
    results.forEach((url) => {
      if (url) evidenceImages.push(url);
    });

    // 5. Save to Database
    await db.insert(reportsTable).values({
      reporterId: user.id,
      type,
      reason,
      // Store arrays if they have data, otherwise null
      targetUserIds: targetUserIds.length > 0 ? targetUserIds : null,
      targetBookIds: targetBookIds.length > 0 ? targetBookIds : null,
      evidenceImages: evidenceImages.length > 0 ? evidenceImages : null,
      status: 'pending' 
    });

    return { success: true, message: "Report submitted successfully." };

  } catch (error) {
    console.error("Server Action Error:", error);
    return { success: false, message: "Failed to submit report. Please try again later." };
  }
};



export const getAllReports = async () => {
  try {
    // 1. Authenticate
    const { user } = await getLoggedInUser();
    if (!user) {
      return { success: false, message: "Unauthorized", data: [] };
    }

    // 2. Fetch all reports and reporter details
    const reports = await db
      .select({
        id: reportsTable.id,
        type: reportsTable.type,
        reason: reportsTable.reason,
        status: reportsTable.status,
        targetUserIds: reportsTable.targetUserIds,
        targetBookIds: reportsTable.targetBookIds,
        evidenceImages: reportsTable.evidenceImages,
        adminNotes: reportsTable.adminNotes,
        createdAt: reportsTable.createdAt,
        reporter: {
          id: usersTable.id,
          name: usersTable.name,
          username: usersTable.username,
          profile_pic: usersTable.profile_pic,
        }
      })
      .from(reportsTable)
      .leftJoin(usersTable, eq(reportsTable.reporterId, usersTable.id))
      .orderBy(desc(reportsTable.createdAt));

    // 3. Extract unique IDs to fetch target details
    const userIdsToFetch = new Set<string>();
    const bookIdsToFetch = new Set<string>();

    reports.forEach((report) => {
      if (report.type === "user" && report.targetUserIds) {
        report.targetUserIds.forEach((id) => userIdsToFetch.add(id));
      }
      if (report.type === "book" && report.targetBookIds) {
        report.targetBookIds.forEach((id) => bookIdsToFetch.add(id));
      }
    });

    // 4. Fetch Target Users (if any)
    const targetUsersMap = new Map();
    if (userIdsToFetch.size > 0) {
      const targetUsers = await db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          username: usersTable.username,
          profile_pic: usersTable.profile_pic,
        })
        .from(usersTable)
        .where(inArray(usersTable.id, Array.from(userIdsToFetch)));

      targetUsers.forEach((u) => targetUsersMap.set(u.id, u));
    }

    // 5. Fetch Target Books (if any)
    const targetBooksMap = new Map();
    if (bookIdsToFetch.size > 0) {
      const targetBooks = await db
        .select({
          id: booksTable.id,
          title: booksTable.title,
          slug: booksTable.slug,
          images: booksTable.images,
        })
        .from(booksTable)
        .where(inArray(booksTable.id, Array.from(bookIdsToFetch)));

      targetBooks.forEach((b) => targetBooksMap.set(b.id, {
        id: b.id,
        name: b.title, // Mapping title to name as requested
        slug: b.slug,
        pic: b.images && b.images.length > 0 ? b.images[0] : null, // Grabbing first image
      }));
    }

    // 6. Map the fetched targets back to the reports
    const enrichedReports = reports.map((report) => {
      // Create base object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enriched: any = { ...report };

      // Attach users array if report type is user
      if (report.type === "user" && report.targetUserIds) {
        enriched.reportedUsers = report.targetUserIds
          .map((id) => targetUsersMap.get(id))
          .filter(Boolean); // Filter out any nulls if user was deleted
      }

      // Attach books array if report type is book
      if (report.type === "book" && report.targetBookIds) {
        enriched.reportedBooks = report.targetBookIds
          .map((id) => targetBooksMap.get(id))
          .filter(Boolean); // Filter out any nulls if book was deleted
      }

      return enriched;
    });

    return { 
      success: true, 
      data: enrichedReports 
    };

  } catch (error) {
    console.error("Error fetching all reports:", error);
    return { 
      success: false, 
      message: "Failed to fetch reports. Please try again.", 
      data: [] 
    };
  }
};


// --- FETCH MESSAGES ---
export const getReportMessages = async (reportId: string) => {
  try {
    const { user } = await getLoggedInUser();
    if (!user) return { success: false, message: "Unauthorized", data: [] };

    const messages = await db
      .select()
      .from(reportMessagesTable)
      .where(eq(reportMessagesTable.reportId, reportId))
      .orderBy(reportMessagesTable.createdAt); // Ascending for chat order

    return { success: true, data: messages };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { success: false, message: "Failed to fetch messages", data: [] };
  }
};

// --- SEND ADMIN MESSAGE ---
export const sendAdminMessage = async (userId: string, reportId: string, message: string) => {
  try {
    const { user } = await getLoggedInUser();
    if (!user) return { success: false, message: "Unauthorized" };

    await db.insert(reportMessagesTable).values({
      reportId,
      senderId: user.id,
      message,
      isAdmin: true, // Mark as admin message
    });
    await createNotification({
      userId: userId,
      type: "system_alert", // Adjust this to match your notificationTypeEnum if needed
      title: "Admin requested more info",
      message: "An admin has left a message regarding your recent report.",
      link: `/reports/details/${reportId}`,
      resourceId: reportId,
    });

    return { success: true, message: "Message sent" };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, message: "Failed to send message" };
  }
};

// --- UPDATE REPORT STATUS & NOTES ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateReportStatus = async (userId: string, reportId: string, status: any, adminNotes: string) => {
  try {
    const { user } = await getLoggedInUser();
    if (!user) return { success: false, message: "Unauthorized" };

    await db
      .update(reportsTable)
      .set({
        status,
        adminNotes: adminNotes || null,
        updatedAt: new Date(),
      })
      .where(eq(reportsTable.id, reportId));

      // Format the status for display (e.g. "in_progress" -> "In Progress")
      const formattedStatus = status.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      
      await createNotification({
        userId: userId,
        type: "system_alert", // Adjust to match your notificationTypeEnum
        title: "Report Status Updated",
        message: `Your report has been updated to: ${formattedStatus}.`,
        link: `/reports/details/${reportId}`,
        resourceId: reportId,
      });
    
    return { success: true, message: "Report updated successfully" };
  } catch (error) {
    console.error("Error updating report:", error);
    return { success: false, message: "Failed to update report" };
  }
};


export const getMyReports = async () => {
  try {
    // 1. Authenticate user
    const { user } = await getLoggedInUser();
    if (!user) {
      return { success: false, message: "Unauthorized", data: [] };
    }

    // 2. Fetch reports for THIS user only
    const reports = await db
      .select()
      .from(reportsTable)
      .where(eq(reportsTable.reporterId, user.id))
      .orderBy(desc(reportsTable.createdAt));

    // 3. Extract unique target IDs for hydration
    const userIdsToFetch = new Set<string>();
    const bookIdsToFetch = new Set<string>();

    reports.forEach((report) => {
      if (report.type === "user" && report.targetUserIds) {
        report.targetUserIds.forEach((id) => userIdsToFetch.add(id));
      }
      if (report.type === "book" && report.targetBookIds) {
        report.targetBookIds.forEach((id) => bookIdsToFetch.add(id));
      }
    });

    // 4. Fetch Target Users
    const targetUsersMap = new Map();
    if (userIdsToFetch.size > 0) {
      const targetUsers = await db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          username: usersTable.username,
          profile_pic: usersTable.profile_pic,
        })
        .from(usersTable)
        .where(inArray(usersTable.id, Array.from(userIdsToFetch)));

      targetUsers.forEach((u) => targetUsersMap.set(u.id, u));
    }

    // 5. Fetch Target Books
    const targetBooksMap = new Map();
    if (bookIdsToFetch.size > 0) {
      const targetBooks = await db
        .select({
          id: booksTable.id,
          title: booksTable.title,
          slug: booksTable.slug,
          images: booksTable.images,
        })
        .from(booksTable)
        .where(inArray(booksTable.id, Array.from(bookIdsToFetch)));

      targetBooks.forEach((b) => targetBooksMap.set(b.id, {
        id: b.id,
        name: b.title,
        slug: b.slug,
        pic: b.images && b.images.length > 0 ? b.images[0] : null,
      }));
    }

    // 6. Map everything together
    const enrichedReports = reports.map((report) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enriched: any = { ...report };

      if (report.type === "user" && report.targetUserIds) {
        enriched.reportedUsers = report.targetUserIds
          .map((id) => targetUsersMap.get(id))
          .filter(Boolean);
      }

      if (report.type === "book" && report.targetBookIds) {
        enriched.reportedBooks = report.targetBookIds
          .map((id) => targetBooksMap.get(id))
          .filter(Boolean);
      }

      return enriched;
    });

    return { success: true, data: enrichedReports };

  } catch (error) {
    console.error("Error fetching my reports:", error);
    return { success: false, message: "Failed to fetch reports", data: [] };
  }
};



// --- GET SINGLE REPORT BY ID ---
export const getReportById = async (reportId: string) => {
  try {
    const { user } = await getLoggedInUser();
    if (!user) return { success: false, message: "Unauthorized", data: null };

    // 1. Fetch the report
    const [report] = await db
      .select()
      .from(reportsTable)
      .where(
        and(
          eq(reportsTable.id, reportId),
          eq(reportsTable.reporterId, user.id) // Security check
        )
      )
      .limit(1);

    if (!report) return { success: false, message: "Report not found", data: null };

    // FIX: Safely extract arrays to guarantee they are never null for TypeScript
    const targetUserIds: string[] = report.targetUserIds || [];
    const targetBookIds: string[] = report.targetBookIds || [];

    // 2. Fetch Target Users (Using a ternary lets TS automatically infer the exact return type)
    const reportedUsers = targetUserIds.length > 0 
      ? await db
          .select({
            id: usersTable.id,
            name: usersTable.name,
            username: usersTable.username,
            email: usersTable.email,
            profile_pic: usersTable.profile_pic,
          })
          .from(usersTable)
          .where(inArray(usersTable.id, targetUserIds))
      : [];

    // 3. Fetch Target Books
    const books = targetBookIds.length > 0
      ? await db
          .select({
            id: booksTable.id,
            title: booksTable.title,
            slug: booksTable.slug,
            images: booksTable.images,
          })
          .from(booksTable)
          .where(inArray(booksTable.id, targetBookIds))
      : [];

    // Map the books to safely extract the first image
    const reportedBooks = books.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      pic: b.images && b.images.length > 0 ? b.images[0] : null
    }));

    return { 
      success: true, 
      data: {
        ...report,
        reportedUsers,
        reportedBooks
      } 
    };

  } catch (error) {
    console.error("Error fetching report:", error);
    return { success: false, message: "Failed to fetch report", data: null };
  }
};

// --- SEND USER REPLY ---
export const sendUserMessage = async (reportId: string, message: string) => {
  try {
    const { user } = await getLoggedInUser();
    if (!user) return { success: false, message: "Unauthorized" };

    // Security check: Make sure user owns the report they are replying to
    const [report] = await db
      .select({ id: reportsTable.id })
      .from(reportsTable)
      .where(
        and(
          eq(reportsTable.id, reportId),
          eq(reportsTable.reporterId, user.id)
        )
      )
      .limit(1);

    if (!report) return { success: false, message: "Unauthorized to reply to this report" };

    // Insert message
    await db.insert(reportMessagesTable).values({
      reportId: reportId,
      senderId: user.id,
      message: message,
      isAdmin: false, // Important: Mark as user reply
    });

    return { success: true, message: "Reply sent" };
  } catch (error) {
    console.error("Error sending user message:", error);
    return { success: false, message: "Failed to send reply" };
  }
};

