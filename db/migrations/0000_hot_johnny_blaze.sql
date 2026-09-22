CREATE TYPE "public"."billing_event_type" AS ENUM('subscription_started', 'subscription_renewed', 'subscription_upgraded', 'subscription_downgraded', 'payment_failed', 'subscription_canceled');--> statement-breakpoint
CREATE TYPE "public"."company_status" AS ENUM('prospect', 'client');--> statement-breakpoint
CREATE TYPE "public"."deal_status" AS ENUM('open', 'won', 'lost');--> statement-breakpoint
CREATE TYPE "public"."email_status" AS ENUM('draft', 'sent', 'opened', 'clicked', 'replied', 'bounced');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('active', 'stopped', 'completed');--> statement-breakpoint
CREATE TYPE "public"."interaction_direction" AS ENUM('inbound', 'outbound');--> statement-breakpoint
CREATE TYPE "public"."interaction_type" AS ENUM('call', 'meeting', 'email', 'message', 'note');--> statement-breakpoint
CREATE TYPE "public"."lead_magnet_type" AS ENUM('ebook', 'checklist', 'template', 'webinar', 'calculateur');--> statement-breakpoint
CREATE TYPE "public"."score_type" AS ENUM('lead', 'health');--> statement-breakpoint
CREATE TYPE "public"."sentiment" AS ENUM('positive', 'neutral', 'negative');--> statement-breakpoint
CREATE TYPE "public"."sequence_status" AS ENUM('draft', 'active', 'paused');--> statement-breakpoint
CREATE TYPE "public"."sequence_step_mode" AS ENUM('auto', 'draft');--> statement-breakpoint
CREATE TYPE "public"."sequence_step_type" AS ENUM('email', 'call_task', 'linkedin_task', 'wait');--> statement-breakpoint
CREATE TYPE "public"."suggestion_status" AS ENUM('proposed', 'accepted', 'dismissed', 'done');--> statement-breakpoint
CREATE TYPE "public"."suggestion_type" AS ENUM('relance', 'envoi_contenu', 'upsell', 'alerte_churn', 'prise_rdv', 'autre');--> statement-breakpoint
CREATE TYPE "public"."support_ticket_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."support_ticket_status" AS ENUM('open', 'pending', 'closed');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('todo', 'done', 'late');--> statement-breakpoint
CREATE TYPE "public"."task_type" AS ENUM('call', 'email', 'linkedin', 'generic');--> statement-breakpoint
CREATE TYPE "public"."trial_status" AS ENUM('trial', 'active', 'past_due', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('commercial', 'manager', 'admin');--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"deal_id" uuid,
	"assigned_to_id" uuid,
	"type" "suggestion_type" NOT NULL,
	"channel" text,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"justification" text NOT NULL,
	"due_date" timestamp with time zone,
	"source_interaction_ids" jsonb DEFAULT '[]'::jsonb,
	"status" "suggestion_status" DEFAULT 'proposed' NOT NULL,
	"dismiss_reason" text,
	"feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"type" "billing_event_type" NOT NULL,
	"amount" numeric(12, 2),
	"occurred_at" timestamp with time zone NOT NULL,
	"source" text DEFAULT 'seed' NOT NULL,
	"external_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"domain" text,
	"industry" text,
	"size_label" text,
	"status" "company_status" DEFAULT 'prospect' NOT NULL,
	"owner_id" uuid,
	"city" text,
	"tech_stack" jsonb DEFAULT '[]'::jsonb,
	"funding_info" text,
	"source" text DEFAULT 'seed' NOT NULL,
	"external_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"role_title" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_decision_maker" boolean DEFAULT false NOT NULL,
	"unsubscribed" boolean DEFAULT false NOT NULL,
	"source" text DEFAULT 'seed' NOT NULL,
	"external_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"stage_id" uuid NOT NULL,
	"owner_id" uuid,
	"name" text NOT NULL,
	"amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"probability" integer DEFAULT 50 NOT NULL,
	"expected_close_date" timestamp with time zone,
	"status" "deal_status" DEFAULT 'open' NOT NULL,
	"lost_reason" text,
	"source" text DEFAULT 'seed' NOT NULL,
	"external_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid NOT NULL,
	"sequence_step_id" uuid,
	"owner_id" uuid,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"status" "email_status" DEFAULT 'draft' NOT NULL,
	"sent_at" timestamp with time zone,
	"opened_at" timestamp with time zone,
	"clicked_at" timestamp with time zone,
	"replied_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"contact_id" uuid,
	"deal_id" uuid,
	"owner_id" uuid,
	"type" "interaction_type" NOT NULL,
	"channel" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"duration_seconds" integer,
	"direction" "interaction_direction",
	"subject" text,
	"ai_summary" text,
	"transcript" text,
	"sentiment" "sentiment",
	"recording_url" text,
	"source" text DEFAULT 'seed' NOT NULL,
	"external_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_magnet_downloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_magnet_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"downloaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" text DEFAULT 'seed' NOT NULL,
	"external_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_magnets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"type" "lead_magnet_type" NOT NULL,
	"persona" text,
	"file_url" text,
	"landing_copy" text,
	"landing_headline" text,
	"associated_sequence_id" uuid,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"author_id" uuid,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"order" integer NOT NULL,
	"is_won" boolean DEFAULT false NOT NULL,
	"is_lost" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_usage_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"plan" text NOT NULL,
	"mrr" numeric(12, 2) DEFAULT '0' NOT NULL,
	"seats_used" integer DEFAULT 0 NOT NULL,
	"last_login_at" timestamp with time zone,
	"features_used" jsonb DEFAULT '[]'::jsonb,
	"trial_status" "trial_status" DEFAULT 'active' NOT NULL,
	"snapshot_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" text DEFAULT 'seed' NOT NULL,
	"external_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"type" "score_type" NOT NULL,
	"value" integer NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sequence_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sequence_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"current_step_order" integer DEFAULT 1 NOT NULL,
	"status" "enrollment_status" DEFAULT 'active' NOT NULL,
	"stop_reason" text,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sequence_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sequence_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"type" "sequence_step_type" NOT NULL,
	"mode" "sequence_step_mode" DEFAULT 'draft' NOT NULL,
	"delay_days" integer DEFAULT 1 NOT NULL,
	"condition" text,
	"subject" text,
	"body" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sequences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "sequence_status" DEFAULT 'draft' NOT NULL,
	"owner_id" uuid,
	"daily_send_limit" integer DEFAULT 50 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"contact_id" uuid,
	"subject" text NOT NULL,
	"status" "support_ticket_status" DEFAULT 'open' NOT NULL,
	"priority" "support_ticket_priority" DEFAULT 'normal' NOT NULL,
	"satisfaction_score" integer,
	"opened_at" timestamp with time zone NOT NULL,
	"closed_at" timestamp with time zone,
	"source" text DEFAULT 'seed' NOT NULL,
	"external_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"company_id" uuid,
	"deal_id" uuid,
	"title" text NOT NULL,
	"due_date" timestamp with time zone NOT NULL,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"type" "task_type" DEFAULT 'generic' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"manager_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" DEFAULT 'commercial' NOT NULL,
	"team_id" uuid,
	"avatar_seed" text NOT NULL,
	"job_title" text,
	"monthly_target_amount" numeric(12, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_stage_id_pipeline_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_sequence_step_id_sequence_steps_id_fk" FOREIGN KEY ("sequence_step_id") REFERENCES "public"."sequence_steps"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_magnet_downloads" ADD CONSTRAINT "lead_magnet_downloads_lead_magnet_id_lead_magnets_id_fk" FOREIGN KEY ("lead_magnet_id") REFERENCES "public"."lead_magnets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_magnet_downloads" ADD CONSTRAINT "lead_magnet_downloads_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_magnets" ADD CONSTRAINT "lead_magnets_associated_sequence_id_sequences_id_fk" FOREIGN KEY ("associated_sequence_id") REFERENCES "public"."sequences"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_usage_snapshots" ADD CONSTRAINT "product_usage_snapshots_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sequence_enrollments" ADD CONSTRAINT "sequence_enrollments_sequence_id_sequences_id_fk" FOREIGN KEY ("sequence_id") REFERENCES "public"."sequences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sequence_enrollments" ADD CONSTRAINT "sequence_enrollments_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sequence_steps" ADD CONSTRAINT "sequence_steps_sequence_id_sequences_id_fk" FOREIGN KEY ("sequence_id") REFERENCES "public"."sequences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sequences" ADD CONSTRAINT "sequences_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;