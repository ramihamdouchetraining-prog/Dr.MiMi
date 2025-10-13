// Contract management routes for Dr.MiMi platform
import { Router, type Request, type Response } from "express";
import { db } from "./db";
import { contracts, contractClauses, contractSignatures, users } from "../shared/schema";
import { eq, and, or, desc } from "drizzle-orm";
import { z } from "zod";
import { requirePermission } from "./rbac";

const router = Router();

// Validation schemas
const createContractSchema = z.object({
  title: z.string().min(1),
  contractType: z.enum(["owner_admin", "admin_editor", "editor_consultant", "custom"]),
  partyAId: z.string().uuid(),
  partyBId: z.string().uuid(),
  revenueSharePercentageA: z.number().min(0).max(100).optional(),
  revenueSharePercentageB: z.number().min(0).max(100).optional(),
  fixedPayment: z.number().min(0).optional(),
  currency: z.string().length(3).default("DZD"),
  paymentFrequency: z.enum(["monthly", "quarterly", "annual", "per_sale", "one_time"]).optional(),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  autoRenew: z.boolean().default(false),
  clauses: z.array(z.object({
    clauseNumber: z.string(),
    title: z.string(),
    content: z.string(),
    clauseType: z.enum(["financial", "responsibilities", "confidentiality", "termination", "liability", "other"]).default("other"),
    isMandatory: z.boolean().default(true),
    orderIndex: z.number().default(0),
  })).optional(),
});

const signContractSchema = z.object({
  contractId: z.string().uuid(),
  signatureType: z.enum(["electronic", "digital_certificate", "manual_upload"]).default("electronic"),
  signatureData: z.string().optional(), // Base64 signature
  consentText: z.string(),
});

// GET /api/contracts - List all contracts (owner/admin only)
router.get("/contracts", requirePermission("contracts.view"), async (req: any, res: Response) => {
  try {
    const userId = req.user?.claims?.sub || req.session?.adminUserId;
    const userRole = req.userRole; // Provided by requirePermission middleware

    // Owner can see all contracts, others only their own
    let allContracts;
    
    if (userRole !== "owner" && userRole !== "admin") {
      allContracts = await db
        .select()
        .from(contracts)
        .where(
          or(
            eq(contracts.partyAId, userId),
            eq(contracts.partyBId, userId)
          )
        )
        .orderBy(desc(contracts.createdAt));
    } else {
      allContracts = await db
        .select()
        .from(contracts)
        .orderBy(desc(contracts.createdAt));
    }

    // Fetch related data for each contract
    const contractsWithDetails = await Promise.all(
      allContracts.map(async (contract) => {
        const [partyA] = await db.select().from(users).where(eq(users.id, contract.partyAId));
        const [partyB] = await db.select().from(users).where(eq(users.id, contract.partyBId));
        const clauses = await db.select().from(contractClauses).where(eq(contractClauses.contractId, contract.id));
        const signatures = await db.select().from(contractSignatures).where(eq(contractSignatures.contractId, contract.id));

        return {
          ...contract,
          partyA: partyA ? { id: partyA.id, firstName: partyA.firstName, lastName: partyA.lastName, email: partyA.email, role: partyA.role } : null,
          partyB: partyB ? { id: partyB.id, firstName: partyB.firstName, lastName: partyB.lastName, email: partyB.email, role: partyB.role } : null,
          clausesCount: clauses.length,
          signaturesCount: signatures.length,
          isSigned: signatures.length === 2,
        };
      })
    );

    res.json({ success: true, contracts: contractsWithDetails });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch contracts" });
  }
});

// GET /api/contracts/:id - Get contract details
router.get("/contracts/:id", requirePermission("contracts.view"), async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.claims?.sub || req.session?.adminUserId;
    const userRole = req.userRole;

    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));

    if (!contract) {
      return res.status(404).json({ success: false, message: "Contract not found" });
    }

    // Check permissions
    if (userRole !== "owner" && userRole !== "admin" && 
        contract.partyAId !== userId && contract.partyBId !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Fetch related data
    const [partyA] = await db.select().from(users).where(eq(users.id, contract.partyAId));
    const [partyB] = await db.select().from(users).where(eq(users.id, contract.partyBId));
    const clauses = await db.select().from(contractClauses).where(eq(contractClauses.contractId, id));
    const signatures = await db.select().from(contractSignatures).where(eq(contractSignatures.contractId, id));

    const contractWithDetails = {
      ...contract,
      partyA: partyA ? { id: partyA.id, firstName: partyA.firstName, lastName: partyA.lastName, email: partyA.email, role: partyA.role } : null,
      partyB: partyB ? { id: partyB.id, firstName: partyB.firstName, lastName: partyB.lastName, email: partyB.email, role: partyB.role } : null,
      clauses,
      signatures,
    };

    res.json({ success: true, contract: contractWithDetails });
  } catch (error) {
    console.error("Error fetching contract:", error);
    res.status(500).json({ success: false, message: "Failed to fetch contract" });
  }
});

// POST /api/contracts - Create new contract (owner only)
router.post("/contracts", requirePermission("contracts.create"), async (req: any, res: Response) => {
  try {
    const userId = req.user?.claims?.sub || req.session?.adminUserId;
    const data = createContractSchema.parse(req.body);

    // Fetch party roles from users
    const [partyA] = await db.select().from(users).where(eq(users.id, data.partyAId));
    const [partyB] = await db.select().from(users).where(eq(users.id, data.partyBId));

    if (!partyA || !partyB) {
      return res.status(400).json({ success: false, message: "Invalid party IDs" });
    }

    // Create contract
    const [newContract] = await db.insert(contracts).values({
      title: data.title,
      contractType: data.contractType,
      partyAId: data.partyAId,
      partyARole: partyA.role!,
      partyBId: data.partyBId,
      partyBRole: partyB.role!,
      revenueSharePercentageA: data.revenueSharePercentageA?.toString(),
      revenueSharePercentageB: data.revenueSharePercentageB?.toString(),
      fixedPayment: data.fixedPayment?.toString(),
      currency: data.currency,
      paymentFrequency: data.paymentFrequency,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      autoRenew: data.autoRenew,
      status: "draft",
      createdBy: userId,
    }).returning();

    // Add clauses if provided
    if (data.clauses && data.clauses.length > 0) {
      await db.insert(contractClauses).values(
        data.clauses.map(clause => ({
          contractId: newContract.id,
          ...clause,
        }))
      );
    }

    res.status(201).json({ success: true, contract: newContract });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Validation error", errors: error.issues });
    }
    console.error("Error creating contract:", error);
    res.status(500).json({ success: false, message: "Failed to create contract" });
  }
});

// POST /api/contracts/:id/sign - Sign a contract
router.post("/contracts/:id/sign", requirePermission("contracts.sign"), async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.claims?.sub || req.session?.adminUserId;
    const data = signContractSchema.parse({ ...req.body, contractId: id });

    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));

    if (!contract) {
      return res.status(404).json({ success: false, message: "Contract not found" });
    }

    // Check if user is a party to the contract
    if (contract.partyAId !== userId && contract.partyBId !== userId) {
      return res.status(403).json({ success: false, message: "You are not a party to this contract" });
    }

    // Check if already signed
    const existingSignature = await db.select()
      .from(contractSignatures)
      .where(and(
        eq(contractSignatures.contractId, id),
        eq(contractSignatures.userId, userId)
      ));

    if (existingSignature.length > 0) {
      return res.status(400).json({ success: false, message: "You have already signed this contract" });
    }

    // Get user role
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Create signature
    await db.insert(contractSignatures).values({
      contractId: id,
      userId,
      userRole: user.role!,
      signatureType: data.signatureType,
      signatureData: data.signatureData || '',
      ipAddress: req.ip || null,
      userAgent: req.get("user-agent") || null,
      consentText: data.consentText,
    });

    // Update contract status and signature timestamp
    let newStatus = contract.status;
    const updateData: any = {};

    if (contract.partyAId === userId) {
      updateData.signedByAAt = new Date();
      newStatus = contract.signedByBAt ? "active" : "pending_signature_b";
    } else {
      updateData.signedByBAt = new Date();
      newStatus = contract.signedByAAt ? "active" : "pending_signature_a";
    }

    updateData.status = newStatus;

    await db.update(contracts)
      .set(updateData)
      .where(eq(contracts.id, id));

    // 🎯 REVENUE SHARING HOOK: Auto-create agreement when contract becomes active
    if (newStatus === "active") {
      try {
        const { revenueShareAgreements, revenueShareTiers } = await import("../shared/schema");
        
        // Determine default percentages based on contract type
        let ownerPct = 40, adminPct = 30, editorPct = 30;
        if (contract.contractType === "owner_admin") {
          ownerPct = parseFloat(contract.revenueSharePercentageA || "60");
          adminPct = parseFloat(contract.revenueSharePercentageB || "40");
          editorPct = 0;
        } else if (contract.contractType === "admin_editor") {
          ownerPct = 0;
          adminPct = parseFloat(contract.revenueSharePercentageA || "50");
          editorPct = parseFloat(contract.revenueSharePercentageB || "50");
        }

        // Create revenue sharing agreement
        const [agreement] = await db.insert(revenueShareAgreements).values({
          contractId: contract.id,
          agreementType: contract.contractType,
          ownerId: contract.partyARole === "owner" ? contract.partyAId : contract.partyBRole === "owner" ? contract.partyBId : null,
          adminId: contract.partyARole === "admin" ? contract.partyAId : contract.partyBRole === "admin" ? contract.partyBId : null,
          editorId: contract.partyARole === "editor" ? contract.partyAId : contract.partyBRole === "editor" ? contract.partyBId : null,
          ownerDefaultPercentage: ownerPct.toString(),
          adminDefaultPercentage: adminPct.toString(),
          editorDefaultPercentage: editorPct.toString(),
          isActive: true,
          activatedAt: new Date(),
          createdBy: userId,
        }).returning();

        // Create tiers for each party
        const tiers = [];
        if (contract.partyARole === "owner" || contract.partyBRole === "owner") {
          const ownerId = contract.partyARole === "owner" ? contract.partyAId : contract.partyBId;
          tiers.push({
            agreementId: agreement.id,
            userId: ownerId,
            userRole: "owner" as const,
            tierLevel: 1,
            percentage: ownerPct.toString(),
            isActive: true,
            createdBy: userId,
          });
        }
        if (contract.partyARole === "admin" || contract.partyBRole === "admin") {
          const adminId = contract.partyARole === "admin" ? contract.partyAId : contract.partyBId;
          tiers.push({
            agreementId: agreement.id,
            userId: adminId,
            userRole: "admin" as const,
            tierLevel: 2,
            percentage: adminPct.toString(),
            isActive: true,
            createdBy: userId,
          });
        }
        if (contract.partyARole === "editor" || contract.partyBRole === "editor") {
          const editorId = contract.partyARole === "editor" ? contract.partyAId : contract.partyBId;
          tiers.push({
            agreementId: agreement.id,
            userId: editorId,
            userRole: "editor" as const,
            tierLevel: 3,
            percentage: editorPct.toString(),
            isActive: true,
            createdBy: userId,
          });
        }

        if (tiers.length > 0) {
          await db.insert(revenueShareTiers).values(tiers);
        }

        console.log(`✅ Revenue sharing agreement created for contract ${contract.id}: ${tiers.length} tiers`);
      } catch (error) {
        console.error("❌ Failed to create revenue sharing agreement:", error);
        // Don't fail the signing process if revenue sharing creation fails
      }
    }

    res.json({ success: true, message: "Contract signed successfully", status: newStatus });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Validation error", errors: error.issues });
    }
    console.error("Error signing contract:", error);
    res.status(500).json({ success: false, message: "Failed to sign contract" });
  }
});

// PUT /api/contracts/:id - Update contract (owner only, draft contracts only)
router.put("/contracts/:id", requirePermission("contracts.edit"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));

    if (!contract) {
      return res.status(404).json({ success: false, message: "Contract not found" });
    }

    if (contract.status !== "draft") {
      return res.status(400).json({ success: false, message: "Only draft contracts can be edited" });
    }

    await db.update(contracts)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(contracts.id, id));

    res.json({ success: true, message: "Contract updated successfully" });
  } catch (error) {
    console.error("Error updating contract:", error);
    res.status(500).json({ success: false, message: "Failed to update contract" });
  }
});

// DELETE /api/contracts/:id - Delete contract (owner only, draft contracts only)
router.delete("/contracts/:id", requirePermission("contracts.delete"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));

    if (!contract) {
      return res.status(404).json({ success: false, message: "Contract not found" });
    }

    if (contract.status !== "draft") {
      return res.status(400).json({ success: false, message: "Only draft contracts can be deleted" });
    }

    await db.delete(contracts).where(eq(contracts.id, id));

    res.json({ success: true, message: "Contract deleted successfully" });
  } catch (error) {
    console.error("Error deleting contract:", error);
    res.status(500).json({ success: false, message: "Failed to delete contract" });
  }
});

export default router;
