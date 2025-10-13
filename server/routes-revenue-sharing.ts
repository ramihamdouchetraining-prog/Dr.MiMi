// Revenue Sharing routes for Dr.MiMi platform
// Implements pyramidal revenue distribution system
import { Router, type Request, type Response } from "express";
import { db } from "./db";
import { 
  revenueShareAgreements, 
  revenueShareTiers, 
  revenueLedger, 
  contentSales,
  users,
  contracts,
  auditLogs
} from "../shared/schema";
import { eq, and, desc, or, sql } from "drizzle-orm";
import { z } from "zod";
import { requirePermission } from "./rbac";

const router = Router();

// Validation schemas
const createAgreementSchema = z.object({
  contractId: z.string().uuid(),
  agreementType: z.enum(["owner_admin", "admin_editor", "editor_consultant", "custom"]),
  ownerId: z.string().uuid().optional(),
  adminId: z.string().uuid().optional(),
  editorId: z.string().uuid().optional(),
  ownerDefaultPercentage: z.number().min(0).max(100).default(40),
  adminDefaultPercentage: z.number().min(0).max(100).default(30),
  editorDefaultPercentage: z.number().min(0).max(100).default(30),
  appliesTo: z.array(z.string()).optional(),
  minimumPayout: z.number().min(0).default(1000),
  currency: z.string().length(3).default("DZD"),
  notes: z.string().optional(),
});

const createTierSchema = z.object({
  agreementId: z.string().uuid(),
  userId: z.string().uuid(),
  userRole: z.enum(["owner", "admin", "editor", "consultant"]),
  tierLevel: z.number().int().min(1).max(3),
  percentage: z.number().min(0).max(100),
  contentTypeOverrides: z.record(z.number()).optional(),
  notes: z.string().optional(),
});

const recordSaleSchema = z.object({
  contentType: z.enum(["course", "summary", "article", "quiz", "case", "blogPost", "driveFile"]),
  contentId: z.string(),
  contentTitle: z.string(),
  buyerId: z.string().uuid(),
  authorId: z.string().uuid(),
  saleAmount: z.number().min(0),
  currency: z.string().length(3).default("DZD"),
  taxAmount: z.number().min(0).default(0),
  paymentMethod: z.enum(["stripe", "ccp", "paypal", "other"]).optional(),
  transactionId: z.string().optional(),
});

// ============================================================================
// REVENUE SHARE AGREEMENTS
// ============================================================================

// GET /api/revenue-sharing/agreements - List all revenue share agreements
router.get("/agreements", requirePermission("finance.view_reports"), async (req: any, res: Response) => {
  try {
    const userId = req.user?.claims?.sub || req.session?.adminUserId;
    const userRole = req.userRole;

    // Owner can see all, others only their own
    let agreements;
    if (userRole === "owner") {
      agreements = await db.select().from(revenueShareAgreements).orderBy(desc(revenueShareAgreements.createdAt));
    } else {
      agreements = await db
        .select()
        .from(revenueShareAgreements)
        .where(
          or(
            eq(revenueShareAgreements.ownerId, userId),
            eq(revenueShareAgreements.adminId, userId),
            eq(revenueShareAgreements.editorId, userId)
          )
        )
        .orderBy(desc(revenueShareAgreements.createdAt));
    }

    // Enrich with user details
    const enrichedAgreements = await Promise.all(
      agreements.map(async (agreement) => {
        const [owner] = agreement.ownerId ? await db.select().from(users).where(eq(users.id, agreement.ownerId)) : [null];
        const [admin] = agreement.adminId ? await db.select().from(users).where(eq(users.id, agreement.adminId)) : [null];
        const [editor] = agreement.editorId ? await db.select().from(users).where(eq(users.id, agreement.editorId)) : [null];
        const [contract] = await db.select().from(contracts).where(eq(contracts.id, agreement.contractId));
        const tiers = await db.select().from(revenueShareTiers).where(eq(revenueShareTiers.agreementId, agreement.id));

        return {
          ...agreement,
          owner: owner ? { id: owner.id, firstName: owner.firstName, lastName: owner.lastName, email: owner.email } : null,
          admin: admin ? { id: admin.id, firstName: admin.firstName, lastName: admin.lastName, email: admin.email } : null,
          editor: editor ? { id: editor.id, firstName: editor.firstName, lastName: editor.lastName, email: editor.email } : null,
          contract: contract ? { id: contract.id, title: contract.title, status: contract.status } : null,
          tiersCount: tiers.length,
        };
      })
    );

    res.json({ success: true, agreements: enrichedAgreements });
  } catch (error) {
    console.error("Error fetching agreements:", error);
    res.status(500).json({ success: false, message: "Failed to fetch agreements" });
  }
});

// POST /api/revenue-sharing/agreements - Create new revenue share agreement
router.post("/agreements", requirePermission("finance.manage_prices"), async (req: any, res: Response) => {
  try {
    const userId = req.user?.claims?.sub || req.session?.adminUserId;
    const data = createAgreementSchema.parse(req.body);

    // Validate percentages sum to 100
    const totalPercentage = data.ownerDefaultPercentage + data.adminDefaultPercentage + data.editorDefaultPercentage;
    if (totalPercentage !== 100) {
      return res.status(400).json({ 
        success: false, 
        message: `Les pourcentages doivent totaliser 100%. Actuel: ${totalPercentage}%` 
      });
    }

    // Create agreement
    const [newAgreement] = await db.insert(revenueShareAgreements).values({
      contractId: data.contractId,
      agreementType: data.agreementType,
      ownerId: data.ownerId || null,
      adminId: data.adminId || null,
      editorId: data.editorId || null,
      ownerDefaultPercentage: data.ownerDefaultPercentage.toString(),
      adminDefaultPercentage: data.adminDefaultPercentage.toString(),
      editorDefaultPercentage: data.editorDefaultPercentage.toString(),
      appliesTo: data.appliesTo || null,
      minimumPayout: data.minimumPayout.toString(),
      currency: data.currency,
      notes: data.notes || null,
      activatedAt: new Date(),
      createdBy: userId,
    }).returning();

    // Auto-create tiers for each party
    const tiers = [];
    if (data.ownerId) {
      tiers.push({
        agreementId: newAgreement.id,
        userId: data.ownerId,
        userRole: "owner" as const,
        tierLevel: 1,
        percentage: data.ownerDefaultPercentage.toString(),
        isActive: true,
        createdBy: userId,
      });
    }
    if (data.adminId) {
      tiers.push({
        agreementId: newAgreement.id,
        userId: data.adminId,
        userRole: "admin" as const,
        tierLevel: 2,
        percentage: data.adminDefaultPercentage.toString(),
        isActive: true,
        createdBy: userId,
      });
    }
    if (data.editorId) {
      tiers.push({
        agreementId: newAgreement.id,
        userId: data.editorId,
        userRole: "editor" as const,
        tierLevel: 3,
        percentage: data.editorDefaultPercentage.toString(),
        isActive: true,
        createdBy: userId,
      });
    }

    if (tiers.length > 0) {
      await db.insert(revenueShareTiers).values(tiers);
    }

    // Audit log
    await db.insert(auditLogs).values({
      userId,
      userRole: req.userRole,
      action: "revenue_sharing.create_agreement",
      entityType: "revenue_share_agreement",
      entityId: newAgreement.id,
      newValues: newAgreement,
      severity: "info",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({ success: true, agreement: newAgreement });
  } catch (error) {
    console.error("Error creating agreement:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
    }
    res.status(500).json({ success: false, message: "Failed to create agreement" });
  }
});

// PUT /api/revenue-sharing/agreements/:id - Update agreement
router.put("/agreements/:id", requirePermission("finance.manage_prices"), async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.claims?.sub || req.session?.adminUserId;
    const updates = req.body;

    const [existing] = await db.select().from(revenueShareAgreements).where(eq(revenueShareAgreements.id, id));
    if (!existing) {
      return res.status(404).json({ success: false, message: "Agreement not found" });
    }

    const [updated] = await db
      .update(revenueShareAgreements)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(revenueShareAgreements.id, id))
      .returning();

    await db.insert(auditLogs).values({
      userId,
      userRole: req.userRole,
      action: "revenue_sharing.update_agreement",
      entityType: "revenue_share_agreement",
      entityId: id,
      oldValues: existing,
      newValues: updated,
      severity: "info",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({ success: true, agreement: updated });
  } catch (error) {
    console.error("Error updating agreement:", error);
    res.status(500).json({ success: false, message: "Failed to update agreement" });
  }
});

// ============================================================================
// REVENUE SHARE TIERS
// ============================================================================

// GET /api/revenue-sharing/tiers - List tiers for an agreement
router.get("/tiers", requirePermission("finance.view_reports"), async (req: any, res: Response) => {
  try {
    const { agreementId } = req.query;

    if (!agreementId) {
      return res.status(400).json({ success: false, message: "agreementId is required" });
    }

    const tiers = await db
      .select()
      .from(revenueShareTiers)
      .where(eq(revenueShareTiers.agreementId, agreementId as string))
      .orderBy(revenueShareTiers.tierLevel);

    // Enrich with user details
    const enrichedTiers = await Promise.all(
      tiers.map(async (tier) => {
        const [user] = await db.select().from(users).where(eq(users.id, tier.userId));
        return {
          ...tier,
          user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } : null,
        };
      })
    );

    res.json({ success: true, tiers: enrichedTiers });
  } catch (error) {
    console.error("Error fetching tiers:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tiers" });
  }
});

// POST /api/revenue-sharing/tiers - Create or update tier
router.post("/tiers", requirePermission("finance.manage_prices"), async (req: any, res: Response) => {
  try {
    const userId = req.user?.claims?.sub || req.session?.adminUserId;
    const data = createTierSchema.parse(req.body);

    // Check if tier already exists for this user in this agreement
    const [existing] = await db
      .select()
      .from(revenueShareTiers)
      .where(
        and(
          eq(revenueShareTiers.agreementId, data.agreementId),
          eq(revenueShareTiers.userId, data.userId)
        )
      );

    let tier;
    if (existing) {
      // Update existing
      [tier] = await db
        .update(revenueShareTiers)
        .set({
          percentage: data.percentage.toString(),
          contentTypeOverrides: data.contentTypeOverrides || null,
          notes: data.notes || null,
          updatedAt: new Date(),
        })
        .where(eq(revenueShareTiers.id, existing.id))
        .returning();
    } else {
      // Create new
      [tier] = await db.insert(revenueShareTiers).values({
        agreementId: data.agreementId,
        userId: data.userId,
        userRole: data.userRole,
        tierLevel: data.tierLevel,
        percentage: data.percentage.toString(),
        contentTypeOverrides: data.contentTypeOverrides || null,
        notes: data.notes || null,
        isActive: true,
        createdBy: userId,
      }).returning();
    }

    await db.insert(auditLogs).values({
      userId,
      userRole: req.userRole,
      action: existing ? "revenue_sharing.update_tier" : "revenue_sharing.create_tier",
      entityType: "revenue_share_tier",
      entityId: tier.id,
      oldValues: existing || undefined,
      newValues: tier,
      severity: "info",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({ success: true, tier });
  } catch (error) {
    console.error("Error creating/updating tier:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
    }
    res.status(500).json({ success: false, message: "Failed to save tier" });
  }
});

// ============================================================================
// REVENUE LEDGER
// ============================================================================

// GET /api/revenue-sharing/ledger - Get revenue ledger entries
router.get("/ledger", requirePermission("finance.view_reports"), async (req: any, res: Response) => {
  try {
    const userId = req.user?.claims?.sub || req.session?.adminUserId;
    const userRole = req.userRole;
    const { recipientId, contentType, payoutStatus, limit = "50" } = req.query;

    let query = db.select().from(revenueLedger);

    // Filter based on role
    if (userRole !== "owner" && !recipientId) {
      query = query.where(eq(revenueLedger.recipientId, userId));
    } else if (recipientId) {
      query = query.where(eq(revenueLedger.recipientId, recipientId as string));
    }

    // Additional filters
    if (contentType) {
      query = query.where(eq(revenueLedger.contentType, contentType as string));
    }
    if (payoutStatus) {
      query = query.where(eq(revenueLedger.payoutStatus, payoutStatus as any));
    }

    const entries = await query.orderBy(desc(revenueLedger.createdAt)).limit(parseInt(limit as string));

    // Enrich with user and sale details
    const enrichedEntries = await Promise.all(
      entries.map(async (entry) => {
        const [recipient] = await db.select().from(users).where(eq(users.id, entry.recipientId));
        const [sale] = await db.select().from(contentSales).where(eq(contentSales.id, entry.saleId));
        
        return {
          ...entry,
          recipient: recipient ? { id: recipient.id, firstName: recipient.firstName, lastName: recipient.lastName, email: recipient.email } : null,
          sale: sale ? { id: sale.id, buyerId: sale.buyerId, createdAt: sale.createdAt } : null,
        };
      })
    );

    res.json({ success: true, entries: enrichedEntries });
  } catch (error) {
    console.error("Error fetching ledger:", error);
    res.status(500).json({ success: false, message: "Failed to fetch ledger" });
  }
});

// GET /api/revenue-sharing/analytics - Revenue analytics by tier
router.get("/analytics", requirePermission("finance.view_reports"), async (req: any, res: Response) => {
  try {
    const userId = req.user?.claims?.sub || req.session?.adminUserId;
    const userRole = req.userRole;
    const { timeRange = "month" } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (timeRange) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Revenue by role
    const revenueByRole = await db
      .select({
        role: revenueLedger.recipientRole,
        totalAmount: sql<number>`SUM(CAST(${revenueLedger.shareAmount} AS DECIMAL))`,
        count: sql<number>`COUNT(*)`,
        currency: revenueLedger.currency,
      })
      .from(revenueLedger)
      .where(sql`${revenueLedger.createdAt} >= ${startDate}`)
      .groupBy(revenueLedger.recipientRole, revenueLedger.currency);

    // Revenue by content type
    const revenueByContent = await db
      .select({
        contentType: revenueLedger.contentType,
        totalAmount: sql<number>`SUM(CAST(${revenueLedger.shareAmount} AS DECIMAL))`,
        count: sql<number>`COUNT(*)`,
      })
      .from(revenueLedger)
      .where(sql`${revenueLedger.createdAt} >= ${startDate}`)
      .groupBy(revenueLedger.contentType);

    // Top earners
    const topEarners = await db
      .select({
        recipientId: revenueLedger.recipientId,
        recipientRole: revenueLedger.recipientRole,
        totalAmount: sql<number>`SUM(CAST(${revenueLedger.shareAmount} AS DECIMAL))`,
        count: sql<number>`COUNT(*)`,
      })
      .from(revenueLedger)
      .where(sql`${revenueLedger.createdAt} >= ${startDate}`)
      .groupBy(revenueLedger.recipientId, revenueLedger.recipientRole)
      .orderBy(sql`SUM(CAST(${revenueLedger.shareAmount} AS DECIMAL)) DESC`)
      .limit(10);

    // Enrich top earners with user details
    const enrichedTopEarners = await Promise.all(
      topEarners.map(async (earner) => {
        const [user] = await db.select().from(users).where(eq(users.id, earner.recipientId));
        return {
          ...earner,
          user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } : null,
        };
      })
    );

    res.json({
      success: true,
      analytics: {
        timeRange,
        revenueByRole,
        revenueByContent,
        topEarners: enrichedTopEarners,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
});

// ============================================================================
// SALES & REVENUE CALCULATION
// ============================================================================

// POST /api/revenue-sharing/record-sale - Record a sale and calculate revenue shares
export async function recordSale(saleData: z.infer<typeof recordSaleSchema>) {
  try {
    const validatedData = recordSaleSchema.parse(saleData);
    const netAmount = validatedData.saleAmount - validatedData.taxAmount;

    // 1. Create the sale record
    const [sale] = await db.insert(contentSales).values({
      contentType: validatedData.contentType,
      contentId: validatedData.contentId,
      contentTitle: validatedData.contentTitle,
      buyerId: validatedData.buyerId,
      authorId: validatedData.authorId,
      saleAmount: validatedData.saleAmount.toString(),
      currency: validatedData.currency,
      taxAmount: validatedData.taxAmount.toString(),
      netAmount: netAmount.toString(),
      paymentMethod: validatedData.paymentMethod || null,
      transactionId: validatedData.transactionId || null,
      status: "completed",
    }).returning();

    // 2. Find applicable revenue sharing agreement for the author
    const [author] = await db.select().from(users).where(eq(users.id, validatedData.authorId));
    if (!author) {
      console.error("Author not found for sale:", validatedData.authorId);
      return { success: false, message: "Author not found" };
    }

    // Find active agreement based on author's role
    let agreement;
    if (author.role === "editor") {
      [agreement] = await db
        .select()
        .from(revenueShareAgreements)
        .where(
          and(
            eq(revenueShareAgreements.editorId, author.id),
            eq(revenueShareAgreements.isActive, true)
          )
        )
        .orderBy(desc(revenueShareAgreements.createdAt))
        .limit(1);
    } else if (author.role === "admin") {
      [agreement] = await db
        .select()
        .from(revenueShareAgreements)
        .where(
          and(
            eq(revenueShareAgreements.adminId, author.id),
            eq(revenueShareAgreements.isActive, true)
          )
        )
        .orderBy(desc(revenueShareAgreements.createdAt))
        .limit(1);
    } else if (author.role === "owner") {
      [agreement] = await db
        .select()
        .from(revenueShareAgreements)
        .where(
          and(
            eq(revenueShareAgreements.ownerId, author.id),
            eq(revenueShareAgreements.isActive, true)
          )
        )
        .orderBy(desc(revenueShareAgreements.createdAt))
        .limit(1);
    }

    if (!agreement) {
      console.log("No active revenue sharing agreement found for author:", author.id);
      // Still record the sale, but no revenue sharing
      return { success: true, sale, message: "Sale recorded without revenue sharing" };
    }

    // 3. Get all tiers for this agreement
    const tiers = await db
      .select()
      .from(revenueShareTiers)
      .where(
        and(
          eq(revenueShareTiers.agreementId, agreement.id),
          eq(revenueShareTiers.isActive, true)
        )
      )
      .orderBy(revenueShareTiers.tierLevel);

    // 4. Calculate and create ledger entries for each tier
    const ledgerEntries = [];
    for (const tier of tiers) {
      const percentage = parseFloat(tier.percentage);
      const shareAmount = (netAmount * percentage) / 100;

      const [ledgerEntry] = await db.insert(revenueLedger).values({
        saleId: sale.id,
        agreementId: agreement.id,
        tierId: tier.id,
        recipientId: tier.userId,
        recipientRole: tier.userRole,
        shareAmount: shareAmount.toFixed(2),
        sharePercentage: tier.percentage,
        currency: validatedData.currency,
        contentType: validatedData.contentType,
        contentId: validatedData.contentId,
        contentTitle: validatedData.contentTitle,
        originalAmount: validatedData.saleAmount.toString(),
        payoutStatus: "pending",
      }).returning();

      ledgerEntries.push(ledgerEntry);
    }

    console.log(`✅ Revenue sharing calculated for sale ${sale.id}: ${ledgerEntries.length} recipients`);

    return { 
      success: true, 
      sale, 
      agreement, 
      ledgerEntries,
      message: `Revenue distributed to ${ledgerEntries.length} recipients` 
    };
  } catch (error) {
    console.error("Error recording sale:", error);
    return { success: false, message: "Failed to record sale", error };
  }
}

// POST endpoint for manual sale recording (for testing/admin use)
router.post("/record-sale", requirePermission("finance.manage_prices"), async (req: any, res: Response) => {
  try {
    const result = await recordSale(req.body);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("Error in record-sale endpoint:", error);
    res.status(500).json({ success: false, message: "Failed to record sale" });
  }
});

export default router;
