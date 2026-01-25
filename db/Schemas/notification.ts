// db/schema.ts
import { pgTable, uuid, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./user"; // Adjust path if needed

// 1. Define all possible notification states
export const notificationTypeEnum = pgEnum('notification_type', [
  // User Identity States
  'verification_pending',
  'verification_approved',
  'verification_rejected',
  
  // Book Listing States
  'book_approved',
  'book_rejected',
  'book_sold',
  
  // Contract/Transaction States
  'contract_offer',      // When a buyer starts a checkout/contract
  'contract_accepted',   // When buyer confirms purchase
  'contract_cancelled',  // When seller cancels
  
  // System/General
  'system_alert'
]);

// 2. The Notifications Table
export const notificationsTable = pgTable('notifications', {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // The user receiving the notification
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  
  type: notificationTypeEnum("type").notNull(),
  
  title: text("title").notNull(),
  message: text("message").notNull(),
  
  // Link to redirect user when they click (e.g., "/contract/checkout?id=...")
  link: text("link"),
  
  // Optional: ID of the related entity (BookID or ContractID) for easier querying
  resourceId: uuid("resource_id"),
  
  isRead: boolean("is_read").default(false).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Types for TypeScript
export type InsertNotification = typeof notificationsTable.$inferInsert;
export type SelectNotification = typeof notificationsTable.$inferSelect;