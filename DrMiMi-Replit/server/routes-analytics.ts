import { Router } from "express";
import { db } from "./db";
import {
  analyticsSnapshots,
  analyticsEvents,
  users,
  articles,
  blogPosts,
  purchases,
  pageViews,
  siteVisitors,
} from "../shared/schema";
import { eq, gte, lte, desc, sql, and } from "drizzle-orm";
import { requirePermission } from "./rbac";
import { z } from "zod";

const router = Router();

const trackEventSchema = z.object({
  eventType: z.string(),
  sessionId: z.string(),
  metadata: z.record(z.any()).optional(),
});

router.get("/analytics/overview", requirePermission("analytics.view_basic"), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [latestSnapshot] = await db
      .select()
      .from(analyticsSnapshots)
      .orderBy(desc(analyticsSnapshots.snapshotDate));

    const totalUsers = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    const totalArticles = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(articles)
      .where(eq(articles.status, "published"));

    const totalBlogPosts = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"));

    const todayRevenue = await db
      .select({ sum: sql<number>`COALESCE(sum(price)::numeric, 0)` })
      .from(purchases)
      .where(
        and(
          gte(purchases.createdAt, today),
          eq(purchases.status, "paid")
        )
      );

    const overview = {
      snapshot: latestSnapshot || null,
      realtime: {
        totalUsers: totalUsers[0]?.count || 0,
        totalArticles: totalArticles[0]?.count || 0,
        totalBlogPosts: totalBlogPosts[0]?.count || 0,
        todayRevenue: todayRevenue[0]?.sum || 0,
      },
    };

    res.json(overview);
  } catch (error) {
    console.error("Error fetching analytics overview:", error);
    res.status(500).json({ message: "Failed to fetch analytics overview" });
  }
});

router.get("/analytics/revenue", requirePermission("analytics.view_financial"), async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;

    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    } else {
      end = new Date();
      start = new Date();
      start.setDate(end.getDate() - 30);
    }

    const revenueData = await db
      .select({
        date: sql<string>`date_trunc('${sql.raw(groupBy as string)}', ${purchases.createdAt})`,
        revenue: sql<number>`COALESCE(sum(${purchases.price})::numeric, 0)`,
        count: sql<number>`count(*)::int`,
      })
      .from(purchases)
      .where(
        and(
          gte(purchases.createdAt, start),
          lte(purchases.createdAt, end),
          eq(purchases.status, "paid")
        )
      )
      .groupBy(sql`date_trunc('${sql.raw(groupBy as string)}', ${purchases.createdAt})`)
      .orderBy(sql`date_trunc('${sql.raw(groupBy as string)}', ${purchases.createdAt})`);

    const totalRevenue = await db
      .select({ sum: sql<number>`COALESCE(sum(price)::numeric, 0)` })
      .from(purchases)
      .where(
        and(
          gte(purchases.createdAt, start),
          lte(purchases.createdAt, end),
          eq(purchases.status, "paid")
        )
      );

    const totalTransactions = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(purchases)
      .where(
        and(
          gte(purchases.createdAt, start),
          lte(purchases.createdAt, end),
          eq(purchases.status, "paid")
        )
      );

    res.json({
      data: revenueData,
      summary: {
        totalRevenue: totalRevenue[0]?.sum || 0,
        totalTransactions: totalTransactions[0]?.count || 0,
        period: { start, end },
      },
    });
  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    res.status(500).json({ message: "Failed to fetch revenue analytics" });
  }
});

router.get("/analytics/visitors", requirePermission("analytics.view_basic"), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    } else {
      end = new Date();
      start = new Date();
      start.setDate(end.getDate() - 7);
    }

    const visitorStats = await db
      .select({
        date: sql<string>`date_trunc('day', ${siteVisitors.createdAt})`,
        totalVisitors: sql<number>`count(DISTINCT ${siteVisitors.sessionId})::int`,
        uniqueVisitors: sql<number>`count(DISTINCT ${siteVisitors.userId})::int`,
      })
      .from(siteVisitors)
      .where(
        and(
          gte(siteVisitors.createdAt, start),
          lte(siteVisitors.createdAt, end)
        )
      )
      .groupBy(sql`date_trunc('day', ${siteVisitors.createdAt})`)
      .orderBy(sql`date_trunc('day', ${siteVisitors.createdAt})`);

    const pageViewStats = await db
      .select({
        path: pageViews.path,
        views: sql<number>`count(*)::int`,
      })
      .from(pageViews)
      .where(
        and(
          gte(pageViews.createdAt, start),
          lte(pageViews.createdAt, end)
        )
      )
      .groupBy(pageViews.path)
      .orderBy(sql`count(*) DESC`)
      .limit(10);

    res.json({
      visitorStats,
      topPages: pageViewStats,
      period: { start, end },
    });
  } catch (error) {
    console.error("Error fetching visitor analytics:", error);
    res.status(500).json({ message: "Failed to fetch visitor analytics" });
  }
});

router.get("/analytics/content", requirePermission("analytics.view_basic"), async (req, res) => {
  try {
    const totalArticles = await db
      .select({
        status: articles.status,
        count: sql<number>`count(*)::int`,
      })
      .from(articles)
      .groupBy(articles.status);

    const totalBlogPosts = await db
      .select({
        status: blogPosts.status,
        count: sql<number>`count(*)::int`,
      })
      .from(blogPosts)
      .groupBy(blogPosts.status);

    const topViewedArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        viewCount: articles.viewCount,
        status: articles.status,
      })
      .from(articles)
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.viewCount))
      .limit(10);

    res.json({
      articles: totalArticles,
      blogPosts: totalBlogPosts,
      topViewedArticles,
    });
  } catch (error) {
    console.error("Error fetching content analytics:", error);
    res.status(500).json({ message: "Failed to fetch content analytics" });
  }
});

router.post("/analytics/event", async (req: any, res) => {
  try {
    const { eventType, sessionId, metadata } = trackEventSchema.parse(req.body);
    const userId = req.user?.claims?.sub || req.session?.adminUserId || null;

    await db.insert(analyticsEvents).values({
      eventType,
      userId,
      sessionId,
      metadata: metadata || {},
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      createdAt: new Date(),
    });

    res.json({ success: true, message: "Event tracked" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Error tracking event:", error);
    res.status(500).json({ message: "Failed to track event" });
  }
});

router.post("/analytics/snapshot/generate", requirePermission("analytics.view_advanced"), async (req: any, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const totalRevenue = await db
      .select({ sum: sql<number>`COALESCE(sum(price)::numeric, 0)` })
      .from(purchases)
      .where(
        and(
          gte(purchases.createdAt, yesterday),
          lte(purchases.createdAt, today),
          eq(purchases.status, "paid")
        )
      );

    const totalTransactions = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(purchases)
      .where(
        and(
          gte(purchases.createdAt, yesterday),
          lte(purchases.createdAt, today),
          eq(purchases.status, "paid")
        )
      );

    const newUsers = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(
        and(
          gte(users.createdAt, yesterday),
          lte(users.createdAt, today)
        )
      );

    const totalPageViews = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pageViews)
      .where(
        and(
          gte(pageViews.createdAt, yesterday),
          lte(pageViews.createdAt, today)
        )
      );

    const uniqueVisitors = await db
      .select({ count: sql<number>`count(DISTINCT ${siteVisitors.sessionId})::int` })
      .from(siteVisitors)
      .where(
        and(
          gte(siteVisitors.createdAt, yesterday),
          lte(siteVisitors.createdAt, today)
        )
      );

    const articlesPublished = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(articles)
      .where(
        and(
          gte(articles.publishedAt, yesterday),
          lte(articles.publishedAt, today),
          eq(articles.status, "published")
        )
      );

    const topPages = await db
      .select({
        page: pageViews.path,
        views: sql<number>`count(*)::int`,
      })
      .from(pageViews)
      .where(
        and(
          gte(pageViews.createdAt, yesterday),
          lte(pageViews.createdAt, today)
        )
      )
      .groupBy(pageViews.path)
      .orderBy(sql`count(*) DESC`)
      .limit(10);

    const avgSessionDuration = await db
      .select({ avg: sql<number>`COALESCE(avg(time_spent)::int, 0)` })
      .from(siteVisitors)
      .where(
        and(
          gte(siteVisitors.createdAt, yesterday),
          lte(siteVisitors.createdAt, today)
        )
      );

    const [snapshot] = await db
      .insert(analyticsSnapshots)
      .values({
        snapshotDate: yesterday,
        totalRevenue: String(totalRevenue[0]?.sum || 0),
        totalTransactions: totalTransactions[0]?.count || 0,
        newUsers: newUsers[0]?.count || 0,
        activeUsers: uniqueVisitors[0]?.count || 0,
        pageViews: totalPageViews[0]?.count || 0,
        uniqueVisitors: uniqueVisitors[0]?.count || 0,
        articlesPublished: articlesPublished[0]?.count || 0,
        articlesSold: totalTransactions[0]?.count || 0,
        avgSessionDuration: avgSessionDuration[0]?.avg || null,
        topPages,
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: analyticsSnapshots.snapshotDate,
        set: {
          totalRevenue: String(totalRevenue[0]?.sum || 0),
          totalTransactions: totalTransactions[0]?.count || 0,
          newUsers: newUsers[0]?.count || 0,
          activeUsers: uniqueVisitors[0]?.count || 0,
          pageViews: totalPageViews[0]?.count || 0,
          uniqueVisitors: uniqueVisitors[0]?.count || 0,
          articlesPublished: articlesPublished[0]?.count || 0,
          articlesSold: totalTransactions[0]?.count || 0,
          avgSessionDuration: avgSessionDuration[0]?.avg || null,
          topPages,
        },
      })
      .returning();

    res.json({ success: true, snapshot });
  } catch (error) {
    console.error("Error generating snapshot:", error);
    res.status(500).json({ message: "Failed to generate snapshot" });
  }
});

export default router;
