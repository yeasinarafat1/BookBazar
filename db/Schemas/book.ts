import { pgTable,uuid,varchar,text,integer,boolean,timestamp, pgEnum } from "drizzle-orm/pg-core";
export const statusEnum=pgEnum('book_status_enum', ['pending', 'approved', 'rejected']);
export const booksTable = pgTable('books_table', {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Link to the seller (assuming you use Clerk ID or User ID)
  sellerId: varchar("seller_id", { length: 255 }).notNull(), 
  sellerName:varchar("seller_name",{length:255}).notNull(),
  sellerWhatsapp:varchar("seller_whatsapp",{length:20}).notNull(),
  sellerPhone:varchar("seller_phone",{length:20}),
  title: text('title').notNull(),
  author: text('author').notNull(),
  

  images: text('images').array().notNull(), 
  
  category: text('category').notNull(), // e.g., 'engineering'
  condition: text('condition').notNull(), // e.g., 'new', 'good'
  
  price: integer('price').notNull(), // Storing price as an integer
  
  semester: varchar('semester', { length: 50 }), // Optional
  location: text('location').notNull(),
  description: text('description'),
  
  // Status management
  status: statusEnum('status').default('pending').notNull(), // pending, approved, rejected
  isSold: boolean('is_sold').default(false).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type InsertBook = typeof booksTable.$inferInsert;
export type Book = typeof booksTable.$inferSelect;