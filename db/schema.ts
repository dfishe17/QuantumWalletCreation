import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  isDeveloper: boolean("is_developer").default(false).notNull(),
  developerProfile: jsonb("developer_profile"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const developerKeys = pgTable("developer_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  apiKey: text("api_key").unique().notNull(),
  name: text("name").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  chain: text("chain").notNull(),
  address: text("address").notNull(),
  mnemonic: text("mnemonic").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  wallets: many(wallets),
  developerKeys: many(developerKeys),
}));

export const walletsRelations = relations(wallets, ({ one }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
}));

export const developerKeysRelations = relations(developerKeys, ({ one }) => ({
  user: one(users, {
    fields: [developerKeys.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertWalletSchema = createInsertSchema(wallets);
export const selectWalletSchema = createSelectSchema(wallets);
export const insertDeveloperKeySchema = createInsertSchema(developerKeys);
export const selectDeveloperKeySchema = createSelectSchema(developerKeys);

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;
export type SelectWallet = typeof wallets.$inferSelect;
export type InsertDeveloperKey = typeof developerKeys.$inferInsert;
export type SelectDeveloperKey = typeof developerKeys.$inferSelect;