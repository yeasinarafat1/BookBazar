import { integer,boolean, pgTable, text, timestamp, uuid, varchar, pgEnum } from 'drizzle-orm/pg-core';

// You can still keep these arrays for your App logic/validation if needed
export const REQUEST_STATUS = ['verified', 'pending', 'rejected'] as const;
export const verification_request_status_enum = pgEnum('verification_request_status', REQUEST_STATUS);

export const profileVerificationRequestTable = pgTable('profile_verifiacation_table', {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerkId", { length: 255 }).notNull(),
  
  // CHANGED: Enum -> Text
  verificationStatus: verification_request_status_enum("verification_request_status").default("pending"),
  
  name: text('name').notNull(),
  profile_pic: text('profile_pic').notNull(),
  document_pic: text('document_pic').notNull(),
  rollNo: varchar("roll_no", { length: 6 }).notNull(),
  regNo: varchar("reg_no", { length: 10 }).notNull(),
  semester: varchar("semester", { length: 10 }).notNull(),
  shift: varchar("shift", { length: 100 }).notNull(),
  department: varchar("department", { length: 100 }).notNull(),
  phoneNo: varchar("phone_no", { length: 50 }).notNull(),
  admin_feedback:varchar("admin_feedback", { length: 500 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


// Types for Books



export type InsertVerificationRequest= typeof profileVerificationRequestTable.$inferInsert;
export type VerificationRequest= typeof profileVerificationRequestTable.$inferSelect;