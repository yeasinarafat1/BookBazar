"use server";

import { db } from "@/db/drizzle";
import { reviewTable, contractsTable, usersTable } from "@/db/schema"; 
import { eq, and, desc, sql } from "drizzle-orm";
import { getLoggedInUser } from "./user";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification";

export const addReview = async (contractId: string, rating: number, feedback: string) => {
  try {
    // 1. Authenticate User
    const { user } = await getLoggedInUser();
    
    if (!user) {
      return { success: false, message: "You must be logged in." };
    }

    // 2. Verify Contract & Eligibility
    // Check if contract exists, user is the buyer, and status is completed
    const [contract] = await db
        .select()
        .from(contractsTable)
        .where(eq(contractsTable.id, contractId));

    if (!contract) {
        return { success: false, message: "Contract not found." };
    }

    if (contract.buyerId !== user.id) {
        return { success: false, message: "You are not authorized to review this purchase." };
    }

    if (contract.status !== 'completed') {
         return { success: false, message: "Transaction must be completed before reviewing." };
    }

    // 3. Check for Existing Review (Prevent Duplicates)
    const [existingReview] = await db
      .select()
      .from(reviewTable)
      .where(
        and(
          eq(reviewTable.contractId, contractId),
          eq(reviewTable.userId, user.id)
        )
      );

    if (existingReview) {
      return { success: false, message: "You have already reviewed this order." };
    }

    // 4. Insert Review
    await db.insert(reviewTable).values({
      userId: user.id,
      contractId,
      rating,
      feedback,
    });
    await db.update(contractsTable)
      .set({ isReviewed: true })
      .where(eq(contractsTable.id, contractId));
    await createNotification({
      userId: contract.sellerId, 
      type: "system_alert", 
      title: "New Review Received! ⭐",
      message: `A buyer gave you a ${rating}-star rating for your transaction.`,
      // 👇 UPDATED LINK: Points to the specific contract page
      link: `/contract/checkout?contractId=${contractId}`, 
      resourceId: contractId,
    });
    // 5. Revalidate Cache
    // Update the checkout page (if you show the review there) and potentially the seller's profile
    revalidatePath(`/contract/checkout`); 
    revalidatePath(`/profile/${contract.sellerId}`); 
    
    return { success: true, message: "Review submitted successfully!" };

  } catch (error) {
    console.error("Error adding review:", error);
    return { success: false, message: "Failed to submit review." };
  }
};


export const getAverageRating = async (userId: string) => {
  try {
    const result = await db
      .select({
        average: sql<number>`avg(${reviewTable.rating})`,
        count: sql<number>`count(${reviewTable.id})`,
      })
      .from(reviewTable)
      .innerJoin(contractsTable, eq(reviewTable.contractId, contractsTable.id))
      .where(eq(contractsTable.sellerId, userId));

    const stats = result[0];
    
    // Handle null result (no reviews yet)
    const average = stats.average ? parseFloat(Number(stats.average).toFixed(1)) : 0;
    const count = Number(stats.count || 0);

    return { 
      success: true, 
      data: { average, count } 
    };
  } catch (error) {
    console.error("Error fetching average rating:", error);
    return { success: false, data: { average: 0, count: 0 } };
  }
};

/**
 * 2. Get All Reviews for a Seller
 * Fetches the actual review content and reviewer details
 */
export const getUserReviews = async (userId: string) => {
  try {
    const reviews = await db
      .select({
        id: reviewTable.id,
        rating: reviewTable.rating,
        feedback: reviewTable.feedback,
        createdAt: reviewTable.createdAt,
        reviewer: {
          id: usersTable.id,
          name: usersTable.name,
          profilePic: usersTable.profile_pic,
        }
      })
      .from(reviewTable)
      .innerJoin(contractsTable, eq(reviewTable.contractId, contractsTable.id))
      .innerJoin(usersTable, eq(reviewTable.userId, usersTable.id)) // Get Reviewer Info
      .where(eq(contractsTable.sellerId, userId))
      .orderBy(desc(reviewTable.createdAt));

    return { success: true, data: reviews };
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return { success: false, data: [] };
  }
};