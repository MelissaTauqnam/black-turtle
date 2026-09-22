import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Colonnes communes : toutes les tables portent id/created_at/updated_at, et
// source/external_id quand la table est susceptible d'être alimentée par
// ingestion externe (n8n) dans une phase ultérieure.
// ---------------------------------------------------------------------------
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

const sourced = {
  source: text("source").notNull().default("seed"),
  externalId: text("external_id"),
};

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const userRoleEnum = pgEnum("user_role", ["commercial", "manager", "admin"]);
export const companyStatusEnum = pgEnum("company_status", ["prospect", "client"]);
export const dealStatusEnum = pgEnum("deal_status", ["open", "won", "lost"]);
export const interactionTypeEnum = pgEnum("interaction_type", [
  "call",
  "meeting",
  "email",
  "message",
  "note",
]);
export const interactionDirectionEnum = pgEnum("interaction_direction", ["inbound", "outbound"]);
export const sentimentEnum = pgEnum("sentiment", ["positive", "neutral", "negative"]);
export const taskStatusEnum = pgEnum("task_status", ["todo", "done", "late"]);
export const taskTypeEnum = pgEnum("task_type", ["call", "email", "linkedin", "generic"]);
export const suggestionTypeEnum = pgEnum("suggestion_type", [
  "relance",
  "envoi_contenu",
  "upsell",
  "alerte_churn",
  "prise_rdv",
  "autre",
]);
export const suggestionStatusEnum = pgEnum("suggestion_status", [
  "proposed",
  "accepted",
  "dismissed",
  "done",
]);
export const sequenceStatusEnum = pgEnum("sequence_status", ["draft", "active", "paused"]);
export const sequenceStepTypeEnum = pgEnum("sequence_step_type", [
  "email",
  "call_task",
  "linkedin_task",
  "wait",
]);
export const sequenceStepModeEnum = pgEnum("sequence_step_mode", ["auto", "draft"]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "active",
  "stopped",
  "completed",
]);
export const emailStatusEnum = pgEnum("email_status", [
  "draft",
  "sent",
  "opened",
  "clicked",
  "replied",
  "bounced",
]);
export const leadMagnetTypeEnum = pgEnum("lead_magnet_type", [
  "ebook",
  "checklist",
  "template",
  "webinar",
  "calculateur",
]);
export const trialStatusEnum = pgEnum("trial_status", [
  "trial",
  "active",
  "past_due",
  "canceled",
]);
export const billingEventTypeEnum = pgEnum("billing_event_type", [
  "subscription_started",
  "subscription_renewed",
  "subscription_upgraded",
  "subscription_downgraded",
  "payment_failed",
  "subscription_canceled",
]);
export const scoreTypeEnum = pgEnum("score_type", ["lead", "health"]);
export const supportTicketStatusEnum = pgEnum("support_ticket_status", [
  "open",
  "pending",
  "closed",
]);
export const supportTicketPriorityEnum = pgEnum("support_ticket_priority", [
  "low",
  "normal",
  "high",
  "urgent",
]);

// ---------------------------------------------------------------------------
// Organisation
// ---------------------------------------------------------------------------
export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  managerId: uuid("manager_id"),
  ...timestamps,
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default("commercial"),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
  avatarSeed: text("avatar_seed").notNull(),
  jobTitle: text("job_title"),
  monthlyTargetAmount: numeric("monthly_target_amount", { precision: 12, scale: 2 }),
  ...timestamps,
});

// ---------------------------------------------------------------------------
// CRM : entreprises, contacts, pipeline, deals
// ---------------------------------------------------------------------------
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  domain: text("domain"),
  industry: text("industry"),
  sizeLabel: text("size_label"),
  status: companyStatusEnum("status").notNull().default("prospect"),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "set null" }),
  city: text("city"),
  techStack: jsonb("tech_stack").$type<string[]>().default(sql`'[]'::jsonb`),
  fundingInfo: text("funding_info"),
  ...sourced,
  ...timestamps,
});

export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  roleTitle: text("role_title"),
  isPrimary: boolean("is_primary").notNull().default(false),
  isDecisionMaker: boolean("is_decision_maker").notNull().default(false),
  unsubscribed: boolean("unsubscribed").notNull().default(false),
  ...sourced,
  ...timestamps,
});

export const pipelineStages = pgTable("pipeline_stages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  isWon: boolean("is_won").notNull().default(false),
  isLost: boolean("is_lost").notNull().default(false),
  ...timestamps,
});

export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  stageId: uuid("stage_id")
    .notNull()
    .references(() => pipelineStages.id),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"),
  probability: integer("probability").notNull().default(50),
  expectedCloseDate: timestamp("expected_close_date", { withTimezone: true }),
  status: dealStatusEnum("status").notNull().default("open"),
  lostReason: text("lost_reason"),
  ...sourced,
  ...timestamps,
});

// ---------------------------------------------------------------------------
// Timeline unifiée
// ---------------------------------------------------------------------------
export const interactions = pgTable("interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "set null" }),
  dealId: uuid("deal_id").references(() => deals.id, { onDelete: "set null" }),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "set null" }),
  type: interactionTypeEnum("type").notNull(),
  channel: text("channel").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  durationSeconds: integer("duration_seconds"),
  direction: interactionDirectionEnum("direction"),
  subject: text("subject"),
  aiSummary: text("ai_summary"),
  transcript: text("transcript"),
  sentiment: sentimentEnum("sentiment"),
  recordingUrl: text("recording_url"),
  ...sourced,
  ...timestamps,
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  dealId: uuid("deal_id").references(() => deals.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  status: taskStatusEnum("status").notNull().default("todo"),
  type: taskTypeEnum("type").notNull().default("generic"),
  ...timestamps,
});

export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  body: text("body").notNull(),
  ...timestamps,
});

// ---------------------------------------------------------------------------
// IA
// ---------------------------------------------------------------------------
export const aiSuggestions = pgTable("ai_suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  dealId: uuid("deal_id").references(() => deals.id, { onDelete: "set null" }),
  assignedToId: uuid("assigned_to_id").references(() => users.id, { onDelete: "set null" }),
  type: suggestionTypeEnum("type").notNull(),
  channel: text("channel"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  justification: text("justification").notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  sourceInteractionIds: jsonb("source_interaction_ids").$type<string[]>().default(sql`'[]'::jsonb`),
  status: suggestionStatusEnum("status").notNull().default("proposed"),
  dismissReason: text("dismiss_reason"),
  feedback: text("feedback"),
  ...timestamps,
});

// ---------------------------------------------------------------------------
// Séquences email
// ---------------------------------------------------------------------------
export const sequences = pgTable("sequences", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  status: sequenceStatusEnum("status").notNull().default("draft"),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "set null" }),
  dailySendLimit: integer("daily_send_limit").notNull().default(50),
  ...timestamps,
});

export const sequenceSteps = pgTable("sequence_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  sequenceId: uuid("sequence_id")
    .notNull()
    .references(() => sequences.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  type: sequenceStepTypeEnum("type").notNull(),
  mode: sequenceStepModeEnum("mode").notNull().default("draft"),
  delayDays: integer("delay_days").notNull().default(1),
  condition: text("condition"),
  subject: text("subject"),
  body: text("body"),
  ...timestamps,
});

export const sequenceEnrollments = pgTable("sequence_enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  sequenceId: uuid("sequence_id")
    .notNull()
    .references(() => sequences.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  currentStepOrder: integer("current_step_order").notNull().default(1),
  status: enrollmentStatusEnum("status").notNull().default("active"),
  stopReason: text("stop_reason"),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
  ...timestamps,
});

export const emails = pgTable("emails", {
  id: uuid("id").primaryKey().defaultRandom(),
  contactId: uuid("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  sequenceStepId: uuid("sequence_step_id").references(() => sequenceSteps.id, {
    onDelete: "set null",
  }),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "set null" }),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: emailStatusEnum("status").notNull().default("draft"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  openedAt: timestamp("opened_at", { withTimezone: true }),
  clickedAt: timestamp("clicked_at", { withTimezone: true }),
  repliedAt: timestamp("replied_at", { withTimezone: true }),
  ...timestamps,
});

// ---------------------------------------------------------------------------
// Lead magnets
// ---------------------------------------------------------------------------
export const leadMagnets = pgTable("lead_magnets", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  type: leadMagnetTypeEnum("type").notNull(),
  persona: text("persona"),
  fileUrl: text("file_url"),
  landingCopy: text("landing_copy"),
  landingHeadline: text("landing_headline"),
  associatedSequenceId: uuid("associated_sequence_id").references(() => sequences.id, {
    onDelete: "set null",
  }),
  published: boolean("published").notNull().default(true),
  ...timestamps,
});

export const leadMagnetDownloads = pgTable("lead_magnet_downloads", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadMagnetId: uuid("lead_magnet_id")
    .notNull()
    .references(() => leadMagnets.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  downloadedAt: timestamp("downloaded_at", { withTimezone: true }).notNull().defaultNow(),
  ...sourced,
  ...timestamps,
});

// ---------------------------------------------------------------------------
// Usage produit / facturation / support (client)
// ---------------------------------------------------------------------------
export const productUsageSnapshots = pgTable("product_usage_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  plan: text("plan").notNull(),
  mrr: numeric("mrr", { precision: 12, scale: 2 }).notNull().default("0"),
  seatsUsed: integer("seats_used").notNull().default(0),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  featuresUsed: jsonb("features_used").$type<string[]>().default(sql`'[]'::jsonb`),
  trialStatus: trialStatusEnum("trial_status").notNull().default("active"),
  snapshotAt: timestamp("snapshot_at", { withTimezone: true }).notNull().defaultNow(),
  ...sourced,
  ...timestamps,
});

export const billingEvents = pgTable("billing_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  type: billingEventTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  ...sourced,
  ...timestamps,
});

export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "set null" }),
  subject: text("subject").notNull(),
  status: supportTicketStatusEnum("status").notNull().default("open"),
  priority: supportTicketPriorityEnum("priority").notNull().default("normal"),
  satisfactionScore: integer("satisfaction_score"),
  openedAt: timestamp("opened_at", { withTimezone: true }).notNull(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  ...sourced,
  ...timestamps,
});

export const scores = pgTable("scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  type: scoreTypeEnum("type").notNull(),
  value: integer("value").notNull(),
  computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
  ...timestamps,
});

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------
export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Relations (pour les requêtes `db.query.*.findMany({ with: {...} })`)
// ---------------------------------------------------------------------------
export const teamsRelations = relations(teams, ({ many, one }) => ({
  members: many(users),
  manager: one(users, { fields: [teams.managerId], references: [users.id] }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  team: one(teams, { fields: [users.teamId], references: [teams.id] }),
  companies: many(companies),
  deals: many(deals),
  tasks: many(tasks),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  owner: one(users, { fields: [companies.ownerId], references: [users.id] }),
  contacts: many(contacts),
  deals: many(deals),
  interactions: many(interactions),
  tasks: many(tasks),
  notes: many(notes),
  aiSuggestions: many(aiSuggestions),
  productUsageSnapshots: many(productUsageSnapshots),
  billingEvents: many(billingEvents),
  supportTickets: many(supportTickets),
  scores: many(scores),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  company: one(companies, { fields: [contacts.companyId], references: [companies.id] }),
  interactions: many(interactions),
  sequenceEnrollments: many(sequenceEnrollments),
  emails: many(emails),
  leadMagnetDownloads: many(leadMagnetDownloads),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  company: one(companies, { fields: [deals.companyId], references: [companies.id] }),
  stage: one(pipelineStages, { fields: [deals.stageId], references: [pipelineStages.id] }),
  owner: one(users, { fields: [deals.ownerId], references: [users.id] }),
  interactions: many(interactions),
  tasks: many(tasks),
  aiSuggestions: many(aiSuggestions),
}));

export const pipelineStagesRelations = relations(pipelineStages, ({ many }) => ({
  deals: many(deals),
}));

export const interactionsRelations = relations(interactions, ({ one }) => ({
  company: one(companies, { fields: [interactions.companyId], references: [companies.id] }),
  contact: one(contacts, { fields: [interactions.contactId], references: [contacts.id] }),
  deal: one(deals, { fields: [interactions.dealId], references: [deals.id] }),
  owner: one(users, { fields: [interactions.ownerId], references: [users.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  owner: one(users, { fields: [tasks.ownerId], references: [users.id] }),
  company: one(companies, { fields: [tasks.companyId], references: [companies.id] }),
  deal: one(deals, { fields: [tasks.dealId], references: [deals.id] }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  company: one(companies, { fields: [notes.companyId], references: [companies.id] }),
  author: one(users, { fields: [notes.authorId], references: [users.id] }),
}));

export const aiSuggestionsRelations = relations(aiSuggestions, ({ one }) => ({
  company: one(companies, { fields: [aiSuggestions.companyId], references: [companies.id] }),
  deal: one(deals, { fields: [aiSuggestions.dealId], references: [deals.id] }),
  assignedTo: one(users, { fields: [aiSuggestions.assignedToId], references: [users.id] }),
}));

export const sequencesRelations = relations(sequences, ({ many, one }) => ({
  steps: many(sequenceSteps),
  enrollments: many(sequenceEnrollments),
  owner: one(users, { fields: [sequences.ownerId], references: [users.id] }),
  leadMagnets: many(leadMagnets),
}));

export const sequenceStepsRelations = relations(sequenceSteps, ({ one, many }) => ({
  sequence: one(sequences, { fields: [sequenceSteps.sequenceId], references: [sequences.id] }),
  emails: many(emails),
}));

export const sequenceEnrollmentsRelations = relations(sequenceEnrollments, ({ one }) => ({
  sequence: one(sequences, {
    fields: [sequenceEnrollments.sequenceId],
    references: [sequences.id],
  }),
  contact: one(contacts, { fields: [sequenceEnrollments.contactId], references: [contacts.id] }),
}));

export const emailsRelations = relations(emails, ({ one }) => ({
  contact: one(contacts, { fields: [emails.contactId], references: [contacts.id] }),
  sequenceStep: one(sequenceSteps, {
    fields: [emails.sequenceStepId],
    references: [sequenceSteps.id],
  }),
  owner: one(users, { fields: [emails.ownerId], references: [users.id] }),
}));

export const leadMagnetsRelations = relations(leadMagnets, ({ one, many }) => ({
  associatedSequence: one(sequences, {
    fields: [leadMagnets.associatedSequenceId],
    references: [sequences.id],
  }),
  downloads: many(leadMagnetDownloads),
}));

export const leadMagnetDownloadsRelations = relations(leadMagnetDownloads, ({ one }) => ({
  leadMagnet: one(leadMagnets, {
    fields: [leadMagnetDownloads.leadMagnetId],
    references: [leadMagnets.id],
  }),
  contact: one(contacts, { fields: [leadMagnetDownloads.contactId], references: [contacts.id] }),
}));

export const productUsageSnapshotsRelations = relations(productUsageSnapshots, ({ one }) => ({
  company: one(companies, {
    fields: [productUsageSnapshots.companyId],
    references: [companies.id],
  }),
}));

export const billingEventsRelations = relations(billingEvents, ({ one }) => ({
  company: one(companies, { fields: [billingEvents.companyId], references: [companies.id] }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  company: one(companies, { fields: [supportTickets.companyId], references: [companies.id] }),
  contact: one(contacts, { fields: [supportTickets.contactId], references: [contacts.id] }),
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  company: one(companies, { fields: [scores.companyId], references: [companies.id] }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, { fields: [activityLog.userId], references: [users.id] }),
}));
