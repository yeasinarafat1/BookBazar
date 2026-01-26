import { integer, pgTable,timestamp,uuid, varchar } from "drizzle-orm/pg-core";
import { contractsTable, usersTable } from "../schema";

export const reviewTable = pgTable('reviews', {
  id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => usersTable.id).notNull(),
    contractId: uuid("contract_id").references(() => contractsTable.id).notNull(),
    rating: integer("rating").notNull(),
    feedback: varchar("feedback", { length: 1000 }).notNull(),
    
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type InsertReview = typeof reviewTable.$inferInsert;
export type Review = typeof reviewTable.$inferSelect;