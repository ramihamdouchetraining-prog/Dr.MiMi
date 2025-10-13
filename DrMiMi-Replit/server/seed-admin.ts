import { db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

/**
 * Seed Admin Account
 * Crée un compte admin séparé du Owner
 */
export async function seedAdmin() {
  try {
    console.log("👤 Seeding admin account...");

    const adminEmail = "admin@medimimi.com";
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.log("⚠️  ADMIN_PASSWORD not set in .env, skipping admin account creation");
      return;
    }

    // Check if admin already exists
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail));

    if (existingAdmin) {
      // Update password if needed
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      const [updatedAdmin] = await db
        .update(users)
        .set({
          password: hashedPassword,
          role: "admin",
          firstName: "Admin",
          lastName: "System",
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingAdmin.id))
        .returning();

      console.log("✅ Admin account updated");
      console.log("   Email:", adminEmail);
      console.log("   Password: (from ADMIN_PASSWORD env)");
      
      return updatedAdmin;
    }

    // Create new admin account
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const [newAdmin] = await db
      .insert(users)
      .values({
        email: adminEmail,
        password: hashedPassword,
        username: "admin",
        firstName: "Admin",
        lastName: "System",
        role: "admin",
        locale: "fr",
        yearOfStudy: null,
        isBlacklisted: false,
        profileImageUrl: "/images/avatars/admin.png",
        forcePasswordChange: false,
        sessionTimeout: 3600, // 1 hour
      })
      .returning();

    console.log("✅ Admin account created successfully");
    console.log("   Email:", adminEmail);
    console.log("   Password: (from ADMIN_PASSWORD env)");
    console.log("   Role: admin");

    return newAdmin;
  } catch (error) {
    console.error("❌ Error seeding admin account:", error);
    throw error;
  }
}
