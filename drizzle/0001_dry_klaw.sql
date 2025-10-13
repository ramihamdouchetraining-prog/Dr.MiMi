CREATE TABLE "content_sales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type" varchar NOT NULL,
	"content_id" varchar NOT NULL,
	"content_title" varchar,
	"buyer_id" varchar NOT NULL,
	"author_id" varchar NOT NULL,
	"sale_amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'DZD',
	"tax_amount" numeric(10, 2) DEFAULT '0',
	"net_amount" numeric(10, 2) NOT NULL,
	"payment_method" varchar,
	"transaction_id" varchar,
	"status" varchar DEFAULT 'completed',
	"refunded_at" timestamp,
	"refund_reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "library_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section" varchar NOT NULL,
	"name" varchar NOT NULL,
	"name_en" varchar,
	"name_ar" varchar,
	"description" text,
	"description_en" text,
	"description_ar" text,
	"parent_id" uuid,
	"order_index" integer DEFAULT 0,
	"madhhab" varchar,
	"era" varchar,
	"level" varchar,
	"icon" varchar,
	"color" varchar,
	"is_active" boolean DEFAULT true,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "library_downloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"item_id" uuid NOT NULL,
	"ip_address" varchar,
	"user_agent" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "library_favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"item_id" uuid NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "library_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section" varchar NOT NULL,
	"title" varchar NOT NULL,
	"title_en" varchar,
	"title_ar" varchar,
	"description" text,
	"description_en" text,
	"description_ar" text,
	"author" varchar,
	"author_en" varchar,
	"author_ar" varchar,
	"author_bio" text,
	"author_era" varchar,
	"category_id" uuid,
	"tags" jsonb,
	"keywords" jsonb,
	"madhhab" varchar,
	"subject" varchar,
	"language" varchar(10) DEFAULT 'ar',
	"original_language" varchar,
	"translator" varchar,
	"publication_date" varchar,
	"format" varchar NOT NULL,
	"file_url" varchar,
	"cover_image" varchar,
	"preview_images" jsonb,
	"audio_url" varchar,
	"video_url" varchar,
	"external_link" varchar,
	"file_size" integer,
	"pages" integer,
	"duration" integer,
	"rating" numeric(3, 2) DEFAULT '0',
	"rating_count" integer DEFAULT 0,
	"download_count" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"favorite_count" integer DEFAULT 0,
	"status" varchar DEFAULT 'pending',
	"rejection_reason" text,
	"moderation_notes" text,
	"submitted_by" varchar NOT NULL,
	"submitted_at" timestamp DEFAULT now(),
	"approved_by" varchar,
	"approved_at" timestamp,
	"rejected_by" varchar,
	"rejected_at" timestamp,
	"is_collaborative" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"is_premium" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "library_ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"item_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"review" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "revenue_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_id" uuid NOT NULL,
	"agreement_id" uuid,
	"tier_id" uuid,
	"recipient_id" varchar NOT NULL,
	"recipient_role" varchar NOT NULL,
	"share_amount" numeric(10, 2) NOT NULL,
	"share_percentage" numeric(5, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'DZD',
	"content_type" varchar NOT NULL,
	"content_id" varchar NOT NULL,
	"content_title" varchar,
	"original_amount" numeric(10, 2) NOT NULL,
	"payout_status" varchar DEFAULT 'pending',
	"payout_method" varchar,
	"payout_reference" varchar,
	"payout_date" timestamp,
	"payout_notes" text,
	"calculated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "revenue_share_agreements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"agreement_type" varchar NOT NULL,
	"owner_id" varchar,
	"admin_id" varchar,
	"editor_id" varchar,
	"owner_default_percentage" numeric(5, 2) DEFAULT '40.00',
	"admin_default_percentage" numeric(5, 2) DEFAULT '30.00',
	"editor_default_percentage" numeric(5, 2) DEFAULT '30.00',
	"is_active" boolean DEFAULT true,
	"applies_to" jsonb,
	"minimum_payout" numeric(10, 2) DEFAULT '1000.00',
	"currency" varchar(3) DEFAULT 'DZD',
	"notes" text,
	"activated_at" timestamp,
	"deactivated_at" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "revenue_share_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agreement_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"user_role" varchar NOT NULL,
	"tier_level" integer NOT NULL,
	"percentage" numeric(5, 2) NOT NULL,
	"content_type_overrides" jsonb,
	"is_active" boolean DEFAULT true,
	"effective_from" timestamp DEFAULT now(),
	"effective_until" timestamp,
	"notes" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "wilaya" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "user_status" varchar DEFAULT 'student';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_suspended" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "suspended_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "suspended_reason" text;--> statement-breakpoint
ALTER TABLE "content_sales" ADD CONSTRAINT "content_sales_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_sales" ADD CONSTRAINT "content_sales_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_categories" ADD CONSTRAINT "library_categories_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_downloads" ADD CONSTRAINT "library_downloads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_downloads" ADD CONSTRAINT "library_downloads_item_id_library_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."library_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_favorites" ADD CONSTRAINT "library_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_favorites" ADD CONSTRAINT "library_favorites_item_id_library_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."library_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_items" ADD CONSTRAINT "library_items_category_id_library_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."library_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_items" ADD CONSTRAINT "library_items_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_items" ADD CONSTRAINT "library_items_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_items" ADD CONSTRAINT "library_items_rejected_by_users_id_fk" FOREIGN KEY ("rejected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_ratings" ADD CONSTRAINT "library_ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_ratings" ADD CONSTRAINT "library_ratings_item_id_library_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."library_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_ledger" ADD CONSTRAINT "revenue_ledger_sale_id_content_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."content_sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_ledger" ADD CONSTRAINT "revenue_ledger_agreement_id_revenue_share_agreements_id_fk" FOREIGN KEY ("agreement_id") REFERENCES "public"."revenue_share_agreements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_ledger" ADD CONSTRAINT "revenue_ledger_tier_id_revenue_share_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."revenue_share_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_ledger" ADD CONSTRAINT "revenue_ledger_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_share_agreements" ADD CONSTRAINT "revenue_share_agreements_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_share_agreements" ADD CONSTRAINT "revenue_share_agreements_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_share_agreements" ADD CONSTRAINT "revenue_share_agreements_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_share_agreements" ADD CONSTRAINT "revenue_share_agreements_editor_id_users_id_fk" FOREIGN KEY ("editor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_share_agreements" ADD CONSTRAINT "revenue_share_agreements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_share_tiers" ADD CONSTRAINT "revenue_share_tiers_agreement_id_revenue_share_agreements_id_fk" FOREIGN KEY ("agreement_id") REFERENCES "public"."revenue_share_agreements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_share_tiers" ADD CONSTRAINT "revenue_share_tiers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_share_tiers" ADD CONSTRAINT "revenue_share_tiers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_library_categories_section" ON "library_categories" USING btree ("section");--> statement-breakpoint
CREATE INDEX "idx_library_categories_parent" ON "library_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_library_downloads_user" ON "library_downloads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_library_downloads_item" ON "library_downloads" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "idx_library_favorites_user" ON "library_favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_library_favorites_item" ON "library_favorites" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "idx_library_items_section" ON "library_items" USING btree ("section");--> statement-breakpoint
CREATE INDEX "idx_library_items_category" ON "library_items" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_library_items_status" ON "library_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_library_items_submitted_by" ON "library_items" USING btree ("submitted_by");--> statement-breakpoint
CREATE INDEX "idx_library_items_approved_by" ON "library_items" USING btree ("approved_by");--> statement-breakpoint
CREATE INDEX "idx_library_ratings_user" ON "library_ratings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_library_ratings_item" ON "library_ratings" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "idx_revenue_ledger_recipient" ON "revenue_ledger" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "idx_revenue_ledger_sale" ON "revenue_ledger" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "idx_revenue_ledger_content" ON "revenue_ledger" USING btree ("content_type","content_id");--> statement-breakpoint
CREATE INDEX "idx_revenue_ledger_payout" ON "revenue_ledger" USING btree ("payout_status");