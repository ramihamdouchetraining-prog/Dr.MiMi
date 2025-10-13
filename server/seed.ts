// Seed data for MediMimi medical education platform
// Based on the modules from the specification
import { db } from "./db";
import { modules, users, blogPosts, siteVisitors, pageViews } from "../shared/schema";
import { sql } from "drizzle-orm";

export async function seedModules() {
  console.log("🌱 Seeding medical modules...");
  
  const modulesSeedData = [
    {
      id: "anatomy",
      name: "Anatomie",
      nameEn: "Anatomy",
      nameAr: "علم التشريح",
      category: "Preclinical" as const,
      bodySystems: ["Neuro", "Cardio", "Respiratoire", "Digestif", "Locomoteur"],
      icon: "bone",
      description: "Étude de la structure du corps humain et de ses organes"
    },
    {
      id: "physiology",
      name: "Physiologie",
      nameEn: "Physiology",
      nameAr: "علم وظائف الأعضاء",
      category: "Preclinical" as const,
      bodySystems: ["Cardio", "Respiratoire", "Rénal", "Endocrino"],
      icon: "pulse",
      description: "Étude du fonctionnement des organes et systèmes du corps"
    },
    {
      id: "biochem",
      name: "Biochimie",
      nameEn: "Biochemistry",
      nameAr: "الكيمياء الحيوية",
      category: "Preclinical" as const,
      bodySystems: [],
      icon: "dna",
      description: "Étude des processus chimiques dans les organismes vivants"
    },
    {
      id: "pathology",
      name: "Pathologie",
      nameEn: "Pathology",
      nameAr: "علم الأمراض",
      category: "Preclinical" as const,
      bodySystems: [],
      icon: "microscope",
      description: "Étude des maladies et de leurs mécanismes"
    },
    {
      id: "pharmacology",
      name: "Pharmacologie",
      nameEn: "Pharmacology",
      nameAr: "علم الأدوية",
      category: "Preclinical" as const,
      bodySystems: [],
      icon: "pill",
      description: "Étude des médicaments et de leurs effets"
    },
    {
      id: "microbiology",
      name: "Microbiologie",
      nameEn: "Microbiology",
      nameAr: "علم الأحياء الدقيقة",
      category: "Preclinical" as const,
      bodySystems: [],
      icon: "bacteria",
      description: "Étude des micro-organismes et infections"
    },
    {
      id: "cardiology",
      name: "Cardiologie",
      nameEn: "Cardiology",
      nameAr: "أمراض القلب",
      category: "Clinical" as const,
      bodySystems: ["Cardio"],
      icon: "heart",
      description: "Spécialité médicale des maladies cardiaques"
    },
    {
      id: "pulmonology",
      name: "Pneumologie",
      nameEn: "Pulmonology",
      nameAr: "أمراض الرئة",
      category: "Clinical" as const,
      bodySystems: ["Respiratoire"],
      icon: "lungs",
      description: "Spécialité des maladies respiratoires"
    },
    {
      id: "gastro",
      name: "Gastro-entérologie",
      nameEn: "Gastroenterology",
      nameAr: "أمراض الجهاز الهضمي",
      category: "Clinical" as const,
      bodySystems: ["Digestif"],
      icon: "stomach",
      description: "Spécialité des maladies digestives"
    },
    {
      id: "endocrinology",
      name: "Endocrinologie",
      nameEn: "Endocrinology",
      nameAr: "أمراض الغدد الصماء",
      category: "Clinical" as const,
      bodySystems: ["Endocrino"],
      icon: "hormone",
      description: "Spécialité des troubles hormonaux"
    },
    {
      id: "neuro",
      name: "Neurologie",
      nameEn: "Neurology",
      nameAr: "طب الأعصاب",
      category: "Clinical" as const,
      bodySystems: ["Neuro"],
      icon: "brain",
      description: "Spécialité des maladies neurologiques"
    },
    {
      id: "public_health",
      name: "Santé Publique",
      nameEn: "Public Health",
      nameAr: "الصحة العامة",
      category: "PublicHealth" as const,
      bodySystems: [],
      icon: "stethoscope",
      description: "Prévention des maladies et promotion de la santé"
    }
  ];

  try {
    // Insert modules (will ignore conflicts if they already exist)
    for (const module of modulesSeedData) {
      await db
        .insert(modules)
        .values(module)
        .onConflictDoUpdate({
          target: modules.id,
          set: {
            name: module.name,
            nameEn: module.nameEn,
            nameAr: module.nameAr,
            description: module.description,
          },
        });
    }
    
    console.log(`✅ Successfully seeded ${modulesSeedData.length} medical modules`);
  } catch (error) {
    console.error("❌ Error seeding modules:", error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedModules().then(() => {
    console.log("🎉 Seeding completed!");
    process.exit(0);
  }).catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  });
}