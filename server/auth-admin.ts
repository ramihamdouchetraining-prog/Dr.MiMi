import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users, auditLogs } from "../shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import "./types";

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

const changeUsernameSchema = z.object({
  newUsername: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(1, "Password is required for verification"),
});

router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (user.role !== "owner") {
      return res.status(403).json({ message: "Access denied. Owner account required." });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    await db.insert(auditLogs).values({
      userId: user.id,
      userRole: user.role || "owner",
      action: "owner.login",
      entityType: "auth",
      entityId: user.id,
      ipAddress: req.ip || null,
      userAgent: req.get("user-agent") || null,
      severity: "info",
    });

    req.session.adminUserId = user.id;
    req.session.adminUsername = user.username || undefined;

    console.log('🔐 Owner login: Saving session for user', user.id);

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

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        forcePasswordChange: user.forcePasswordChange,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

router.get("/admin/session", async (req, res) => {
  try {
    const userId = req.session.adminUserId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        forcePasswordChange: user.forcePasswordChange,
      },
    });
  } catch (error) {
    console.error("Session check error:", error);
    res.status(500).json({ message: "Failed to check session" });
  }
});

router.post("/admin/logout", (req, res) => {
  const userId = req.session.adminUserId;
  
  if (userId) {
    db.insert(auditLogs).values({
      userId,
      userRole: "owner",
      action: "owner.logout",
      entityType: "auth",
      entityId: userId,
      ipAddress: req.ip || null,
      userAgent: req.get("user-agent") || null,
      severity: "info",
    }).catch(err => console.error("Audit log error:", err));
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});

router.post("/admin/change-password", async (req, res) => {
  try {
    const userId = req.session.adminUserId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || !user.password) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        forcePasswordChange: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    await db.insert(auditLogs).values({
      userId,
      userRole: user.role || "owner",
      action: "owner.change_password",
      entityType: "user",
      entityId: userId,
      ipAddress: req.ip || null,
      userAgent: req.get("user-agent") || null,
      severity: "warning",
    });

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Change password error:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
});

router.post("/admin/change-username", async (req, res) => {
  try {
    const userId = req.session.adminUserId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { newUsername, password } = changeUsernameSchema.parse(req.body);

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || !user.password) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Password is incorrect" });
    }

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, newUsername));

    if (existingUser) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const oldUsername = user.username;

    await db
      .update(users)
      .set({
        username: newUsername,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    await db.insert(auditLogs).values({
      userId,
      userRole: user.role || "owner",
      action: "owner.change_username",
      entityType: "user",
      entityId: userId,
      oldValues: { username: oldUsername },
      newValues: { username: newUsername },
      ipAddress: req.ip || null,
      userAgent: req.get("user-agent") || null,
      severity: "warning",
    });

    req.session.adminUsername = newUsername;

    res.json({ success: true, message: "Username changed successfully", username: newUsername });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Change username error:", error);
    res.status(500).json({ message: "Failed to change username" });
  }
});

router.get("/admin/check", async (req, res) => {
  try {
    const userId = req.session.adminUserId;
    if (!userId) {
      return res.status(401).json({ authenticated: false });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || user.role !== "owner") {
      return res.status(403).json({ authenticated: false });
    }

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        forcePasswordChange: user.forcePasswordChange,
      },
    });
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ authenticated: false });
  }
});

export function requireOwnerAuth(req: any, res: any, next: any) {
  const userId = req.session.adminUserId;
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  db.select()
    .from(users)
    .where(eq(users.id, userId))
    .then(([user]) => {
      if (!user || user.role !== "owner") {
        return res.status(403).json({ message: "Owner access required" });
      }
      req.adminUser = user;
      next();
    })
    .catch((error) => {
      console.error("Auth middleware error:", error);
      res.status(500).json({ message: "Authentication failed" });
    });
}

export function isAdmin(req: any, res: any, next: any) {
  const userId = req.session.adminUserId || req.session.userId;
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  db.select()
    .from(users)
    .where(eq(users.id, userId))
    .then(([user]) => {
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Allow owner, admin, and editor roles to access chat
      if (!["owner", "admin", "editor"].includes(user.role || "")) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      req.session.userId = user.id;
      req.adminUser = user;
      next();
    })
    .catch((error) => {
      console.error("Auth middleware error:", error);
      res.status(500).json({ message: "Authentication failed" });
    });
}

export default router;
