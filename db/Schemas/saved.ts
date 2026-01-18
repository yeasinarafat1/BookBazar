import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { booksTable } from "./book";
import { usersTable } from "./user";

export const savedTable = pgTable('saved_table', {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // FIXED: Changed back to varchar to match Clerk ID format
  // Referenced usersTable.clerkId (which must be unique)
  userId: varchar("user_id", { length: 255 })
    .notNull(), 

  bookId: uuid("book_id")
    .notNull()
    .references(() => booksTable.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const savedRelations = relations(savedTable, ({ one }) => ({
  book: one(booksTable, {
    fields: [savedTable.bookId],
    references: [booksTable.id],
  }),
  // Optional: Add relation to user if needed
  user: one(usersTable, {
    fields: [savedTable.userId],
    references: [usersTable.clerkId],
  }),
}));

export type InsertSaved = typeof savedTable.$inferInsert;
export type Saved = typeof savedTable.$inferSelect;