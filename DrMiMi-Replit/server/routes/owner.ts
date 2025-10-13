import { Router } from "express";
import { db } from "../db";
import { users, auditLogs } from "../../shared/schema";
import { eq, or, and, desc, like, sql, gte } from "drizzle-orm";
import { requireRole } from "../rbac";
import { z } from "zod";

const router = Router();

const suspendSchema = z.object({
  reason: z.string().min(3, "Reason must be at least 3 characters"),
});

const blockSchema = z.object({
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

const roleSchema = z.object({
  role: z.enum(["viewer", "consultant", "editor", "admin"]),
});

const deleteUserSchema = z.object({
  confirmEmail: z.string().email("Invalid email format"),
});

// GET /api/owner/users - Get all users with enhanced filters
router.get("/owner/users", requireRole("owner"), async (req: any, res) => {
  try {
    const { 
      search, 
      role, 
      status, 
      dateFrom,
      dateTo,
      page = "1", 
      limit = "50" 
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let conditions: any[] = [];

    // Search by name or email
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

    // Filter by role
    if (role && role !== 'all') {
      conditions.push(eq(users.role, role as any));
    }

    // Filter by status
    if (status && status !== 'all') {
      if (status === 'active') {
        conditions.push(
          and(
            eq(users.isBlacklisted, false),
            eq(users.isSuspended, false)
          )
        );
      } else if (status === 'suspended') {
        conditions.push(eq(users.isSuspended, true));
      } else if (status === 'blocked') {
        conditions.push(eq(users.isBlacklisted, true));
      }
    }

    // Filter by registration date
    if (dateFrom) {
      conditions.push(gte(users.createdAt, new Date(dateFrom as string)));
    }
    if (dateTo) {
      const endDate = new Date(dateTo as string);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(sql`${users.createdAt} <= ${endDate}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const usersList = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        isBlacklisted: users.isBlacklisted,
        blacklistReason: users.blacklistReason,
        isSuspended: users.isSuspended,
        suspendedAt: users.suspendedAt,
        suspendedReason: users.suspendedReason,
        yearOfStudy: users.yearOfStudy,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limitNum)
      .offset(offset);

    const [totalCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(whereClause);

    res.json({
      users: usersList,
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

// POST /api/owner/users/:userId/suspend - Suspend or reactivate a user
router.post("/owner/users/:userId/suspend", requireRole("owner"), async (req: any, res) => {
  try {
    const { userId } = req.params;
    const performedBy = req.user?.claims?.sub || req.session?.adminUserId;

    if (!performedBy) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Prevent self-suspension
    if (userId === performedBy) {
      return res.status(403).json({ message: "Cannot suspend your own account" });
    }

    const [targetUser] = await db.select().from(users).where(eq(users.id, userId));

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent suspending other owners
    if (targetUser.role === "owner") {
      return res.status(403).json({ message: "Cannot suspend another owner account" });
    }

    const isSuspended = !targetUser.isSuspended;
    let updateData: any = {
      isSuspended,
      updatedAt: new Date(),
    };

    if (isSuspended) {
      const { reason } = suspendSchema.parse(req.body);
      updateData.suspendedAt = new Date();
      updateData.suspendedReason = reason;
    } else {
      updateData.suspendedAt = null;
      updateData.suspendedReason = null;
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId));

    await db.insert(auditLogs).values({
      userId: performedBy,
      userRole: "owner",
      action: isSuspended ? "owner.user.suspend" : "owner.user.reactivate",
      entityType: "user",
      entityId: userId,
      oldValues: { isSuspended: targetUser.isSuspended },
      newValues: { isSuspended },
      ipAddress: req.ip || null,
      userAgent: req.get("user-agent") || null,
      severity: "warning",
    });

    console.log(`🔒 Owner action: User ${targetUser.email} ${isSuspended ? 'suspended' : 'reactivated'} by owner`);

    res.json({ 
      success: true, 
      message: `User ${isSuspended ? 'suspended' : 'reactivated'} successfully`,
      isSuspended 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Error suspending/reactivating user:", error);
    res.status(500).json({ message: "Failed to suspend/reactivate user" });
  }
});

// POST /api/owner/users/:userId/block - Block or unblock a user (using blacklist)
router.post("/owner/users/:userId/block", requireRole("owner"), async (req: any, res) => {
  try {
    const { userId } = req.params;
    const performedBy = req.user?.claims?.sub || req.session?.adminUserId;

    if (!performedBy) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Prevent self-blocking
    if (userId === performedBy) {
      return res.status(403).json({ message: "Cannot block your own account" });
    }

    const [targetUser] = await db.select().from(users).where(eq(users.id, userId));

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent blocking other owners
    if (targetUser.role === "owner") {
      return res.status(403).json({ message: "Cannot block another owner account" });
    }

    const isBlocked = !targetUser.isBlacklisted;
    let updateData: any = {
      isBlacklisted: isBlocked,
      updatedAt: new Date(),
    };

    if (isBlocked) {
      const { reason } = blockSchema.parse(req.body);
      updateData.blacklistReason = reason;
    } else {
      updateData.blacklistReason = null;
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId));

    await db.insert(auditLogs).values({
      userId: performedBy,
      userRole: "owner",
      action: isBlocked ? "owner.user.block" : "owner.user.unblock",
      entityType: "user",
      entityId: userId,
      oldValues: { isBlacklisted: targetUser.isBlacklisted },
      newValues: { isBlacklisted: isBlocked },
      ipAddress: req.ip || null,
      userAgent: req.get("user-agent") || null,
      severity: isBlocked ? "critical" : "warning",
    });

    console.log(`🚫 Owner action: User ${targetUser.email} ${isBlocked ? 'blocked' : 'unblocked'} by owner`);

    res.json({ 
      success: true, 
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      isBlocked 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Error blocking/unblocking user:", error);
    res.status(500).json({ message: "Failed to block/unblock user" });
  }
});

// POST /api/owner/users/:userId/role - Change user role
router.post("/owner/users/:userId/role", requireRole("owner"), async (req: any, res) => {
  try {
    const { userId } = req.params;
    const { role } = roleSchema.parse(req.body);
    const performedBy = req.user?.claims?.sub || req.session?.adminUserId;

    if (!performedBy) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Prevent self role change
    if (userId === performedBy) {
      return res.status(403).json({ message: "Cannot change your own role. Contact another owner." });
    }

    const [targetUser] = await db.select().from(users).where(eq(users.id, userId));

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent changing owner roles
    if (targetUser.role === "owner") {
      return res.status(403).json({ message: "Cannot change another owner's role" });
    }

    const oldRole = targetUser.role;

    await db
      .update(users)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    await db.insert(auditLogs).values({
      userId: performedBy,
      userRole: "owner",
      action: "owner.user.change_role",
      entityType: "user",
      entityId: userId,
      oldValues: { role: oldRole },
      newValues: { role },
      ipAddress: req.ip || null,
      userAgent: req.get("user-agent") || null,
      severity: "warning",
    });

    console.log(`👤 Owner action: User ${targetUser.email} role changed from ${oldRole} to ${role} by owner`);

    res.json({ 
      success: true, 
      message: `User role changed to ${role} successfully`,
      role 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Error changing user role:", error);
    res.status(500).json({ message: "Failed to change user role" });
  }
});

// GET /api/owner/stats - Get enhanced dashboard statistics
router.get("/owner/stats", requireRole("owner"), async (req: any, res) => {
  try {
    const [totalUsers] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    const [activeUsers] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(
        and(
          eq(users.isBlacklisted, false),
          eq(users.isSuspended, false)
        )
      );

    const [suspendedUsers] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.isSuspended, true));

    const [blockedUsers] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.isBlacklisted, true));

    const roleStats = await db
      .select({
        role: users.role,
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .groupBy(users.role);

    res.json({
      totalUsers: totalUsers?.count || 0,
      activeUsers: activeUsers?.count || 0,
      suspendedUsers: suspendedUsers?.count || 0,
      blockedUsers: blockedUsers?.count || 0,
      roleDistribution: roleStats.reduce((acc, stat) => {
        acc[stat.role || 'unknown'] = stat.count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error("Error fetching owner stats:", error);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
});

// PUT /api/owner/users/:userId/role - Change user role
router.put("/owner/users/:userId/role", requireRole("owner"), async (req: any, res) => {
  try {
    const { userId } = req.params;
    const { role } = roleSchema.parse(req.body);
    const performedBy = req.user?.claims?.sub || req.session?.adminUserId;

    if (!performedBy) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Prevent self-role change
    if (userId === performedBy) {
      return res.status(403).json({ message: "Cannot change your own role" });
    }

    const [targetUser] = await db.select().from(users).where(eq(users.id, userId));

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent changing other owners' roles
    if (targetUser.role === "owner") {
      return res.status(403).json({ message: "Cannot change another owner's role" });
    }

    const oldRole = targetUser.role;

    await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId));

    await db.insert(auditLogs).values({
      userId: performedBy,
      userRole: "owner",
      action: "owner.user.role_change",
      entityType: "user",
      entityId: userId,
      oldValues: { role: oldRole },
      newValues: { role },
      ipAddress: req.ip || null,
      userAgent: req.get("user-agent") || null,
      severity: "medium",
    });

    console.log(`👑 Owner action: User ${targetUser.email} role changed from ${oldRole} to ${role}`);

    res.json({ 
      success: true, 
      message: `User role changed to ${role} successfully`,
      newRole: role 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Error changing user role:", error);
    res.status(500).json({ message: "Failed to change user role" });
  }
});

// DELETE /api/owner/users/:userId - Delete a user
router.delete("/owner/users/:userId", requireRole("owner"), async (req: any, res) => {
  try {
    const { userId } = req.params;
    const { confirmEmail } = deleteUserSchema.parse(req.body);
    const performedBy = req.user?.claims?.sub || req.session?.adminUserId;

    if (!performedBy) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Prevent self-deletion
    if (userId === performedBy) {
      return res.status(403).json({ message: "Cannot delete your own account" });
    }

    const [targetUser] = await db.select().from(users).where(eq(users.id, userId));

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Confirm email matches
    if (targetUser.email !== confirmEmail) {
      return res.status(400).json({ message: "Email confirmation does not match" });
    }

    // Prevent deleting other owners
    if (targetUser.role === "owner") {
      return res.status(403).json({ message: "Cannot delete another owner account" });
    }

    // Store user data for audit log before deletion
    const userData = {
      email: targetUser.email,
      firstName: targetUser.firstName,
      lastName: targetUser.lastName,
      role: targetUser.role,
    };

    // Delete user
    await db.delete(users).where(eq(users.id, userId));

    await db.insert(auditLogs).values({
      userId: performedBy,
      userRole: "owner",
      action: "owner.user.delete",
      entityType: "user",
      entityId: userId,
      oldValues: userData,
      newValues: null,
      ipAddress: req.ip || null,
      userAgent: req.get("user-agent") || null,
      severity: "high",
    });

    console.log(`🗑️ Owner action: User ${targetUser.email} deleted permanently`);

    res.json({ 
      success: true, 
      message: "User deleted successfully" 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;