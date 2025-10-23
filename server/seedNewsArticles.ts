// Seed news articles for testing
import { db } from "./db";
import { blogPosts } from "../shared/schema";

export async function seedNewsArticles() {
  try {
    console.log("🌱 Seeding news articles...");

    const articles = [
      {
        title: "Nouvelle Avancée dans le Traitement du Cancer du Pancréas",
        titleEn: "New Breakthrough in Pancreatic Cancer Treatment",
        titleAr: "اكتشاف جديد في علاج سرطان البنكرياس",
        slug: "avancee-cancer-pancreas-2024",
        content: `<h2>Une découverte prometteuse</h2>
<p>Des chercheurs de l'Institut Curie ont découvert une nouvelle approche thérapeutique combinant immunothérapie et thérapie ciblée qui montre des résultats prometteurs dans le traitement du cancer du pancréas, l'un des cancers les plus difficiles à traiter.</p>
<h3>Les résultats de l'étude</h3>
<p>L'essai clinique de phase II a montré une augmentation de 40% du taux de survie à 5 ans chez les patients traités avec cette nouvelle approche par rapport aux traitements standards.</p>
<h3>Perspectives</h3>
<p>Cette découverte ouvre la voie à de nouveaux traitements pour d'autres types de cancers digestifs et pourrait révolutionner la prise en charge oncologique.</p>`,
        excerpt: "Une étude révolutionnaire montre des résultats prometteurs avec une nouvelle immunothérapie",
        category: "Actualités",
        coverImage: "/images/news/cancer-research.jpg",
        tags: JSON.stringify(["Oncologie", "Immunothérapie", "Innovation", "Recherche"]),
        readingTime: 8,
        viewCount: 5234,
        likeCount: 892,
        featured: true,
        status: "published",
        publishedAt: new Date("2024-03-25"),
      },
      {
        title: "L'IA Révolutionne le Diagnostic Précoce d'Alzheimer",
        titleEn: "AI Revolutionizes Early Alzheimer's Diagnosis",
        titleAr: "الذكاء الاصطناعي يحدث ثورة في التشخيص المبكر لمرض الزهايمر",
        slug: "ia-diagnostic-alzheimer-2024",
        content: `<h2>Intelligence Artificielle et Neurologie</h2>
<p>Une équipe internationale a développé un système d'intelligence artificielle capable de détecter les signes précoces de la maladie d'Alzheimer avec une précision de 95%, bien avant l'apparition des symptômes cliniques.</p>
<h3>Comment ça marche ?</h3>
<p>L'algorithme analyse des IRM cérébrales et des données cognitives pour identifier des patterns subtils invisibles à l'œil humain. Il peut détecter la maladie jusqu'à 6 ans avant le diagnostic clinique traditionnel.</p>
<h3>Impact clinique</h3>
<p>Cette avancée permettra une intervention thérapeutique plus précoce, potentiellement ralentissant ou arrêtant la progression de la maladie.</p>`,
        excerpt: "Un algorithme détecte les signes précoces avec 95% de précision",
        category: "Innovation",
        coverImage: "/images/news/ai-brain.jpg",
        tags: JSON.stringify(["Neurologie", "IA", "Diagnostic", "Innovation"]),
        readingTime: 6,
        viewCount: 4567,
        likeCount: 723,
        featured: true,
        status: "published",
        publishedAt: new Date("2024-03-24"),
      },
      {
        title: "Congrès International de Cardiologie 2024 à Alger",
        titleEn: "2024 International Cardiology Congress in Algiers",
        titleAr: "المؤتمر الدولي لأمراض القلب 2024 في الجزائر",
        slug: "congres-cardiologie-alger-2024",
        content: `<h2>Un événement majeur pour la cardiologie</h2>
<p>Le congrès international de cardiologie se tiendra à Alger du 15 au 18 avril 2024, rassemblant plus de 2000 spécialistes du monde entier.</p>
<h3>Programme</h3>
<ul>
<li>Nouvelles techniques d'intervention coronarienne</li>
<li>Intelligence artificielle en cardiologie</li>
<li>Prévention des maladies cardiovasculaires</li>
<li>Innovations en chirurgie cardiaque</li>
</ul>
<h3>Inscription</h3>
<p>Tarif étudiant réduit disponible. Inscriptions ouvertes jusqu'au 1er avril 2024.</p>`,
        excerpt: "Plus de 2000 spécialistes attendus pour cet événement majeur",
        category: "Actualités",
        coverImage: "/images/news/cardio-conference.jpg",
        tags: JSON.stringify(["Cardiologie", "Congrès", "Alger", "Formation"]),
        readTime: 4,
        viewCount: 3456,
        likeCount: 567,
        featured: false,
        status: "published",
        publishedAt: new Date("2024-03-23"),
      },
      {
        title: "Nouveau Traitement Révolutionnaire contre l'Hypertension",
        titleEn: "Revolutionary New Treatment for Hypertension",
        titleAr: "علاج ثوري جديد لارتفاع ضغط الدم",
        slug: "nouveau-traitement-hypertension-2024",
        content: `<h2>Une pilule une fois par semaine</h2>
<p>Des chercheurs ont développé un nouveau médicament contre l'hypertension qui ne nécessite qu'une prise par semaine, révolutionnant l'observance thérapeutique.</p>
<h3>Efficacité prouvée</h3>
<p>Les études cliniques montrent une efficacité équivalente voire supérieure aux traitements quotidiens, avec une observance de 98% contre 60% pour les traitements classiques.</p>`,
        excerpt: "Une pilule par semaine suffit pour contrôler l'hypertension",
        category: "Innovation",
        coverImage: "/images/news/hypertension-drug.jpg",
        tags: JSON.stringify(["Cardiologie", "Pharmacologie", "Innovation"]),
        readingTime: 5,
        viewCount: 2890,
        likeCount: 445,
        featured: false,
        status: "published",
        publishedAt: new Date("2024-03-22"),
      },
      {
        title: "Formation: Maîtriser l'Échographie en Médecine d'Urgence",
        titleEn: "Training: Mastering Emergency Medicine Ultrasound",
        titleAr: "تدريب: إتقان الموجات فوق الصوتية في طب الطوارئ",
        slug: "formation-echographie-urgence-2024",
        content: `<h2>Nouvelle formation certifiante</h2>
<p>Dr.MiMi lance une formation en ligne certifiante sur l'échographie en médecine d'urgence, niveau débutant à avancé.</p>
<h3>Au programme</h3>
<ul>
<li>FAST Protocol (Focused Assessment with Sonography for Trauma)</li>
<li>Échographie cardiaque d'urgence</li>
<li>Échographie pulmonaire (Blue Protocol)</li>
<li>Échographie abdominale</li>
</ul>
<h3>Durée et modalités</h3>
<p>Formation de 40 heures sur 8 semaines, avec cas pratiques et simulations 3D interactives.</p>`,
        excerpt: "Nouvelle formation certifiante disponible sur Dr.MiMi",
        category: "Études",
        coverImage: "/images/news/ultrasound-training.jpg",
        tags: JSON.stringify(["Formation", "Échographie", "Urgence", "E-learning"]),
        readingTime: 6,
        viewCount: 4123,
        likeCount: 678,
        featured: true,
        status: "published",
        publishedAt: new Date("2024-03-21"),
      },
      {
        title: "Conseils pour Réussir l'ECN 2024",
        titleEn: "Tips to Succeed in ECN 2024",
        titleAr: "نصائح للنجاح في ECN 2024",
        slug: "conseils-reussir-ecn-2024",
        content: `<h2>L'approche gagnante pour l'ECN</h2>
<p>Avec l'ECN qui approche, Dr.MiMi vous donne ses meilleurs conseils pour maximiser vos chances de réussite.</p>
<h3>Organisation</h3>
<ul>
<li>Planifier des révisions espacées (spaced repetition)</li>
<li>Utiliser des fiches de révision efficaces</li>
<li>Pratiquer avec des QCM tous les jours</li>
</ul>
<h3>Stratégie d'examen</h3>
<ul>
<li>Gérer son temps (2 minutes par QCM)</li>
<li>Ne jamais laisser de questions sans réponse</li>
<li>Réviser les items les plus tombés</li>
</ul>
<h3>Bien-être</h3>
<p>Maintenir un équilibre vie-études, dormir suffisamment, et gérer son stress avec des techniques de relaxation.</p>`,
        excerpt: "Tous les conseils pour maximiser vos chances de réussite",
        category: "Conseils",
        coverImage: "/images/news/ecn-study.jpg",
        tags: JSON.stringify(["ECN", "Révisions", "Conseils", "Études"]),
        readingTime: 7,
        viewCount: 8234,
        likeCount: 1245,
        featured: true,
        status: "published",
        publishedAt: new Date("2024-03-20"),
      },
      {
        title: "COVID-19: Nouvelle Variante Détectée",
        titleEn: "COVID-19: New Variant Detected",
        titleAr: "COVID-19: اكتشاف متغير جديد",
        slug: "covid-nouvelle-variante-2024",
        content: `<h2>Surveillance épidémiologique</h2>
<p>Une nouvelle variante du SARS-CoV-2 a été détectée par les systèmes de surveillance génomique. Les autorités sanitaires rassurent sur l'efficacité des vaccins actuels.</p>
<h3>Caractéristiques</h3>
<p>La variante présente quelques mutations sur la protéine Spike, mais reste sensible aux anticorps neutralisants produits par la vaccination.</p>
<h3>Recommandations</h3>
<p>Maintenir les gestes barrières et continuer la campagne de vaccination, particulièrement pour les populations à risque.</p>`,
        excerpt: "Surveillance continue des nouvelles variantes du SARS-CoV-2",
        category: "Actualités",
        coverImage: "/images/news/covid-variant.jpg",
        tags: JSON.stringify(["COVID-19", "Épidémiologie", "Virologie", "Santé Publique"]),
        readingTime: 5,
        viewCount: 6789,
        likeCount: 543,
        featured: false,
        status: "published",
        publishedAt: new Date("2024-03-19"),
      },
      {
        title: "Témoignage: Mon Parcours d'Interne en Chirurgie",
        titleEn: "Testimony: My Journey as a Surgery Resident",
        titleAr: "شهادة: رحلتي كمقيم في الجراحة",
        slug: "temoignage-interne-chirurgie-2024",
        content: `<h2>Le quotidien d'un interne en chirurgie</h2>
<p>Dr. Amina Benali, interne en chirurgie générale à Alger, partage son expérience et ses conseils pour les futurs internes.</p>
<h3>Les défis</h3>
<p>"Les gardes de 24h sont physiquement exigeantes, mais chaque intervention est une opportunité d'apprentissage unique. La gestion du stress et du temps est cruciale."</p>
<h3>Conseils aux étudiants</h3>
<ul>
<li>Pratiquer la suture dès maintenant</li>
<li>Lire les protocoles chirurgicaux</li>
<li>Observer un maximum d'interventions</li>
<li>Développer l'esprit d'équipe</li>
</ul>`,
        excerpt: "Témoignage d'une interne en chirurgie générale à Alger",
        category: "Carrière",
        coverImage: "/images/news/surgery-intern.jpg",
        tags: JSON.stringify(["Chirurgie", "Internat", "Témoignage", "Carrière"]),
        readingTime: 8,
        viewCount: 5432,
        likeCount: 876,
        featured: false,
        status: "published",
        publishedAt: new Date("2024-03-18"),
      },
    ];

    // Insert articles
    for (const article of articles) {
      await db.insert(blogPosts).values(article).onConflictDoNothing();
    }

    console.log(`✅ Seeded ${articles.length} news articles`);
  } catch (error) {
    console.error("Error seeding news articles:", error);
  }
}
