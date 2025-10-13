import { Router } from "express";
import { db } from "./db";
import { users, userBlacklistAudit, auditLogs, userBadges } from "../shared/schema";
import { eq, or, and, desc, like, sql } from "drizzle-orm";
import { requirePermission } from "./rbac";
import { z } from "zod";
import bcrypt from "bcryptjs";

const router = Router();

const blacklistSchema = z.object({
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

const updateRoleSchema = z.object({
  role: z.enum(["owner", "admin", "editor", "viewer", "consultant"]),
});

const createAdminSchema = z.object({
  email: z.string().email("Invalid email format"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["admin", "editor", "viewer", "consultant"]),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const badgeSchema = z.object({
  badgeType: z.enum(["gold", "silver", "bronze"]),
  reason: z.string().min(3, "Reason must be at least 3 characters"),
});

router.get("/users", requirePermission("users.read"), async (req: any, res) => {
  try {
    const { search, role, isBlacklisted, badgeType, page = "1", limit = "50" } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let conditions: any[] = [];

    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          like(users.email, searchTerm),
          like(users.firstName, searchTerm),
          like(users.lastName, searchTerm),
          like(users.username, searchTerm)
        )
      );
    }

    if (role) {
      conditions.push(eq(users.role, role as any));
    }

    if (isBlacklisted !== undefined) {
      conditions.push(eq(users.isBlacklisted, isBlacklisted === "true"));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let usersList = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        isBlacklisted: users.isBlacklisted,
        blacklistReason: users.blacklistReason,
        yearOfStudy: users.yearOfStudy,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limitNum)
      .offset(offset);

    const usersWithBadges = await Promise.all(
      usersList.map(async (user) => {
        const badges = await db
          .select()
          .from(userBadges)
          .where(eq(userBadges.userId, user.id))
          .orderBy(desc(userBadges.createdAt));

        return {
          ...user,
          badges,
        };
      })
    );

    let filteredUsers = usersWithBadges;
    if (badgeType && badgeType !== 'all') {
      filteredUsers = usersWithBadges.filter(u => 
        u.badges.some(b => b.badgeType === badgeType)
      );
    }

    const [totalCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(whereClause);

    res.json({
      users: filteredUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount?.count || 0,
        totalPages: Math.ceil((totalCount?.count || 0) / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.get("/users/:id", requirePermission("users.read"), async (req, res) => {
  try {
    const { id } = req.params;

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        role: users.role,
        locale: users.locale,
        yearOfStudy: users.yearOfStudy,
        isBlacklisted: users.isBlacklisted,
        blacklistReason: users.blacklistReason,
        lastLoginAt: users.lastLoginAt,
        sessionTimeout: users.sessionTimeout,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

router.put("/users/:id/blacklist", requirePermission("users.blacklist"), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { reason } = blacklistSchema.parse(req.body);
    const performedBy = req.user?.claims?.sub || req.session?.adminUserId;

    if (!performedBy) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [targetUser] = await db.select().from(users).where(eq(users.id, id));

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser.role === "owner") {
      return res.status(403).json({ message: "Cannot blacklist owner accounts" });
    }

    if (targetUser.isBlacklisted) {
      return res.status(400).json({ message: "User is already blacklisted" });
    }

    await db
      .update(users)
      .set({
        isBlacklisted: true,
        blacklistReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    await db.insert(userBlacklistAudit).values({
      userId: id,
      action: "blacklisted",
      reason,
      performedBy,
      createdAt: new Date(),
    });

    await db.insert(auditLogs).values({
      userId: performedBy,
      userRole: req.user?.role || "owner",
      action: "users.blacklist",
      entityType: "user",
      entityId: id,
      newValues: { isBlacklisted: true, reason },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      severity: "warning",
    });

    res.json({ success: true, message: "User blacklisted successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Error blacklisting user:", error);
    res.status(500).json({ message: "Failed to blacklist user" });
  }
});

router.put("/users/:id/unblacklist", requirePermission("users.blacklist"), async (req: any, res) => {
  try {
    const { id } = req.params;
    const performedBy = req.user?.claims?.sub || req.session?.adminUserId;

    if (!performedBy) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [targetUser] = await db.select().from(users).where(eq(users.id, id));

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!targetUser.isBlacklisted) {
      return res.status(400).json({ message: "User is not blacklisted" });
    }

    await db
      .update(users)
      .set({
        isBlacklisted: false,
        blacklistReason: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    await db.insert(userBlacklistAudit).values({
      userId: id,
      action: "unblacklisted",
      reason: "Blacklist removed by administrator",
      performedBy,
      createdAt: new Date(),
    });

    await db.insert(auditLogs).values({
      userId: performedBy,
      userRole: req.user?.role || "owner",
      action: "users.unblacklist",
      entityType: "user",
      entityId: id,
      oldValues: { isBlacklisted: true },
      newValues: { isBlacklisted: false },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      severity: "info",
    });

    res.json({ success: true, message: "User unblacklisted successfully" });
  } catch (error) {
    console.error("Error unblacklisting user:", error);
    res.status(500).json({ message: "Failed to unblacklist user" });
  }
});

router.put("/users/:id/role", requirePermission("users.assign_roles"), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { role } = updateRoleSchema.parse(req.body);
    const performedBy = req.user?.claims?.sub || req.session?.adminUserId;

    if (!performedBy) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [performingUser] = await db.select().from(users).where(eq(users.id, performedBy));
    const [targetUser] = await db.select().from(users).where(eq(users.id, id));

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser.role === "owner" && performingUser.role !== "owner") {
      return res.status(403).json({ message: "Only owner can modify owner accounts" });
    }

    if (role === "owner" && performingUser.role !== "owner") {
      return res.status(403).json({ message: "Only owner can assign owner role" });
    }

    const oldRole = targetUser.role;

    await db
      .update(users)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    await db.insert(auditLogs).values({
      userId: performedBy,
      userRole: performingUser.role || "owner",
      action: "users.change_role",
      entityType: "user",
      entityId: id,
      oldValues: { role: oldRole },
      newValues: { role },
      ipAddress: req.ip || null,
      userAgent: req.get("user-agent") || null,
      severity: "warning",
    });

    res.json({ success: true, message: "User role updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Failed to update user role" });
  }
});

router.get("/users/:id/blacklist-history", requirePermission("users.read"), async (req, res) => {
  try {
    const { id } = req.params;

    const history = await db
      .select()
      .from(userBlacklistAudit)
      .where(eq(userBlacklistAudit.userId, id))
      .orderBy(desc(userBlacklistAudit.createdAt));

    const enrichedHistory = await Promise.all(
      history.map(async (entry) => {
        const [performer] = await db
          .select({ id: users.id, firstName: users.firstName, lastName: users.lastName })
          .from(users)
          .where(eq(users.id, entry.performedBy));

        return {
          ...entry,
          performedByUser: performer,
        };
      })
    );

    res.json(enrichedHistory);
  } catch (error) {
    console.error("Error fetching blacklist history:", error);
    res.status(500).json({ message: "Failed to fetch blacklist history" });
  }
});

router.post("/users/create-admin", requirePermission("users.assign_roles"), async (req: any, res) => {
  try {
    const { email, firstName, lastName, role, password } = createAdminSchema.parse(req.body);
    const performedBy = req.user?.claims?.sub || req.session?.adminUserId;

    if (!performedBy) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        firstName,
        lastName,
        role,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
      });

    await db.insert(auditLogs).values({
      userId: performedBy,
      userRole: req.user?.role || "owner",
      action: "users.create_admin",
      entityType: "user",
      entityId: newUser.id,
      newValues: { email, firstName, lastName, role },
      ipAddress: req.ip || null,
      userAgent: req.get("user-agent") || null,
      severity: "info",
    });

    res.json(newUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Error creating admin/editor:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
});

router.delete("/users/:id", requirePermission("users.delete"), async (req: any, res) => {
  try {
    const { id } = req.params;
    const performedBy = req.user?.claims?.sub || req.session?.adminUserId;

    if (!performedBy) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [targetUser] = await db.select().from(users).where(eq(users.id, id));

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser.role === "owner") {
      return res.status(403).json({ message: "Cannot delete owner accounts" });
    }

    await db.delete(users).where(eq(users.id, id));

    await db.insert(auditLogs).values({
      userId: performedBy,
      userRole: req.user?.role || "owner",
      action: "users.delete",
      entityType: "user",
      entityId: id,
      oldValues: { 
        email: targetUser.email, 
        firstName: targetUser.firstName, 
        lastName: targetUser.lastName, 
        role: targetUser.role 
      },
      ipAddress: req.ip || null,
      userAgent: req.get("user-agent") || null,
      severity: "critical",
    });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

router.get("/users/:id/badges", requirePermission("users.read"), async (req, res) => {
  try {
    const { id } = req.params;

    const badges = await db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, id))
      .orderBy(desc(userBadges.createdAt));

    res.json(badges);
  } catch (error) {
    console.error("Error fetching user badges:", error);
    res.status(500).json({ message: "Failed to fetch badges" });
  }
});

router.post("/users/:id/badge", requirePermission("users.assign_roles"), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { badgeType, reason } = badgeSchema.parse(req.body);
    const performedBy = req.user?.claims?.sub || req.session?.adminUserId;

    if (!performedBy) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [targetUser] = await db.select().from(users).where(eq(users.id, id));

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const [newBadge] = await db
      .insert(userBadges)
      .values({
        userId: id,
        badgeType,
        reason,
        createdAt: new Date(),
      })
      .returning();

    await db.insert(auditLogs).values({
      userId: performedBy,
      userRole: req.user?.role || "owner",
      action: "users.assign_badge",
      entityType: "user",
      entityId: id,
      newValues: { badgeType, reason },
      ipAddress: req.ip || null,
      userAgent: req.get("user-agent") || null,
      severity: "info",
    });

    res.json({ success: true, message: "Badge assigned successfully", badge: newBadge });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Error assigning badge:", error);
    res.status(500).json({ message: "Failed to assign badge" });
  }
});

router.delete("/users/:userId/badge/:badgeId", requirePermission("users.assign_roles"), async (req: any, res) => {
  try {
    const { userId, badgeId } = req.params;
    const performedBy = req.user?.claims?.sub || req.session?.adminUserId;

    if (!performedBy) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [badge] = await db
      .select()
      .from(userBadges)
      .where(and(eq(userBadges.id, badgeId), eq(userBadges.userId, userId)));

    if (!badge) {
      return res.status(404).json({ message: "Badge not found" });
    }

    await db.delete(userBadges).where(eq(userBadges.id, badgeId));

    await db.insert(auditLogs).values({
      userId: performedBy,
      userRole: req.user?.role || "owner",
      action: "users.remove_badge",
      entityType: "user",
      entityId: userId,
      oldValues: { badgeType: badge.badgeType, reason: badge.reason },
      ipAddress: req.ip || null,
      userAgent: req.get("user-agent") || null,
      severity: "info",
    });

    res.json({ success: true, message: "Badge removed successfully" });
  } catch (error) {
    console.error("Error removing badge:", error);
    res.status(500).json({ message: "Failed to remove badge" });
  }
});

router.get("/users/:id/audit-history", requirePermission("users.read"), async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = "50", page = "1" } = req.query;

    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const offset = (pageNum - 1) * limitNum;

    const history = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.entityId, id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limitNum)
      .offset(offset);

    const enrichedHistory = await Promise.all(
      history.map(async (entry) => {
        const [performer] = await db
          .select({ 
            id: users.id, 
            firstName: users.firstName, 
            lastName: users.lastName,
            email: users.email 
          })
          .from(users)
          .where(eq(users.id, entry.userId));

        return {
          ...entry,
          performedByUser: performer,
        };
      })
    );

    const [totalCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(eq(auditLogs.entityId, id));

    res.json({
      history: enrichedHistory,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount?.count || 0,
        totalPages: Math.ceil((totalCount?.count || 0) / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching audit history:", error);
    res.status(500).json({ message: "Failed to fetch audit history" });
  }
});

export default router;
