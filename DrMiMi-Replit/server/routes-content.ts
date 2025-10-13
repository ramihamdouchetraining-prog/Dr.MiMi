import { Router } from "express";
import { db } from "./db";
import { posts, events, auditLogs } from "../shared/schema";
import { eq, or, and, desc, like } from "drizzle-orm";
import { requirePermission } from "./rbac";
import { z } from "zod";

const router = Router();

const createPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  titleEn: z.string().optional(),
  titleAr: z.string().optional(),
  content: z.string().min(10, "Content must be at least 10 characters"),
  contentEn: z.string().optional(),
  contentAr: z.string().optional(),
  images: z.array(z.string()).optional(),
  postType: z.enum(["announcement", "tip", "news", "discussion"]).default("announcement"),
  isPinned: z.boolean().default(false),
  price: z.number().default(0),
  currency: z.string().default("DZD"),
});

const updatePostSchema = createPostSchema.partial();

const createEventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  titleEn: z.string().optional(),
  titleAr: z.string().optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  eventType: z.enum(["webinar", "workshop", "conference", "exam"]),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  location: z.string().optional(),
  isOnline: z.boolean().default(true),
  meetingLink: z.string().optional(),
  maxParticipants: z.number().optional(),
  price: z.number().default(0),
  currency: z.string().default("DZD"),
  coverImage: z.string().optional(),
});

const updateEventSchema = createEventSchema.partial();

router.get("/posts", async (req, res) => {
  try {
    const { status, postType, search } = req.query;

    let conditions: any[] = [];

    if (status) {
      conditions.push(eq(posts.status, status as any));
    } else {
      conditions.push(eq(posts.status, "published"));
    }

    if (postType) {
      conditions.push(eq(posts.postType, postType as any));
    }

    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          like(posts.title, searchTerm),
          like(posts.content, searchTerm)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const postsList = await db
      .select()
      .from(posts)
      .where(whereClause)
      .orderBy(desc(posts.isPinned), desc(posts.createdAt));

    res.json(postsList);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

router.get("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id));

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Failed to fetch post" });
  }
});

router.post("/posts", requirePermission("content.create"), async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || req.session?.adminUserId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const postData = createPostSchema.parse(req.body);

    const [post] = await db
      .insert(posts)
      .values({
        ...postData,
        price: String(postData.price || 0),
        createdBy: userId,
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await db.insert(auditLogs).values({
      userId,
      userRole: req.user?.role || "editor",
      action: "content.create_post",
      entityType: "post",
      entityId: post.id,
      metadata: { title: post.title },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      severity: "info",
    });

    res.json({ success: true, post });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Failed to create post" });
  }
});

router.put("/posts/:id", requirePermission("content.edit"), async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.claims?.sub || req.session?.adminUserId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [existingPost] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id));

    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (existingPost.createdBy !== userId && req.user?.role !== "owner" && req.user?.role !== "admin") {
      return res.status(403).json({ message: "You can only edit your own posts" });
    }

    const updateData = updatePostSchema.parse(req.body);

    const [post] = await db
      .update(posts)
      .set({
        ...updateData,
        price: updateData.price !== undefined ? String(updateData.price) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();

    await db.insert(auditLogs).values({
      userId,
      userRole: req.user?.role || "editor",
      action: "content.update_post",
      entityType: "post",
      entityId: id,
      metadata: { title: post.title },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      severity: "info",
    });

    res.json({ success: true, post });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Failed to update post" });
  }
});

router.delete("/posts/:id", requirePermission("content.delete"), async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.claims?.sub || req.session?.adminUserId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [existingPost] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id));

    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (existingPost.createdBy !== userId && req.user?.role !== "owner" && req.user?.role !== "admin") {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await db.delete(posts).where(eq(posts.id, id));

    await db.insert(auditLogs).values({
      userId,
      userRole: req.user?.role || "editor",
      action: "content.delete_post",
      entityType: "post",
      entityId: id,
      metadata: { title: existingPost.title },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      severity: "warning",
    });

    res.json({ success: true, message: "Post deleted" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
});

router.get("/events", async (req, res) => {
  try {
    const { status, eventType, upcoming } = req.query;

    let conditions: any[] = [];

    if (status) {
      conditions.push(eq(events.status, status as any));
    } else {
      conditions.push(eq(events.status, "published"));
    }

    if (eventType) {
      conditions.push(eq(events.eventType, eventType as any));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let eventsList = await db
      .select()
      .from(events)
      .where(whereClause)
      .orderBy(desc(events.startDate));

    if (upcoming === "true") {
      const now = new Date();
      eventsList = eventsList.filter(event => new Date(event.startDate) > now);
    }

    res.json(eventsList);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

router.get("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id));

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

router.post("/events", requirePermission("content.create"), async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || req.session?.adminUserId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const eventData = createEventSchema.parse(req.body);

    const [event] = await db
      .insert(events)
      .values({
        ...eventData,
        price: String(eventData.price || 0),
        createdBy: userId,
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await db.insert(auditLogs).values({
      userId,
      userRole: req.user?.role || "editor",
      action: "content.create_event",
      entityType: "event",
      entityId: event.id,
      metadata: { title: event.title },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      severity: "info",
    });

    res.json({ success: true, event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Failed to create event" });
  }
});

router.put("/events/:id", requirePermission("content.edit"), async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.claims?.sub || req.session?.adminUserId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [existingEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, id));

    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (existingEvent.createdBy !== userId && req.user?.role !== "owner" && req.user?.role !== "admin") {
      return res.status(403).json({ message: "You can only edit your own events" });
    }

    const updateData = updateEventSchema.parse(req.body);

    const [event] = await db
      .update(events)
      .set({
        ...updateData,
        price: updateData.price !== undefined ? String(updateData.price) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    await db.insert(auditLogs).values({
      userId,
      userRole: req.user?.role || "editor",
      action: "content.update_event",
      entityType: "event",
      entityId: id,
      metadata: { title: event.title },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      severity: "info",
    });

    res.json({ success: true, event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
});

router.delete("/events/:id", requirePermission("content.delete"), async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.claims?.sub || req.session?.adminUserId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [existingEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, id));

    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (existingEvent.createdBy !== userId && req.user?.role !== "owner" && req.user?.role !== "admin") {
      return res.status(403).json({ message: "You can only delete your own events" });
    }

    await db.delete(events).where(eq(events.id, id));

    await db.insert(auditLogs).values({
      userId,
      userRole: req.user?.role || "editor",
      action: "content.delete_event",
      entityType: "event",
      entityId: id,
      metadata: { title: existingEvent.title },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      severity: "warning",
    });

    res.json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
});

export default router;
