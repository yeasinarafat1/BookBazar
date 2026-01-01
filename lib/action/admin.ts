"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { profileVerificationRequestTable, usersTable } from "@/db/schema";
import { desc, eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

export const changeUserRole = async (userId: string, newRole: string) => {
  try {
    await db
      .update(usersTable)
      .set({ role: newRole })
      .where(eq(usersTable.id, userId));
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
export const updateVerificationRequestStatus=async (reqId:string, status:"pending"|"verified"|"rejected", adminNotes?:string)=>{
  try{
    if(status=="verified"){
      // On verification, update the user's isVerified status
      const request = await db
        .select({ clerkId: profileVerificationRequestTable.clerkId })
        .from(profileVerificationRequestTable)
        .where(eq(profileVerificationRequestTable.id, reqId))
        .limit(1);
      if(request.length===0) throw new Error("Request not found");
      const clerkId=request[0].clerkId;
      const resUser= await db.update(usersTable)
        .set({ verification_status: status })
        .where(eq(usersTable.clerkId, clerkId));
      if(!resUser) throw new Error("Failed to update user verification status");
    }
   const res= await db.update(profileVerificationRequestTable)
          .set({verificationStatus:status,admin_feedback:adminNotes})
          .where(eq(profileVerificationRequestTable.id,reqId))
    if(res) return true;
    else throw new Error()
  }catch(error){
    console.error("Error updating verification request status:", error);
    return false;
  }
}
