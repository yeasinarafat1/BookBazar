import { pgTable, uuid, text, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./user"; 
import { booksTable } from "./book"; 

// 1. Updated Enums
export const reportTypeEnum = pgEnum('report_type', ['user', 'book', 'other']);

// Updated to match your UI dropdown exactly
export const reportStatusEnum = pgEnum('report_status', [
  'pending', 
  'reviewing', 
  'in_progress', 
  'almost_done', 
  'resolved', 
  'dismissed'
]);

// 2. Main Reports Table
export const reportsTable = pgTable('reports', {
  id: uuid("id").primaryKey().defaultRandom(),
  
  reporterId: uuid("reporter_id")
    .notNull()
    .references(() => usersTable.id),

  type: reportTypeEnum("type").notNull(),
  reason: text("reason").notNull(),

  targetUserIds: uuid("target_user_ids").array(), 
  targetBookIds: uuid("target_book_ids").array(),
  evidenceImages: text("evidence_images").array(),

  status: reportStatusEnum("status").default('pending').notNull(),

  // NEW: Internal notes for admins (from your screenshot)
  adminNotes: text("admin_notes"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 3. NEW: Report Messages Table (For Admin Questions & User Replies)
// This allows a back-and-forth conversation rather than just a single question/answer
export const reportMessagesTable = pgTable('report_messages', {
  id: uuid("id").primaryKey().defaultRandom(),
  
  reportId: uuid("report_id")
    .notNull()
    .references(() => reportsTable.id, { onDelete: 'cascade' }),
    
  senderId: uuid("sender_id")
    .notNull()
    .references(() => usersTable.id),

  message: text("message").notNull(),

  // Easy way to style admin messages differently from user replies in the UI
  isAdmin: boolean("is_admin").default(false).notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 4. Define Relations (Crucial for fetching a report with its messages easily)
export const reportsRelations = relations(reportsTable, ({ one, many }) => ({
  reporter: one(usersTable, {
    fields: [reportsTable.reporterId],
    references: [usersTable.id],
  }),
  messages: many(reportMessagesTable),
}));

export const reportMessagesRelations = relations(reportMessagesTable, ({ one }) => ({
  report: one(reportsTable, {
    fields: [reportMessagesTable.reportId],
    references: [reportsTable.id],
  }),
  sender: one(usersTable, {
    fields: [reportMessagesTable.senderId],
    references: [usersTable.id],
  }),
}));

// Types
export type InsertReport = typeof reportsTable.$inferInsert;
export type ReportType = typeof reportsTable.$inferSelect;
export type InsertReportMessage = typeof reportMessagesTable.$inferInsert;
export type SelectReportMessage = typeof reportMessagesTable.$inferSelect;