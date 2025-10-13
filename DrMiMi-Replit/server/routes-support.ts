import { Router } from "express";
import { db } from "./db";
import { supportTickets, users, auditLogs } from "../shared/schema";
import { eq, or, and, desc, sql } from "drizzle-orm";
import { requirePermission } from "./rbac";
import { z } from "zod";

const router = Router();

const createTicketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

const replySchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

const updateStatusSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
});

router.get("/support/tickets", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || req.session?.adminUserId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let tickets;

    if (user.role === "owner" || user.role === "admin") {
      tickets = await db
        .select()
        .from(supportTickets)
        .orderBy(desc(supportTickets.createdAt));
    } else {
      tickets = await db
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.userId, userId))
        .orderBy(desc(supportTickets.createdAt));
    }

    const enrichedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const [creator] = await db
          .select({ id: users.id, firstName: users.firstName, lastName: users.lastName, email: users.email })
          .from(users)
          .where(eq(users.id, ticket.userId));

        let assignee: any = null;
        if (ticket.assignedTo) {
          [assignee] = await db
            .select({ id: users.id, firstName: users.firstName, lastName: users.lastName })
            .from(users)
            .where(eq(users.id, ticket.assignedTo));
        }

        return {
          ...ticket,
          creator,
          assignee,
        };
      })
    );

    res.json(enrichedTickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
});

router.post("/support/tickets", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || req.session?.adminUserId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { subject, description, priority } = createTicketSchema.parse(req.body);

    const [ticket] = await db
      .insert(supportTickets)
      .values({
        userId,
        subject,
        description,
        priority,
        status: "open",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await db.insert(auditLogs).values({
      userId,
      userRole: req.user?.role || "viewer",
      action: "support.create_ticket",
      entityType: "support_ticket",
      entityId: ticket.id,
      metadata: { subject, priority },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      severity: "info",
    });

    res.json({ success: true, ticket });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Error creating ticket:", error);
    res.status(500).json({ message: "Failed to create ticket" });
  }
});

router.get("/support/tickets/:id", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || req.session?.adminUserId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, id));

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "owner" && user.role !== "admin" && ticket.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const [creator] = await db
      .select({ id: users.id, firstName: users.firstName, lastName: users.lastName, email: users.email })
      .from(users)
      .where(eq(users.id, ticket.userId));

    let assignee: any = null;
    if (ticket.assignedTo) {
      [assignee] = await db
        .select({ id: users.id, firstName: users.firstName, lastName: users.lastName })
        .from(users)
        .where(eq(users.id, ticket.assignedTo));
    }

    res.json({
      ...ticket,
      creator,
      assignee,
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ message: "Failed to fetch ticket" });
  }
});

router.post("/support/tickets/:id/reply", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || req.session?.adminUserId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { message } = replySchema.parse(req.body);

    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, id));

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "owner" && user.role !== "admin" && ticket.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = Array.isArray(ticket.messages) ? ticket.messages : [];
    const newMessage = {
      senderId: userId,
      senderName: `${user.firstName} ${user.lastName}`,
      message,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, newMessage];

    await db
      .update(supportTickets)
      .set({
        messages: updatedMessages,
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, id));

    await db.insert(auditLogs).values({
      userId,
      userRole: user.role || "viewer",
      action: "support.reply",
      entityType: "support_ticket",
      entityId: id,
      metadata: { messageLength: message.length },
      ipAddress: req.ip || null,
      userAgent: req.get("user-agent") || null,
      severity: "info",
    });

    res.json({ success: true, message: newMessage });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Error replying to ticket:", error);
    res.status(500).json({ message: "Failed to reply to ticket" });
  }
});

router.put("/support/tickets/:id/status", requirePermission("support.resolve_tickets"), async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || req.session?.adminUserId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { status } = updateStatusSchema.parse(req.body);

    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, id));

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const oldStatus = ticket.status;

    await db
      .update(supportTickets)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, id));

    await db.insert(auditLogs).values({
      userId,
      userRole: req.user?.role || "admin",
      action: "support.update_status",
      entityType: "support_ticket",
      entityId: id,
      oldValues: { status: oldStatus },
      newValues: { status },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      severity: "info",
    });

    res.json({ success: true, message: "Ticket status updated" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Error updating ticket status:", error);
    res.status(500).json({ message: "Failed to update ticket status" });
  }
});

router.put("/support/tickets/:id/assign", requirePermission("support.respond_tickets"), async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || req.session?.adminUserId;
    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, id));

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (assignedTo) {
      const [assignee] = await db.select().from(users).where(eq(users.id, assignedTo));
      if (!assignee) {
        return res.status(404).json({ message: "Assignee user not found" });
      }
    }

    await db
      .update(supportTickets)
      .set({
        assignedTo: assignedTo || null,
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, id));

    await db.insert(auditLogs).values({
      userId,
      userRole: req.user?.role || "admin",
      action: "support.assign",
      entityType: "support_ticket",
      entityId: id,
      newValues: { assignedTo },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      severity: "info",
    });

    res.json({ success: true, message: "Ticket assigned" });
  } catch (error) {
    console.error("Error assigning ticket:", error);
    res.status(500).json({ message: "Failed to assign ticket" });
  }
});

export default router;
