import { Router } from 'express';
import { db } from '../db';
import { 
  learningAnalytics, 
  studyPatterns, 
  aiRecommendations, 
  performanceMetrics,
  quizAttempts,
  courseEnrollments,
  caseCompletions,
  summaryDownloads,
  users,
  modules
} from '../../shared/schema';
import { eq, sql, and, desc, gte } from 'drizzle-orm';
import AnalyticsAIService from '../analyticsAI';
import { requirePermission } from '../rbac';

const router = Router();

// Utility function to calculate or fetch learning analytics
async function getOrCalculateAnalytics(userId: string) {
  // Try to fetch existing analytics
  let [analytics] = await db.select()
    .from(learningAnalytics)
    .where(eq(learningAnalytics.userId, userId))
    .limit(1);

  // If doesn't exist or outdated (>1 hour), recalculate
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  if (!analytics || !analytics.lastCalculatedAt || analytics.lastCalculatedAt < oneHourAgo) {
    analytics = await calculateLearningAnalytics(userId);
  }

  return analytics;
}

// Calculate comprehensive learning analytics for a user
async function calculateLearningAnalytics(userId: string) {
  // Get all quiz attempts
  const quizzes = await db.select()
    .from(quizAttempts)
    .where(eq(quizAttempts.userId, userId));

  // Get course enrollments
  const enrollments = await db.select()
    .from(courseEnrollments)
    .where(eq(courseEnrollments.userId, userId));

  // Get case completions
  const cases = await db.select()
    .from(caseCompletions)
    .where(eq(caseCompletions.userId, userId));

  // Get summary downloads
  const summaries = await db.select()
    .from(summaryDownloads)
    .where(eq(summaryDownloads.userId, userId));

  // Calculate metrics
  const totalQuizzes = quizzes.length;
  const passedQuizzes = quizzes.filter(q => Number(q.score) >= 50).length;
  const totalScore = quizzes.reduce((sum, q) => sum + Number(q.score || 0), 0);
  const avgQuizScore = totalQuizzes > 0 ? totalScore / totalQuizzes : 0;
  
  const totalStudyTime = quizzes.reduce((sum, q) => sum + (q.timeTaken || 0), 0);
  const avgSessionDuration = totalQuizzes > 0 ? Math.round(totalStudyTime / totalQuizzes) : 0;

  const completedCourses = enrollments.filter(e => e.status === 'completed').length;
  const completionRate = enrollments.length > 0 ? (completedCourses / enrollments.length) * 100 : 0;
  const quizSuccessRate = totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) * 100 : 0;

  // Identify weak and strong modules (simplified - would need join with quizzes table)
  const weakModules: any[] = [];
  const strongModules: any[] = [];

  // Upsert analytics
  const analyticsData = {
    userId,
    totalStudyTime: Math.round(totalStudyTime / 60), // Convert to minutes
    averageSessionDuration: avgSessionDuration,
    totalCoursesEnrolled: enrollments.length,
    totalCoursesCompleted: completedCourses,
    totalQuizzesTaken: totalQuizzes,
    totalQuizzesPassed: passedQuizzes,
    totalCasesCompleted: cases.length,
    totalSummariesDownloaded: summaries.length,
    overallAverageScore: avgQuizScore.toFixed(2),
    courseCompletionRate: completionRate.toFixed(2),
    quizSuccessRate: quizSuccessRate.toFixed(2),
    averageQuizScore: avgQuizScore.toFixed(2),
    weakModules: weakModules.length > 0 ? weakModules : null,
    strongModules: strongModules.length > 0 ? strongModules : null,
    lastCalculatedAt: new Date(),
    updatedAt: new Date()
  };

  // Check if analytics exists
  const [existing] = await db.select()
    .from(learningAnalytics)
    .where(eq(learningAnalytics.userId, userId))
    .limit(1);

  if (existing) {
    // Update existing
    const [updated] = await db.update(learningAnalytics)
      .set(analyticsData)
      .where(eq(learningAnalytics.userId, userId))
      .returning();
    return updated;
  } else {
    // Insert new
    const [created] = await db.insert(learningAnalytics)
      .values(analyticsData)
      .returning();
    return created;
  }
}

// Calculate study patterns
async function calculateStudyPatterns(userId: string) {
  const quizzes = await db.select()
    .from(quizAttempts)
    .where(eq(quizAttempts.userId, userId))
    .orderBy(desc(quizAttempts.createdAt));

  if (quizzes.length < 5) {
    return null; // Not enough data
  }

  // Analyze time patterns
  const hourCounts = new Map<number, number>();
  const dayCounts = new Map<string, number>();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  quizzes.forEach(q => {
    if (q.createdAt) {
      const hour = q.createdAt.getHours();
      const day = days[q.createdAt.getDay()];
      
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      dayCounts.set(day, (dayCounts.get(day) || 0) + (q.timeTaken || 0));
    }
  });

  // Find peak hour
  let peakHour = 0;
  let maxCount = 0;
  hourCounts.forEach((count, hour) => {
    if (count > maxCount) {
      maxCount = count;
      peakHour = hour;
    }
  });

  // Determine preferred study time
  let preferredTime: 'morning' | 'afternoon' | 'evening' | 'night' = 'morning';
  if (peakHour >= 6 && peakHour < 12) preferredTime = 'morning';
  else if (peakHour >= 12 && peakHour < 18) preferredTime = 'afternoon';
  else if (peakHour >= 18 && peakHour < 22) preferredTime = 'evening';
  else preferredTime = 'night';

  // Session length categorization
  const shortSessions = quizzes.filter(q => (q.timeTaken || 0) < 900).length; // < 15 min
  const mediumSessions = quizzes.filter(q => (q.timeTaken || 0) >= 900 && (q.timeTaken || 0) <= 2700).length; // 15-45 min
  const longSessions = quizzes.filter(q => (q.timeTaken || 0) > 2700).length; // > 45 min

  // Study days pattern
  const studyDaysPattern: Record<string, number> = {};
  dayCounts.forEach((minutes, day) => {
    studyDaysPattern[day] = Math.round(minutes / 60); // Convert to minutes
  });

  // Calculate learning style scores (simple heuristic)
  const visualScore = Math.min(100, quizzes.length * 5); // More quizzes = more visual learning
  const practicalScore = Math.min(100, await db.select({ count: sql<number>`count(*)` })
    .from(caseCompletions)
    .where(eq(caseCompletions.userId, userId))
    .then(r => (r[0]?.count || 0) * 10));

  const patternsData = {
    userId,
    preferredStudyTime: preferredTime,
    studyDaysPattern,
    peakProductivityHour: peakHour,
    averageSessionsPerDay: (quizzes.length / 30).toFixed(2), // Assume 30 days of data
    shortSessionsCount: shortSessions,
    mediumSessionsCount: mediumSessions,
    longSessionsCount: longSessions,
    preferredContentType: 'mixed' as const,
    visualLearnerScore: visualScore,
    practicalLearnerScore: practicalScore,
    theoreticalLearnerScore: 50, // Default
    consistentLearnerScore: quizzes.length > 20 ? 75 : 50,
    procrastinationScore: shortSessions > quizzes.length * 0.5 ? 60 : 30,
    dataPoints: quizzes.length,
    confidenceScore: Math.min(100, quizzes.length * 2),
    lastAnalyzedAt: new Date(),
    updatedAt: new Date()
  };

  // Upsert patterns
  const [existing] = await db.select()
    .from(studyPatterns)
    .where(eq(studyPatterns.userId, userId))
    .limit(1);

  if (existing) {
    const [updated] = await db.update(studyPatterns)
      .set(patternsData)
      .where(eq(studyPatterns.userId, existing.id))
      .returning();
    return updated;
  } else {
    const [created] = await db.insert(studyPatterns)
      .values(patternsData)
      .returning();
    return created;
  }
}

// ===== ROUTES =====

// GET /api/analytics/student/:userId - Student dashboard analytics
router.get('/student/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Calculate/fetch analytics
    const analytics = await getOrCalculateAnalytics(userId);
    const patterns = await calculateStudyPatterns(userId);

    // Get performance metrics
    const performance = await db.select()
      .from(performanceMetrics)
      .where(eq(performanceMetrics.userId, userId));

    // Get active recommendations
    const recommendations = await db.select()
      .from(aiRecommendations)
      .where(
        and(
          eq(aiRecommendations.userId, userId),
          eq(aiRecommendations.status, 'active')
        )
      )
      .orderBy(desc(aiRecommendations.priority), desc(aiRecommendations.createdAt))
      .limit(5);

    // Get recent activity
    const recentQuizzes = await db.select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))
      .orderBy(desc(quizAttempts.createdAt))
      .limit(10);

    res.json({
      analytics,
      patterns,
      performance,
      recommendations,
      recentActivity: recentQuizzes
    });

  } catch (error: any) {
    console.error('Error fetching student analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/analytics/admin/overview - Admin overview analytics
router.get('/admin/overview', requirePermission('analytics.view_basic'), async (req, res) => {
  try {
    // Get total students count
    const [totalStudents] = await db.select({ count: sql<number>`count(*)` })
      .from(users);

    // Get active students (logged in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [activeStudents] = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.lastLoginAt, sevenDaysAgo));

    // Get average performance
    const [avgPerformance] = await db.select({
      avgScore: sql<number>`AVG(${learningAnalytics.overallAverageScore})`
    }).from(learningAnalytics);

    // Get top performers
    const topPerformers = await db.select()
      .from(learningAnalytics)
      .orderBy(desc(learningAnalytics.overallAverageScore))
      .limit(10);

    // Get struggling students
    const strugglingStudents = await db.select()
      .from(learningAnalytics)
      .where(sql`${learningAnalytics.overallAverageScore} < 50`)
      .orderBy(learningAnalytics.overallAverageScore)
      .limit(10);

    // Get module performance overview
    const moduleStats = await db.select()
      .from(performanceMetrics)
      .orderBy(desc(performanceMetrics.averageScore));

    res.json({
      overview: {
        totalStudents: totalStudents?.count || 0,
        activeStudents: activeStudents?.count || 0,
        averagePerformance: avgPerformance?.avgScore || 0,
        totalQuizzesTaken: await db.select({ count: sql<number>`count(*)` }).from(quizAttempts).then(r => r[0]?.count || 0)
      },
      topPerformers,
      strugglingStudents,
      moduleStats: moduleStats.slice(0, 10)
    });

  } catch (error: any) {
    console.error('Error fetching admin overview:', error);
    res.status(500).json({ error: 'Failed to fetch admin overview' });
  }
});

// GET /api/analytics/admin/students - List all students with metrics
router.get('/admin/students', requirePermission('analytics.view_basic'), async (req, res) => {
  try {
    const studentsWithAnalytics = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      yearOfStudy: users.yearOfStudy,
      analytics: learningAnalytics
    })
      .from(users)
      .leftJoin(learningAnalytics, eq(users.id, learningAnalytics.userId))
      .where(eq(users.role, 'viewer')) // Students are viewers
      .orderBy(desc(learningAnalytics.overallAverageScore));

    res.json({ students: studentsWithAnalytics });

  } catch (error: any) {
    console.error('Error fetching students list:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// POST /api/analytics/recommendations/:userId - Generate AI recommendations
router.post('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, priority } = req.body;

    // Get analytics data
    const analytics = await getOrCalculateAnalytics(userId);
    const patterns = await calculateStudyPatterns(userId);
    const performance = await db.select()
      .from(performanceMetrics)
      .where(eq(performanceMetrics.userId, userId));

    const recentActivity = await db.select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))
      .orderBy(desc(quizAttempts.createdAt))
      .limit(10);

    // Generate recommendation using AI
    const recommendation = await AnalyticsAIService.generateRecommendations({
      type: type || 'study_plan',
      priority: priority || 'medium',
      userId,
      analyticsData: {
        userId,
        analytics,
        patterns,
        performance,
        recentActivity
      }
    });

    res.json({ recommendation });

  } catch (error: any) {
    console.error('Error generating recommendation:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/predictions/:userId - Get exam predictions
router.get('/predictions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const prediction = await AnalyticsAIService.predictExamPerformance(userId);

    res.json({ prediction });

  } catch (error: any) {
    console.error('Error predicting performance:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/learning-style/:userId - Analyze learning style
router.get('/learning-style/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const analysis = await AnalyticsAIService.analyzeLearningStyle(userId);

    res.json({ analysis });

  } catch (error: any) {
    console.error('Error analyzing learning style:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/analytics/recommendations/:id/feedback - Update recommendation feedback
router.put('/recommendations/:id/feedback', async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback, comment } = req.body;

    const [updated] = await db.update(aiRecommendations)
      .set({
        userFeedback: feedback,
        feedbackComment: comment,
        updatedAt: new Date()
      })
      .where(eq(aiRecommendations.id, id))
      .returning();

    res.json({ recommendation: updated });

  } catch (error: any) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/analytics/recalculate/:userId - Force recalculation
router.post('/recalculate/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const analytics = await calculateLearningAnalytics(userId);
    const patterns = await calculateStudyPatterns(userId);

    res.json({ 
      success: true, 
      analytics, 
      patterns 
    });

  } catch (error: any) {
    console.error('Error recalculating analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
