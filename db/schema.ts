
import { integer,boolean, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

// You can still keep these arrays for your App logic/validation if needed
export const ROLES = ['user', 'admin'] as const;
export const VERIFICATION_STATUS = ['verified', 'unverified'] as const;
export const REQUEST_STATUS = ['verified', 'pending', 'rejected'] as const;

export const usersTable = pgTable('users_table', {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerkId", { length: 255 }).notNull(),
  
  // CHANGED: Enum -> Text
  role: text('role').notNull().default('user'), 
  
  // CHANGED: Enum -> Text
  verification_status: text('profile_verification_status').default('unverified').notNull(),
  
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  profile_pic: text('profile_pic').notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const profileVerificationRequestTable = pgTable('profile_verifiacation_table', {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerkId", { length: 255 }).notNull(),
  
  // CHANGED: Enum -> Text
  verificationStatus: text("verification_request_status").default("pending"),
  
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
export const booksTable = pgTable('books_table', {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Link to the seller (assuming you use Clerk ID or User ID)
  sellerId: varchar("seller_id", { length: 255 }).notNull(), 
  
  title: text('title').notNull(),
  author: text('author').notNull(),
  
  // 🟢 HERE IS THE ARRAY OF STRINGS FIELD
  // In Postgres this becomes text[]
  images: text('images').array().notNull(), 
  
  category: text('category').notNull(), // e.g., 'engineering'
  condition: text('condition').notNull(), // e.g., 'new', 'good'
  
  price: integer('price').notNull(), // Storing price as an integer
  
  semester: varchar('semester', { length: 50 }), // Optional
  location: text('location').notNull(),
  description: text('description'),
  
  // Status management
  status: text('status').default('pending').notNull(), // pending, approved, rejected
  isSold: boolean('is_sold').default(false).notNull(),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Types for Books
export type InsertBook = typeof booksTable.$inferInsert;
export type Book = typeof booksTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;

export type InsertVerificationRequest= typeof profileVerificationRequestTable.$inferInsert;
export type VerificationRequest= typeof profileVerificationRequestTable.$inferSelect;

