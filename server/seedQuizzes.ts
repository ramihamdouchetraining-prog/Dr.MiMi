// Seed quiz data for testing
import { db } from "./db";
import { quizzes } from "../shared/schema";

export async function seedQuizzes() {
  try {
    console.log("🌱 Seeding quiz data...");

    const quizData = [
      // PACES / Y1 - Anatomie
      {
        title: "Quiz: Anatomie du Cœur",
        titleEn: "Quiz: Heart Anatomy",
        titleAr: "اختبار: تشريح القلب",
        moduleId: "anatomy",
        yearLevels: JSON.stringify(["Y1", "Y2"]),
        difficulty: "easy",
        timeLimit: 20,
        passingScore: 70,
        questions: JSON.stringify([
          {
            id: "q1",
            type: "mcq",
            stem: "Quelle est la fonction principale du ventricule gauche?",
            stemEn: "What is the main function of the left ventricle?",
            stemAr: "ما هي الوظيفة الرئيسية للبطين الأيسر؟",
            options: [
              { id: "a", text: "Pomper le sang vers l'aorte", isCorrect: true },
              { id: "b", text: "Recevoir le sang des poumons", isCorrect: false },
              { id: "c", text: "Pomper le sang vers les poumons", isCorrect: false },
              { id: "d", text: "Recevoir le sang de la veine cave", isCorrect: false },
            ],
            explanation: "Le ventricule gauche pompe le sang oxygéné vers l'aorte et la circulation systémique.",
            difficulty: "easy",
            module: "Cardiologie",
            points: 1,
          },
          {
            id: "q2",
            type: "mcq",
            stem: "Combien de valves cardiaques le cœur possède-t-il?",
            stemEn: "How many heart valves does the heart have?",
            stemAr: "كم عدد صمامات القلب؟",
            options: [
              { id: "a", text: "2", isCorrect: false },
              { id: "b", text: "3", isCorrect: false },
              { id: "c", text: "4", isCorrect: true },
              { id: "d", text: "5", isCorrect: false },
            ],
            explanation: "Le cœur a 4 valves: mitrale, tricuspide, aortique et pulmonaire.",
            difficulty: "easy",
            module: "Cardiologie",
            points: 1,
          },
          {
            id: "q3",
            type: "mcq",
            stem: "Quelle artère irrigue le myocarde?",
            stemEn: "Which artery supplies the myocardium?",
            stemAr: "أي شريان يغذي عضلة القلب؟",
            options: [
              { id: "a", text: "Artères coronaires", isCorrect: true },
              { id: "b", text: "Artère pulmonaire", isCorrect: false },
              { id: "c", text: "Aorte", isCorrect: false },
              { id: "d", text: "Artères carotides", isCorrect: false },
            ],
            explanation: "Les artères coronaires (gauche et droite) irriguent le muscle cardiaque.",
            difficulty: "easy",
            module: "Cardiologie",
            points: 1,
          },
        ]),
        status: "published",
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Y2 - Pharmacologie
      {
        title: "Quiz: Antibiotiques - Bêta-lactamines",
        titleEn: "Quiz: Antibiotics - Beta-lactams",
        titleAr: "اختبار: المضادات الحيوية - بيتا لاكتام",
        moduleId: "pharmacology",
        yearLevels: JSON.stringify(["Y2", "Y3"]),
        difficulty: "medium",
        timeLimit: 25,
        passingScore: 75,
        questions: JSON.stringify([
          {
            id: "q1",
            type: "mcq",
            stem: "Quel est le mécanisme d'action des pénicillines?",
            options: [
              { id: "a", text: "Inhibition de la synthèse de la paroi bactérienne", isCorrect: true },
              { id: "b", text: "Inhibition de la synthèse protéique", isCorrect: false },
              { id: "c", text: "Inhibition de la synthèse d'ADN", isCorrect: false },
              { id: "d", text: "Altération de la membrane cytoplasmique", isCorrect: false },
            ],
            explanation: "Les pénicillines inhibent la transpeptidase, enzyme clé de la synthèse du peptidoglycane.",
            difficulty: "medium",
            points: 2,
          },
          {
            id: "q2",
            type: "mcq",
            stem: "Quelle est la principale cause de résistance aux pénicillines?",
            options: [
              { id: "a", text: "Production de bêta-lactamases", isCorrect: true },
              { id: "b", text: "Mutation des ribosomes", isCorrect: false },
              { id: "c", text: "Efflux actif", isCorrect: false },
              { id: "d", text: "Modification de l'ADN gyrase", isCorrect: false },
            ],
            explanation: "Les bêta-lactamases hydrolysent le cycle bêta-lactame, inactivant l'antibiotique.",
            difficulty: "medium",
            points: 2,
          },
        ]),
        status: "published",
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Y3 - Sémiologie
      {
        title: "Quiz: Sémiologie Cardiaque",
        titleEn: "Quiz: Cardiac Semiology",
        titleAr: "اختبار: السيميولوجيا القلبية",
        moduleId: "cardiology",
        yearLevels: JSON.stringify(["Y3", "Y4"]),
        difficulty: "medium",
        timeLimit: 30,
        passingScore: 75,
        questions: JSON.stringify([
          {
            id: "q1",
            type: "mcq",
            stem: "Quel souffle cardiaque est typique d'une sténose aortique?",
            options: [
              { id: "a", text: "Souffle systolique éjectionnel au foyer aortique", isCorrect: true },
              { id: "b", text: "Souffle diastolique au foyer mitral", isCorrect: false },
              { id: "c", text: "Souffle holosystolique au foyer tricuspide", isCorrect: false },
              { id: "d", text: "Roulement diastolique", isCorrect: false },
            ],
            explanation: "La sténose aortique donne un souffle systolique éjectionnel irradiant vers les carotides.",
            difficulty: "medium",
            points: 2,
          },
          {
            id: "q2",
            type: "mcq",
            stem: "Quelle est la triade de Beck dans la tamponnade cardiaque?",
            options: [
              { id: "a", text: "Hypotension + Turgescence jugulaire + Assourdissement des bruits", isCorrect: true },
              { id: "b", text: "Dyspnée + Orthopnée + Œdèmes", isCorrect: false },
              { id: "c", text: "Douleur + Fièvre + Souffle", isCorrect: false },
              { id: "d", text: "Tachycardie + Bradycardie + Arythmie", isCorrect: false },
            ],
            explanation: "La triade de Beck: hypotension artérielle, turgescence jugulaire et assourdissement des bruits du cœur.",
            difficulty: "hard",
            points: 3,
          },
        ]),
        status: "published",
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Y4 - Pédiatrie
      {
        title: "Quiz: Pédiatrie - Vaccination",
        titleEn: "Quiz: Pediatrics - Vaccination",
        titleAr: "اختبار: طب الأطفال - التطعيم",
        moduleId: "pediatrics",
        yearLevels: JSON.stringify(["Y4", "Y5"]),
        difficulty: "easy",
        timeLimit: 20,
        passingScore: 70,
        questions: JSON.stringify([
          {
            id: "q1",
            type: "mcq",
            stem: "À quel âge administre-t-on le BCG en Algérie?",
            options: [
              { id: "a", text: "À la naissance", isCorrect: true },
              { id: "b", text: "À 2 mois", isCorrect: false },
              { id: "c", text: "À 6 mois", isCorrect: false },
              { id: "d", text: "À 1 an", isCorrect: false },
            ],
            explanation: "Le BCG est administré dès la naissance dans le calendrier vaccinal algérien.",
            difficulty: "easy",
            points: 1,
          },
          {
            id: "q2",
            type: "mcq",
            stem: "Quelle est la principale contre-indication du vaccin ROR?",
            options: [
              { id: "a", text: "Immunodépression sévère", isCorrect: true },
              { id: "b", text: "Allergie aux œufs", isCorrect: false },
              { id: "c", text: "Fièvre modérée", isCorrect: false },
              { id: "d", text: "Prématurité", isCorrect: false },
            ],
            explanation: "Le ROR est un vaccin vivant atténué, contre-indiqué en cas d'immunodépression sévère.",
            difficulty: "medium",
            points: 2,
          },
        ]),
        status: "published",
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Y5 - Urgences
      {
        title: "Quiz: Urgences Médicales - AVC",
        titleEn: "Quiz: Medical Emergencies - Stroke",
        titleAr: "اختبار: الطوارئ الطبية - السكتة الدماغية",
        moduleId: "emergency",
        yearLevels: JSON.stringify(["Y5", "Y6", "Intern"]),
        difficulty: "hard",
        timeLimit: 30,
        passingScore: 80,
        questions: JSON.stringify([
          {
            id: "q1",
            type: "mcq",
            stem: "Quelle est la fenêtre thérapeutique pour la thrombolyse IV dans l'AVC ischémique?",
            options: [
              { id: "a", text: "4h30", isCorrect: true },
              { id: "b", text: "6 heures", isCorrect: false },
              { id: "c", text: "12 heures", isCorrect: false },
              { id: "d", text: "24 heures", isCorrect: false },
            ],
            explanation: "La thrombolyse IV doit être administrée dans les 4h30 après le début des symptômes.",
            difficulty: "medium",
            points: 2,
          },
          {
            id: "q2",
            type: "mcq",
            stem: "Quel score évalue la sévérité d'un AVC?",
            options: [
              { id: "a", text: "Score NIHSS", isCorrect: true },
              { id: "b", text: "Score de Glasgow", isCorrect: false },
              { id: "c", text: "Score APACHE", isCorrect: false },
              { id: "d", text: "Score SOFA", isCorrect: false },
            ],
            explanation: "Le score NIHSS (National Institutes of Health Stroke Scale) évalue la sévérité d'un AVC.",
            difficulty: "medium",
            points: 2,
          },
          {
            id: "q3",
            type: "mcq",
            stem: "Quelle est la principale contre-indication absolue à la thrombolyse?",
            options: [
              { id: "a", text: "Hémorragie intracrânienne récente", isCorrect: true },
              { id: "b", text: "Âge > 80 ans", isCorrect: false },
              { id: "c", text: "Diabète", isCorrect: false },
              { id: "d", text: "Hypertension artérielle", isCorrect: false },
            ],
            explanation: "Une hémorragie intracrânienne récente est une contre-indication absolue à la thrombolyse.",
            difficulty: "easy",
            points: 1,
          },
        ]),
        status: "published",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Insert quizzes
    for (const quiz of quizData) {
      await db.insert(quizzes).values(quiz).onConflictDoNothing();
    }

    console.log(`✅ Seeded ${quizData.length} quizzes`);
  } catch (error) {
    console.error("Error seeding quizzes:", error);
  }
}
