import { uuid,pgEnum, pgTable,varchar,text,timestamp } from "drizzle-orm/pg-core";
export const VERIFICATION_STATUS = ['verified', 'unverified'] as const;
export const ROLES = ['user', 'admin'] as const;

export const roles_enum = pgEnum('roles_enum', ROLES);

export const profile_verification_status = pgEnum('profile_verification_status', VERIFICATION_STATUS);

export const usersTable = pgTable('users_table', {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerkId", { length: 255 }).notNull(),
  
  // CHANGED: Enum -> Text
  role: roles_enum('role').notNull().default('user'), 
  
  // CHANGED: Enum -> Text
  verification_status: profile_verification_status('profile_verification_status').default('unverified').notNull(),
  
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  username: text('username').unique(),
  profile_pic: text('profile_pic').notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type InsertUser = typeof usersTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;