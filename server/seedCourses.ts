// Seed Courses Data
import { db } from './db';
import { courses } from '../shared/schema';

export async function seedCourses() {
  console.log('🌱 Seeding courses...');
  
  try {
    const coursesData = [
      {
        title: 'Anatomie Générale - Première Année',
        titleEn: 'General Anatomy - First Year',
        titleAr: 'علم التشريح العام - السنة الأولى',
        description: 'Cours complet sur l\'anatomie humaine couvrant tous les systèmes du corps. Inclut des schémas détaillés, des animations 3D et des quiz interactifs pour renforcer l\'apprentissage.',
        descriptionEn: 'Comprehensive course on human anatomy covering all body systems. Includes detailed diagrams, 3D animations and interactive quizzes.',
        descriptionAr: 'دورة شاملة في علم التشريح البشري تغطي جميع أنظمة الجسم. يتضمن رسوماً تفصيلية ورسوم متحركة ثلاثية الأبعاد واختبارات تفاعلية.',
        yearLevels: ['Y1'],
        authors: ['Dr. Benali Ahmed'],
        language: 'fr',
        price: '0.00',
        currency: 'DZD',
        rating: '4.8',
        status: 'published' as const,
      },
      {
        title: 'Physiologie Humaine Approfondie',
        titleEn: 'Advanced Human Physiology',
        titleAr: 'علم وظائف الأعضاء البشرية المتقدم',
        description: 'Étude détaillée des fonctions des organes et systèmes du corps humain. Comprend des études de cas, des expériences virtuelles et des protocoles de recherche.',
        descriptionEn: 'Detailed study of organ and body system functions. Includes case studies, virtual experiments and research protocols.',
        descriptionAr: 'دراسة مفصلة لوظائف الأعضاء وأنظمة الجسم. يتضمن دراسات حالة وتجارب افتراضية وبروتوكولات بحث.',
        yearLevels: ['Y2'],
        authors: ['Prof. Kadri Fatima'],
        language: 'fr',
        price: '0.00',
        currency: 'DZD',
        rating: '4.7',
        status: 'published' as const,
      },
      {
        title: 'Cardiologie Clinique Pratique',
        titleEn: 'Practical Clinical Cardiology',
        titleAr: 'أمراض القلب السريرية العملية',
        description: 'Pathologies cardiovasculaires et leur prise en charge clinique. Cas réels, ECG interactifs, protocoles thérapeutiques et guidelines internationales.',
        descriptionEn: 'Cardiovascular pathologies and their clinical management. Real cases, interactive ECGs, therapeutic protocols and international guidelines.',
        descriptionAr: 'الأمراض القلبية الوعائية وإدارتها السريرية. حالات حقيقية، تخطيط قلب تفاعلي، بروتوكولات علاجية وإرشادات دولية.',
        yearLevels: ['Y5', 'Y6', 'Intern'],
        authors: ['Prof. Meziane Rachid'],
        language: 'fr',
        price: '0.00',
        currency: 'DZD',
        rating: '4.9',
        status: 'published' as const,
      },
      {
        title: 'Pharmacologie Générale et Clinique',
        titleEn: 'General and Clinical Pharmacology',
        titleAr: 'علم الأدوية العام والسريري',
        description: 'Principes fondamentaux de la pharmacologie, mécanismes d\'action des médicaments, pharmacocinétique et pharmacodynamie.',
        descriptionEn: 'Fundamental principles of pharmacology, drug mechanisms of action, pharmacokinetics and pharmacodynamics.',
        descriptionAr: 'المبادئ الأساسية لعلم الأدوية، آليات عمل الأدوية، الحرائك الدوائية والديناميكيات الدوائية.',
        yearLevels: ['Y3', 'Y4'],
        authors: ['Dr. Taleb Samira'],
        language: 'fr',
        price: '0.00',
        currency: 'DZD',
        rating: '4.6',
        status: 'published' as const,
      },
      {
        title: 'Pédiatrie Pratique et Urgences',
        titleEn: 'Practical Pediatrics and Emergencies',
        titleAr: 'طب الأطفال العملي والطوارئ',
        description: 'Pathologies pédiatriques courantes, croissance et développement de l\'enfant, urgences pédiatriques. Inclut protocoles de vaccination et nutrition infantile.',
        descriptionEn: 'Common pediatric pathologies, child growth and development, pediatric emergencies. Includes vaccination protocols and infant nutrition.',
        descriptionAr: 'الأمراض الشائعة عند الأطفال، نمو وتطور الطفل، طوارئ الأطفال. يتضمن بروتوكولات التطعيم وتغذية الرضع.',
        yearLevels: ['Y6', 'Intern'],
        authors: ['Dr. Hamdi Leila'],
        language: 'fr',
        price: '0.00',
        currency: 'DZD',
        rating: '4.8',
        status: 'published' as const,
      },
      {
        title: 'Microbiologie et Infectiologie',
        titleEn: 'Microbiology and Infectious Diseases',
        titleAr: 'علم الأحياء الدقيقة والأمراض المعدية',
        description: 'Étude des micro-organismes pathogènes, maladies infectieuses, antibiotiques et résistance. Techniques de laboratoire et diagnostic microbiologique.',
        descriptionEn: 'Study of pathogenic microorganisms, infectious diseases, antibiotics and resistance. Laboratory techniques and microbiological diagnosis.',
        descriptionAr: 'دراسة الكائنات الحية الدقيقة المسببة للأمراض، الأمراض المعدية، المضادات الحيوية والمقاومة. تقنيات المختبر والتشخيص الميكروبيولوجي.',
        yearLevels: ['Y3'],
        authors: ['Prof. Saadi Mohamed'],
        language: 'fr',
        price: '0.00',
        currency: 'DZD',
        rating: '4.7',
        status: 'published' as const,
      },
      {
        title: 'Radiologie et Imagerie Médicale',
        titleEn: 'Radiology and Medical Imaging',
        titleAr: 'الأشعة والتصوير الطبي',
        description: 'Interprétation des examens radiologiques, scanner, IRM, échographie. Atlas d\'imagerie normale et pathologique avec cas cliniques commentés.',
        descriptionEn: 'Interpretation of radiological exams, CT, MRI, ultrasound. Atlas of normal and pathological imaging with commented clinical cases.',
        descriptionAr: 'تفسير الفحوصات الإشعاعية، الأشعة المقطعية، الرنين المغناطيسي، الموجات فوق الصوتية. أطلس التصوير الطبيعي والمرضي مع حالات سريرية معلقة.',
        yearLevels: ['Y4', 'Y5'],
        authors: ['Dr. Bouazza Nadia'],
        language: 'fr',
        price: '0.00',
        currency: 'DZD',
        rating: '4.9',
        status: 'published' as const,
      },
      {
        title: 'Psychiatrie et Santé Mentale',
        titleEn: 'Psychiatry and Mental Health',
        titleAr: 'الطب النفسي والصحة العقلية',
        description: 'Troubles psychiatriques, psychopathologie, thérapeutiques psychiatriques. Approche clinique avec cas pratiques et techniques d\'entretien.',
        descriptionEn: 'Psychiatric disorders, psychopathology, psychiatric therapeutics. Clinical approach with practical cases and interview techniques.',
        descriptionAr: 'الاضطرابات النفسية، علم النفس المرضي، العلاجات النفسية. نهج سريري مع حالات عملية وتقنيات المقابلة.',
        yearLevels: ['Y5', 'Y6'],
        authors: ['Prof. Amrani Karim'],
        language: 'fr',
        price: '0.00',
        currency: 'DZD',
        rating: '4.5',
        status: 'published' as const,
      }
    ];
    
    await db.insert(courses).values(coursesData);
    console.log(`✅ Courses seeded: ${coursesData.length} courses`);
    
    return coursesData.length;
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    throw error;
  }
}
