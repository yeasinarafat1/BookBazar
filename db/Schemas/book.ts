import { pgTable, uuid, varchar, text, integer, boolean, timestamp, pgEnum, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./user"; 

export const statusEnum = pgEnum('book_status_enum', ['pending', 'approved', 'rejected']);

export const booksTable = pgTable('books_table', {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text('slug').unique().notNull(),
  
  sellerId: uuid("seller_id")
    .notNull()
    .references(() => usersTable.id), 
    
  sellerName: varchar("seller_name", { length: 255 }).notNull(),
  sellerWhatsapp: varchar("seller_whatsapp", { length: 20 }).notNull(),
  sellerPhone: varchar("seller_phone", { length: 20 }),
  title: text('title').notNull(),
  author: text('author').notNull(),
  images: text('images').array().notNull(),
  category: text('category').notNull(),
  condition: text('condition').notNull(),
  price: integer('price').notNull(),
  semester: varchar('semester', { length: 50 }),
  location: text('location').notNull(),
  description: text('description'),
  status: statusEnum('status').default('pending').notNull(),
  isSold: boolean('is_sold').default(false).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    // 1. Search Indexes (for Title & Author lookups)
    titleIdx: index("title_idx").on(table.title),
    authorIdx: index("author_idx").on(table.author),

    // 2. Filter Indexes (for Category & Semester sidebars)
    categoryIdx: index("category_idx").on(table.category),
    semesterIdx: index("semester_idx").on(table.semester),

    // 3. Status Index (CRITICAL)
    // Most queries will filter "WHERE status = 'approved' AND is_sold = false"
    // This composite index makes that base filter instant.
    statusSoldIdx: index("status_sold_idx").on(table.status, table.isSold),
  }
});

export const booksRelations = relations(booksTable, ({ one }) => ({
  seller: one(usersTable, {
    fields: [booksTable.sellerId],
    references: [usersTable.id], 
  }),
}));

export type InsertBook = typeof booksTable.$inferInsert;
export type Book = typeof booksTable.$inferSelect;