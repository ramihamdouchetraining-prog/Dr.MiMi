import { Router } from 'express';
import { db } from '../db';
import { users, courses, quizzes, cases, summaries } from '../../shared/schema';
import { eq, sql, desc, gte, and } from 'drizzle-orm';

const router = Router();

// Middleware to check admin rights
const requireAdmin = async (req: any, res: any, next: any) => {
  if (!req.user || req.user.role !== 'admin' && req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get dashboard stats
router.get('/dashboard-stats', requireAdmin, async (req, res) => {
  try {
    // Get total users
    const totalUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    const totalUsers = Number(totalUsersResult[0]?.count) || 0;

    // Get active users (logged in within last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.updatedAt, sevenDaysAgo));
    const activeUsers = Number(activeUsersResult[0]?.count) || 0;

    // Get total content count
    const coursesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses);
    const quizzesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(quizzes);
    const casesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(cases);
    const summariesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(summaries);

    const totalContent = 
      Number(coursesCount[0]?.count || 0) + 
      Number(quizzesCount[0]?.count || 0) + 
      Number(casesCount[0]?.count || 0) + 
      Number(summariesCount[0]?.count || 0);

    // Calculate revenue (mock data for now - replace with actual payment data)
    const revenue = Math.floor(Math.random() * 100000) + 50000;
    
    // Calculate growth percentage
    const growth = Math.floor(Math.random() * 30) + 10;

    // Get support tickets count (mock for now)
    const tickets = Math.floor(Math.random() * 20) + 5;

    res.json({
      totalUsers,
      activeUsers,
      totalContent,
      revenue,
      growth,
      tickets
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get recent activity
router.get('/recent-activity', requireAdmin, async (req, res) => {
  try {
    // Get recent users
    const recentUsers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10);

    // Get recent courses
    const recentCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        createdAt: courses.createdAt
      })
      .from(courses)
      .orderBy(desc(courses.createdAt))
      .limit(5);

    // Get recent quizzes  
    const recentQuizzes = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        createdAt: quizzes.createdAt
      })
      .from(quizzes)
      .orderBy(desc(quizzes.createdAt))
      .limit(5);

    res.json({
      recentUsers,
      recentCourses,
      recentQuizzes
    });
  } catch (error) {
    console.error('Failed to fetch recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

// Get user statistics
router.get('/user-stats', requireAdmin, async (req, res) => {
  try {
    // Get users by role
    const usersByRole = await db
      .select({
        role: users.role,
        count: sql<number>`count(*)`
      })
      .from(users)
      .groupBy(users.role);

    // Get users by year of study
    const usersByYear = await db
      .select({
        yearOfStudy: users.yearOfStudy,
        count: sql<number>`count(*)`
      })
      .from(users)
      .groupBy(users.yearOfStudy);

    // Get blacklisted users count
    const blacklistedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isBlacklisted, true));
    const blacklistedCount = Number(blacklistedResult[0]?.count) || 0;

    res.json({
      usersByRole,
      usersByYear,
      blacklistedCount
    });
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Get content statistics  
router.get('/content-stats', requireAdmin, async (req, res) => {
  try {
    // Get content by status
    const coursesByStatus = await db
      .select({
        status: courses.status,
        count: sql<number>`count(*)`
      })
      .from(courses)
      .groupBy(courses.status);

    // Get quizzes with question count
    const quizzesWithQuestions = await db
      .select({
        total: sql<number>`count(*)`,
        avgQuestions: sql<number>`avg(json_array_length(questions))`
      })
      .from(quizzes);

    // Get content by module (mock data for now)
    const contentByModule = [
      { module: 'Cardiologie', courses: 12, quizzes: 8 },
      { module: 'Neurologie', courses: 10, quizzes: 6 },
      { module: 'Pneumologie', courses: 8, quizzes: 5 },
      { module: 'Pharmacologie', courses: 15, quizzes: 10 }
    ];

    res.json({
      coursesByStatus,
      quizzesWithQuestions,
      contentByModule
    });
  } catch (error) {
    console.error('Failed to fetch content stats:', error);
    res.status(500).json({ error: 'Failed to fetch content stats' });
  }
});

// Get platform analytics
router.get('/platform-analytics', requireAdmin, async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const days = Number(period);
    
    // Generate mock data for charts (replace with actual analytics data)
    const dailyStats = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        visitors: Math.floor(Math.random() * 500) + 200,
        pageViews: Math.floor(Math.random() * 2000) + 1000,
        signups: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 5000) + 2000
      });
    }

    // Get top performing content
    const topCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        views: sql<number>`COALESCE(views, 0)`,
        completions: sql<number>`COALESCE(completions, 0)`
      })
      .from(courses)
      .orderBy(desc(sql`COALESCE(views, 0)`))
      .limit(5);

    const topQuizzes = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        attempts: sql<number>`COALESCE(attempts, 0)`,
        avgScore: sql<number>`COALESCE(avg_score, 0)`
      })
      .from(quizzes)
      .orderBy(desc(sql`COALESCE(attempts, 0)`))
      .limit(5);

    res.json({
      dailyStats,
      topCourses,
      topQuizzes
    });
  } catch (error) {
    console.error('Failed to fetch platform analytics:', error);
    res.status(500).json({ error: 'Failed to fetch platform analytics' });
  }
});

export default router;