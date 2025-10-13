// Drizzle schema for MediMimi medical education platform
// Based on the specification from attached_assets/Pasted--schema-version-1-0...
import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table - Extended for MediMimi with medical student features and RBAC
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  username: varchar("username").unique(), // For owner authentication
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  university: varchar("university"),
  country: varchar("country"),
  wilaya: varchar("wilaya"), // For Algerian users (58 wilayas)
  phone: varchar("phone"), // Phone number
  userStatus: varchar("user_status", { enum: ["student", "professor", "phd", "other"] }).default("student"), // User status
  // Updated to use only the 5 main roles as per requirements
  role: varchar("role", { enum: ["owner", "admin", "editor", "viewer", "consultant"] }).default("viewer"),
  customPermissions: jsonb("custom_permissions"), // For any custom permission overrides
  locale: varchar("locale", { length: 10 }).default("fr"),
  yearOfStudy: varchar("year_of_study", { enum: ["Y1","Y2","Y3","Y4","Y5","Y6","Intern"] }),
  isBlacklisted: boolean("is_blacklisted").default(false),
  blacklistReason: text("blacklist_reason"),
  isSuspended: boolean("is_suspended").default(false),
  suspendedAt: timestamp("suspended_at"),
  suspendedReason: text("suspended_reason"),
  password: varchar("password"), // For non-OAuth users like owner
  forcePasswordChange: boolean("force_password_change").default(false),
  lastLoginAt: timestamp("last_login_at"),
  sessionTimeout: integer("session_timeout").default(3600), // seconds
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Medical modules (anatomy, cardiology, etc.)
export const modules = pgTable("modules", {
  id: varchar("id").primaryKey(), // e.g., "anatomy", "cardiology"
  name: varchar("name").notNull(),
  nameEn: varchar("name_en"),
  nameAr: varchar("name_ar"),
  category: varchar("category", { enum: ["Preclinical", "Clinical", "PublicHealth"] }).notNull(),
  bodySystems: jsonb("body_systems"), // array of strings
  icon: varchar("icon"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Courses (structured lessons)
export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  titleEn: varchar("title_en"),
  titleAr: varchar("title_ar"),
  description: text("description"),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  content: text("content"),
  contentEn: text("content_en"),
  contentAr: text("content_ar"),
  moduleId: varchar("module_id").references(() => modules.id),
  yearLevels: jsonb("year_levels"), // array of year levels
  authors: jsonb("authors"), // array of author names
  language: varchar("language", { length: 10 }).default("fr"),
  coverImage: varchar("cover_image"),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("DZD"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  status: varchar("status", { enum: ["draft", "review", "published", "archived"] }).default("draft"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lessons within courses
export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: uuid("course_id").references(() => courses.id),
  title: varchar("title").notNull(),
  content: text("content"), // rich text/markdown
  orderIndex: integer("order_index"),
  images: jsonb("images"), // array of image URLs
  videos: jsonb("videos"), // array of video URLs
  biodigitalLinks: jsonb("biodigital_links"), // array of BioDigital links
  createdAt: timestamp("created_at").defaultNow(),
});

// Summaries (PDF documents)
export const summaries = pgTable("summaries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  titleEn: varchar("title_en"),
  titleAr: varchar("title_ar"),
  content: text("content"),
  contentEn: text("content_en"),
  contentAr: text("content_ar"),
  moduleId: varchar("module_id").references(() => modules.id),
  pdfAsset: varchar("pdf_asset"),
  previewImages: jsonb("preview_images"), // array of preview image URLs
  language: varchar("language", { length: 10 }).default("fr"),
  pages: integer("pages"),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("DZD"),
  tags: jsonb("tags"), // array of tags
  status: varchar("status", { enum: ["draft", "review", "published", "archived"] }).default("draft"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quizzes
export const quizzes = pgTable("quizzes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  titleEn: varchar("title_en"),
  titleAr: varchar("title_ar"),
  description: text("description"),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  moduleId: varchar("module_id").references(() => modules.id),
  timeLimitSec: integer("time_limit_sec"),
  difficulty: varchar("difficulty", { enum: ["Easy", "Medium", "Hard"] }).default("Medium"),
  status: varchar("status", { enum: ["draft", "review", "published", "archived"] }).default("draft"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quiz questions
export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: uuid("quiz_id").references(() => quizzes.id),
  stem: text("stem"), // markdown question text
  stemEn: text("stem_en"),
  stemAr: text("stem_ar"),
  type: varchar("type", { enum: ["MCQ", "EMQ", "TrueFalse", "ShortAnswer", "CaseBased"] }),
  answerExplanation: text("answer_explanation"),
  answerExplanationEn: text("answer_explanation_en"),
  answerExplanationAr: text("answer_explanation_ar"),
  reference: varchar("reference"),
  orderIndex: integer("order_index"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Answer options for questions
export const options = pgTable("options", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: uuid("question_id").references(() => questions.id),
  label: varchar("label").notNull(),
  labelEn: varchar("label_en"),
  labelAr: varchar("label_ar"),
  isCorrect: boolean("is_correct").default(false),
  orderIndex: integer("order_index"),
});

// Clinical cases
export const cases = pgTable("cases", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  titleEn: varchar("title_en"),
  titleAr: varchar("title_ar"),
  description: text("description"),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  presentation: text("presentation"),
  presentationEn: text("presentation_en"),
  presentationAr: text("presentation_ar"),
  history: text("history"),
  historyEn: text("history_en"),
  historyAr: text("history_ar"),
  exam: text("exam"),
  examEn: text("exam_en"),
  examAr: text("exam_ar"),
  investigations: text("investigations"),
  investigationsEn: text("investigations_en"),
  investigationsAr: text("investigations_ar"),
  management: text("management"),
  managementEn: text("management_en"),
  managementAr: text("management_ar"),
  moduleId: varchar("module_id").references(() => modules.id),
  difficulty: varchar("difficulty"),
  status: varchar("status", { enum: ["draft", "review", "published", "archived"] }).default("draft"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// News items
export const newsItems = pgTable("news_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  source: varchar("source"),
  link: varchar("link"),
  summary: text("summary"),
  tags: jsonb("tags"),
  publishedAt: timestamp("published_at"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blog posts for admin content creation
export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  titleEn: varchar("title_en"),
  titleAr: varchar("title_ar"),
  slug: varchar("slug").unique(),
  content: text("content").notNull(), // Rich text/HTML content
  excerpt: text("excerpt"), // Short summary for preview
  category: varchar("category", { enum: ["Actualités", "Conseils", "Études", "Carrière", "Innovation"] }),
  coverImage: varchar("cover_image"),
  images: jsonb("images"), // array of image URLs used in content
  tags: jsonb("tags"), // array of tags
  readingTime: integer("reading_time"), // estimated minutes to read
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),
  featured: boolean("featured").default(false),
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("DZD"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("19.00"),
  isPremium: boolean("is_premium").default(false),
  metaTitle: varchar("meta_title"),
  metaDescription: text("meta_description"),
  status: varchar("status", { enum: ["draft", "review", "published", "archived"] }).default("draft"),
  publishedAt: timestamp("published_at"),
  createdBy: varchar("created_by").references(() => users.id),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blog post versions for versioning/history
export const blogPostVersions = pgTable("blog_post_versions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: uuid("post_id").references(() => blogPosts.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  changedBy: varchar("changed_by").references(() => users.id),
  changeReason: text("change_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// CMS Articles table for TipTap editor content
export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  titleEn: varchar("title_en"),
  titleAr: varchar("title_ar"),
  slug: varchar("slug").unique().notNull(),
  content: jsonb("content").notNull(), // TipTap JSON content
  contentEn: jsonb("content_en"), // English version
  contentAr: jsonb("content_ar"), // Arabic version
  metaDescription: text("meta_description"),
  metaDescriptionEn: text("meta_description_en"),
  metaDescriptionAr: text("meta_description_ar"),
  featuredImage: varchar("featured_image"),
  priceDzd: decimal("price_dzd", { precision: 10, scale: 2 }).default("0"),
  priceEur: decimal("price_eur", { precision: 10, scale: 2 }).default("0"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("19.00"),
  isPaid: boolean("is_paid").default(false),
  status: varchar("status", { enum: ["draft", "published", "archived"] }).default("draft"),
  translationStatus: varchar("translation_status", { enum: ["complete", "needs_review", "in_progress"] }).default("in_progress"),
  moduleId: varchar("module_id").references(() => modules.id),
  tags: jsonb("tags"), // array of tags
  yearLevels: jsonb("year_levels"), // array of year levels
  readingTime: integer("reading_time"), // estimated minutes to read
  viewCount: integer("view_count").default(0),
  authorId: varchar("author_id").references(() => users.id),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Article versions for version history
export const articleVersions = pgTable("article_versions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: uuid("article_id").references(() => articles.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  title: varchar("title").notNull(),
  content: jsonb("content").notNull(), // TipTap JSON content
  metaDescription: text("meta_description"),
  changedBy: varchar("changed_by").references(() => users.id),
  changeReason: text("change_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Article templates for reusable content structures
export const articleTemplates = pgTable("article_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category", { enum: ["Course", "ClinicalCase", "RevisionSheet", "Quiz", "Custom"] }).default("Custom"),
  content: jsonb("content").notNull(), // TipTap JSON template
  thumbnail: varchar("thumbnail"),
  isPublic: boolean("is_public").default(false),
  usageCount: integer("usage_count").default(0),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Purchases
export const purchases = pgTable("purchases", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  itemType: varchar("item_type", { enum: ["Course", "Summary", "Bundle"] }),
  itemId: varchar("item_id"),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("DZD"),
  status: varchar("status", { enum: ["paid", "pending", "failed"] }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments system
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type"), // "course", "summary", "case", etc.
  entityId: varchar("entity_id"),
  userId: varchar("user_id").references(() => users.id),
  body: text("body").notNull(),
  status: varchar("status", { enum: ["visible", "hidden", "pending"] }).default("visible"),
  parentId: uuid("parent_id").references(() => comments.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blacklist entries
export const blacklistEntries = pgTable("blacklist_entries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  reason: text("reason"),
  scope: varchar("scope", { enum: ["comments", "chat", "site"] }).default("comments"),
  expiresAt: timestamp("expires_at"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Media assets
export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name"),
  mimetype: varchar("mimetype"),
  size: integer("size"),
  url: varchar("url"),
  thumbnailUrl: varchar("thumbnail_url"),
  status: varchar("status", { enum: ["scanning", "approved", "rejected"] }).default("scanning"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// User settings (theme, preferences)
export const userSettings = pgTable("user_settings", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  theme: varchar("theme", { enum: ["light", "dark", "feminine_light", "feminine_dark"] }).default("light"),
  locale: varchar("locale", { length: 10 }).default("fr"),
  rtlPreference: boolean("rtl_preference").default(false),
  reducedMotion: boolean("reduced_motion").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit logs for tracking admin actions - RBAC security
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  userRole: varchar("user_role").notNull(), // role at time of action
  action: varchar("action").notNull(), // e.g., "user.update", "article.delete"
  entityType: varchar("entity_type"), // e.g., "user", "article", "settings"
  entityId: varchar("entity_id"), // ID of the affected entity
  oldValues: jsonb("old_values"), // Previous state
  newValues: jsonb("new_values"), // New state
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"), // Additional context
  severity: varchar("severity", { enum: ["info", "warning", "critical"] }).default("info"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_audit_logs_user").on(table.userId),
  index("idx_audit_logs_action").on(table.action),
  index("idx_audit_logs_entity").on(table.entityType, table.entityId),
  index("idx_audit_logs_created").on(table.createdAt),
]);

// Chat system - Conversations between administrators
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  participants: jsonb("participants").notNull(), // array of user IDs
  lastMessageAt: timestamp("last_message_at"),
  lastMessagePreview: text("last_message_preview"),
  unreadCount: jsonb("unread_count"), // object mapping userId to unread count
  type: varchar("type", { enum: ["direct", "group"] }).default("direct"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_conversations_participants").using('gin', table.participants),
  index("idx_conversations_last_message").on(table.lastMessageAt),
]);

// Chat system - Messages
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: uuid("conversation_id").references(() => conversations.id).notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id), // For direct messages
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
  attachments: jsonb("attachments"), // array of attachment objects (url, type, name)
  metadata: jsonb("metadata"), // Additional data like emoji reactions
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_messages_conversation").on(table.conversationId),
  index("idx_messages_sender").on(table.senderId),
  index("idx_messages_receiver").on(table.receiverId),
  index("idx_messages_created").on(table.createdAt),
]);

// Chat system - Online status tracking
export const onlineStatus = pgTable("online_status", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  isOnline: boolean("is_online").default(false),
  lastSeenAt: timestamp("last_seen_at").defaultNow(),
  currentlyTypingIn: uuid("currently_typing_in").references(() => conversations.id),
  socketId: varchar("socket_id"), // WebSocket connection ID
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Analytics - Site visitors tracking
export const siteVisitors = pgTable("site_visitors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  userId: varchar("user_id").references(() => users.id), // null for anonymous
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  country: varchar("country"),
  city: varchar("city"),
  referrer: varchar("referrer"),
  landingPage: varchar("landing_page"),
  pagesVisited: jsonb("pages_visited"), // array of page paths
  timeSpent: integer("time_spent"), // seconds
  deviceType: varchar("device_type", { enum: ["desktop", "mobile", "tablet"] }),
  isReturning: boolean("is_returning").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics - Page views
export const pageViews = pgTable("page_views", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(), // Just a string, no foreign key
  userId: varchar("user_id").references(() => users.id),
  path: varchar("path").notNull(),
  title: varchar("title"),
  timeSpent: integer("time_spent"), // seconds on page
  scrollDepth: integer("scroll_depth"), // percentage
  exitPage: boolean("exit_page").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics - Revenue tracking
export const revenueReports = pgTable("revenue_reports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  periodType: varchar("period_type", { enum: ["daily", "weekly", "monthly", "yearly"] }).notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).notNull(),
  courseRevenue: decimal("course_revenue", { precision: 12, scale: 2 }).default("0"),
  summaryRevenue: decimal("summary_revenue", { precision: 12, scale: 2 }).default("0"),
  bundleRevenue: decimal("bundle_revenue", { precision: 12, scale: 2 }).default("0"),
  transactionCount: integer("transaction_count").default(0),
  newCustomers: integer("new_customers").default(0),
  returningCustomers: integer("returning_customers").default(0),
  currency: varchar("currency", { length: 3 }).default("DZD"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Team management
export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  position: varchar("position").notNull(), // "Fondatrice", "Éditeur Médical", etc.
  department: varchar("department"), // "Administration", "Contenu", "Technique"
  permissions: jsonb("permissions"), // array of permission strings
  salary: decimal("salary", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("DZD"),
  hireDate: timestamp("hire_date").defaultNow(),
  status: varchar("status", { enum: ["active", "inactive", "suspended"] }).default("active"),
  supervisorId: varchar("supervisor_id").references(() => users.id),
  bio: text("bio"),
  skills: jsonb("skills"), // array of skill strings
  achievements: jsonb("achievements"), // array of achievement objects
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Google Drive file uploads with pricing
export const driveFiles = pgTable("drive_files", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  driveUrl: varchar("drive_url").notNull(), // Google Drive sharing link
  downloadUrl: varchar("download_url"), // Direct download link
  fileType: varchar("file_type", { enum: ["pdf", "docx", "pptx", "video", "image"] }),
  fileSize: varchar("file_size"), // "2.5 MB"
  moduleId: varchar("module_id").references(() => modules.id),
  category: varchar("category"), // "Cours", "Résumé", "Exercices"
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("DZD"),
  isFree: boolean("is_free").default(false),
  downloadCount: integer("download_count").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  tags: jsonb("tags"), // array of tags
  previewImages: jsonb("preview_images"), // array of preview image URLs
  status: varchar("status", { enum: ["draft", "review", "published", "archived"] }).default("draft"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Download tracking for monetization
export const fileDownloads = pgTable("file_downloads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fileId: uuid("file_id").references(() => driveFiles.id),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  downloadType: varchar("download_type", { enum: ["purchase", "free", "preview"] }),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Site settings - Store logo, fonts, branding
export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  settingKey: varchar("setting_key").unique().notNull(),
  settingValue: text("setting_value"),
  settingType: varchar("setting_type", { enum: ["image", "font", "text", "color", "json"] }).notNull(),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content submissions - Approval workflow
export const contentSubmissions = pgTable("content_submissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contentType: varchar("content_type", { enum: ["article", "post", "blog", "course", "case", "file", "image"] }).notNull(),
  contentId: varchar("content_id").notNull(),
  submittedBy: varchar("submitted_by").references(() => users.id).notNull(),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  status: varchar("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
  reviewNotes: text("review_notes"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

// Support tickets - Admin support system
export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  subject: varchar("subject").notNull(),
  description: text("description").notNull(),
  status: varchar("status", { enum: ["open", "in_progress", "resolved", "closed"] }).default("open").notNull(),
  priority: varchar("priority", { enum: ["low", "medium", "high", "urgent"] }).default("medium").notNull(),
  assignedTo: varchar("assigned_to").references(() => users.id),
  messages: jsonb("messages"), // array of {senderId, message, timestamp}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// MEDICAL GAMES SYSTEM - Jeux Médicaux Éducatifs
// ============================================

// Medical Games - Game scores tracking
export const gameScores = pgTable("game_scores", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  gameType: varchar("game_type", { 
    enum: ["anatomie_puzzle", "diagnostic_detective", "medicament_match", "urgence_chrono", "formule_chimique", "cytologie_slider"] 
  }).notNull(),
  score: integer("score").notNull(),
  timeSpent: integer("time_spent").notNull(), // in seconds
  difficulty: varchar("difficulty", { enum: ["facile", "moyen", "difficile", "expert"] }).default("facile"),
  level: integer("level").default(1),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }), // percentage
  completedAt: timestamp("completed_at").defaultNow(),
}, (table) => [
  index("idx_game_scores_user").on(table.userId),
  index("idx_game_scores_type").on(table.gameType),
  index("idx_game_scores_completed").on(table.completedAt),
]);

// Medical Games - Player progress and achievements
export const gameProgress = pgTable("game_progress", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  gameType: varchar("game_type", { 
    enum: ["anatomie_puzzle", "diagnostic_detective", "medicament_match", "urgence_chrono", "formule_chimique", "cytologie_slider"] 
  }).notNull(),
  currentLevel: integer("current_level").default(1),
  maxLevel: integer("max_level").default(1),
  totalXp: integer("total_xp").default(0),
  achievements: jsonb("achievements"), // array of achievement IDs
  unlockedItems: jsonb("unlocked_items"), // array of unlocked puzzle pieces, cases, etc.
  dailyStreak: integer("daily_streak").default(0),
  lastPlayedAt: timestamp("last_played_at").defaultNow(),
  statistics: jsonb("statistics"), // game-specific stats
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_game_progress_user_game").on(table.userId, table.gameType),
]);

// Medical Games - Diagnostic cases for Detective game
export const medicalCases = pgTable("medical_cases", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  titleEn: varchar("title_en"),
  titleAr: varchar("title_ar"),
  difficulty: varchar("difficulty", { enum: ["facile", "moyen", "difficile", "expert"] }).notNull(),
  category: varchar("category"), // "Cardiologie", "Neurologie", etc.
  symptoms: jsonb("symptoms").notNull(), // array of symptom descriptions
  symptomsEn: jsonb("symptoms_en"),
  symptomsAr: jsonb("symptoms_ar"),
  hints: jsonb("hints").notNull(), // array of progressive hints
  hintsEn: jsonb("hints_en"),
  hintsAr: jsonb("hints_ar"),
  diagnosis: varchar("diagnosis").notNull(),
  diagnosisEn: varchar("diagnosis_en"),
  diagnosisAr: varchar("diagnosis_ar"),
  explanation: text("explanation").notNull(),
  explanationEn: text("explanation_en"),
  explanationAr: text("explanation_ar"),
  labResults: jsonb("lab_results"), // optional lab test results
  imaging: jsonb("imaging"), // optional imaging findings
  treatments: jsonb("treatments"), // correct treatment options
  points: integer("points").default(100),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical Games - Anatomy puzzle configurations
export const anatomyPuzzles = pgTable("anatomy_puzzles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  nameEn: varchar("name_en"),
  nameAr: varchar("name_ar"),
  category: varchar("category", { enum: ["squelette", "organes", "systeme_nerveux", "muscles", "circulation"] }).notNull(),
  difficulty: varchar("difficulty", { enum: ["facile", "moyen", "difficile"] }).notNull(),
  bodySystem: varchar("body_system"),
  pieces: jsonb("pieces").notNull(), // array of puzzle piece configurations
  backgroundImage: varchar("background_image"),
  completedImage: varchar("completed_image"),
  timeLimit: integer("time_limit"), // in seconds
  points: integer("points").default(100),
  orderIndex: integer("order_index"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical Games - Medicine matching pairs
export const medicineMatchPairs = pgTable("medicine_match_pairs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  category: varchar("category", { enum: ["antibiotiques", "cardio", "psychotropes", "analgesiques", "vitamines"] }).notNull(),
  medicineName: varchar("medicine_name").notNull(),
  medicineNameEn: varchar("medicine_name_en"),
  medicineNameAr: varchar("medicine_name_ar"),
  indication: varchar("indication").notNull(),
  indicationEn: varchar("indication_en"),
  indicationAr: varchar("indication_ar"),
  image: varchar("image"),
  difficulty: varchar("difficulty", { enum: ["facile", "moyen", "difficile"] }).notNull(),
  additionalInfo: text("additional_info"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical Games - Emergency scenarios
export const emergencyScenarios = pgTable("emergency_scenarios", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  titleEn: varchar("title_en"),
  titleAr: varchar("title_ar"),
  type: varchar("type", { enum: ["arret_cardiaque", "avc", "trauma", "intoxication", "hemorragie"] }).notNull(),
  scenario: text("scenario").notNull(),
  scenarioEn: text("scenario_en"),
  scenarioAr: text("scenario_ar"),
  correctSequence: jsonb("correct_sequence").notNull(), // array of correct action IDs in order
  availableActions: jsonb("available_actions").notNull(), // all possible actions
  timeLimit: integer("time_limit").notNull(), // in seconds
  criticalActions: jsonb("critical_actions"), // must-do actions
  feedback: jsonb("feedback"), // feedback for each action
  difficulty: varchar("difficulty", { enum: ["facile", "moyen", "difficile", "expert"] }).notNull(),
  points: integer("points").default(100),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical Games - Chemical formulas
export const chemicalFormulas = pgTable("chemical_formulas", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  drugName: varchar("drug_name").notNull(),
  drugNameEn: varchar("drug_name_en"),
  drugNameAr: varchar("drug_name_ar"),
  formula: varchar("formula").notNull(), // molecular formula
  structure: jsonb("structure").notNull(), // atom and bond configuration
  category: varchar("category"), // WHO essential medicines category
  difficulty: varchar("difficulty", { enum: ["facile", "moyen", "difficile"] }).notNull(),
  hint: text("hint"),
  description: text("description"),
  points: integer("points").default(100),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical Games - Leaderboard
export const gameLeaderboard = pgTable("game_leaderboard", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  gameType: varchar("game_type", { 
    enum: ["anatomie_puzzle", "diagnostic_detective", "medicament_match", "urgence_chrono", "formule_chimique", "cytologie_slider", "overall"] 
  }).notNull(),
  period: varchar("period", { enum: ["daily", "weekly", "monthly", "alltime"] }).notNull(),
  score: integer("score").notNull(),
  rank: integer("rank"),
  gamesPlayed: integer("games_played").default(1),
  averageScore: decimal("average_score", { precision: 10, scale: 2 }),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_leaderboard_game_period").on(table.gameType, table.period),
  index("idx_leaderboard_score").on(table.score.desc()),
]);

// Medical Games - Achievements
export const gameAchievements = pgTable("game_achievements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  nameEn: varchar("name_en"),
  nameAr: varchar("name_ar"),
  description: text("description").notNull(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  icon: varchar("icon"),
  category: varchar("category", { enum: ["speed", "accuracy", "completion", "streak", "mastery", "special"] }).notNull(),
  gameType: varchar("game_type"), // null for cross-game achievements
  criteria: jsonb("criteria").notNull(), // conditions to unlock
  xpReward: integer("xp_reward").default(50),
  rarity: varchar("rarity", { enum: ["common", "rare", "epic", "legendary"] }).default("common"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics snapshots - Daily aggregated analytics
export const analyticsSnapshots = pgTable("analytics_snapshots", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  snapshotDate: timestamp("snapshot_date").notNull().unique(),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0"),
  totalTransactions: integer("total_transactions").default(0),
  newUsers: integer("new_users").default(0),
  activeUsers: integer("active_users").default(0),
  pageViews: integer("page_views").default(0),
  uniqueVisitors: integer("unique_visitors").default(0),
  articlesPublished: integer("articles_published").default(0),
  articlesSold: integer("articles_sold").default(0),
  avgSessionDuration: integer("avg_session_duration").default(0), // seconds
  topPages: jsonb("top_pages"), // array of {page, views}
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics events - Raw event tracking
export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: varchar("event_type").notNull(), // "page_view", "purchase", "signup", "article_view"
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id").notNull(),
  metadata: jsonb("metadata"), // event-specific data
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User blacklist audit - Blacklist history
export const userBlacklistAudit = pgTable("user_blacklist_audit", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  action: varchar("action", { enum: ["blacklisted", "unblacklisted"] }).notNull(),
  reason: text("reason"),
  performedBy: varchar("performed_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Posts - Social-style posts
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  titleEn: varchar("title_en"),
  titleAr: varchar("title_ar"),
  content: text("content").notNull(),
  contentEn: text("content_en"),
  contentAr: text("content_ar"),
  images: jsonb("images"), // array of image URLs
  postType: varchar("post_type", { enum: ["announcement", "tip", "news", "discussion"] }).default("announcement").notNull(),
  isPinned: boolean("is_pinned").default(false),
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("DZD"),
  status: varchar("status", { enum: ["draft", "review", "published", "archived"] }).default("draft").notNull(),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events - Educational events
export const events = pgTable("events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  titleEn: varchar("title_en"),
  titleAr: varchar("title_ar"),
  description: text("description"),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  eventType: varchar("event_type", { enum: ["webinar", "workshop", "conference", "exam"] }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: varchar("location"),
  isOnline: boolean("is_online").default(true),
  meetingLink: varchar("meeting_link"),
  maxParticipants: integer("max_participants"),
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("DZD"),
  coverImage: varchar("cover_image"),
  status: varchar("status", { enum: ["draft", "review", "published", "cancelled"] }).default("draft").notNull(),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course enrollments - Track user course progress
export const courseEnrollments = pgTable("course_enrollments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  courseId: uuid("course_id").references(() => courses.id),
  status: varchar("status", { enum: ["enrolled", "completed", "dropped"] }).default("enrolled"),
  progress: integer("progress").default(0), // 0-100%
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quiz attempts - Track quiz performance
export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  quizId: uuid("quiz_id").references(() => quizzes.id),
  score: integer("score"), // percentage 0-100
  passed: boolean("passed").default(false),
  timeTaken: integer("time_taken_sec"),
  answers: jsonb("answers"), // { questionId: answer }
  createdAt: timestamp("created_at").defaultNow(),
});

// Case completions - Track clinical case solving
export const caseCompletions = pgTable("case_completions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  caseId: uuid("case_id").references(() => cases.id),
  solved: boolean("solved").default(false),
  timeSpent: integer("time_spent_sec"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Summary downloads - Track summary access
export const summaryDownloads = pgTable("summary_downloads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  summaryId: uuid("summary_id").references(() => summaries.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// User badges - Achievement system
export const userBadges = pgTable("user_badges", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  badgeType: varchar("badge_type", { enum: ["gold", "silver", "bronze"] }),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// MIMI LIBRARY SYSTEM - La Bib de mimi (مكتبة ميمي)
// ============================================

// Library Categories - Hierarchical organization for library items
export const libraryCategories = pgTable("library_categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  // Section-specific categories
  section: varchar("section", { 
    enum: ["islamic", "diverse", "palestine"] 
  }).notNull(),
  // Category details
  name: varchar("name").notNull(),
  nameEn: varchar("name_en"),
  nameAr: varchar("name_ar"),
  description: text("description"),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  // Hierarchical organization
  parentId: uuid("parent_id"), // Self-reference for subcategories
  orderIndex: integer("order_index").default(0),
  // Islamic-specific metadata
  madhhab: varchar("madhhab"), // School of jurisprudence (Maliki, Hanafi, Shafi'i, Hanbali)
  era: varchar("era"), // Hijri century or era (e.g., "3rd century", "classical", "contemporary")
  level: varchar("level", { enum: ["beginner", "intermediate", "advanced"] }),
  // Icon and styling
  icon: varchar("icon"),
  color: varchar("color"),
  // Metadata
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_library_categories_section").on(table.section),
  index("idx_library_categories_parent").on(table.parentId),
]);

// Library Items - Books, documents, media for all 3 sections
export const libraryItems = pgTable("library_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  // Section identifier
  section: varchar("section", { 
    enum: ["islamic", "diverse", "palestine"] 
  }).notNull(),
  // Core content
  title: varchar("title").notNull(),
  titleEn: varchar("title_en"),
  titleAr: varchar("title_ar"),
  description: text("description"),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  // Author/Creator information
  author: varchar("author"),
  authorEn: varchar("author_en"),
  authorAr: varchar("author_ar"),
  authorBio: text("author_bio"), // Islamic scholar bio
  authorEra: varchar("author_era"), // For Islamic scholars
  // Category and organization
  categoryId: uuid("category_id").references(() => libraryCategories.id),
  tags: jsonb("tags"), // array of keywords
  keywords: jsonb("keywords"), // For search optimization
  // Islamic-specific fields
  madhhab: varchar("madhhab"), // School of jurisprudence
  subject: varchar("subject"), // Exegesis, Fiqh, Aqeedah, etc.
  language: varchar("language", { length: 10 }).default("ar"), // Default Arabic for Islamic texts
  originalLanguage: varchar("original_language"),
  translator: varchar("translator"),
  publicationDate: varchar("publication_date"), // Hijri or Gregorian
  // Content format and files
  format: varchar("format", { 
    enum: ["pdf", "epub", "audio", "video", "image", "article", "link"] 
  }).notNull(),
  fileUrl: varchar("file_url"), // Main file URL
  coverImage: varchar("cover_image"),
  previewImages: jsonb("preview_images"), // array of preview images
  audioUrl: varchar("audio_url"), // For accessibility (malvoyants)
  videoUrl: varchar("video_url"), // For Palestine section
  externalLink: varchar("external_link"), // External resources
  // File metadata
  fileSize: integer("file_size"), // in bytes
  pages: integer("pages"), // For PDFs
  duration: integer("duration"), // in seconds for audio/video
  // Community features
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"), // 0.00 to 5.00
  ratingCount: integer("rating_count").default(0),
  downloadCount: integer("download_count").default(0),
  viewCount: integer("view_count").default(0),
  favoriteCount: integer("favorite_count").default(0),
  // Moderation and approval
  status: varchar("status", { 
    enum: ["pending", "approved", "rejected", "archived"] 
  }).default("pending"),
  rejectionReason: text("rejection_reason"),
  moderationNotes: text("moderation_notes"), // Internal notes for moderators
  // Submission and approval tracking
  submittedBy: varchar("submitted_by").references(() => users.id).notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectedBy: varchar("rejected_by").references(() => users.id),
  rejectedAt: timestamp("rejected_at"),
  // Metadata
  isCollaborative: boolean("is_collaborative").default(true), // User-submitted content
  isFeatured: boolean("is_featured").default(false),
  isPremium: boolean("is_premium").default(false), // Future premium content
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_library_items_section").on(table.section),
  index("idx_library_items_category").on(table.categoryId),
  index("idx_library_items_status").on(table.status),
  index("idx_library_items_submitted_by").on(table.submittedBy),
  index("idx_library_items_approved_by").on(table.approvedBy),
]);

// Library Favorites - User favorites/bookmarks
export const libraryFavorites = pgTable("library_favorites", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  itemId: uuid("item_id").references(() => libraryItems.id, { onDelete: 'cascade' }).notNull(),
  notes: text("notes"), // Personal notes
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_library_favorites_user").on(table.userId),
  index("idx_library_favorites_item").on(table.itemId),
]);

// Library Ratings - User ratings for items
export const libraryRatings = pgTable("library_ratings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  itemId: uuid("item_id").references(() => libraryItems.id, { onDelete: 'cascade' }).notNull(),
  rating: integer("rating").notNull(), // 1-5
  review: text("review"), // Optional text review
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_library_ratings_user").on(table.userId),
  index("idx_library_ratings_item").on(table.itemId),
]);

// Library Downloads - Track downloads for analytics
export const libraryDownloads = pgTable("library_downloads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  itemId: uuid("item_id").references(() => libraryItems.id, { onDelete: 'cascade' }).notNull(),
  ipAddress: varchar("ip_address"), // For anonymous downloads
  userAgent: varchar("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_library_downloads_user").on(table.userId),
  index("idx_library_downloads_item").on(table.itemId),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  summaries: many(summaries),
  quizzes: many(quizzes),
  cases: many(cases),
  purchases: many(purchases),
  comments: many(comments),
  blogPosts: many(blogPosts),
  uploads: many(mediaAssets),
}));

export const modulesRelations = relations(modules, ({ many }) => ({
  courses: many(courses),
  summaries: many(summaries),
  quizzes: many(quizzes),
  cases: many(cases),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  module: one(modules, { fields: [courses.moduleId], references: [modules.id] }),
  creator: one(users, { fields: [courses.createdBy], references: [users.id] }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  course: one(courses, { fields: [lessons.courseId], references: [courses.id] }),
}));

export const summariesRelations = relations(summaries, ({ one }) => ({
  module: one(modules, { fields: [summaries.moduleId], references: [modules.id] }),
  creator: one(users, { fields: [summaries.createdBy], references: [users.id] }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  module: one(modules, { fields: [quizzes.moduleId], references: [modules.id] }),
  creator: one(users, { fields: [quizzes.createdBy], references: [users.id] }),
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  quiz: one(quizzes, { fields: [questions.quizId], references: [quizzes.id] }),
  options: many(options),
}));

export const optionsRelations = relations(options, ({ one }) => ({
  question: one(questions, { fields: [options.questionId], references: [questions.id] }),
}));

export const casesRelations = relations(cases, ({ one }) => ({
  module: one(modules, { fields: [cases.moduleId], references: [modules.id] }),
  creator: one(users, { fields: [cases.createdBy], references: [users.id] }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  parent: one(comments, { fields: [comments.parentId], references: [comments.id] }),
  replies: many(comments),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, { fields: [purchases.userId], references: [users.id] }),
}));

export const siteVisitorsRelations = relations(siteVisitors, ({ one, many }) => ({
  user: one(users, { fields: [siteVisitors.userId], references: [users.id] }),
  pageViews: many(pageViews),
}));

export const pageViewsRelations = relations(pageViews, ({ one }) => ({
  user: one(users, { fields: [pageViews.userId], references: [users.id] }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, { fields: [teamMembers.userId], references: [users.id] }),
  supervisor: one(users, { fields: [teamMembers.supervisorId], references: [users.id] }),
  creator: one(users, { fields: [teamMembers.createdBy], references: [users.id] }),
}));

export const driveFilesRelations = relations(driveFiles, ({ one, many }) => ({
  module: one(modules, { fields: [driveFiles.moduleId], references: [modules.id] }),
  creator: one(users, { fields: [driveFiles.createdBy], references: [users.id] }),
  downloads: many(fileDownloads),
}));

export const fileDownloadsRelations = relations(fileDownloads, ({ one }) => ({
  file: one(driveFiles, { fields: [fileDownloads.fileId], references: [driveFiles.id] }),
  user: one(users, { fields: [fileDownloads.userId], references: [users.id] }),
}));

// Contracts - System for agreements between roles (Owner-Admin, Admin-Editor, etc.)
export const contracts = pgTable("contracts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(), // e.g., "Contrat Owner-Admin 2025"
  contractType: varchar("contract_type", { 
    enum: ["owner_admin", "admin_editor", "editor_consultant", "custom"] 
  }).notNull(),
  // Parties involved
  partyAId: varchar("party_a_id").references(() => users.id).notNull(), // e.g., Owner
  partyARole: varchar("party_a_role", { enum: ["owner", "admin", "editor", "viewer", "consultant"] }).notNull(),
  partyBId: varchar("party_b_id").references(() => users.id).notNull(), // e.g., Admin
  partyBRole: varchar("party_b_role", { enum: ["owner", "admin", "editor", "viewer", "consultant"] }).notNull(),
  // Financial terms
  revenueSharePercentageA: decimal("revenue_share_percentage_a", { precision: 5, scale: 2 }), // Party A percentage
  revenueSharePercentageB: decimal("revenue_share_percentage_b", { precision: 5, scale: 2 }), // Party B percentage
  fixedPayment: decimal("fixed_payment", { precision: 10, scale: 2 }), // Optional fixed payment
  currency: varchar("currency", { length: 3 }).default("DZD"),
  paymentFrequency: varchar("payment_frequency", { 
    enum: ["monthly", "quarterly", "annual", "per_sale", "one_time"] 
  }),
  // Contract details
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"), // null = indefinite
  autoRenew: boolean("auto_renew").default(false),
  // Status and signatures
  status: varchar("status", { 
    enum: ["draft", "pending_signature_a", "pending_signature_b", "active", "expired", "terminated"] 
  }).default("draft"),
  signedByAAt: timestamp("signed_by_a_at"),
  signedByBAt: timestamp("signed_by_b_at"),
  terminationReason: text("termination_reason"),
  terminatedAt: timestamp("terminated_at"),
  // Metadata
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contract Clauses - Detailed clauses for each contract
export const contractClauses = pgTable("contract_clauses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: uuid("contract_id").references(() => contracts.id, { onDelete: 'cascade' }).notNull(),
  clauseNumber: varchar("clause_number").notNull(), // e.g., "1.1", "2.3"
  title: varchar("title").notNull(), // e.g., "Obligations de l'Administrateur"
  content: text("content").notNull(), // Detailed clause text
  clauseType: varchar("clause_type", { 
    enum: ["financial", "responsibilities", "confidentiality", "termination", "liability", "other"] 
  }).default("other"),
  isMandatory: boolean("is_mandatory").default(true),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contract Signatures - Electronic signatures for contracts
export const contractSignatures = pgTable("contract_signatures", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: uuid("contract_id").references(() => contracts.id, { onDelete: 'cascade' }).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  userRole: varchar("user_role", { enum: ["owner", "admin", "editor", "viewer", "consultant"] }).notNull(),
  signatureType: varchar("signature_type", { 
    enum: ["electronic", "digital_certificate", "manual_upload"] 
  }).default("electronic"),
  signatureData: text("signature_data"), // Base64 signature image or certificate data
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  consentText: text("consent_text"), // The text user agreed to
  signedAt: timestamp("signed_at").defaultNow(),
});

// Relations for contracts
export const contractsRelations = relations(contracts, ({ one, many }) => ({
  partyA: one(users, { fields: [contracts.partyAId], references: [users.id] }),
  partyB: one(users, { fields: [contracts.partyBId], references: [users.id] }),
  creator: one(users, { fields: [contracts.createdBy], references: [users.id] }),
  clauses: many(contractClauses),
  signatures: many(contractSignatures),
}));

export const contractClausesRelations = relations(contractClauses, ({ one }) => ({
  contract: one(contracts, { fields: [contractClauses.contractId], references: [contracts.id] }),
}));

export const contractSignaturesRelations = relations(contractSignatures, ({ one }) => ({
  contract: one(contracts, { fields: [contractSignatures.contractId], references: [contracts.id] }),
  user: one(users, { fields: [contractSignatures.userId], references: [users.id] }),
}));

// Revenue Sharing System - Pyramidal revenue distribution
// Content Sales - Track all content sales to trigger revenue sharing
export const contentSales = pgTable("content_sales", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contentType: varchar("content_type", { 
    enum: ["course", "summary", "article", "quiz", "case", "blogPost", "driveFile"] 
  }).notNull(),
  contentId: varchar("content_id").notNull(), // ID of the sold content
  contentTitle: varchar("content_title"), // Cached for reporting
  buyerId: varchar("buyer_id").references(() => users.id).notNull(),
  authorId: varchar("author_id").references(() => users.id).notNull(), // Creator of content
  saleAmount: decimal("sale_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("DZD"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(), // Amount after tax
  paymentMethod: varchar("payment_method", { enum: ["stripe", "ccp", "paypal", "other"] }),
  transactionId: varchar("transaction_id"), // External payment reference
  status: varchar("status", { enum: ["completed", "pending", "refunded", "failed"] }).default("completed"),
  refundedAt: timestamp("refunded_at"),
  refundReason: text("refund_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Revenue Share Agreements - Links contracts to revenue sharing configuration
export const revenueShareAgreements = pgTable("revenue_share_agreements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: uuid("contract_id").references(() => contracts.id, { onDelete: 'cascade' }).notNull(),
  agreementType: varchar("agreement_type", { 
    enum: ["owner_admin", "admin_editor", "editor_consultant", "custom"] 
  }).notNull(),
  // Parties involved
  ownerId: varchar("owner_id").references(() => users.id), // Top of pyramid
  adminId: varchar("admin_id").references(() => users.id), // Middle tier
  editorId: varchar("editor_id").references(() => users.id), // Content creator tier
  // Default percentages (can be overridden per tier)
  ownerDefaultPercentage: decimal("owner_default_percentage", { precision: 5, scale: 2 }).default("40.00"),
  adminDefaultPercentage: decimal("admin_default_percentage", { precision: 5, scale: 2 }).default("30.00"),
  editorDefaultPercentage: decimal("editor_default_percentage", { precision: 5, scale: 2 }).default("30.00"),
  // Configuration
  isActive: boolean("is_active").default(true),
  appliesTo: jsonb("applies_to"), // array of content types this applies to
  minimumPayout: decimal("minimum_payout", { precision: 10, scale: 2 }).default("1000.00"), // Minimum DZD to trigger payout
  currency: varchar("currency", { length: 3 }).default("DZD"),
  // Metadata
  notes: text("notes"),
  activatedAt: timestamp("activated_at"),
  deactivatedAt: timestamp("deactivated_at"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Revenue Share Tiers - Specific percentage configurations per user/level
export const revenueShareTiers = pgTable("revenue_share_tiers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  agreementId: uuid("agreement_id").references(() => revenueShareAgreements.id, { onDelete: 'cascade' }).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  userRole: varchar("user_role", { enum: ["owner", "admin", "editor", "consultant"] }).notNull(),
  tierLevel: integer("tier_level").notNull(), // 1=owner, 2=admin, 3=editor
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(), // e.g., 40.00 for 40%
  // Optional overrides per content type
  contentTypeOverrides: jsonb("content_type_overrides"), // { "article": 35, "course": 45 }
  // Status
  isActive: boolean("is_active").default(true),
  effectiveFrom: timestamp("effective_from").defaultNow(),
  effectiveUntil: timestamp("effective_until"),
  // Metadata
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Revenue Ledger - Complete transaction log of all revenue shares
export const revenueLedger = pgTable("revenue_ledger", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  saleId: uuid("sale_id").references(() => contentSales.id, { onDelete: 'cascade' }).notNull(),
  agreementId: uuid("agreement_id").references(() => revenueShareAgreements.id),
  tierId: uuid("tier_id").references(() => revenueShareTiers.id),
  // Recipient of this share
  recipientId: varchar("recipient_id").references(() => users.id).notNull(),
  recipientRole: varchar("recipient_role", { enum: ["owner", "admin", "editor", "consultant"] }).notNull(),
  // Financial details
  shareAmount: decimal("share_amount", { precision: 10, scale: 2 }).notNull(),
  sharePercentage: decimal("share_percentage", { precision: 5, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("DZD"),
  // Sale context (cached for reporting)
  contentType: varchar("content_type").notNull(),
  contentId: varchar("content_id").notNull(),
  contentTitle: varchar("content_title"),
  originalAmount: decimal("original_amount", { precision: 10, scale: 2 }).notNull(), // Total sale amount
  // Payout tracking
  payoutStatus: varchar("payout_status", { 
    enum: ["pending", "processing", "completed", "failed", "on_hold"] 
  }).default("pending"),
  payoutMethod: varchar("payout_method", { enum: ["bank_transfer", "ccp", "paypal", "crypto", "other"] }),
  payoutReference: varchar("payout_reference"), // External payout transaction ID
  payoutDate: timestamp("payout_date"),
  payoutNotes: text("payout_notes"),
  // Audit
  calculatedAt: timestamp("calculated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_revenue_ledger_recipient").on(table.recipientId),
  index("idx_revenue_ledger_sale").on(table.saleId),
  index("idx_revenue_ledger_content").on(table.contentType, table.contentId),
  index("idx_revenue_ledger_payout").on(table.payoutStatus),
]);

// Relations for revenue sharing
export const contentSalesRelations = relations(contentSales, ({ one, many }) => ({
  buyer: one(users, { fields: [contentSales.buyerId], references: [users.id] }),
  author: one(users, { fields: [contentSales.authorId], references: [users.id] }),
  ledgerEntries: many(revenueLedger),
}));

export const revenueShareAgreementsRelations = relations(revenueShareAgreements, ({ one, many }) => ({
  contract: one(contracts, { fields: [revenueShareAgreements.contractId], references: [contracts.id] }),
  owner: one(users, { fields: [revenueShareAgreements.ownerId], references: [users.id] }),
  admin: one(users, { fields: [revenueShareAgreements.adminId], references: [users.id] }),
  editor: one(users, { fields: [revenueShareAgreements.editorId], references: [users.id] }),
  creator: one(users, { fields: [revenueShareAgreements.createdBy], references: [users.id] }),
  tiers: many(revenueShareTiers),
  ledgerEntries: many(revenueLedger),
}));

export const revenueShareTiersRelations = relations(revenueShareTiers, ({ one, many }) => ({
  agreement: one(revenueShareAgreements, { fields: [revenueShareTiers.agreementId], references: [revenueShareAgreements.id] }),
  user: one(users, { fields: [revenueShareTiers.userId], references: [users.id] }),
  creator: one(users, { fields: [revenueShareTiers.createdBy], references: [users.id] }),
  ledgerEntries: many(revenueLedger),
}));

export const revenueLedgerRelations = relations(revenueLedger, ({ one }) => ({
  sale: one(contentSales, { fields: [revenueLedger.saleId], references: [contentSales.id] }),
  agreement: one(revenueShareAgreements, { fields: [revenueLedger.agreementId], references: [revenueShareAgreements.id] }),
  tier: one(revenueShareTiers, { fields: [revenueLedger.tierId], references: [revenueShareTiers.id] }),
  recipient: one(users, { fields: [revenueLedger.recipientId], references: [users.id] }),
}));

// Library Relations
export const libraryCategoriesRelations = relations(libraryCategories, ({ one, many }) => ({
  parent: one(libraryCategories, { fields: [libraryCategories.parentId], references: [libraryCategories.id] }),
  subcategories: many(libraryCategories),
  items: many(libraryItems),
  creator: one(users, { fields: [libraryCategories.createdBy], references: [users.id] }),
}));

export const libraryItemsRelations = relations(libraryItems, ({ one, many }) => ({
  category: one(libraryCategories, { fields: [libraryItems.categoryId], references: [libraryCategories.id] }),
  submitter: one(users, { fields: [libraryItems.submittedBy], references: [users.id] }),
  approver: one(users, { fields: [libraryItems.approvedBy], references: [users.id] }),
  rejecter: one(users, { fields: [libraryItems.rejectedBy], references: [users.id] }),
  favorites: many(libraryFavorites),
  ratings: many(libraryRatings),
  downloads: many(libraryDownloads),
}));

export const libraryFavoritesRelations = relations(libraryFavorites, ({ one }) => ({
  user: one(users, { fields: [libraryFavorites.userId], references: [users.id] }),
  item: one(libraryItems, { fields: [libraryFavorites.itemId], references: [libraryItems.id] }),
}));

export const libraryRatingsRelations = relations(libraryRatings, ({ one }) => ({
  user: one(users, { fields: [libraryRatings.userId], references: [users.id] }),
  item: one(libraryItems, { fields: [libraryRatings.itemId], references: [libraryItems.id] }),
}));

export const libraryDownloadsRelations = relations(libraryDownloads, ({ one }) => ({
  user: one(users, { fields: [libraryDownloads.userId], references: [users.id] }),
  item: one(libraryItems, { fields: [libraryDownloads.itemId], references: [libraryItems.id] }),
}));

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type InsertModule = typeof modules.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;
export type Summary = typeof summaries.$inferSelect;
export type InsertSummary = typeof summaries.$inferInsert;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;
export type Case = typeof cases.$inferSelect;
export type InsertCase = typeof cases.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;
export type ArticleVersion = typeof articleVersions.$inferSelect;
export type InsertArticleVersion = typeof articleVersions.$inferInsert;
export type ArticleTemplate = typeof articleTemplates.$inferSelect;
export type InsertArticleTemplate = typeof articleTemplates.$inferInsert;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = typeof mediaAssets.$inferInsert;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;
export type SiteVisitor = typeof siteVisitors.$inferSelect;
export type InsertSiteVisitor = typeof siteVisitors.$inferInsert;
export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;
export type RevenueReport = typeof revenueReports.$inferSelect;
export type InsertRevenueReport = typeof revenueReports.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;
export type DriveFile = typeof driveFiles.$inferSelect;
export type InsertDriveFile = typeof driveFiles.$inferInsert;
export type FileDownload = typeof fileDownloads.$inferSelect;
export type InsertFileDownload = typeof fileDownloads.$inferInsert;
export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;
export type ContractClause = typeof contractClauses.$inferSelect;
export type InsertContractClause = typeof contractClauses.$inferInsert;
export type ContractSignature = typeof contractSignatures.$inferSelect;
export type InsertContractSignature = typeof contractSignatures.$inferInsert;

// Tracking tables type exports
export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type InsertCourseEnrollment = typeof courseEnrollments.$inferInsert;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;
export type CaseCompletion = typeof caseCompletions.$inferSelect;
export type InsertCaseCompletion = typeof caseCompletions.$inferInsert;
export type SummaryDownload = typeof summaryDownloads.$inferSelect;
export type InsertSummaryDownload = typeof summaryDownloads.$inferInsert;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;
export type ContentSale = typeof contentSales.$inferSelect;
export type InsertContentSale = typeof contentSales.$inferInsert;
export type RevenueShareAgreement = typeof revenueShareAgreements.$inferSelect;
export type InsertRevenueShareAgreement = typeof revenueShareAgreements.$inferInsert;
export type RevenueShareTier = typeof revenueShareTiers.$inferSelect;
export type InsertRevenueShareTier = typeof revenueShareTiers.$inferInsert;
export type RevenueLedger = typeof revenueLedger.$inferSelect;
export type InsertRevenueLedger = typeof revenueLedger.$inferInsert;
export type LibraryCategory = typeof libraryCategories.$inferSelect;
export type InsertLibraryCategory = typeof libraryCategories.$inferInsert;
export type LibraryItem = typeof libraryItems.$inferSelect;
export type InsertLibraryItem = typeof libraryItems.$inferInsert;
export type LibraryFavorite = typeof libraryFavorites.$inferSelect;
export type InsertLibraryFavorite = typeof libraryFavorites.$inferInsert;
export type LibraryRating = typeof libraryRatings.$inferSelect;
export type InsertLibraryRating = typeof libraryRatings.$inferInsert;
export type LibraryDownload = typeof libraryDownloads.$inferSelect;
export type InsertLibraryDownload = typeof libraryDownloads.$inferInsert;