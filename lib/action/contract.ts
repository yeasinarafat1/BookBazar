"use server";

import { db } from "@/db/drizzle";
import { contractsTable } from "@/db/Schemas/Contract";
import { booksTable } from "@/db/Schemas/book";
import { inArray, eq, getTableColumns } from "drizzle-orm";
import { usersTable } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { getLoggedInUser } from "./user";
import { createNotification } from "./notification";

export const createContract = async (sellerId: string, bookIds: string[], price: number) => {
  try {
    // 1. Basic Input Validation
    if (!sellerId) return { success: false, message: "Unauthorized: Missing seller ID" };
    if (!bookIds || bookIds.length === 0) return { success: false, message: "No books selected" };
    if (price < 0) return { success: false, message: "Price cannot be negative" };

    // Remove duplicate IDs to prevent DB errors
    const uniqueBookIds = Array.from(new Set(bookIds));

    // 2. Fetch the books from DB to verify them
    const books = await db
      .select()
      .from(booksTable)
      .where(inArray(booksTable.id, uniqueBookIds));

    // 3. Data Integrity Check: Did we find all the books?
    if (books.length !== uniqueBookIds.length) {
      return { success: false, message: "One or more selected books could not be found." };
    }

    // 4. Security & Logic Checks
    for (const book of books) {
      // Check A: Does this user own the book?
      if (book.sellerId !== sellerId) {
        return { success: false, message: `Security Alert: You do not own the book "${book.title}"` };
      }

      // Check B: Is the book already sold?
      if (book.isSold) {
        return { success: false, message: `The book "${book.title}" is already sold.` };
      }

      // Check C: Is the book approved?
      if (book.status !== 'approved') {
        return { success: false, message: `The book "${book.title}" is not approved for sale yet.` };
      }
    }

    // 5. Create the Contract
    const [newContract] = await db.insert(contractsTable).values({
      sellerId,
      bookIds: uniqueBookIds,
      price,
      status: 'pending'
    }).returning();

    return { 
      success: true, 
      message: "Contract created successfully", 
      contractId: newContract.id 
    };

  } catch (error) {
    console.error("Error creating contract:", error);
    return { 
      success: false, 
      message: "Failed to create contract. Please try again later." 
    };
  }
};


export const getContractById = async (contractId: string) => {
  try {
    // 1. Fetch Contract + Seller Details
    const contractResult = await db
      .select({
        ...getTableColumns(contractsTable),
        seller: {
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          username: usersTable.username,
          profilePic: usersTable.profile_pic,
          verificationStatus: usersTable.verification_status,
        }
      })
      .from(contractsTable)
      .leftJoin(usersTable, eq(contractsTable.sellerId, usersTable.id))
      .where(eq(contractsTable.id, contractId));

    const contract = contractResult[0];

    if (!contract) {
      return null;
    }

    // 2. Fetch the Book Details
    // We query the books table for any book whose ID is in the contract's bookIds array
    let books: typeof booksTable.$inferSelect[] = [];
    
    if (contract.bookIds && contract.bookIds.length > 0) {
      books = await db
        .select()
        .from(booksTable)
        .where(inArray(booksTable.id, contract.bookIds));
    }

    // 3. Combine and Return
    return {
      ...contract,
      books, // Now includes the array of full book objects
    };

  } catch (error) {
    console.error("Error fetching contract:", error);
    return null;
  }
};

export const acceptContract = async (contractId: string) => {
  try {
    // 1. Get the DB User (UUID)
    const { user } = await getLoggedInUser();
    const buyerId = user?.id;

    if (!buyerId) {
      return { success: false, message: "You must be logged in to purchase." };
    }

    // 2. Fetch the contract
    const [contract] = await db
      .select()
      .from(contractsTable)
      .where(eq(contractsTable.id, contractId));

    if (!contract) {
      return { success: false, message: "Contract not found." };
    }

    if (contract.status !== "pending") {
      return { success: false, message: "This contract is no longer available." };
    }

    if (contract.sellerId === buyerId) {
      return { success: false, message: "You cannot buy your own books." };
    }

    // 3. Perform Updates Sequentially (No Transaction for Neon HTTP)
    
    // A. Update Contract Status & Buyer
    await db
      .update(contractsTable)
      .set({ 
        buyerId: buyerId, 
        status: "completed",
        updatedAt: new Date() 
      })
      .where(eq(contractsTable.id, contractId));

    // B. Mark Books as Sold AND Set BuyerId
    if (contract.bookIds && contract.bookIds.length > 0) {
      await db
        .update(booksTable)
        .set({ 
            isSold: true,
            buyerId: buyerId // 👈 Added this line to link the buyer to the specific books
        })
        .where(inArray(booksTable.id, contract.bookIds));
    }
    
    await createNotification({
      userId: contract.sellerId, // Send to Seller
      type: "contract_accepted",
      title: "Order Confirmed! 💰",
      message: `Great news! A buyer has purchased your bundle for ৳${contract.price}. Please check details to arrange handover.`,
      link: `/contract/checkout?contractId=${contractId}`,
      resourceId: contractId,
    });

    // Optional: Notify the Buyer as well (so they have a record in their inbox)
    await createNotification({
      userId: buyerId, // Send to Buyer
      type: "contract_accepted",
      title: "Purchase Successful! 📚",
      message: `You successfully secured the bundle. Please contact the seller to pick up your books.`,
      link: `/contract/checkout?contractId=${contractId}`,
      resourceId: contractId,
    });
    revalidatePath("/contract/checkout");
    revalidatePath("/notifications");
    return { success: true, message: "Purchase successful!" };

  } catch (error: any) {
    console.error("Detailed Purchase Error:", error);
    
    return { 
      success: false, 
      message: error.message || "Database error occurred" 
    };
  }
};
export const cancelContract = async (contractId: string) => {
  try {
    const { user } = await getLoggedInUser();
    const userId=user?.id;

    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    // 1. Fetch Contract to verify ownership
    const contractResult = await db
      .select()
      .from(contractsTable)
      .where(eq(contractsTable.id, contractId));

    const contract = contractResult[0];

    if (!contract) {
      return { success: false, message: "Contract not found" };
    }

    // 2. Verify Seller Ownership
    if (contract.sellerId !== userId) {
      return { success: false, message: "You are not authorized to cancel this contract." };
    }

    // 3. Verify Status
    if (contract.status !== "pending") {
      return { success: false, message: "Cannot cancel a completed or already cancelled contract." };
    }

    // 4. Update Status
    await db
      .update(contractsTable)
      .set({ 
        status: "cancelled",
        updatedAt: new Date()
      })
      .where(eq(contractsTable.id, contractId));

    revalidatePath("/contract/checkout");
    return { success: true, message: "Contract cancelled successfully." };

  } catch (error) {
    console.error("Cancel error:", error);
    return { success: false, message: "Failed to cancel contract." };
  }
};