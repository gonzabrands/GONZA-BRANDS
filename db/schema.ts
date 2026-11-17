import { boolean, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), email: text("email").notNull(),
  role: text("role", { enum: ["designer", "business"] }).notNull(),
  name: text("name").notNull(), title: text("title").notNull().default(""),
  bio: text("bio").notNull().default(""), location: text("location").notNull().default(""),
  website: text("website").notNull().default(""), skills: text("skills").notNull().default(""),
  services: text("services").notNull().default(""), experience: numeric("experience", { mode: "number" }).notNull().default(0),
  startingPrice: numeric("starting_price", { mode: "number" }).notNull().default(0),
  industry: text("industry").notNull().default(""), phone: text("phone").notNull().default(""),
  openToProposals: boolean("open_to_proposals").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const legacyGoogleAccounts = pgTable("legacy_google_accounts", {
  accountId: text("account_id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id),
});

export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(), businessId: text("business_id").notNull().references(() => users.id),
  title: text("title").notNull(), description: text("description").notNull(),
  service: text("service").notNull(), skills: text("skills").notNull().default(""),
  budget: numeric("budget", { mode: "number" }).notNull(), deadline: text("deadline").notNull(),
  attachment: text("attachment").notNull().default(""), status: text("status").notNull().default("Open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const proposals = pgTable("proposals", {
  id: text("id").primaryKey(), jobId: text("job_id").notNull().references(() => jobs.id),
  designerId: text("designer_id").notNull().references(() => users.id),
  amount: numeric("amount", { mode: "number" }).notNull(), deliveryDays: numeric("delivery_days", { mode: "number" }).notNull(),
  message: text("message").notNull(), attachment: text("attachment").notNull().default(""),
  status: text("status").notNull().default("Submitted"), createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey(), jobId: text("job_id").references(() => jobs.id),
  businessId: text("business_id").notNull().references(() => users.id),
  designerId: text("designer_id").notNull().references(() => users.id),
  title: text("title").notNull(), amount: numeric("amount", { mode: "number" }).notNull(),
  deadline: text("deadline").notNull(), status: text("status").notNull().default("Not Started"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(), senderId: text("sender_id").notNull().references(() => users.id),
  recipientId: text("recipient_id").notNull().references(() => users.id),
  projectId: text("project_id").references(() => projects.id), jobId: text("job_id").references(() => jobs.id),
  body: text("body").notNull(), attachment: text("attachment").notNull().default(""),
  readAt: timestamp("read_at", { withTimezone: true }), createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const portfolio = pgTable("portfolio", {
  id: text("id").primaryKey(), designerId: text("designer_id").notNull().references(() => users.id),
  title: text("title").notNull(), description: text("description").notNull().default(""),
  image: text("image").notNull().default(""), services: text("services").notNull().default(""),
  client: text("client").notNull().default(""), createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(), projectId: text("project_id").notNull().references(() => projects.id),
  designerId: text("designer_id").notNull().references(() => users.id),
  businessId: text("business_id").notNull().references(() => users.id),
  number: text("number").notNull(), description: text("description").notNull(),
  quantity: numeric("quantity", { mode: "number" }).notNull().default(1), unitPrice: numeric("unit_price", { mode: "number" }).notNull(),
  tax: numeric("tax", { mode: "number" }).notNull().default(0), notes: text("notes").notNull().default(""),
  dueDate: text("due_date").notNull(), status: text("status").notNull().default("Draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(), projectId: text("project_id").notNull().references(() => projects.id),
  authorId: text("author_id").notNull().references(() => users.id),
  subjectId: text("subject_id").notNull().references(() => users.id),
  rating: numeric("rating", { mode: "number" }).notNull(), body: text("body").notNull(), createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id),
  body: text("body").notNull(), readAt: timestamp("read_at", { withTimezone: true }), createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});
