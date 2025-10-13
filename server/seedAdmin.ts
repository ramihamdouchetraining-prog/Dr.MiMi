// Seed data for admin features
import { db } from "./db";
import { users, blogPosts, siteVisitors, pageViews, purchases, revenueReports } from "../shared/schema";
import { sql } from "drizzle-orm";
import bcrypt from 'bcryptjs';

export async function seedAdminData() {
  console.log("👤 Creating owner account...");
  
  try {
    // Owner secure account with hashed password  
    const adminEmail = process.env.ADMIN_EMAIL || 'mimi.ben@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      throw new Error("❌ ADMIN_PASSWORD environment variable is required for security. Please set it in your .env file.");
    }
    
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const forcePasswordChange = process.env.ADMIN_MUST_CHANGE_PASSWORD !== 'false';
    
    // Check if owner already exists
    const existingOwner = await db.select().from(users).where(sql`email = ${adminEmail}`).limit(1);
    
    let adminUser;
    if (existingOwner.length > 0) {
      // Update existing user to owner
      [adminUser] = await db.update(users)
        .set({
          password: hashedPassword,
          role: 'owner',
          firstName: 'Merieme',
          lastName: 'BENNAMANE',
          forcePasswordChange: forcePasswordChange,
          updatedAt: new Date()
        })
        .where(sql`email = ${adminEmail}`)
        .returning();
      console.log(`✅ Existing user updated to owner: ${adminEmail}`);
    } else {
      // Create new owner user
      [adminUser] = await db.insert(users).values({
        id: 'owner-001',
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Merieme',
        lastName: 'BENNAMANE',
        role: 'owner',
        locale: 'fr',
        yearOfStudy: null,
        isBlacklisted: false,
        profileImageUrl: '/images/avatars/greeting.png',
        forcePasswordChange: forcePasswordChange
      }).returning();
      console.log(`✅ Owner account created: ${adminEmail}`);
    }
    
    if (forcePasswordChange) {
      console.log(`⚠️  IMPORTANT: Owner must change password on first login!`);
    }

    // Create example articles
    console.log("📝 Creating example articles...");
    
    const articles = [
      {
        title: "Bienvenue sur Dr.MiMi - Votre assistant médical intelligent",
        slug: "bienvenue-dr-mimi",
        content: `
          <h1>Bienvenue sur Dr.MiMi!</h1>
          <p>Dr.MiMi est votre compagnon d'apprentissage médical, conçu spécialement pour les étudiants en médecine.</p>
          <h2>Fonctionnalités principales</h2>
          <ul>
            <li>Cours structurés par niveau d'étude</li>
            <li>Quiz interactifs avec explications détaillées</li>
            <li>Cas cliniques réalistes</li>
            <li>Bibliothèque d'images médicales</li>
          </ul>
          <p>Commencez votre parcours d'apprentissage dès aujourd'hui!</p>
        `,
        excerpt: "Découvrez Dr.MiMi, votre assistant intelligent pour apprendre la médecine de manière interactive et efficace.",
        category: 'Actualités' as const,
        tags: ['bienvenue', 'dr.mimi', 'apprentissage'],
        price: 0,
        isPremium: false,
        featured: true,
        status: 'published' as const,
        metaTitle: "Dr.MiMi - Assistant médical intelligent pour étudiants",
        metaDescription: "Plateforme d'apprentissage médical avec cours, quiz et cas cliniques pour étudiants en médecine.",
        readingTime: 2,
        viewCount: 250,
        likeCount: 45,
        createdBy: adminUser.id,
        publishedAt: new Date()
      },
      {
        title: "Les 10 médicaments essentiels à connaître en urgence",
        slug: "medicaments-essentiels-urgence",
        content: `
          <h1>Les médicaments d'urgence incontournables</h1>
          <p>En situation d'urgence, la connaissance rapide des médicaments essentiels peut sauver des vies.</p>
          <h2>1. Adrénaline (Épinéphrine)</h2>
          <p>Utilisée dans le choc anaphylactique et l'arrêt cardiaque.</p>
          <h2>2. Atropine</h2>
          <p>Pour les bradycardies symptomatiques.</p>
          <h2>3. Morphine</h2>
          <p>Analgésique puissant pour douleurs sévères.</p>
          <p class="premium-note">Article complet réservé aux membres premium.</p>
        `,
        excerpt: "Guide pratique des médicaments essentiels à maîtriser pour tout professionnel de santé en situation d'urgence.",
        category: 'Conseils' as const,
        tags: ['urgence', 'médicaments', 'pharmacologie', 'pratique'],
        price: 500,
        currency: 'DZD',
        taxRate: 19,
        isPremium: true,
        featured: false,
        status: 'published' as const,
        metaTitle: "Médicaments d'urgence - Guide pratique médical",
        metaDescription: "Liste et utilisation des 10 médicaments essentiels en médecine d'urgence.",
        readingTime: 8,
        viewCount: 180,
        likeCount: 32,
        createdBy: adminUser.id,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        title: "Anatomie cardiaque : Comprendre le cœur en 3D",
        slug: "anatomie-cardiaque-3d",
        content: `
          <h1>Le cœur humain en détail</h1>
          <p>Explorez l'anatomie cardiaque avec nos modèles 3D interactifs.</p>
          <h2>Les 4 cavités cardiaques</h2>
          <img src="/images/anatomy/heart-diagram.png" alt="Anatomie du cœur" />
          <p>Le cœur est divisé en quatre cavités...</p>
          <p class="premium-note">Accédez aux modèles 3D interactifs avec l'abonnement premium.</p>
        `,
        excerpt: "Étude complète de l'anatomie cardiaque avec visualisations 3D et explications détaillées.",
        category: 'Études' as const,
        tags: ['anatomie', 'cardiologie', 'cœur', '3D'],
        price: 750,
        currency: 'DZD',
        taxRate: 19,
        isPremium: true,
        featured: true,
        status: 'published' as const,
        metaTitle: "Anatomie du cœur - Modèles 3D interactifs",
        metaDescription: "Apprenez l'anatomie cardiaque avec des modèles 3D détaillés et des explications complètes.",
        readingTime: 12,
        viewCount: 320,
        likeCount: 68,
        createdBy: adminUser.id,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      }
    ];

    for (const article of articles) {
      await db.insert(blogPosts).values(article);
    }
    
    console.log(`✅ Created ${articles.length} example articles`);

    // Create sample analytics data
    console.log("📊 Creating sample analytics data...");
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Generate daily visitors for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const visitorsCount = Math.floor(Math.random() * 50) + 20; // 20-70 visitors per day
      
      for (let j = 0; j < visitorsCount; j++) {
        await db.insert(siteVisitors).values({
          sessionId: `session-${date.getTime()}-${j}`,
          userId: Math.random() > 0.7 ? adminUser.id : null, // 30% logged in
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
          country: 'DZ',
          city: 'Alger',
          referrer: Math.random() > 0.5 ? 'https://google.com' : null,
          landingPage: '/',
          pagesVisited: ['/courses', '/quiz', '/library'],
          timeSpent: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
          deviceType: Math.random() > 0.6 ? 'desktop' : 'mobile',
          isReturning: Math.random() > 0.6,
          createdAt: date
        });
      }
    }
    
    console.log("✅ Created 30 days of visitor data");

    // Create sample purchases
    console.log("💰 Creating sample purchases...");
    
    const purchases_data = [
      {
        userId: adminUser.id,
        itemType: 'Course' as const,
        itemId: 'course-001',
        price: '1500',
        currency: 'DZD',
        status: 'paid' as const,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        userId: adminUser.id,
        itemType: 'Summary' as const,
        itemId: 'summary-001',
        price: '500',
        currency: 'DZD',
        status: 'paid' as const,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        userId: adminUser.id,
        itemType: 'Bundle' as const,
        itemId: 'bundle-001',
        price: '3000',
        currency: 'DZD',
        status: 'paid' as const,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      }
    ];

    for (const purchase of purchases_data) {
      await db.insert(purchases).values(purchase);
    }
    
    console.log(`✅ Created ${purchases_data.length} sample purchases`);

    // Create monthly revenue report
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    await db.insert(revenueReports).values({
      periodType: 'monthly',
      periodStart: monthStart,
      periodEnd: monthEnd,
      totalRevenue: '15000',
      courseRevenue: '8000',
      summaryRevenue: '4000',
      bundleRevenue: '3000',
      transactionCount: 25,
      newCustomers: 15,
      returningCustomers: 10,
      currency: 'DZD'
    });
    
    console.log("✅ Created monthly revenue report");

    console.log("🎉 Admin seed data completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding admin data:", error);
    throw error;
  }
}