import type { Express } from "express";
import express from "express";
import { storage } from "./storage";
import { db } from "./db";
import { blogPosts, blogPostVersions, users, purchases, siteVisitors, pageViews, revenueReports, auditLogs } from "../shared/schema";
import { eq, desc, and, between, count, sum, sql } from "drizzle-orm";
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import bcrypt from 'bcryptjs';
// import { objectStorageService } from './objectStorage'; // TODO: Implement when object storage is configured
import * as stripe from './stripe';
import { 
  requirePermission, 
  requireRole, 
  getUserPermissions, 
  userHasPermission,
  canManageRole,
  type Permission,
  type UserRole 
} from './rbac';

// Helper to get authenticated user ID from RBAC middleware
function getAuthenticatedUserId(req: any): string {
  const userId = req.user?.claims?.sub || req.session?.adminUserId;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return userId;
}

// Helper to get authenticated user ID (returns null if not authenticated)
function tryGetAuthenticatedUserId(req: any): string | null {
  return req.user?.claims?.sub || req.session?.adminUserId || null;
}

// Multer configuration for media uploads
const storage_multer = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/articles';
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for images
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Article validation schema
const articleSchema = z.object({
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().optional(),
  category: z.enum(['Actualités', 'Conseils', 'Études', 'Carrière', 'Innovation']),
  tags: z.array(z.string()).optional(),
  price: z.number().default(0),
  currency: z.string().default('DZD'),
  taxRate: z.number().default(19),
  isPremium: z.boolean().default(false),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'review', 'published', 'archived']).default('draft'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  coverImage: z.string().optional(),
  readingTime: z.number().optional(),
});

// Audit log helper
async function logAdminAction(
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  oldValues?: any,
  newValues?: any,
  metadata?: any,
  severity: 'info' | 'warning' | 'critical' = 'info'
) {
  const user = await storage.getUser(userId);
  await db.insert(auditLogs).values({
    userId,
    userRole: user?.role || 'unknown',
    action,
    entityType,
    entityId,
    oldValues,
    newValues,
    metadata,
    severity,
    ipAddress: metadata?.ipAddress,
    userAgent: metadata?.userAgent
  });
}

// Legacy middleware for backward compatibility - now uses new RBAC system
export function requireAdmin(req: any, res: any, next: any) {
  return requirePermission('content.edit')(req, res, next);
}

export function registerAdminRoutes(app: Express) {
  // Admin login with password (for owner account)
  app.post('/api/admin/login', async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      
      // Get user by email
      const [user] = await db.select().from(users).where(eq(users.email, email));
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check if user has admin/owner role
      if (!['owner', 'admin', 'editor'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Verify password
      if (!user.password) {
        return res.status(401).json({ message: "Password login not enabled for this account" });
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        await logAdminAction(
          user.id,
          'failed_login_attempt',
          'user',
          user.id,
          null,
          null,
          { email, ipAddress: req.ip, userAgent: req.get('user-agent') },
          'warning'
        );
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Update last login
      await db.update(users).set({ 
        lastLoginAt: new Date() 
      }).where(eq(users.id, user.id));
      
      // Store user in session
      req.session.adminUserId = user.id;
      req.session.adminRole = user.role;
      
      console.log('🔐 Admin login: Saving session for user', user.id);
      
      // Save session explicitly before responding
      await new Promise<void>((resolve, reject) => {
        req.session.save((err: any) => {
          if (err) {
            console.error('❌ Session save error:', err);
            reject(err);
          } else {
            console.log('✅ Session saved successfully, sessionID:', req.sessionID);
            resolve();
          }
        });
      });
      
      // Log successful login
      await logAdminAction(
        user.id,
        'admin_login',
        'user',
        user.id,
        null,
        null,
        { email, ipAddress: req.ip, userAgent: req.get('user-agent') },
        'info'
      );
      
      res.json({ 
        success: true,
        user: { 
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          forcePasswordChange: user.forcePasswordChange
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Check admin status
  app.get('/api/admin/check', async (req: any, res) => {
    try {
      const userId = tryGetAuthenticatedUserId(req);
      
      if (!userId) {
        return res.json({ isAdmin: false });
      }
      
      const user = await storage.getUser(userId);
      const perms = await getUserPermissions(userId);
      const isAdminUser = user && ['owner', 'admin', 'editor'].includes(user.role);
      
      res.json({ 
        isAdmin: isAdminUser,
        role: user?.role,
        permissions: perms.permissions
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check admin status" });
    }
  });

  // ===== ARTICLE ROUTES =====
  
  // Get all articles (admin)
  app.get('/api/admin/articles', requirePermission('content.edit'), async (req, res) => {
    try {
      const articles = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
      res.json(articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ message: 'Failed to fetch articles' });
    }
  });

  // Get single article (admin)
  app.get('/api/admin/articles/:id', requirePermission('content.edit'), async (req, res) => {
    try {
      const [article] = await db.select().from(blogPosts).where(eq(blogPosts.id, req.params.id));
      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }
      res.json(article);
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({ message: 'Failed to fetch article' });
    }
  });

  // Create article
  app.post('/api/admin/articles', requirePermission('content.edit'), async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const validated = articleSchema.parse(req.body);
      
      // Create article
      const [article] = await db.insert(blogPosts).values({
        ...validated,
        createdBy: userId,
        updatedBy: userId,
        publishedAt: validated.status === 'published' ? new Date() : null,
      }).returning();

      // Create initial version
      await db.insert(blogPostVersions).values({
        postId: article.id,
        versionNumber: 1,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        changedBy: userId,
        changeReason: 'Initial creation',
      });

      res.json(article);
    } catch (error) {
      console.error('Error creating article:', error);
      res.status(500).json({ message: 'Failed to create article' });
    }
  });

  // Update article
  app.put('/api/admin/articles/:id', requirePermission('content.edit'), async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const validated = articleSchema.partial().parse(req.body);
      
      // Get current article for versioning
      const [currentArticle] = await db.select().from(blogPosts).where(eq(blogPosts.id, req.params.id));
      if (!currentArticle) {
        return res.status(404).json({ message: 'Article not found' });
      }

      // Get latest version number
      const [latestVersion] = await db
        .select({ maxVersion: sql`MAX(version_number)` })
        .from(blogPostVersions)
        .where(eq(blogPostVersions.postId, req.params.id));

      const nextVersionNumber = (latestVersion?.maxVersion || 0) + 1;

      // Update article
      const [updatedArticle] = await db
        .update(blogPosts)
        .set({
          ...validated,
          updatedBy: userId,
          updatedAt: new Date(),
          publishedAt: validated.status === 'published' && !currentArticle.publishedAt ? new Date() : currentArticle.publishedAt,
        })
        .where(eq(blogPosts.id, req.params.id))
        .returning();

      // Create new version
      await db.insert(blogPostVersions).values({
        postId: req.params.id,
        versionNumber: nextVersionNumber,
        title: updatedArticle.title,
        content: updatedArticle.content,
        excerpt: updatedArticle.excerpt,
        changedBy: userId,
        changeReason: req.body.changeReason || 'Update',
      });

      res.json(updatedArticle);
    } catch (error) {
      console.error('Error updating article:', error);
      res.status(500).json({ message: 'Failed to update article' });
    }
  });

  // Delete article
  app.delete('/api/admin/articles/:id', requirePermission('content.edit'), async (req, res) => {
    try {
      await db.delete(blogPosts).where(eq(blogPosts.id, req.params.id));
      res.json({ message: 'Article deleted successfully' });
    } catch (error) {
      console.error('Error deleting article:', error);
      res.status(500).json({ message: 'Failed to delete article' });
    }
  });

  // Upload image
  app.post('/api/admin/upload', requirePermission('content.edit'), upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // For now, return a placeholder URL until object storage is configured
      // TODO: Upload to object storage when available
      // const fileBuffer = await fs.readFile(req.file.path);
      // const fileName = `articles/${Date.now()}-${req.file.originalname}`;
      // const url = await objectStorageService.uploadFile(fileName, fileBuffer, req.file.mimetype);
      
      const url = `/uploads/${req.file.filename}`;

      // Clean up local file
      await fs.unlink(req.file.path);

      res.json({ url });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Failed to upload file' });
    }
  });

  // ===== ANALYTICS ROUTES =====

  // Get dashboard stats
  app.get('/api/admin/stats', requirePermission('analytics.view_basic'), async (req, res) => {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Get user stats
      const totalUsers = await db.select({ count: count() }).from(users);
      const blacklistedUsers = await db.select({ count: count() }).from(users).where(eq(users.isBlacklisted, true));

      // Get content stats
      const totalCourses = await db.select({ count: count() }).from(blogPosts).where(eq(blogPosts.status, 'published'));
      
      // Get visitor stats
      const todayVisitors = await db.select({ count: count() }).from(siteVisitors).where(
        between(siteVisitors.createdAt, todayStart, now)
      );

      // Get revenue stats for the month
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthRevenue = await db.select({ total: sum(purchases.price) })
        .from(purchases)
        .where(
          and(
            eq(purchases.status, 'paid'),
            between(purchases.createdAt, monthStart, now)
          )
        );

      res.json({
        totalUsers: totalUsers[0]?.count || 0,
        activeUsers: (totalUsers[0]?.count || 0) - (blacklistedUsers[0]?.count || 0),
        blacklistedUsers: blacklistedUsers[0]?.count || 0,
        totalArticles: totalCourses[0]?.count || 0,
        todayVisitors: todayVisitors[0]?.count || 0,
        monthRevenue: monthRevenue[0]?.total || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  // Get analytics data
  app.get('/api/admin/analytics', requirePermission('analytics.view_basic'), async (req, res) => {
    try {
      const period = parseInt(req.query.period as string) || 30; // days
      const now = new Date();
      const startDate = new Date(now.getTime() - period * 24 * 60 * 60 * 1000);

      // Get daily visitors
      const dailyVisitors = await db
        .select({
          date: sql`DATE(created_at)`,
          count: count(),
        })
        .from(siteVisitors)
        .where(between(siteVisitors.createdAt, startDate, now))
        .groupBy(sql`DATE(created_at)`)
        .orderBy(sql`DATE(created_at)`);

      // Get daily revenue
      const dailyRevenue = await db
        .select({
          date: sql`DATE(created_at)`,
          total: sum(purchases.price),
        })
        .from(purchases)
        .where(
          and(
            eq(purchases.status, 'paid'),
            between(purchases.createdAt, startDate, now)
          )
        )
        .groupBy(sql`DATE(created_at)`)
        .orderBy(sql`DATE(created_at)`);

      // Get page views
      const pageViews = await db
        .select({
          path: pageViews.path,
          count: count(),
        })
        .from(pageViews)
        .where(between(pageViews.createdAt, startDate, now))
        .groupBy(pageViews.path)
        .orderBy(desc(count()))
        .limit(10);

      res.json({
        dailyVisitors,
        dailyRevenue,
        pageViews,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  // ===== USER MANAGEMENT ROUTES =====

  // Get all users
  app.get('/api/admin/users', requirePermission('users.edit'), async (req: any, res) => {
    try {
      const allUsers = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        yearOfStudy: users.yearOfStudy,
        isBlacklisted: users.isBlacklisted,
        blacklistReason: users.blacklistReason,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt
      }).from(users).orderBy(desc(users.createdAt));

      // Log access to user data
      try {
        const userId = getAuthenticatedUserId(req);
        await logAdminAction(
          userId,
          'users.list',
          'users',
          null,
          null,
          null,
          { count: allUsers.length },
          'info'
        );
      } catch (err) {
        console.error('Failed to log admin action:', err);
      }

      res.json(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  // Update user role
  app.put('/api/admin/users/:id/role', requirePermission('users.edit'), async (req: any, res) => {
    try {
      const { role } = req.body;
      const targetUserId = req.params.id;

      // Prevent changing owner role unless you are owner
      const [targetUser] = await db.select().from(users).where(eq(users.id, targetUserId));
      const userRole = req.userRole;
      if (targetUser?.role === 'owner' && userRole !== 'owner') {
        return res.status(403).json({ message: 'Cannot modify owner account' });
      }

      // Update role
      const [updatedUser] = await db.update(users)
        .set({ role, updatedAt: new Date() })
        .where(eq(users.id, targetUserId))
        .returning();

      // Log the action
      try {
        const userId = getAuthenticatedUserId(req);
        await logAdminAction(
          userId,
          'user.role_change',
          'user',
          targetUserId,
          { role: targetUser?.role },
          { role },
          { 
            performedBy: userId,
            targetUser: targetUser?.email 
          },
          'warning'
        );
      } catch (err) {
        console.error('Failed to log admin action:', err);
      }

      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ message: 'Failed to update user role' });
    }
  });

  // Blacklist/unblacklist user
  app.put('/api/admin/users/:id/blacklist', requirePermission('users.edit'), async (req: any, res) => {
    try {
      const { blacklist, reason } = req.body;
      const targetUserId = req.params.id;

      // Cannot blacklist owner
      const [targetUser] = await db.select().from(users).where(eq(users.id, targetUserId));
      if (targetUser?.role === 'owner') {
        return res.status(403).json({ message: 'Cannot blacklist owner account' });
      }

      // Update blacklist status
      const [updatedUser] = await db.update(users)
        .set({ 
          isBlacklisted: blacklist,
          blacklistReason: blacklist ? reason : null,
          updatedAt: new Date() 
        })
        .where(eq(users.id, targetUserId))
        .returning();

      // Log the action
      try {
        const userId = getAuthenticatedUserId(req);
        await logAdminAction(
          userId,
          blacklist ? 'user.blacklisted' : 'user.unblacklisted',
          'user',
          targetUserId,
          { isBlacklisted: targetUser?.isBlacklisted },
          { isBlacklisted: blacklist, reason },
          { 
            performedBy: userId,
            targetUser: targetUser?.email 
          },
          'critical'
        );
      } catch (err) {
        console.error('Failed to log admin action:', err);
      }

      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating blacklist status:', error);
      res.status(500).json({ message: 'Failed to update blacklist status' });
    }
  });

  // Delete user (soft delete by blacklisting)
  app.delete('/api/admin/users/:id', requirePermission('users.edit'), async (req: any, res) => {
    try {
      const targetUserId = req.params.id;

      // Cannot delete owner or self
      const userId = getAuthenticatedUserId(req);
      const [targetUser] = await db.select().from(users).where(eq(users.id, targetUserId));
      if (targetUser?.role === 'owner') {
        return res.status(403).json({ message: 'Cannot delete owner account' });
      }
      if (targetUserId === userId) {
        return res.status(403).json({ message: 'Cannot delete your own account' });
      }

      // Soft delete by blacklisting
      await db.update(users)
        .set({ 
          isBlacklisted: true,
          blacklistReason: 'Account deleted by admin',
          updatedAt: new Date() 
        })
        .where(eq(users.id, targetUserId));

      // Log the action
      try {
        await logAdminAction(
          userId,
          'user.deleted',
          'user',
          targetUserId,
          targetUser,
          null,
          { 
            performedBy: userId,
            targetUser: targetUser?.email 
          },
          'critical'
        );
      } catch (err) {
        console.error('Failed to log admin action:', err);
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // ===== STRIPE ROUTES =====

  // Create checkout session for article
  app.post('/api/stripe/create-checkout', requirePermission('finance.process_payments'), async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const { itemId, itemType, itemTitle, price, taxRate } = req.body;

      const session = await stripe.createCheckoutSession({
        userId,
        itemType,
        itemId,
        itemTitle,
        priceInDZD: price,
        taxRate,
        successUrl: `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${req.headers.origin}/payment/cancel`,
      });

      res.json(session);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ message: 'Failed to create checkout session' });
    }
  });

  // ===== CMS ARTICLE ROUTES =====
  
  // Get CMS articles with filters
  app.get('/api/admin/cms/articles', requirePermission('content.edit'), async (req, res) => {
    try {
      const { status, isPaid, moduleId } = req.query;
      const filters: any = {};
      
      if (status && status !== 'all') filters.status = status as string;
      if (isPaid && isPaid !== 'all') filters.isPaid = isPaid === 'true';
      if (moduleId) filters.moduleId = moduleId as string;
      
      const articles = await storage.getArticles(filters);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching CMS articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Get single CMS article
  app.get('/api/admin/cms/articles/:id', requirePermission('content.edit'), async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error fetching CMS article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Create CMS article
  app.post('/api/admin/cms/articles', requirePermission('content.edit'), async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const articleData = {
        ...req.body,
        authorId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const article = await storage.createArticle(articleData);
      
      // Create initial version
      await storage.createArticleVersion({
        articleId: article.id,
        versionNumber: 1,
        title: article.title,
        content: article.content,
        metaDescription: article.metaDescription,
        changedBy: userId,
        changeReason: 'Initial creation',
        createdAt: new Date(),
      });
      
      // Log the action
      await logAdminAction(
        userId,
        'cms.article.created',
        'article',
        article.id,
        null,
        article,
        { title: article.title },
        'info'
      );
      
      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating CMS article:", error);
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  // Update CMS article
  app.put('/api/admin/cms/articles/:id', requirePermission('content.edit'), async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const { id } = req.params;
      
      // Get current article for version history
      const currentArticle = await storage.getArticle(id);
      if (!currentArticle) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      // Update article
      const updatedArticle = await storage.updateArticle(id, {
        ...req.body,
        updatedAt: new Date(),
      });
      
      // Create version entry if content changed
      if (JSON.stringify(currentArticle.content) !== JSON.stringify(req.body.content)) {
        const versions = await storage.getArticleVersions(id);
        await storage.createArticleVersion({
          articleId: id,
          versionNumber: versions.length + 1,
          title: updatedArticle.title,
          content: updatedArticle.content,
          metaDescription: updatedArticle.metaDescription,
          changedBy: userId,
          changeReason: req.body.changeReason || 'Content update',
          createdAt: new Date(),
        });
      }
      
      // Log the action
      await logAdminAction(
        userId,
        'cms.article.updated',
        'article',
        id,
        currentArticle,
        updatedArticle,
        { title: updatedArticle.title },
        'info'
      );
      
      res.json(updatedArticle);
    } catch (error) {
      console.error("Error updating CMS article:", error);
      res.status(500).json({ message: "Failed to update article" });
    }
  });

  // Delete CMS article
  app.delete('/api/admin/cms/articles/:id', requirePermission('content.edit'), async (req: any, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      await storage.deleteArticle(req.params.id);
      
      // Log the action
      try {
        const userId = getAuthenticatedUserId(req);
        await logAdminAction(
          userId,
          'cms.article.deleted',
          'article',
          req.params.id,
          article,
          null,
          { title: article.title },
          'warning'
        );
      } catch (err) {
        console.error('Failed to log admin action:', err);
      }
      
      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      console.error("Error deleting CMS article:", error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Get CMS templates
  app.get('/api/admin/cms/templates', requirePermission('content.edit'), async (req, res) => {
    try {
      const { category, isPublic } = req.query;
      const filters: any = {};
      
      if (category) filters.category = category as string;
      if (isPublic !== undefined) filters.isPublic = isPublic === 'true';
      
      const templates = await storage.getArticleTemplates(filters);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Create CMS template
  app.post('/api/admin/cms/templates', requirePermission('content.edit'), async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const templateData = {
        ...req.body,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const template = await storage.createArticleTemplate(templateData);
      
      // Log the action
      await logAdminAction(
        userId,
        'cms.template.created',
        'template',
        template.id,
        null,
        template,
        { name: template.name },
        'info'
      );
      
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  // Get financial analytics (for Owner Dashboard)
  app.get('/api/admin/financial/analytics', requirePermission('users.view'), async (req, res) => {
    try {
      const { timeRange = 'month', currency = 'all' } = req.query;

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Build where conditions
      const whereConditions = [
        eq(purchases.status, 'paid'),
        gte(purchases.createdAt, startDate)
      ];

      // Add currency filter if specified
      if (currency !== 'all') {
        whereConditions.push(eq(purchases.currency, currency as string));
      }

      // Query purchases from database
      const purchaseData = await db
        .select({
          id: purchases.id,
          itemType: purchases.itemType,
          itemId: purchases.itemId,
          price: purchases.price,
          currency: purchases.currency,
          status: purchases.status,
          userId: purchases.userId,
          createdAt: purchases.createdAt,
        })
        .from(purchases)
        .where(and(...whereConditions));

      // If no purchases, return empty/default data
      if (purchaseData.length === 0) {
        return res.json({
          revenueByArticle: [],
          revenueByAuthor: [],
          monthlyRevenue: [],
          summary: {
            totalRevenueDZD: 0,
            totalRevenueEUR: 0,
            totalSales: 0,
            paidArticlesCount: 0,
          },
          shareDistribution: [
            { name: 'Owner (70%)', value: 70, color: '#0FA3B1' },
            { name: 'Admin (20%)', value: 20, color: '#1363DF' },
            { name: 'Editor (10%)', value: 10, color: '#F59E0B' },
          ],
        });
      }

      // Calculate revenue by currency
      const totalRevenueDZD = purchaseData
        .filter(p => p.currency === 'DZD')
        .reduce((sum, p) => sum + Number(p.price || 0), 0);

      const totalRevenueEUR = purchaseData
        .filter(p => p.currency === 'EUR')
        .reduce((sum, p) => sum + Number(p.price || 0), 0);

      // Group by month for chart
      const monthlyRevenue = purchaseData.reduce((acc: any[], purchase) => {
        const month = new Date(purchase.createdAt!).toLocaleDateString('fr-FR', { month: 'short' });
        const existing = acc.find(m => m.month === month);
        
        if (existing) {
          if (purchase.currency === 'DZD') {
            existing.dzd += Number(purchase.price || 0);
          } else {
            existing.eur += Number(purchase.price || 0);
          }
          existing.total += Number(purchase.price || 0);
        } else {
          acc.push({
            month,
            dzd: purchase.currency === 'DZD' ? Number(purchase.price || 0) : 0,
            eur: purchase.currency === 'EUR' ? Number(purchase.price || 0) : 0,
            total: Number(purchase.price || 0),
          });
        }
        return acc;
      }, []);

      // TODO: When contracts system is integrated, calculate actual author shares
      // For now, return aggregated data without author breakdown
      const revenueByArticle: any[] = [];
      const revenueByAuthor: any[] = [];

      res.json({
        revenueByArticle,
        revenueByAuthor,
        monthlyRevenue,
        summary: {
          totalRevenueDZD,
          totalRevenueEUR,
          totalSales: purchaseData.length,
          paidArticlesCount: new Set(purchaseData.map(p => p.itemId)).size,
        },
        shareDistribution: [
          { name: 'Owner (70%)', value: 70, color: '#0FA3B1' },
          { name: 'Admin (20%)', value: 20, color: '#1363DF' },
          { name: 'Editor (10%)', value: 10, color: '#F59E0B' },
        ],
      });
    } catch (error) {
      console.error('Error fetching financial analytics:', error);
      res.status(500).json({ message: 'Failed to fetch financial analytics' });
    }
  });

  // Get badges statistics (for Owner Dashboard)
  app.get('/api/admin/badges/stats', requirePermission('users.view'), async (req, res) => {
    try {
      const { userBadges } = await import('../shared/schema');
      const { count, eq, sql } = await import('drizzle-orm');

      // Count badges by type
      const badgeStats = await db
        .select({
          badgeType: userBadges.badgeType,
          count: count()
        })
        .from(userBadges)
        .groupBy(userBadges.badgeType);

      // Get top users with most badges
      const topUsers = await db
        .select({
          userId: userBadges.userId,
          badgeCount: count()
        })
        .from(userBadges)
        .groupBy(userBadges.userId)
        .orderBy(sql`count(*) DESC`)
        .limit(10);

      // Format response
      const stats = {
        gold: Number(badgeStats.find(b => b.badgeType === 'gold')?.count || 0),
        silver: Number(badgeStats.find(b => b.badgeType === 'silver')?.count || 0),
        bronze: Number(badgeStats.find(b => b.badgeType === 'bronze')?.count || 0),
        total: badgeStats.reduce((sum, b) => sum + Number(b.count || 0), 0),
        topUsers
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching badge stats:', error);
      res.status(500).json({ message: 'Failed to fetch badge statistics' });
    }
  });

  // Stripe webhook
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;

    try {
      const event = stripe.verifyWebhookSignature(req.body, sig);
      
      if (!event) {
        return res.status(400).send('Webhook signature verification failed');
      }

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as any;
          const paymentData = await stripe.handlePaymentSuccess(session);
          
          // Record purchase
          await db.insert(purchases).values({
            userId: paymentData.userId,
            itemType: paymentData.itemType as any,
            itemId: paymentData.itemId,
            price: paymentData.priceInDZD.toString(),
            currency: 'DZD',
            status: 'paid',
          });
          
          break;
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).send('Webhook error');
    }
  });
}