CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" varchar NOT NULL,
	"user_id" varchar,
	"session_id" varchar NOT NULL,
	"metadata" jsonb,
	"ip_address" varchar,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "analytics_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snapshot_date" timestamp NOT NULL,
	"total_revenue" numeric(12, 2) DEFAULT '0',
	"total_transactions" integer DEFAULT 0,
	"new_users" integer DEFAULT 0,
	"active_users" integer DEFAULT 0,
	"page_views" integer DEFAULT 0,
	"unique_visitors" integer DEFAULT 0,
	"articles_published" integer DEFAULT 0,
	"articles_sold" integer DEFAULT 0,
	"avg_session_duration" integer DEFAULT 0,
	"top_pages" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "analytics_snapshots_snapshot_date_unique" UNIQUE("snapshot_date")
);
--> statement-breakpoint
CREATE TABLE "article_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"category" varchar DEFAULT 'Custom',
	"content" jsonb NOT NULL,
	"thumbnail" varchar,
	"is_public" boolean DEFAULT false,
	"usage_count" integer DEFAULT 0,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "article_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid,
	"version_number" integer NOT NULL,
	"title" varchar NOT NULL,
	"content" jsonb NOT NULL,
	"meta_description" text,
	"changed_by" varchar,
	"change_reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"title_en" varchar,
	"title_ar" varchar,
	"slug" varchar NOT NULL,
	"content" jsonb NOT NULL,
	"content_en" jsonb,
	"content_ar" jsonb,
	"meta_description" text,
	"meta_description_en" text,
	"meta_description_ar" text,
	"featured_image" varchar,
	"price_dzd" numeric(10, 2) DEFAULT '0',
	"price_eur" numeric(10, 2) DEFAULT '0',
	"tax_rate" numeric(5, 2) DEFAULT '19.00',
	"is_paid" boolean DEFAULT false,
	"status" varchar DEFAULT 'draft',
	"translation_status" varchar DEFAULT 'in_progress',
	"module_id" varchar,
	"tags" jsonb,
	"year_levels" jsonb,
	"reading_time" integer,
	"view_count" integer DEFAULT 0,
	"author_id" varchar,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"user_role" varchar NOT NULL,
	"action" varchar NOT NULL,
	"entity_type" varchar,
	"entity_id" varchar,
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" varchar,
	"user_agent" text,
	"metadata" jsonb,
	"severity" varchar DEFAULT 'info',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blacklist_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"reason" text,
	"scope" varchar DEFAULT 'comments',
	"expires_at" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blog_post_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid,
	"version_number" integer NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"changed_by" varchar,
	"change_reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"title_en" varchar,
	"title_ar" varchar,
	"slug" varchar,
	"content" text NOT NULL,
	"excerpt" text,
	"category" varchar,
	"cover_image" varchar,
	"images" jsonb,
	"tags" jsonb,
	"reading_time" integer,
	"view_count" integer DEFAULT 0,
	"like_count" integer DEFAULT 0,
	"featured" boolean DEFAULT false,
	"price" numeric(10, 2) DEFAULT '0',
	"currency" varchar(3) DEFAULT 'DZD',
	"tax_rate" numeric(5, 2) DEFAULT '19.00',
	"is_premium" boolean DEFAULT false,
	"meta_title" varchar,
	"meta_description" text,
	"status" varchar DEFAULT 'draft',
	"published_at" timestamp,
	"created_by" varchar,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "case_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"case_id" uuid,
	"solved" boolean DEFAULT false,
	"time_spent_sec" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"title_en" varchar,
	"title_ar" varchar,
	"description" text,
	"description_en" text,
	"description_ar" text,
	"presentation" text,
	"presentation_en" text,
	"presentation_ar" text,
	"history" text,
	"history_en" text,
	"history_ar" text,
	"exam" text,
	"exam_en" text,
	"exam_ar" text,
	"investigations" text,
	"investigations_en" text,
	"investigations_ar" text,
	"management" text,
	"management_en" text,
	"management_ar" text,
	"module_id" varchar,
	"difficulty" varchar,
	"status" varchar DEFAULT 'draft',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar,
	"entity_id" varchar,
	"user_id" varchar,
	"body" text NOT NULL,
	"status" varchar DEFAULT 'visible',
	"parent_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type" varchar NOT NULL,
	"content_id" varchar NOT NULL,
	"submitted_by" varchar NOT NULL,
	"reviewed_by" varchar,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"review_notes" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "contract_clauses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"clause_number" varchar NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"clause_type" varchar DEFAULT 'other',
	"is_mandatory" boolean DEFAULT true,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contract_signatures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"user_role" varchar NOT NULL,
	"signature_type" varchar DEFAULT 'electronic',
	"signature_data" text,
	"ip_address" varchar,
	"user_agent" varchar,
	"consent_text" text,
	"signed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"contract_type" varchar NOT NULL,
	"party_a_id" varchar NOT NULL,
	"party_a_role" varchar NOT NULL,
	"party_b_id" varchar NOT NULL,
	"party_b_role" varchar NOT NULL,
	"revenue_share_percentage_a" numeric(5, 2),
	"revenue_share_percentage_b" numeric(5, 2),
	"fixed_payment" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'DZD',
	"payment_frequency" varchar,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"auto_renew" boolean DEFAULT false,
	"status" varchar DEFAULT 'draft',
	"signed_by_a_at" timestamp,
	"signed_by_b_at" timestamp,
	"termination_reason" text,
	"terminated_at" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"course_id" uuid,
	"status" varchar DEFAULT 'enrolled',
	"progress" integer DEFAULT 0,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"title_en" varchar,
	"title_ar" varchar,
	"description" text,
	"description_en" text,
	"description_ar" text,
	"content" text,
	"content_en" text,
	"content_ar" text,
	"module_id" varchar,
	"year_levels" jsonb,
	"authors" jsonb,
	"language" varchar(10) DEFAULT 'fr',
	"cover_image" varchar,
	"price" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'DZD',
	"rating" numeric(3, 2),
	"status" varchar DEFAULT 'draft',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drive_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"drive_url" varchar NOT NULL,
	"download_url" varchar,
	"file_type" varchar,
	"file_size" varchar,
	"module_id" varchar,
	"category" varchar,
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'DZD',
	"is_free" boolean DEFAULT false,
	"download_count" integer DEFAULT 0,
	"rating" numeric(3, 2),
	"tags" jsonb,
	"preview_images" jsonb,
	"status" varchar DEFAULT 'draft',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"title_en" varchar,
	"title_ar" varchar,
	"description" text,
	"description_en" text,
	"description_ar" text,
	"event_type" varchar NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"location" varchar,
	"is_online" boolean DEFAULT true,
	"meeting_link" varchar,
	"max_participants" integer,
	"price" numeric(10, 2) DEFAULT '0',
	"currency" varchar(3) DEFAULT 'DZD',
	"cover_image" varchar,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "file_downloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" uuid,
	"user_id" varchar,
	"session_id" varchar,
	"download_type" varchar,
	"ip_address" varchar,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid,
	"title" varchar NOT NULL,
	"content" text,
	"order_index" integer,
	"images" jsonb,
	"videos" jsonb,
	"biodigital_links" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" varchar NOT NULL,
	"original_name" varchar,
	"mimetype" varchar,
	"size" integer,
	"url" varchar,
	"thumbnail_url" varchar,
	"status" varchar DEFAULT 'scanning',
	"uploaded_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"name_en" varchar,
	"name_ar" varchar,
	"category" varchar NOT NULL,
	"body_systems" jsonb,
	"icon" varchar,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "news_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"source" varchar,
	"link" varchar,
	"summary" text,
	"tags" jsonb,
	"published_at" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid,
	"label" varchar NOT NULL,
	"label_en" varchar,
	"label_ar" varchar,
	"is_correct" boolean DEFAULT false,
	"order_index" integer
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"user_id" varchar,
	"path" varchar NOT NULL,
	"title" varchar,
	"time_spent" integer,
	"scroll_depth" integer,
	"exit_page" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"title_en" varchar,
	"title_ar" varchar,
	"content" text NOT NULL,
	"content_en" text,
	"content_ar" text,
	"images" jsonb,
	"post_type" varchar DEFAULT 'announcement' NOT NULL,
	"is_pinned" boolean DEFAULT false,
	"price" numeric(10, 2) DEFAULT '0',
	"currency" varchar(3) DEFAULT 'DZD',
	"status" varchar DEFAULT 'draft' NOT NULL,
	"created_by" varchar NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"item_type" varchar,
	"item_id" varchar,
	"price" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'DZD',
	"status" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" uuid,
	"stem" text,
	"stem_en" text,
	"stem_ar" text,
	"type" varchar,
	"answer_explanation" text,
	"answer_explanation_en" text,
	"answer_explanation_ar" text,
	"reference" varchar,
	"order_index" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"quiz_id" uuid,
	"score" integer,
	"passed" boolean DEFAULT false,
	"time_taken_sec" integer,
	"answers" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"title_en" varchar,
	"title_ar" varchar,
	"description" text,
	"description_en" text,
	"description_ar" text,
	"module_id" varchar,
	"time_limit_sec" integer,
	"difficulty" varchar DEFAULT 'Medium',
	"status" varchar DEFAULT 'draft',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "revenue_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_type" varchar NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_revenue" numeric(12, 2) NOT NULL,
	"course_revenue" numeric(12, 2) DEFAULT '0',
	"summary_revenue" numeric(12, 2) DEFAULT '0',
	"bundle_revenue" numeric(12, 2) DEFAULT '0',
	"transaction_count" integer DEFAULT 0,
	"new_customers" integer DEFAULT 0,
	"returning_customers" integer DEFAULT 0,
	"currency" varchar(3) DEFAULT 'DZD',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"setting_key" varchar NOT NULL,
	"setting_value" text,
	"setting_type" varchar NOT NULL,
	"updated_by" varchar,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "site_settings_setting_key_unique" UNIQUE("setting_key")
);
--> statement-breakpoint
CREATE TABLE "site_visitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"user_id" varchar,
	"ip_address" varchar,
	"user_agent" text,
	"country" varchar,
	"city" varchar,
	"referrer" varchar,
	"landing_page" varchar,
	"pages_visited" jsonb,
	"time_spent" integer,
	"device_type" varchar,
	"is_returning" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"title_en" varchar,
	"title_ar" varchar,
	"content" text,
	"content_en" text,
	"content_ar" text,
	"module_id" varchar,
	"pdf_asset" varchar,
	"preview_images" jsonb,
	"language" varchar(10) DEFAULT 'fr',
	"pages" integer,
	"price" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'DZD',
	"tags" jsonb,
	"status" varchar DEFAULT 'draft',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "summary_downloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"summary_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"description" text NOT NULL,
	"status" varchar DEFAULT 'open' NOT NULL,
	"priority" varchar DEFAULT 'medium' NOT NULL,
	"assigned_to" varchar,
	"messages" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"position" varchar NOT NULL,
	"department" varchar,
	"permissions" jsonb,
	"salary" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'DZD',
	"hire_date" timestamp DEFAULT now(),
	"status" varchar DEFAULT 'active',
	"supervisor_id" varchar,
	"bio" text,
	"skills" jsonb,
	"achievements" jsonb,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"badge_type" varchar,
	"reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_blacklist_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"action" varchar NOT NULL,
	"reason" text,
	"performed_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"theme" varchar DEFAULT 'light',
	"locale" varchar(10) DEFAULT 'fr',
	"rtl_preference" boolean DEFAULT false,
	"reduced_motion" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"username" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"bio" text,
	"university" varchar,
	"country" varchar,
	"role" varchar DEFAULT 'viewer',
	"custom_permissions" jsonb,
	"locale" varchar(10) DEFAULT 'fr',
	"year_of_study" varchar,
	"is_blacklisted" boolean DEFAULT false,
	"blacklist_reason" text,
	"password" varchar,
	"force_password_change" boolean DEFAULT false,
	"last_login_at" timestamp,
	"session_timeout" integer DEFAULT 3600,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_templates" ADD CONSTRAINT "article_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_versions" ADD CONSTRAINT "article_versions_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_versions" ADD CONSTRAINT "article_versions_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blacklist_entries" ADD CONSTRAINT "blacklist_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blacklist_entries" ADD CONSTRAINT "blacklist_entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_versions" ADD CONSTRAINT "blog_post_versions_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_versions" ADD CONSTRAINT "blog_post_versions_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_completions" ADD CONSTRAINT "case_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_completions" ADD CONSTRAINT "case_completions_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_submissions" ADD CONSTRAINT "content_submissions_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_submissions" ADD CONSTRAINT "content_submissions_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_clauses" ADD CONSTRAINT "contract_clauses_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_signatures" ADD CONSTRAINT "contract_signatures_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_signatures" ADD CONSTRAINT "contract_signatures_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_party_a_id_users_id_fk" FOREIGN KEY ("party_a_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_party_b_id_users_id_fk" FOREIGN KEY ("party_b_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drive_files" ADD CONSTRAINT "drive_files_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drive_files" ADD CONSTRAINT "drive_files_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_downloads" ADD CONSTRAINT "file_downloads_file_id_drive_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."drive_files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_downloads" ADD CONSTRAINT "file_downloads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_items" ADD CONSTRAINT "news_items_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "options" ADD CONSTRAINT "options_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_visitors" ADD CONSTRAINT "site_visitors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summaries" ADD CONSTRAINT "summaries_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summaries" ADD CONSTRAINT "summaries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summary_downloads" ADD CONSTRAINT "summary_downloads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summary_downloads" ADD CONSTRAINT "summary_downloads_summary_id_summaries_id_fk" FOREIGN KEY ("summary_id") REFERENCES "public"."summaries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_supervisor_id_users_id_fk" FOREIGN KEY ("supervisor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_blacklist_audit" ADD CONSTRAINT "user_blacklist_audit_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_blacklist_audit" ADD CONSTRAINT "user_blacklist_audit_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");