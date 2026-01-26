import { pgTable, uuid, integer, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./user";

// Define the status enum
export const contractStatusEnum = pgEnum('contract_status', ['pending', 'completed', 'cancelled']);

export const contractsTable = pgTable('contracts_table', {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Seller: The user who created the contract
  sellerId: uuid("seller_id")
    .notNull()
    .references(() => usersTable.id),

  // Buyer: Initially NULL, populated when someone accepts the deal
  buyerId: uuid("buyer_id")
    .references(() => usersTable.id), 

  // Books: Array of Book UUIDs included in this deal
  bookIds: uuid("book_ids").array().notNull(), 

  // Final agreed price for the whole bundle
  price: integer("price").notNull(),

  status: contractStatusEnum("status").default('pending').notNull(),
  isReviewed:boolean("is_reviewed").default(false).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Define Relations
export const contractsRelations = relations(contractsTable, ({ one }) => ({
  seller: one(usersTable, {
    fields: [contractsTable.sellerId],
    references: [usersTable.id],
    relationName: "seller_contracts"
  }),
  buyer: one(usersTable, {
    fields: [contractsTable.buyerId],
    references: [usersTable.id],
    relationName: "buyer_contracts"
  }),
}));

export type InsertContract = typeof contractsTable.$inferInsert;
export type Contract = typeof contractsTable.$inferSelect;