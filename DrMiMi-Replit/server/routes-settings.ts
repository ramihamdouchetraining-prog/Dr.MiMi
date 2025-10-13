import { Router } from "express";
import { db } from "./db";
import { siteSettings, auditLogs } from "../shared/schema";
import { eq } from "drizzle-orm";
import { requirePermission } from "./rbac";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

const router = Router();

const upload = multer({
  dest: "uploads/settings/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|svg|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Invalid file type. Only images allowed."));
  },
});

const updateSettingSchema = z.object({
  settingValue: z.string(),
});

router.get("/settings", requirePermission("settings.theme"), async (req, res) => {
  try {
    const settings = await db.select().from(siteSettings);

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.settingKey] = {
        value: setting.settingValue,
        type: setting.settingType,
        updatedAt: setting.updatedAt,
      };
      return acc;
    }, {} as Record<string, any>);

    res.json(settingsMap);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

router.get("/settings/:key", requirePermission("settings.theme"), async (req, res) => {
  try {
    const { key } = req.params;

    const [setting] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.settingKey, key));

    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }

    res.json(setting);
  } catch (error) {
    console.error("Error fetching setting:", error);
    res.status(500).json({ message: "Failed to fetch setting" });
  }
});

router.put("/settings/:key", requirePermission("settings.system"), async (req: any, res) => {
  try {
    const { key } = req.params;
    const { settingValue } = updateSettingSchema.parse(req.body);
    const userId = req.user?.claims?.sub || req.session?.adminUserId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [existing] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.settingKey, key));

    let setting;
    if (existing) {
      [setting] = await db
        .update(siteSettings)
        .set({
          settingValue,
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.settingKey, key))
        .returning();

      await db.insert(auditLogs).values({
        userId,
        userRole: req.user?.role || "owner",
        action: "settings.update",
        entityType: "site_settings",
        entityId: key,
        oldValues: { value: existing.settingValue },
        newValues: { value: settingValue },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        severity: "warning",
      });
    } else {
      return res.status(404).json({ message: "Setting not found. Use POST to create." });
    }

    res.json({ success: true, setting });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.issues });
    }
    console.error("Error updating setting:", error);
    res.status(500).json({ message: "Failed to update setting" });
  }
});

router.post("/settings", requirePermission("settings.system"), async (req: any, res) => {
  try {
    const { settingKey, settingValue, settingType } = req.body;
    const userId = req.user?.claims?.sub || req.session?.adminUserId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!settingKey || !settingType) {
      return res.status(400).json({ message: "settingKey and settingType are required" });
    }

    const validTypes = ["image", "font", "text", "color", "json"];
    if (!validTypes.includes(settingType)) {
      return res.status(400).json({ message: "Invalid settingType" });
    }

    const [existing] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.settingKey, settingKey));

    if (existing) {
      return res.status(409).json({ message: "Setting already exists. Use PUT to update." });
    }

    const [setting] = await db
      .insert(siteSettings)
      .values({
        settingKey,
        settingValue,
        settingType,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .returning();

    await db.insert(auditLogs).values({
      userId,
      userRole: req.user?.role || "owner",
      action: "settings.create",
      entityType: "site_settings",
      entityId: settingKey,
      newValues: { key: settingKey, value: settingValue, type: settingType },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      severity: "info",
    });

    res.json({ success: true, setting });
  } catch (error) {
    console.error("Error creating setting:", error);
    res.status(500).json({ message: "Failed to create setting" });
  }
});

router.post(
  "/settings/logo/upload",
  requirePermission("settings.logo"),
  upload.single("logo"),
  async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.adminUserId;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const logoUrl = `/uploads/settings/${req.file.filename}`;

      const [existing] = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.settingKey, "site_logo"));

      if (existing && existing.settingValue) {
        const oldPath = path.join(process.cwd(), existing.settingValue);
        try {
          await fs.unlink(oldPath);
        } catch (err) {
          console.warn("Could not delete old logo:", err);
        }
      }

      let setting;
      if (existing) {
        [setting] = await db
          .update(siteSettings)
          .set({
            settingValue: logoUrl,
            updatedBy: userId,
            updatedAt: new Date(),
          })
          .where(eq(siteSettings.settingKey, "site_logo"))
          .returning();
      } else {
        [setting] = await db
          .insert(siteSettings)
          .values({
            settingKey: "site_logo",
            settingValue: logoUrl,
            settingType: "image",
            updatedBy: userId,
            updatedAt: new Date(),
          })
          .returning();
      }

      await db.insert(auditLogs).values({
        userId,
        userRole: req.user?.role || "owner",
        action: "settings.logo_upload",
        entityType: "site_settings",
        entityId: "site_logo",
        newValues: { logo: logoUrl },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        severity: "info",
      });

      res.json({ success: true, logoUrl, setting });
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ message: "Failed to upload logo" });
    }
  }
);

router.delete("/settings/:key", requirePermission("settings.system"), async (req: any, res) => {
  try {
    const { key } = req.params;
    const userId = req.user?.claims?.sub || req.session?.adminUserId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [existing] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.settingKey, key));

    if (!existing) {
      return res.status(404).json({ message: "Setting not found" });
    }

    await db.delete(siteSettings).where(eq(siteSettings.settingKey, key));

    await db.insert(auditLogs).values({
      userId,
      userRole: req.user?.role || "owner",
      action: "settings.delete",
      entityType: "site_settings",
      entityId: key,
      oldValues: { key, value: existing.settingValue },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      severity: "warning",
    });

    res.json({ success: true, message: "Setting deleted" });
  } catch (error) {
    console.error("Error deleting setting:", error);
    res.status(500).json({ message: "Failed to delete setting" });
  }
});

export default router;
