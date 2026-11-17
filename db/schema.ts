import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), email: text("email").notNull(),
  role: text("role", { enum: ["designer", "business"] }).notNull(),
  name: text("name").notNull(), title: text("title").notNull().default(""),
  bio: text("bio").notNull().default(""), location: text("location").notNull().default(""),
  website: text("website").notNull().default(""), skills: text("skills").notNull().default(""),
  services: text("services").notNull().default(""), experience: integer("experience").notNull().default(0),
  startingPrice: integer("starting_price").notNull().default(0),
  industry: text("industry").notNull().default(""), phone: text("phone").notNull().default(""),
  openToProposals: integer("open_to_proposals", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(), businessId: text("business_id").notNull().references(() => users.id),
  title: text("title").notNull(), description: text("description").notNull(),
  service: text("service").notNull(), skills: text("skills").notNull().default(""),
  budget: integer("budget").notNull(), deadline: text("deadline").notNull(),
  attachment: text("attachment").notNull().default(""), status: text("status").notNull().default("Open"),
  createdAt: text("created_at").notNull(),
});

export const proposals = sqliteTable("proposals", {
  id: text("id").primaryKey(), jobId: text("job_id").notNull().references(() => jobs.id),
  designerId: text("designer_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), deliveryDays: integer("delivery_days").notNull(),
  message: text("message").notNull(), attachment: text("attachment").notNull().default(""),
  status: text("status").notNull().default("Submitted"), createdAt: text("created_at").notNull(),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(), jobId: text("job_id").references(() => jobs.id),
  businessId: text("business_id").notNull().references(() => users.id),
  designerId: text("designer_id").notNull().references(() => users.id),
  title: text("title").notNull(), amount: integer("amount").notNull(),
  deadline: text("deadline").notNull(), status: text("status").notNull().default("Not Started"),
  createdAt: text("created_at").notNull(),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(), senderId: text("sender_id").notNull().references(() => users.id),
  recipientId: text("recipient_id").notNull().references(() => users.id),
  projectId: text("project_id").references(() => projects.id), jobId: text("job_id").references(() => jobs.id),
  body: text("body").notNull(), attachment: text("attachment").notNull().default(""),
  readAt: text("read_at"), createdAt: text("created_at").notNull(),
});

export const portfolio = sqliteTable("portfolio", {
  id: text("id").primaryKey(), designerId: text("designer_id").notNull().references(() => users.id),
  title: text("title").notNull(), description: text("description").notNull().default(""),
  image: text("image").notNull().default(""), services: text("services").notNull().default(""),
  client: text("client").notNull().default(""), createdAt: text("created_at").notNull(),
});

export const invoices = sqliteTable("invoices", {
  id: text("id").primaryKey(), projectId: text("project_id").notNull().references(() => projects.id),
  designerId: text("designer_id").notNull().references(() => users.id),
  businessId: text("business_id").notNull().references(() => users.id),
  number: text("number").notNull(), description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1), unitPrice: integer("unit_price").notNull(),
  tax: integer("tax").notNull().default(0), notes: text("notes").notNull().default(""),
  dueDate: text("due_date").notNull(), status: text("status").notNull().default("Draft"),
  createdAt: text("created_at").notNull(),
});

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(), projectId: text("project_id").notNull().references(() => projects.id),
  authorId: text("author_id").notNull().references(() => users.id),
  subjectId: text("subject_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), body: text("body").notNull(), createdAt: text("created_at").notNull(),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id),
  body: text("body").notNull(), readAt: text("read_at"), createdAt: text("created_at").notNull(),
});
