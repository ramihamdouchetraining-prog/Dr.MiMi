import { db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function seedOwner() {
  try {
    console.log("🔐 Seeding owner account...");

    // Check if owner already exists first
    const [existingByUsername] = await db
      .select()
      .from(users)
      .where(eq(users.username, "MiMiBEN"));

    if (existingByUsername) {
      // Only update non-sensitive info, preserve password
      const updates: any = {
        email: "dr.mimi.ben@gmail.com",
        firstName: "Merieme",
        lastName: "BENNAMANE",
        updatedAt: new Date(),
      };
      
      // Only reset password if explicitly requested via env variable
      const resetPassword = process.env.RESET_OWNER_PASSWORD === 'true';
      if (resetPassword) {
        if (!process.env.OWNER_PASSWORD) {
          throw new Error("❌ RESET_OWNER_PASSWORD is set but OWNER_PASSWORD is not provided. Aborting for security.");
        }
        const hashedPassword = await bcrypt.hash(process.env.OWNER_PASSWORD, 12);
        updates.password = hashedPassword;
        updates.forcePasswordChange = true;
        console.log("⚠️  SECURITY ALERT: Owner password reset from OWNER_PASSWORD env variable");
      }
      
      const [updatedOwner] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, existingByUsername.id))
        .returning();
      
      console.log("✅ Owner account updated (password preserved)");
      console.log("   Username: MiMiBEN");
      console.log("   Email: dr.mimi.ben@gmail.com");
      
      return updatedOwner;
    }

    // Require password for new owner account creation (NO FALLBACK for security)
    const ownerPassword = process.env.OWNER_PASSWORD;
    if (!ownerPassword) {
      throw new Error("❌ OWNER_PASSWORD environment variable is required for owner account setup. Please set it securely.");
    }
    
    // Check if owner exists by email
    const [existingByEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, "dr.mimi.ben@gmail.com"));

    if (existingByEmail) {
      console.log("⚠️  User with email dr.mimi.ben@gmail.com already exists, updating to owner role...");
      
      const updates: any = {
        username: "MiMiBEN",
        role: "owner",
        firstName: "Merieme",
        lastName: "BENNAMANE",
        sessionTimeout: 7200,
        updatedAt: new Date(),
      };
      
      // Only set password if not already set
      if (!existingByEmail.password) {
        const hashedPassword = await bcrypt.hash(ownerPassword, 12);
        updates.password = hashedPassword;
        updates.forcePasswordChange = true;
        console.log("   Setting initial password (change required on first login)");
      }
      
      const [updatedOwner] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, existingByEmail.id))
        .returning();
      
      console.log("✅ Existing user updated to owner account!");
      console.log("   Username: MiMiBEN");
      console.log("   Email: dr.mimi.ben@gmail.com");
      console.log("   Role: owner");
      
      return updatedOwner;
    }

    const hashedPassword = await bcrypt.hash(ownerPassword, 12);

    const [owner] = await db
      .insert(users)
      .values({
        username: "MiMiBEN",
        email: "dr.mimi.ben@gmail.com",
        firstName: "Merieme",
        lastName: "BENNAMANE",
        role: "owner",
        password: hashedPassword,
        forcePasswordChange: true,
        locale: "fr",
        isBlacklisted: false,
        sessionTimeout: 7200,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log("✅ Owner account created successfully!");
    console.log("   Username: MiMiBEN");
    console.log("   Email: dr.mimi.ben@gmail.com");
    console.log("   Role: owner");
    console.log("   ⚠️  Password set from OWNER_PASSWORD env (or default)");
    console.log("   ⚠️  Password change required on first login");

    return owner;
  } catch (error) {
    console.error("❌ Error seeding owner account:", error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedOwner()
    .then(() => {
      console.log("🎉 Owner account seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Owner account seeding failed:", error);
      process.exit(1);
    });
}
