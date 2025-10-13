// Storage layer for MediMimi - Database operations
import {
  users,
  modules,
  courses,
  summaries,
  quizzes,
  cases,
  comments,
  blogPosts,
  articles,
  articleVersions,
  articleTemplates,
  mediaAssets,
  userSettings,
  blacklistEntries,
  siteVisitors,
  pageViews,
  revenueReports,
  purchases,
  driveFiles,
  teamMembers,
  type User,
  type UpsertUser,
  type Module,
  type InsertModule,
  type Course,
  type InsertCourse,
  type Summary,
  type InsertSummary,
  type Quiz,
  type InsertQuiz,
  type Case,
  type InsertCase,
  type Comment,
  type InsertComment,
  type BlogPost,
  type InsertBlogPost,
  type Article,
  type InsertArticle,
  type ArticleVersion,
  type InsertArticleVersion,
  type ArticleTemplate,
  type InsertArticleTemplate,
  type MediaAsset,
  type InsertMediaAsset,
  type UserSettings,
  type InsertUserSettings,
  type SiteVisitor,
  type PageView,
  type RevenueReport,
  type DriveFile,
  type InsertDriveFile,
  type TeamMember,
} from "../shared/schema";
import { db } from "./db";
import { eq, and, desc, like, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User management operations
  updateUserRole(userId: string, role: string): Promise<User>;
  blacklistUser(userId: string, reason: string, scope: string, expiresAt?: Date): Promise<void>;
  unblacklistUser(userId: string): Promise<void>;
  
  // Module operations
  getModules(): Promise<Module[]>;
  getModule(id: string): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;
  updateModule(id: string, updates: Partial<InsertModule>): Promise<Module>;
  
  // Course operations
  getCourses(filters?: { moduleId?: string; yearLevels?: string[]; language?: string }): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course>;
  updateCourseStatus(id: string, status: string): Promise<Course>;
  
  // Summary operations
  getSummaries(filters?: { moduleId?: string; language?: string }): Promise<Summary[]>;
  getSummary(id: string): Promise<Summary | undefined>;
  createSummary(summary: InsertSummary): Promise<Summary>;
  updateSummary(id: string, updates: Partial<InsertSummary>): Promise<Summary>;
  updateSummaryStatus(id: string, status: string): Promise<Summary>;
  
  // Quiz operations
  getQuizzes(filters?: { moduleId?: string; difficulty?: string }): Promise<Quiz[]>;
  getQuiz(id: string): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuiz(id: string, updates: Partial<InsertQuiz>): Promise<Quiz>;
  
  // Case operations
  getCases(filters?: { moduleId?: string; difficulty?: string }): Promise<Case[]>;
  getCase(id: string): Promise<Case | undefined>;
  createCase(caseData: InsertCase): Promise<Case>;
  updateCase(id: string, updates: Partial<InsertCase>): Promise<Case>;
  
  // Comment operations
  getComments(entityType: string, entityId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateCommentStatus(id: string, status: string): Promise<Comment>;
  deleteComment(id: string): Promise<void>;
  
  // Media operations
  createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset>;
  getMediaAsset(id: string): Promise<MediaAsset | undefined>;
  updateMediaAssetStatus(id: string, status: string): Promise<MediaAsset>;
  getUserMediaAssets(userId: string): Promise<MediaAsset[]>;
  
  // User settings
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  upsertUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  
  // Search operations
  searchContent(query: string, types?: string[]): Promise<{
    courses: Course[];
    summaries: Summary[];
    cases: Case[];
  }>;
  
  // Blog post operations
  getBlogPosts(filters?: { category?: string; featured?: boolean; status?: string }): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<BlogPost>;
  updateBlogPostStatus(id: string, status: string): Promise<BlogPost>;
  deleteBlogPost(id: string): Promise<void>;
  
  // Admin Dashboard operations
  getDashboardStats(): Promise<any>;
  
  // Article operations for CMS
  getArticles(filters?: { status?: string; isPaid?: boolean; moduleId?: string; authorId?: string }): Promise<Article[]>;
  getArticle(id: string): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, updates: Partial<InsertArticle>): Promise<Article>;
  updateArticleStatus(id: string, status: string): Promise<Article>;
  deleteArticle(id: string): Promise<void>;
  
  // Article version operations
  getArticleVersions(articleId: string): Promise<ArticleVersion[]>;
  createArticleVersion(version: InsertArticleVersion): Promise<ArticleVersion>;
  
  // Article template operations
  getArticleTemplates(filters?: { category?: string; isPublic?: boolean }): Promise<ArticleTemplate[]>;
  getArticleTemplate(id: string): Promise<ArticleTemplate | undefined>;
  createArticleTemplate(template: InsertArticleTemplate): Promise<ArticleTemplate>;
  updateArticleTemplate(id: string, updates: Partial<InsertArticleTemplate>): Promise<ArticleTemplate>;
  deleteArticleTemplate(id: string): Promise<void>;
  getRevenueStats(period?: string): Promise<RevenueReport[]>;
  getAllUsers(filters?: { role?: string; isBlacklisted?: boolean }): Promise<User[]>;
  getTeamMembers(): Promise<TeamMember[]>;
  getDriveFiles(filters?: { category?: string; moduleId?: string }): Promise<DriveFile[]>;
  createDriveFile(file: InsertDriveFile): Promise<DriveFile>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User management operations
  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role: role as any, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async blacklistUser(userId: string, reason: string, scope: string, expiresAt?: Date): Promise<void> {
    await db.insert(blacklistEntries).values({
      userId,
      reason,
      scope: scope as any,
      expiresAt,
      createdBy: userId, // In real implementation, this would be the admin's ID
    });

    await db
      .update(users)
      .set({ isBlacklisted: true, blacklistReason: reason })
      .where(eq(users.id, userId));
  }

  async unblacklistUser(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ isBlacklisted: false, blacklistReason: null })
      .where(eq(users.id, userId));
  }

  // Module operations
  async getModules(): Promise<Module[]> {
    return await db.select().from(modules);
  }

  async getModule(id: string): Promise<Module | undefined> {
    const [module] = await db.select().from(modules).where(eq(modules.id, id));
    return module;
  }

  async createModule(module: InsertModule): Promise<Module> {
    const [newModule] = await db.insert(modules).values(module).returning();
    return newModule;
  }

  async updateModule(id: string, updates: Partial<InsertModule>): Promise<Module> {
    const [updatedModule] = await db
      .update(modules)
      .set(updates)
      .where(eq(modules.id, id))
      .returning();
    return updatedModule;
  }

  // Course operations
  async getCourses(filters?: { moduleId?: string; yearLevels?: string[]; language?: string }): Promise<Course[]> {
    let query = db.select().from(courses);
    
    if (filters?.moduleId) {
      query = query.where(eq(courses.moduleId, filters.moduleId));
    }
    if (filters?.language) {
      query = query.where(eq(courses.language, filters.language));
    }
    
    return await query.orderBy(desc(courses.createdAt));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async updateCourseStatus(id: string, status: string): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  // Summary operations
  async getSummaries(filters?: { moduleId?: string; language?: string }): Promise<Summary[]> {
    let query = db.select().from(summaries);
    
    if (filters?.moduleId) {
      query = query.where(eq(summaries.moduleId, filters.moduleId));
    }
    if (filters?.language) {
      query = query.where(eq(summaries.language, filters.language));
    }
    
    return await query.orderBy(desc(summaries.createdAt));
  }

  async getSummary(id: string): Promise<Summary | undefined> {
    const [summary] = await db.select().from(summaries).where(eq(summaries.id, id));
    return summary;
  }

  async createSummary(summary: InsertSummary): Promise<Summary> {
    const [newSummary] = await db.insert(summaries).values(summary).returning();
    return newSummary;
  }

  async updateSummary(id: string, updates: Partial<InsertSummary>): Promise<Summary> {
    const [updatedSummary] = await db
      .update(summaries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(summaries.id, id))
      .returning();
    return updatedSummary;
  }

  async updateSummaryStatus(id: string, status: string): Promise<Summary> {
    const [updatedSummary] = await db
      .update(summaries)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(summaries.id, id))
      .returning();
    return updatedSummary;
  }

  // Quiz operations
  async getQuizzes(filters?: { moduleId?: string; difficulty?: string }): Promise<Quiz[]> {
    let query = db.select().from(quizzes);
    
    if (filters?.moduleId) {
      query = query.where(eq(quizzes.moduleId, filters.moduleId));
    }
    if (filters?.difficulty) {
      query = query.where(eq(quizzes.difficulty, filters.difficulty));
    }
    
    return await query.orderBy(desc(quizzes.createdAt));
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
  }

  async updateQuiz(id: string, updates: Partial<InsertQuiz>): Promise<Quiz> {
    const [updatedQuiz] = await db
      .update(quizzes)
      .set(updates)
      .where(eq(quizzes.id, id))
      .returning();
    return updatedQuiz;
  }

  // Case operations
  async getCases(filters?: { moduleId?: string; difficulty?: string }): Promise<Case[]> {
    let query = db.select().from(cases);
    
    if (filters?.moduleId) {
      query = query.where(eq(cases.moduleId, filters.moduleId));
    }
    if (filters?.difficulty) {
      query = query.where(eq(cases.difficulty, filters.difficulty));
    }
    
    return await query.orderBy(desc(cases.createdAt));
  }

  async getCase(id: string): Promise<Case | undefined> {
    const [case_] = await db.select().from(cases).where(eq(cases.id, id));
    return case_;
  }

  async createCase(caseData: InsertCase): Promise<Case> {
    const [newCase] = await db.insert(cases).values(caseData).returning();
    return newCase;
  }

  async updateCase(id: string, updates: Partial<InsertCase>): Promise<Case> {
    const [updatedCase] = await db
      .update(cases)
      .set(updates)
      .where(eq(cases.id, id))
      .returning();
    return updatedCase;
  }

  // Comment operations
  async getComments(entityType: string, entityId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.entityType, entityType),
          eq(comments.entityId, entityId),
          eq(comments.status, "visible")
        )
      )
      .orderBy(desc(comments.createdAt));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async updateCommentStatus(id: string, status: string): Promise<Comment> {
    const [updatedComment] = await db
      .update(comments)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return updatedComment;
  }

  async deleteComment(id: string): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  // Media operations
  async createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset> {
    const [newAsset] = await db.insert(mediaAssets).values(asset).returning();
    return newAsset;
  }

  async getMediaAsset(id: string): Promise<MediaAsset | undefined> {
    const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
    return asset;
  }

  async updateMediaAssetStatus(id: string, status: string): Promise<MediaAsset> {
    const [updatedAsset] = await db
      .update(mediaAssets)
      .set({ status: status as any })
      .where(eq(mediaAssets.id, id))
      .returning();
    return updatedAsset;
  }

  async getUserMediaAssets(userId: string): Promise<MediaAsset[]> {
    return await db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.uploadedBy, userId))
      .orderBy(desc(mediaAssets.createdAt));
  }

  // User settings
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    return settings;
  }

  async upsertUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const [upsertedSettings] = await db
      .insert(userSettings)
      .values(settings)
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: {
          ...settings,
          updatedAt: new Date(),
        },
      })
      .returning();
    return upsertedSettings;
  }

  // Search operations
  async searchContent(query: string, types?: string[]): Promise<{
    courses: Course[];
    summaries: Summary[];
    cases: Case[];
  }> {
    const searchTerm = `%${query}%`;
    
    const searchCourses = (!types || types.includes('courses')) 
      ? await db
          .select()
          .from(courses)
          .where(like(courses.title, searchTerm))
          .limit(10)
      : [];
    
    const searchSummaries = (!types || types.includes('summaries'))
      ? await db
          .select()
          .from(summaries)
          .where(like(summaries.title, searchTerm))
          .limit(10)
      : [];
    
    const searchCases = (!types || types.includes('cases'))
      ? await db
          .select()
          .from(cases)
          .where(like(cases.title, searchTerm))
          .limit(10)
      : [];

    return {
      courses: searchCourses,
      summaries: searchSummaries,
      cases: searchCases,
    };
  }

  // Blog post operations
  async getBlogPosts(filters?: { category?: string; featured?: boolean; status?: string }): Promise<BlogPost[]> {
    let query = db.select().from(blogPosts);
    
    if (filters?.category) {
      query = query.where(eq(blogPosts.category, filters.category));
    }
    if (filters?.featured !== undefined) {
      query = query.where(eq(blogPosts.featured, filters.featured));
    }
    if (filters?.status) {
      query = query.where(eq(blogPosts.status, filters.status));
    }
    
    return await query.orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db.insert(blogPosts).values(post).returning();
    return newPost;
  }

  async updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [updatedPost] = await db
      .update(blogPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedPost;
  }

  async updateBlogPostStatus(id: string, status: string): Promise<BlogPost> {
    const [updatedPost] = await db
      .update(blogPosts)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedPost;
  }

  async deleteBlogPost(id: string): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  // Admin Dashboard operations
  async getDashboardStats(): Promise<any> {
    // Get user counts
    const totalUsers = await db.select({ count: users.id }).from(users);
    const activeUsers = await db.select({ count: users.id }).from(users).where(eq(users.isBlacklisted, false));
    
    // Get content counts
    const totalCourses = await db.select({ count: courses.id }).from(courses).where(eq(courses.status, 'published'));
    const totalSummaries = await db.select({ count: summaries.id }).from(summaries).where(eq(summaries.status, 'published'));
    const totalBlogPosts = await db.select({ count: blogPosts.id }).from(blogPosts).where(eq(blogPosts.status, 'published'));
    
    // Get today's visitors
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVisitors = await db
      .select({ count: siteVisitors.id })
      .from(siteVisitors)
      .where(eq(siteVisitors.createdAt, today));
    
    // Get revenue for current week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekRevenue = await db
      .select({ total: purchases.price })
      .from(purchases)
      .where(and(
        eq(purchases.status, 'paid'),
        eq(purchases.createdAt, weekAgo)
      ));
    
    return {
      totalUsers: totalUsers[0]?.count || 0,
      activeUsers: activeUsers[0]?.count || 0,
      totalCourses: totalCourses[0]?.count || 0,
      totalSummaries: totalSummaries[0]?.count || 0,
      totalBlogPosts: totalBlogPosts[0]?.count || 0,
      todayVisitors: todayVisitors[0]?.count || 0,
      weekRevenue: weekRevenue.reduce((sum, r) => sum + Number(r.total || 0), 0),
    };
  }

  async getRevenueStats(period: string = 'weekly'): Promise<RevenueReport[]> {
    return await db
      .select()
      .from(revenueReports)
      .where(eq(revenueReports.periodType, period))
      .orderBy(desc(revenueReports.periodStart))
      .limit(10);
  }

  async getAllUsers(filters?: { role?: string; isBlacklisted?: boolean }): Promise<User[]> {
    let query = db.select().from(users);
    
    if (filters?.role) {
      query = query.where(eq(users.role, filters.role));
    }
    if (filters?.isBlacklisted !== undefined) {
      query = query.where(eq(users.isBlacklisted, filters.isBlacklisted));
    }
    
    return await query.orderBy(desc(users.createdAt));
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    return await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.status, 'active'))
      .orderBy(desc(teamMembers.createdAt));
  }

  async getDriveFiles(filters?: { category?: string; moduleId?: string }): Promise<DriveFile[]> {
    let query = db.select().from(driveFiles);
    
    if (filters?.category) {
      query = query.where(eq(driveFiles.category, filters.category));
    }
    if (filters?.moduleId) {
      query = query.where(eq(driveFiles.moduleId, filters.moduleId));
    }
    
    return await query.orderBy(desc(driveFiles.createdAt));
  }

  async createDriveFile(file: InsertDriveFile): Promise<DriveFile> {
    const [newFile] = await db.insert(driveFiles).values(file).returning();
    return newFile;
  }

  // Article operations for CMS
  async getArticles(filters?: { status?: string; isPaid?: boolean; moduleId?: string; authorId?: string }): Promise<Article[]> {
    let query = db.select().from(articles);
    
    if (filters?.status) {
      query = query.where(eq(articles.status, filters.status));
    }
    if (filters?.isPaid !== undefined) {
      query = query.where(eq(articles.isPaid, filters.isPaid));
    }
    if (filters?.moduleId) {
      query = query.where(eq(articles.moduleId, filters.moduleId));
    }
    if (filters?.authorId) {
      query = query.where(eq(articles.authorId, filters.authorId));
    }
    
    return await query.orderBy(desc(articles.createdAt));
  }

  async getArticle(id: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.slug, slug));
    return article;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db.insert(articles).values(article).returning();
    return newArticle;
  }

  async updateArticle(id: string, updates: Partial<InsertArticle>): Promise<Article> {
    const [updatedArticle] = await db
      .update(articles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return updatedArticle;
  }

  async updateArticleStatus(id: string, status: string): Promise<Article> {
    return await this.updateArticle(id, { 
      status: status as 'draft' | 'published' | 'archived',
      publishedAt: status === 'published' ? new Date() : undefined 
    });
  }

  async deleteArticle(id: string): Promise<void> {
    await db.delete(articles).where(eq(articles.id, id));
  }

  // Article version operations
  async getArticleVersions(articleId: string): Promise<ArticleVersion[]> {
    return await db
      .select()
      .from(articleVersions)
      .where(eq(articleVersions.articleId, articleId))
      .orderBy(desc(articleVersions.createdAt));
  }

  async createArticleVersion(version: InsertArticleVersion): Promise<ArticleVersion> {
    const [newVersion] = await db.insert(articleVersions).values(version).returning();
    return newVersion;
  }

  // Article template operations
  async getArticleTemplates(filters?: { category?: string; isPublic?: boolean }): Promise<ArticleTemplate[]> {
    let query = db.select().from(articleTemplates);
    
    if (filters?.category) {
      query = query.where(eq(articleTemplates.category, filters.category));
    }
    if (filters?.isPublic !== undefined) {
      query = query.where(eq(articleTemplates.isPublic, filters.isPublic));
    }
    
    return await query.orderBy(desc(articleTemplates.createdAt));
  }

  async getArticleTemplate(id: string): Promise<ArticleTemplate | undefined> {
    const [template] = await db.select().from(articleTemplates).where(eq(articleTemplates.id, id));
    return template;
  }

  async createArticleTemplate(template: InsertArticleTemplate): Promise<ArticleTemplate> {
    const [newTemplate] = await db.insert(articleTemplates).values(template).returning();
    return newTemplate;
  }

  async updateArticleTemplate(id: string, updates: Partial<InsertArticleTemplate>): Promise<ArticleTemplate> {
    const [updatedTemplate] = await db
      .update(articleTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(articleTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  async deleteArticleTemplate(id: string): Promise<void> {
    await db.delete(articleTemplates).where(eq(articleTemplates.id, id));
  }
}

export const storage = new DatabaseStorage();