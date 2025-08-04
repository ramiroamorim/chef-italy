import { pgTable, text, serial, integer, boolean, uuid, varchar, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const visitors = pgTable("visitors", {
  id: uuid("id").defaultRandom().primaryKey(),
  session_id: varchar("session_id", { length: 255 }).notNull().unique(),
  ip: varchar("ip", { length: 45 }),
  country: varchar("country", { length: 100 }),
  country_code: varchar("country_code", { length: 2 }),
  city: varchar("city", { length: 100 }),
  region_name: varchar("region_name", { length: 100 }),
  zip: varchar("zip", { length: 20 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  timezone: varchar("timezone", { length: 50 }),
  currency: varchar("currency", { length: 3 }),
  isp: varchar("isp", { length: 255 }),
  user_agent: text("user_agent"),
  page_url: text("page_url"),
  referrer: text("referrer"),
  utm_source: varchar("utm_source", { length: 255 }),
  utm_medium: varchar("utm_medium", { length: 255 }),
  utm_campaign: varchar("utm_campaign", { length: 255 }),
  utm_content: varchar("utm_content", { length: 255 }),
  utm_term: varchar("utm_term", { length: 255 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const facebookEvents = pgTable("facebook_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  event_type: varchar("event_type", { length: 50 }).notNull(),
  event_id: varchar("event_id", { length: 255 }).notNull().unique(),
  session_id: varchar("session_id", { length: 255 }).notNull(),
  custom_parameters: jsonb("custom_parameters").notNull().default('{}'),
  original_data: jsonb("original_data").notNull().default('{}'),
  formatted_data: jsonb("formatted_data").default('{}'),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertVisitorSchema = createInsertSchema(visitors);
export const insertFacebookEventSchema = createInsertSchema(facebookEvents);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertVisitor = z.infer<typeof insertVisitorSchema>;
export type Visitor = typeof visitors.$inferSelect;
export type InsertFacebookEvent = z.infer<typeof insertFacebookEventSchema>;
export type FacebookEvent = typeof facebookEvents.$inferSelect;
