"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { profileVerificationRequestTable, usersTable } from "@/db/schema";
import { count, desc, eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { deleteImage } from "./upload";
import { get } from "http";
import { getPublicIdFromUrl } from "../utils";
import { createNotification } from "./notification";

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
export const getAllUsers = async (query?: string) => {
  try {
    // 2. If a query exists, filter by name OR email
    if (query) {
      return await db
        .select()
        .from(usersTable)
        .where(
          or(
            // ilike performs a case-insensitive search
            ilike(usersTable.name, `%${query}%`),
            ilike(usersTable.email, `%${query}%`)
          )
        );
    }

    // 3. If no query, return all users as before
    const users = await db.select().from(usersTable);
    return users;
    
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
};

export const changeUserRole = async (userId: string, newRole: "user" | "admin") => {
  try {
    await db
      .update(usersTable)
      .set({ role: newRole })
      .where(eq(usersTable.id, userId));
    await createNotification({
      userId: userId,
      type: "system_alert",
      title: "Role Updated",
      message: `Your account role has been updated to '${newRole}'.`,
    });
    revalidatePath('/notification');
    revalidatePath('/admin/users'); // Revalidate the users page to reflect changes
  } catch (error) {
    console.error("Error changing user role:", error);
    throw new Error("Failed to change user role");
  }
};

export const newVerficationRequest = async (formData: {
  avatarUrl: string | null | undefined; // This type is fine
  documentUrl: string;
  full_name: string;
  roll_number: string;
  registration_number: string;
  department: string;
  shift: string;
  semester: string;
  phone: string;
}) => {
  const user = await currentUser();
  
  if (!user) {
    throw new Error("Not logged in");
  }

  try {
    await db.insert(profileVerificationRequestTable).values({
      clerkId: user.id,
      
 
      profile_pic: formData.avatarUrl || user.imageUrl, 
      
      document_pic: formData.documentUrl,
      name: formData.full_name,
      rollNo: formData.roll_number,
      regNo: formData.registration_number,
      department: formData.department,
      shift: formData.shift,
      semester: formData.semester,
      verificationStatus: 'pending',
      phoneNo: formData.phone,
    });

  } catch (error) {
    console.error("Error creating verification request:", error);
    throw new Error("Failed to create verification request");
  }
}
export const getVerificationRequest = async () => {
  const user = await currentUser();
  
  if (!user) return null;

  try {
    // Get the most recent request
    const request = await db
      .select()
      .from(profileVerificationRequestTable)
      .where(eq(profileVerificationRequestTable.clerkId, user.id))
      .orderBy(desc(profileVerificationRequestTable.createdAt))
      .limit(1);

    if (request.length > 0) {
      return request[0];
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching verification status:", error);
    return null;
  }
};
export const getAllVerificationRequests = async () => {
   try {
    
    const request = await db
      .select()
      .from(profileVerificationRequestTable)
      .orderBy(desc(profileVerificationRequestTable.createdAt))
      

    if (request.length > 0) {
      return request;
    }
    
    return null;
  }catch(error){

  }
}
export const updateVerificationRequestStatus = async (
  reqId: string, 
  status: "pending" | "verified" | "rejected", 
  adminNotes?: string
) => {
  try {
    // 1. Fetch request to get clerkId
    const request = await db
      .select({ clerkId: profileVerificationRequestTable.clerkId })
      .from(profileVerificationRequestTable)
      .where(eq(profileVerificationRequestTable.id, reqId))
      .limit(1);

    if (request.length === 0) throw new Error("Request not found");
    const clerkId = request[0].clerkId;

    // 2. Fetch User UUID (Required for Notification Table)
    const userResult = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.clerkId, clerkId))
      .limit(1);
    
    const userUuid = userResult[0]?.id;

    // 3. Perform Updates
    if (status == "verified") {
      const resUser = await db.update(usersTable)
        .set({ verification_status: status })
        .where(eq(usersTable.clerkId, clerkId));
      if (!resUser) throw new Error("Failed to update user verification status");
    }

    const res = await db.update(profileVerificationRequestTable)
      .set({ verificationStatus: status, admin_feedback: adminNotes })
      .where(eq(profileVerificationRequestTable.id, reqId));

    // 4. 🎉 Send Notification based on Status
    if (res && userUuid) {
      if (status === "verified") {
        await createNotification({
          userId: userUuid,
          type: "verification_approved",
          title: "Verification Approved! 🎉",
          message: "Your student profile has been verified. You can now fully utilize the platform.",
          link: "/profile",
        });
      } else if (status === "rejected") {
        await createNotification({
          userId: userUuid,
          type: "verification_rejected",
          title: "Verification Rejected",
          message: `Your verification request was rejected.${adminNotes ? ` Reason: ${adminNotes}` : ' Please check your details and try again.'}`,
          link: "/profile/verify", // Direct them to re-apply
        });
      }
    }

    if (res) return true;
    else throw new Error();

  } catch (error) {
    console.error("Error updating verification request status:", error);
    return false;
  }
};


export const getUserAndVerfiedUserCount = async () => {
  try {
    const userPromise = db
      .select({ count: count() })
      .from(usersTable);

    const verifiedUserPromise = db
      .select({ count: count() })
      .from(usersTable)
      .where(eq(usersTable.verification_status, "verified"));

    const [userCount, verifiedUserCount] = await Promise.all([
      userPromise,
      verifiedUserPromise,
    ]);

    return {
      userCount: userCount[0].count,
      verifiedUserCount: verifiedUserCount[0].count,
    };
  } catch (error) {
    console.error("Error fetching user and verified user counts:", error);
    throw new Error("Failed to fetch user and verified user counts");
  }
};
export const getPendingVerificationCount = async () => {
  try {
    const pendingVerificationCount = await db
      .select({ count: count() })
      .from(profileVerificationRequestTable)
      .where(eq(profileVerificationRequestTable.verificationStatus, "pending"));

    return pendingVerificationCount[0].count;
  } catch (error) {
    console.error("Error fetching pending verification count:", error);
    throw new Error("Failed to fetch pending verification count");
  }
};

export const deleteVerificationRequest = async (reqId: string) => {
  try {
    await db
      .delete(profileVerificationRequestTable)
      .where(eq(profileVerificationRequestTable.id, reqId));
  } catch (error) {
    console.error("Error deleting verification request:", error);
    throw new Error("Failed to delete verification request");
  }
};
export const reSubmitVerificationRequest = async (reqId: string) => {
  try {
    // FIX 1: Use db.select() instead of db.query() to avoid schema errors
    const requests = await db
      .select()
      .from(profileVerificationRequestTable)
      .where(eq(profileVerificationRequestTable.id, reqId))
      .limit(1);

    const request = requests[0];

    if (request) {
      // FIX 2: Check for null BEFORE calling deleteImage
      
      // Handle Profile Picture
      const profilePicId = getPublicIdFromUrl(request.profile_pic || "");
      if (profilePicId) {
        await deleteImage(profilePicId);
      }

      // Handle Document Picture
      const docPicId = getPublicIdFromUrl(request.document_pic || "");
      if (docPicId) {
        await deleteImage(docPicId);
      }
      
      // Finally, delete the request from the database
      await deleteVerificationRequest(reqId);
      
      revalidatePath('/profile/verify');
    }
  } catch (error) {
    console.error("Error resubmitting verification request:", error);
    throw new Error("Failed to resubmit verification request");
  }
};