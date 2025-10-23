// Seed Summaries Data
import { db } from './db';
import { summaries } from '../shared/schema';
import { eq } from 'drizzle-orm';

export async function seedSummaries() {
  console.log('🌱 Seeding summaries...');

  const summariesData = [
    {
      id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
      title: 'Résumé Anatomie Cardiaque',
      titleEn: 'Cardiac Anatomy Summary',
      titleAr: 'ملخص تشريح القلب',
      content: 'Résumé complet sur l\'anatomie du cœur: cavités, valves, vascularisation et innervation.',
      contentEn: 'Complete summary of heart anatomy: chambers, valves, vascularization and innervation.',
      contentAr: 'ملخص كامل لتشريح القلب: الحجرات، الصمامات، التوعية والتعصيب.',
      moduleId: null,
      pdfAsset: '/summaries/cardiac-anatomy.pdf',
      previewImages: ['/images/summaries/cardiac-preview-1.jpg', '/images/summaries/cardiac-preview-2.jpg'],
      language: 'fr',
      pages: 12,
      price: '0.00',
      currency: 'DZD',
      tags: ['anatomie', 'cardiologie', 'Y1', 'Y2'],
      status: 'published' as const,
      createdBy: null,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
      title: 'Résumé Physiologie Respiratoire',
      titleEn: 'Respiratory Physiology Summary',
      titleAr: 'ملخص الفيزيولوجيا التنفسية',
      content: 'Mécanismes de la ventilation, échanges gazeux et régulation de la respiration.',
      contentEn: 'Mechanisms of ventilation, gas exchange and respiratory regulation.',
      contentAr: 'آليات التهوية، تبادل الغازات وتنظيم التنفس.',
      moduleId: null,
      pdfAsset: '/summaries/respiratory-physiology.pdf',
      previewImages: ['/images/summaries/respiratory-preview.jpg'],
      language: 'fr',
      pages: 8,
      price: '0.00',
      currency: 'DZD',
      tags: ['physiologie', 'respiration', 'Y2'],
      status: 'published' as const,
      createdBy: null,
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-02-10'),
    },
    {
      id: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
      title: 'Résumé Pharmacologie Cardiovasculaire',
      titleEn: 'Cardiovascular Pharmacology Summary',
      titleAr: 'ملخص الصيدلة القلبية الوعائية',
      content: 'Médicaments cardiaques: antihypertenseurs, antiarythmiques, anticoagulants.',
      contentEn: 'Cardiac medications: antihypertensives, antiarrhythmics, anticoagulants.',
      contentAr: 'الأدوية القلبية: خافضات الضغط، مضادات عدم انتظام ضربات القلب، مضادات التخثر.',
      moduleId: null,
      pdfAsset: '/summaries/cardio-pharmacology.pdf',
      previewImages: ['/images/summaries/pharma-preview.jpg'],
      language: 'fr',
      pages: 15,
      price: '0.00',
      currency: 'DZD',
      tags: ['pharmacologie', 'cardiologie', 'Y3', 'Y4'],
      status: 'published' as const,
      createdBy: null,
      createdAt: new Date('2024-03-05'),
      updatedAt: new Date('2024-03-05'),
    },
    {
      id: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s',
      title: 'Résumé Neurologie Clinique',
      titleEn: 'Clinical Neurology Summary',
      titleAr: 'ملخص علم الأعصاب السريري',
      content: 'Syndromes neurologiques: AVC, épilepsie, SEP, Parkinson, Alzheimer.',
      contentEn: 'Neurological syndromes: stroke, epilepsy, MS, Parkinson, Alzheimer.',
      contentAr: 'المتلازمات العصبية: السكتة الدماغية، الصرع، التصلب المتعدد، باركنسون، الزهايمر.',
      moduleId: null,
      pdfAsset: '/summaries/neurology-clinical.pdf',
      previewImages: ['/images/summaries/neuro-preview.jpg'],
      language: 'fr',
      pages: 20,
      price: '0.00',
      currency: 'DZD',
      tags: ['neurologie', 'clinique', 'Y5', 'Y6', 'Intern'],
      status: 'published' as const,
      createdBy: null,
      createdAt: new Date('2024-04-12'),
      updatedAt: new Date('2024-04-12'),
    },
    {
      id: '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t',
      title: 'Résumé Pédiatrie Générale',
      titleEn: 'General Pediatrics Summary',
      titleAr: 'ملخص طب الأطفال العام',
      content: 'Pathologies pédiatriques courantes: infections, vaccinations, croissance.',
      contentEn: 'Common pediatric pathologies: infections, vaccinations, growth.',
      contentAr: 'الأمراض الشائعة عند الأطفال: العدوى، التطعيمات، النمو.',
      moduleId: null,
      pdfAsset: '/summaries/pediatrics-general.pdf',
      previewImages: ['/images/summaries/pediatrics-preview.jpg'],
      language: 'fr',
      pages: 18,
      price: '0.00',
      currency: 'DZD',
      tags: ['pédiatrie', 'Y6', 'Intern'],
      status: 'published' as const,
      createdBy: null,
      createdAt: new Date('2024-05-20'),
      updatedAt: new Date('2024-05-20'),
    },
    {
      id: '6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u',
      title: 'Résumé Microbiologie Médicale',
      titleEn: 'Medical Microbiology Summary',
      titleAr: 'ملخص علم الأحياء الدقيقة الطبية',
      content: 'Bactériologie, virologie, parasitologie et mycologie médicale.',
      contentEn: 'Bacteriology, virology, parasitology and medical mycology.',
      contentAr: 'علم البكتيريا، الفيروسات، الطفيليات والفطريات الطبية.',
      moduleId: null,
      pdfAsset: '/summaries/microbiology-medical.pdf',
      previewImages: ['/images/summaries/microbio-preview.jpg'],
      language: 'fr',
      pages: 22,
      price: '0.00',
      currency: 'DZD',
      tags: ['microbiologie', 'infectiologie', 'Y3'],
      status: 'published' as const,
      createdBy: null,
      createdAt: new Date('2024-06-08'),
      updatedAt: new Date('2024-06-08'),
    }
  ];

  try {
    for (const summary of summariesData) {
      const existing = await db.select().from(summaries).where(eq(summaries.id, summary.id));
      
      if (existing.length === 0) {
        await db.insert(summaries).values(summary);
        console.log(`✅ Created summary: ${summary.title}`);
      } else {
        console.log(`ℹ️  Summary already exists: ${summary.title}`);
      }
    }
    
    console.log('✅ Summaries seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding summaries:', error);
    throw error;
  }
}
