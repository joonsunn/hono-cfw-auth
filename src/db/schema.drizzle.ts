// db/schema.ts
import { relations } from "drizzle-orm";
import { pgTable, text, uuid, date, pgEnum } from "drizzle-orm/pg-core";

export enum ROLE {
  USER = "USER",
  ADMIN = "ADMIN",
}

export const ROLE_PG = pgEnum("role", ["USER", "ADMIN"]);

export const users = pgTable("User", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  hashedPassword: text().notNull(),
  role: ROLE_PG("role").notNull(),
});

export const tokens = pgTable("Token", {
  id: uuid("id").primaryKey(),
  createdAt: date().notNull().defaultNow(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

// Define relationships for Drizzle ORM
export const usersRelations = relations(users, ({ many }) => ({
  tokens: many(tokens),
}));

export const tokensRelations = relations(tokens, ({ one }) => ({
  user: one(users, {
    fields: [tokens.userId],
    references: [users.id],
  }),
}));

export const schema = {
  users,
  tokens,
  usersRelations,
  tokensRelations,
};
