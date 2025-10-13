import { Router } from "express";
import { db } from "./db";
import { 
  contentSubmissions, 
  articles, 
  posts, 
  events, 
  courses, 
  cases,
  blogPosts,
  auditLogs 
} from "../shared/schema";
import { eq, and, or, desc } from "drizzle-orm";
import { requirePermission } from "./rbac";
import { z } from "zod";

const router = Router();

const submitSchema = z.object({
  contentType: z.enum(["article", "post", "blog", "course", "case", "file", "image"]),
  contentId: z.string(),
});

const reviewSchema = z.object({
  reviewNotes: z.string().optional(),
});

router.get("/approvals/pending", requirePermission("content.approve"), async (req, res) => {
  try {
    const pending = await db
      .select()
      .from(contentSubmissions)
      .where(eq(contentSubmissions.status, "pending"))
      .orderBy(desc(contentSubmissions.submittedAt));

    const enrichedSubmissions = await Promise.all(
      pending.map(async (submission) => {
        let contentDetails: any = null;

        try {
          switch (submission.contentType) {
            case "article":
              const [article] = await db
                .select()
                .from(articles)
                .where(eq(articles.id, submission.contentId));
              contentDetails = article;
              break;
            case "post":
              const [post] = await db
                .select()
                .from(posts)
                .where(eq(posts.id, submission.contentId));
              contentDetails = post;
              break;
            case "blog":
              const [blog] = await db
                .select()
                .from(blogPosts)
                .where(eq(blogPosts.id, submission.contentId));
              contentDetails = blog;
              break;
            case "course":
              const [course] = await db
                .select()
                .from(courses)
                .where(eq(courses.id, submission.contentId));
              contentDetails = course;
              break;
            case "case":
              const [caseItem] = await db
                .select()
                .from(cases)
                .where(eq(cases.id, submission.contentId));
              contentDetails = caseItem;
              break;
          }
        } catch (error) {
          console.error(`Error fetching ${submission.contentType} content:`, error);
        }

        return {
          ...submission,
          contentDetails,
        };
      })
    );

    res.json(enrichedSubmissions);
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    res.status(500).json({ message: "Failed to fetch pending approvals" });
  }
});

router.get("/approvals/:id", requirePermission("content.approve"), async (req, res) => {
  try {
    const { id } = req.params;

    const [submission] = await db
      .select()
      .from(contentSubmissions)
      .where(eq(contentSubmissions.id, id));

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    let contentDetails: any = null;

    switch (submission.contentType) {
      case "article":
        const [article] = await db
          .select()
          .from(articles)
          .where(eq(articles.id, submission.contentId));
        contentDetails = article;
        break;
      case "post":
        const [post] = await db
          .select()
          .from(posts)
          .where(eq(posts.id, submission.contentId));
        contentDetails = post;
        break;
      case "blog":
        const [blog] = await db
          .select()
          .from(blogPosts)
          .where(eq(blogPosts.id, submission.contentId));
        contentDetails = blog;
        break;
      case "course":
        const [course] = await db
          .select()
          .from(courses)
          .where(eq(courses.id, submission.contentId));
        contentDetails = course;
        break;
      case "case":
        const [caseItem] = await db
          .select()
          .from(cases)
          .where(eq(cases.id, submission.contentId));
        contentDetails = caseItem;
        break;
    }

    res.json({
      ...submission,
      contentDetails,
    });
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({ message: "Failed to fetch submission" });
  }
});

router.post("/approvals/:id/approve", requirePermission("content.approve"), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = reviewSchema.parse(req.body);
    const reviewerId = req.user?.claims?.sub || req.session?.adminUserId;

    if (!reviewerId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [submission] = await db
      .select()
      .from(contentSubmissions)
      .where(eq(contentSubmissions.id, id));

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (submission.status !== "pending") {
      return res.status(400).json({ message: "Submission has already been reviewed" });
    }

    await db
      .update(contentSubmissions)
      .set({
        status: "approved",
        reviewedBy: reviewerId,
        reviewNotes,
        reviewedAt: new Date(),
      })
      .where(eq(contentSubmissions.id, id));

    let contentTable;
    switch (submission.contentType) {
      case "article":
        contentTable = articles;
        break;
      case "post":
        contentTable = posts;
        break;
      case "blog":
        contentTable = blogPosts;
        break;
      case "course":
        contentTable = courses;
        break;
      case "case":
        contentTable = cases;
        break;
      default:
        return res.json({ success: true, message: "Submission approved" });
    }

    if (contentTable) {
      await db
        .update(contentTable)
        .set({
          status: "published",
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(contentTable.id, submission.contentId));
    }

    await db.insert(auditLogs).values({
      userId: reviewerId,
      userRole: req.user?.role || "owner",
      action: "content.approve",
      entityType: submission.contentType,
      entityId: submission.contentId,
      metadata: { submissionId: id, reviewNotes },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      severity: "info",
    });

    res.json({ success: true, message: "Content approved and published" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Error approving submission:", error);
    res.status(500).json({ message: "Failed to approve submission" });
  }
});

router.post("/approvals/:id/reject", requirePermission("content.approve"), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = reviewSchema.parse(req.body);
    const reviewerId = req.user?.claims?.sub || req.session?.adminUserId;

    if (!reviewerId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!reviewNotes) {
      return res.status(400).json({ message: "Review notes are required for rejection" });
    }

    const [submission] = await db
      .select()
      .from(contentSubmissions)
      .where(eq(contentSubmissions.id, id));

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (submission.status !== "pending") {
      return res.status(400).json({ message: "Submission has already been reviewed" });
    }

    await db
      .update(contentSubmissions)
      .set({
        status: "rejected",
        reviewedBy: reviewerId,
        reviewNotes,
        reviewedAt: new Date(),
      })
      .where(eq(contentSubmissions.id, id));

    await db.insert(auditLogs).values({
      userId: reviewerId,
      userRole: req.user?.role || "owner",
      action: "content.reject",
      entityType: submission.contentType,
      entityId: submission.contentId,
      metadata: { submissionId: id, reviewNotes },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      severity: "info",
    });

    res.json({ success: true, message: "Content rejected" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Error rejecting submission:", error);
    res.status(500).json({ message: "Failed to reject submission" });
  }
});

router.post("/content/:type/:id/submit", requirePermission("content.submit_for_review"), async (req: any, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user?.claims?.sub || req.session?.adminUserId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validTypes = ["article", "post", "blog", "course", "case", "file", "image"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid content type" });
    }

    const [existing] = await db
      .select()
      .from(contentSubmissions)
      .where(
        and(
          eq(contentSubmissions.contentType, type as any),
          eq(contentSubmissions.contentId, id),
          eq(contentSubmissions.status, "pending")
        )
      );

    if (existing) {
      return res.status(409).json({ message: "This content is already pending review" });
    }

    const [submission] = await db
      .insert(contentSubmissions)
      .values({
        contentType: type as any,
        contentId: id,
        submittedBy: userId,
        status: "pending",
        submittedAt: new Date(),
      })
      .returning();

    await db.insert(auditLogs).values({
      userId,
      userRole: req.user?.role || "editor",
      action: "content.submit",
      entityType: type,
      entityId: id,
      metadata: { submissionId: submission.id },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      severity: "info",
    });

    res.json({ success: true, submission, message: "Content submitted for review" });
  } catch (error) {
    console.error("Error submitting content:", error);
    res.status(500).json({ message: "Failed to submit content" });
  }
});

export default router;
