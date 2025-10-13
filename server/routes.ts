// Routes configuration for MediMimi backend
import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from 'multer';
import path from 'path';
import { z } from 'zod';

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common medical document and image formats
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only medical documents and images allowed.'));
    }
  }
});

// Validation schemas
const createModuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameEn: z.string().optional(),
  nameAr: z.string().optional(),
  category: z.enum(["Preclinical", "Clinical", "PublicHealth"]),
  bodySystems: z.array(z.string()).optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
});

const createCourseSchema = z.object({
  title: z.string(),
  moduleId: z.string(),
  yearLevels: z.array(z.string()).optional(),
  authors: z.array(z.string()).optional(),
  language: z.string().default("fr"),
  price: z.number().optional(),
  currency: z.string().default("DZD"),
});

// Helper function to check admin/manager permissions
function requireRole(roles: string[]) {
  return async (req: any, res: any, next: any) => {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(userId);
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Import and register admin routes
  const adminRoutes = await import('./adminRoutes');
  adminRoutes.registerAdminRoutes(app);

  // Import and register new management system routes
  const authAdminRoutes = await import('./auth-admin');
  const approvalsRoutes = await import('./routes-approvals');
  const settingsRoutes = await import('./routes-settings');
  const supportRoutes = await import('./routes-support');
  const analyticsRoutes = await import('./routes-analytics');
  const usersRoutes = await import('./routes-users');
  const contentRoutes = await import('./routes-content');
  const contractsRoutes = await import('./routes-contracts');
  const revenueSharingRoutes = await import('./routes-revenue-sharing');
  const chatRoutes = await import('./routes-chat');
  const libraryRoutes = await import('./routes/library');
  const ownerRoutes = await import('./routes/owner');
  const gamesRoutes = await import('./routes/games');
  const aiTutorRoutes = await import('./routes/ai-tutor');
  
  // Import user authentication routes (for students/regular users)
  const userAuthRoutes = await import('./routes/auth');

  // Register new routes
  app.use('/api/auth', userAuthRoutes.default); // User auth (login/register)
  app.use('/api/games', gamesRoutes.default); // Medical games routes
  app.use('/api/admin/auth', authAdminRoutes.default); // Admin auth (separate)
  app.use('/api', approvalsRoutes.default);
  app.use('/api', settingsRoutes.default);
  app.use('/api', supportRoutes.default);
  app.use('/api', analyticsRoutes.default);
  app.use('/api', usersRoutes.default);
  app.use('/api', contentRoutes.default);
  app.use('/api', contractsRoutes.default);
  app.use('/api/revenue-sharing', revenueSharingRoutes.default);
  app.use('/api/library', libraryRoutes.default); // Mimi Library routes
  app.use('/api', ownerRoutes.default); // Owner-specific routes
  app.use('/api/chat', chatRoutes.default); // Chat routes for admin messaging system
  app.use('/api/ai-tutor', aiTutorRoutes.default); // AI Tutor routes

  // ===== AUTH ROUTES =====
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ===== USER PROFILE ROUTES =====
  app.put('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, bio, university, country } = req.body;
      
      const { db } = await import('./db');
      const { users } = await import('../shared/schema');
      const { eq } = await import('drizzle-orm');

      const [updatedUser] = await db
        .update(users)
        .set({
          firstName,
          lastName,
          bio,
          university,
          country,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.post('/api/users/avatar', isAuthenticated, upload.single('avatar'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { db } = await import('./db');
      const { users } = await import('../shared/schema');
      const { eq } = await import('drizzle-orm');

      const avatarUrl = `/uploads/${req.file.filename}`;

      const [updatedUser] = await db
        .update(users)
        .set({
          profileImageUrl: avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ success: true, avatarUrl, user: updatedUser });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      res.status(500).json({ message: "Failed to upload avatar" });
    }
  });

  // ===== USER STATISTICS ROUTE =====
  app.get('/api/users/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const { db } = await import('./db');
      const { 
        users, 
        courses, 
        quizzes, 
        cases, 
        courseEnrollments, 
        quizAttempts, 
        caseCompletions, 
        summaryDownloads,
        userBadges 
      } = await import('../shared/schema');
      const { eq, and, count, avg, sum, sql, desc } = await import('drizzle-orm');

      // Get user for study streak calculation
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Count courses completed
      const [coursesCompletedResult] = await db
        .select({ count: count() })
        .from(courseEnrollments)
        .where(and(
          eq(courseEnrollments.userId, userId),
          eq(courseEnrollments.status, 'completed')
        ));

      // Count total published courses
      const [totalCoursesResult] = await db
        .select({ count: count() })
        .from(courses)
        .where(eq(courses.status, 'published'));

      // Count quizzes passed
      const [quizzesPassedResult] = await db
        .select({ count: count() })
        .from(quizAttempts)
        .where(and(
          eq(quizAttempts.userId, userId),
          eq(quizAttempts.passed, true)
        ));

      // Count total published quizzes
      const [totalQuizzesResult] = await db
        .select({ count: count() })
        .from(quizzes)
        .where(eq(quizzes.status, 'published'));

      // Count cases resolved
      const [casesResolvedResult] = await db
        .select({ count: count() })
        .from(caseCompletions)
        .where(and(
          eq(caseCompletions.userId, userId),
          eq(caseCompletions.solved, true)
        ));

      // Count total published cases
      const [totalCasesResult] = await db
        .select({ count: count() })
        .from(cases)
        .where(eq(cases.status, 'published'));

      // Count summaries downloaded
      const [summariesDownloadedResult] = await db
        .select({ count: count() })
        .from(summaryDownloads)
        .where(eq(summaryDownloads.userId, userId));

      // Calculate average score
      const [avgScoreResult] = await db
        .select({ avgScore: avg(quizAttempts.score) })
        .from(quizAttempts)
        .where(eq(quizAttempts.userId, userId));

      // Calculate total study hours (sum of time spent on quizzes and cases)
      const [quizTimeResult] = await db
        .select({ totalTime: sum(quizAttempts.timeTaken) })
        .from(quizAttempts)
        .where(eq(quizAttempts.userId, userId));

      const [caseTimeResult] = await db
        .select({ totalTime: sum(caseCompletions.timeSpent) })
        .from(caseCompletions)
        .where(eq(caseCompletions.userId, userId));

      const totalSeconds = (Number(quizTimeResult?.totalTime) || 0) + (Number(caseTimeResult?.totalTime) || 0);
      const totalStudyHours = Math.round(totalSeconds / 3600);

      // Calculate study streak (simplified - days since last login)
      let studyStreak = 0;
      if (user.lastLoginAt) {
        const daysSinceLogin = Math.floor((Date.now() - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24));
        studyStreak = daysSinceLogin === 0 ? 1 : 0; // If logged in today, streak is 1, otherwise 0
      }

      // Get user badges
      const badges = await db
        .select()
        .from(userBadges)
        .where(eq(userBadges.userId, userId))
        .orderBy(desc(userBadges.createdAt));

      const stats = {
        coursesCompleted: coursesCompletedResult?.count || 0,
        totalCourses: totalCoursesResult?.count || 0,
        quizzesPassed: quizzesPassedResult?.count || 0,
        totalQuizzes: totalQuizzesResult?.count || 0,
        casesResolved: casesResolvedResult?.count || 0,
        totalCases: totalCasesResult?.count || 0,
        summariesDownloaded: summariesDownloadedResult?.count || 0,
        studyStreak,
        totalStudyHours,
        averageScore: Math.round(Number(avgScoreResult?.avgScore) || 0),
      };

      res.json({ stats, badges });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user statistics" });
    }
  });

  // ===== USER MANAGEMENT ROUTES (Admin/Manager only) =====
  app.put('/api/admin/users/:userId/role', isAuthenticated, requireRole(['admin']), async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      if (!['student', 'creator', 'manager', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await storage.updateUserRole(userId, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.post('/api/admin/users/:userId/blacklist', isAuthenticated, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const { userId } = req.params;
      const { reason, scope = 'comments', expiresAt } = req.body;
      
      await storage.blacklistUser(userId, reason, scope, expiresAt ? new Date(expiresAt) : undefined);
      res.json({ message: "User blacklisted successfully" });
    } catch (error) {
      console.error("Error blacklisting user:", error);
      res.status(500).json({ message: "Failed to blacklist user" });
    }
  });

  app.delete('/api/admin/users/:userId/blacklist', isAuthenticated, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.unblacklistUser(userId);
      res.json({ message: "User unblacklisted successfully" });
    } catch (error) {
      console.error("Error unblacklisting user:", error);
      res.status(500).json({ message: "Failed to unblacklist user" });
    }
  });

  // ===== MODULE ROUTES =====
  app.get('/api/modules', async (req, res) => {
    try {
      const modules = await storage.getModules();
      res.json(modules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });

  app.get('/api/modules/:id', async (req, res) => {
    try {
      const module = await storage.getModule(req.params.id);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.json(module);
    } catch (error) {
      console.error("Error fetching module:", error);
      res.status(500).json({ message: "Failed to fetch module" });
    }
  });

  app.post('/api/admin/modules', isAuthenticated, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const moduleData = createModuleSchema.parse(req.body);
      const module = await storage.createModule(moduleData);
      res.status(201).json(module);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating module:", error);
      res.status(500).json({ message: "Failed to create module" });
    }
  });

  // ===== COURSE ROUTES =====
  app.get('/api/courses', async (req, res) => {
    try {
      const { moduleId, language, yearLevels } = req.query;
      const filters: any = {};
      
      if (moduleId) filters.moduleId = moduleId as string;
      if (language) filters.language = language as string;
      if (yearLevels) filters.yearLevels = (yearLevels as string).split(',');
      
      const courses = await storage.getCourses(filters);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post('/api/courses', isAuthenticated, requireRole(['creator', 'manager', 'admin']), async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const courseData = createCourseSchema.parse(req.body);
      
      const course = await storage.createCourse({
        ...courseData,
        createdBy: userId,
      });
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.put('/api/admin/courses/:id/status', isAuthenticated, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['draft', 'review', 'published', 'archived'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const course = await storage.updateCourseStatus(id, status);
      res.json(course);
    } catch (error) {
      console.error("Error updating course status:", error);
      res.status(500).json({ message: "Failed to update course status" });
    }
  });

  // ===== SUMMARY ROUTES =====
  app.get('/api/summaries', async (req, res) => {
    try {
      const { moduleId, language } = req.query;
      const filters: any = {};
      
      if (moduleId) filters.moduleId = moduleId as string;
      if (language) filters.language = language as string;
      
      const summaries = await storage.getSummaries(filters);
      res.json(summaries);
    } catch (error) {
      console.error("Error fetching summaries:", error);
      res.status(500).json({ message: "Failed to fetch summaries" });
    }
  });

  // ===== QUIZ ROUTES =====
  app.get('/api/quizzes', async (req, res) => {
    try {
      const { moduleId, difficulty } = req.query;
      const filters: any = {};
      
      if (moduleId) filters.moduleId = moduleId as string;
      if (difficulty) filters.difficulty = difficulty as string;
      
      const quizzes = await storage.getQuizzes(filters);
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  // ===== CLINICAL CASES ROUTES =====
  app.get('/api/cases', async (req, res) => {
    try {
      const { moduleId, difficulty } = req.query;
      const filters: any = {};
      
      if (moduleId) filters.moduleId = moduleId as string;
      if (difficulty) filters.difficulty = difficulty as string;
      
      const cases = await storage.getCases(filters);
      res.json(cases);
    } catch (error) {
      console.error("Error fetching cases:", error);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  // ===== COMMENT ROUTES =====
  app.get('/api/comments/:entityType/:entityId', async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const comments = await storage.getComments(entityType, entityId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/comments', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { entityType, entityId, body, parentId } = req.body;
      
      // Check if user is blacklisted
      const user = await storage.getUser(userId);
      if (user?.isBlacklisted) {
        return res.status(403).json({ message: "You are not allowed to comment" });
      }
      
      const comment = await storage.createComment({
        entityType,
        entityId,
        userId,
        body,
        parentId,
      });
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // ===== DONATION ROUTES =====
  app.post('/api/create-donation-session', async (req, res) => {
    const { amount, currency, description, successUrl, cancelUrl } = req.body;
    
    try {
      // In test mode, return a simulated response
      // In production, this would create a real Stripe checkout session
      res.json({ 
        success: true,
        message: 'Test mode donation session created',
        amount,
        currency,
        // In production, this would return the actual Stripe checkout session URL
        url: null 
      });
    } catch (error) {
      console.error('Error creating donation session:', error);
      res.status(500).json({ error: 'Failed to create donation session' });
    }
  });

  app.put('/api/admin/comments/:id/status', isAuthenticated, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['visible', 'hidden', 'pending'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const comment = await storage.updateCommentStatus(id, status);
      res.json(comment);
    } catch (error) {
      console.error("Error updating comment status:", error);
      res.status(500).json({ message: "Failed to update comment status" });
    }
  });

  // ===== MEDIA UPLOAD ROUTES =====
  app.post('/api/upload', isAuthenticated, requireRole(['creator', 'manager', 'admin']), upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.claims.sub;
      const asset = await storage.createMediaAsset({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
        uploadedBy: userId,
      });

      res.status(201).json(asset);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // ===== SEARCH ROUTES =====
  app.get('/api/search', async (req, res) => {
    try {
      const { q: query, types } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Search query required" });
      }

      const typeArray = types ? (types as string).split(',') : undefined;
      const results = await storage.searchContent(query, typeArray);
      res.json(results);
    } catch (error) {
      console.error("Error searching content:", error);
      res.status(500).json({ message: "Failed to search content" });
    }
  });

  // ===== USER SETTINGS ROUTES =====
  app.get('/api/settings', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.getUserSettings(userId);
      res.json(settings || { theme: 'light', locale: 'fr' });
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put('/api/settings', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { theme, locale, rtlPreference, reducedMotion } = req.body;
      
      const settings = await storage.upsertUserSettings({
        userId,
        theme,
        locale,
        rtlPreference,
        reducedMotion,
      });
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // ===== ADMIN DASHBOARD ROUTES =====
  
  // Check if user is admin (Merieme BENNAMANE)
  app.get('/api/admin/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is Merieme BENNAMANE or has admin role
      const isAdmin = user?.email === 'merieme.bennamane@gmail.com' || 
                      user?.firstName === 'Merieme' && user?.lastName === 'BENNAMANE' ||
                      user?.role === 'admin';
      
      res.json({ isAdmin, user });
    } catch (error) {
      console.error("Error checking admin status:", error);
      res.status(500).json({ message: "Failed to check admin status" });
    }
  });

  // Get dashboard statistics
  app.get('/api/admin/stats', isAuthenticated, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get revenue statistics
  app.get('/api/admin/revenue', isAuthenticated, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const { period = 'weekly' } = req.query;
      const revenueStats = await storage.getRevenueStats(period as string);
      res.json(revenueStats);
    } catch (error) {
      console.error("Error fetching revenue stats:", error);
      res.status(500).json({ message: "Failed to fetch revenue" });
    }
  });

  // Get all users for admin
  app.get('/api/admin/users', isAuthenticated, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const { role, isBlacklisted } = req.query;
      const filters: any = {};
      
      if (role) filters.role = role as string;
      if (isBlacklisted !== undefined) filters.isBlacklisted = isBlacklisted === 'true';
      
      const users = await storage.getAllUsers(filters);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Blog post routes
  app.get('/api/blog/posts', async (req, res) => {
    try {
      const { category, featured, status } = req.query;
      const filters: any = {};
      
      if (category) filters.category = category as string;
      if (featured !== undefined) filters.featured = featured === 'true';
      if (status) filters.status = status as string;
      
      const posts = await storage.getBlogPosts(filters);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get('/api/blog/posts/:id', async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.post('/api/admin/blog/posts', isAuthenticated, requireRole(['admin', 'manager', 'creator']), async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = {
        ...req.body,
        createdBy: userId,
        slug: req.body.slug || req.body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      };
      
      const post = await storage.createBlogPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  app.put('/api/admin/blog/posts/:id', isAuthenticated, requireRole(['admin', 'manager', 'creator']), async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = {
        ...req.body,
        updatedBy: userId,
      };
      
      const post = await storage.updateBlogPost(req.params.id, updates);
      res.json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete('/api/admin/blog/posts/:id', isAuthenticated, requireRole(['admin']), async (req, res) => {
    try {
      await storage.deleteBlogPost(req.params.id);
      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Drive files management
  app.get('/api/admin/files', isAuthenticated, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const { category, moduleId } = req.query;
      const filters: any = {};
      
      if (category) filters.category = category as string;
      if (moduleId) filters.moduleId = moduleId as string;
      
      const files = await storage.getDriveFiles(filters);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.post('/api/admin/files', isAuthenticated, requireRole(['admin', 'manager', 'creator']), upload.single('file'), async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileData = {
        title: req.body.title || req.file.originalname,
        description: req.body.description,
        driveUrl: `/uploads/${req.file.filename}`,
        downloadUrl: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype.includes('pdf') ? 'pdf' : 
                  req.file.mimetype.includes('doc') ? 'docx' : 
                  req.file.mimetype.includes('image') ? 'image' : 'video',
        fileSize: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
        moduleId: req.body.moduleId,
        category: req.body.category,
        price: parseFloat(req.body.price || '0'),
        isFree: req.body.isFree === 'true',
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        createdBy: userId,
      };
      
      const file = await storage.createDriveFile(fileData);
      res.status(201).json(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Team members management
  app.get('/api/admin/team', isAuthenticated, requireRole(['admin']), async (req, res) => {
    try {
      const teamMembers = await storage.getTeamMembers();
      res.json(teamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  // Stripe payment routes
  const { createCheckoutSession, verifyWebhookSignature, handlePaymentSuccess } = await import('./stripe');
  
  // Create Stripe checkout session
  app.post('/api/stripe/create-checkout', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { itemType, itemId, itemTitle, priceInDZD, taxRate } = req.body;
      
      const session = await createCheckoutSession({
        userId,
        itemType,
        itemId,
        itemTitle,
        priceInDZD,
        taxRate: taxRate || 19,
        successUrl: `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${req.headers.origin}/payment/cancel`
      });
      
      res.json(session);
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Stripe webhook handler
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    
    try {
      const event = verifyWebhookSignature(req.body, sig);
      
      if (!event) {
        return res.status(400).send('Webhook signature verification failed');
      }

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          const paymentData = await handlePaymentSuccess(session);
          
          // Save purchase to database
          await storage.createPurchase({
            userId: paymentData.userId,
            itemType: paymentData.itemType as any,
            itemId: paymentData.itemId,
            price: paymentData.priceInDZD,
            currency: 'DZD',
            status: 'paid'
          });
          
          console.log('Payment successful:', paymentData);
          break;
          
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Initialize WebSocket server for chat
  const { createChatWebSocketServer } = await import('./routes/chat');
  createChatWebSocketServer(httpServer);
  
  return httpServer;
}