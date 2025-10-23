// Seed Clinical Cases Data
import { db } from './db';
import { cases } from '../shared/schema';
import { eq } from 'drizzle-orm';

export async function seedCases() {
  console.log('🌱 Seeding clinical cases...');

  const casesData = [
    {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      title: 'Infarctus du myocarde aigu',
      titleEn: 'Acute Myocardial Infarction',
      titleAr: 'احتشاء عضلة القلب الحاد',
      description: 'Cas clinique de patient avec douleur thoracique typique d\'IDM.',
      descriptionEn: 'Clinical case of patient with typical chest pain of MI.',
      descriptionAr: 'حالة سريرية لمريض يعاني من ألم صدري نموذجي لاحتشاء عضلة القلب.',
      presentation: 'Homme de 55 ans, douleur thoracique constrictive irradiant vers le bras gauche depuis 2h.',
      presentationEn: '55-year-old man, constrictive chest pain radiating to left arm for 2 hours.',
      presentationAr: 'رجل يبلغ من العمر 55 عامًا، ألم صدري ضاغط يمتد إلى الذراع الأيسر منذ ساعتين.',
      history: 'ATCD: HTA, tabagisme actif 30 paquets-années, dyslipidémie.',
      historyEn: 'History: HTN, active smoking 30 pack-years, dyslipidemia.',
      historyAr: 'التاريخ المرضي: ارتفاع ضغط الدم، تدخين نشط 30 علبة-سنة، اضطراب الدهون.',
      exam: 'TA: 140/90, FC: 95/min, sueurs, anxiété. Auscultation cardiaque normale.',
      examEn: 'BP: 140/90, HR: 95/min, sweating, anxiety. Normal cardiac auscultation.',
      examAr: 'ضغط الدم: 140/90، معدل القلب: 95/دقيقة، تعرق، قلق. فحص القلب طبيعي.',
      investigations: 'ECG: sus-décalage ST en DII, DIII, aVF. Troponine élevée.',
      investigationsEn: 'ECG: ST elevation in DII, DIII, aVF. Elevated troponin.',
      investigationsAr: 'تخطيط القلب: ارتفاع ST في DII، DIII، aVF. تروبونين مرتفع.',
      management: 'Charge antiplaquettaire (aspirine + clopidogrel), coronarographie en urgence.',
      managementEn: 'Antiplatelet therapy (aspirin + clopidogrel), emergency coronary angiography.',
      managementAr: 'علاج مضاد للصفائح (أسبرين + كلوبيدوغريل)، قسطرة قلبية طارئة.',
      moduleId: 'cardiology',
      difficulty: 'Medium',
      status: 'published' as const,
      createdBy: null,
      createdAt: new Date('2024-01-10'),
    },
    {
      id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      title: 'AVC ischémique',
      titleEn: 'Ischemic Stroke',
      titleAr: 'السكتة الدماغية الإقفارية',
      description: 'Cas d\'AVC avec déficit moteur brutal.',
      descriptionEn: 'Stroke case with sudden motor deficit.',
      descriptionAr: 'حالة سكتة دماغية مع عجز حركي مفاجئ.',
      presentation: 'Femme de 68 ans, faiblesse soudaine du membre supérieur droit, aphasie.',
      presentationEn: '68-year-old woman, sudden right upper limb weakness, aphasia.',
      presentationAr: 'امرأة تبلغ من العمر 68 عامًا، ضعف مفاجئ في الطرف العلوي الأيمن، فقدان القدرة على الكلام.',
      history: 'ATCD: Fibrillation auriculaire, diabète type 2.',
      historyEn: 'History: Atrial fibrillation, type 2 diabetes.',
      historyAr: 'التاريخ المرضي: الرجفان الأذيني، داء السكري من النوع 2.',
      exam: 'Hémiparésie droite, aphasie de Broca, déviation conjuguée du regard.',
      examEn: 'Right hemiparesis, Broca\'s aphasia, conjugate gaze deviation.',
      examAr: 'شلل نصفي أيمن، فقدان القدرة على الكلام من نوع بروكا، انحراف النظر المشترك.',
      investigations: 'Scanner cérébral: hypodensité de l\'ACM gauche.',
      investigationsEn: 'Brain CT: left MCA hypodensity.',
      investigationsAr: 'فحص الدماغ: نقص الكثافة في الشريان الدماغي الأوسط الأيسر.',
      management: 'Thrombolyse IV si < 4h30, anticoagulation, rééducation.',
      managementEn: 'IV thrombolysis if < 4.5h, anticoagulation, rehabilitation.',
      managementAr: 'إذابة الجلطة وريديًا إذا < 4.5 ساعة، مضادات التخثر، إعادة التأهيل.',
      moduleId: 'neuro',
      difficulty: 'Hard',
      status: 'published' as const,
      createdBy: null,
      createdAt: new Date('2024-02-15'),
    },
    {
      id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
      title: 'Pneumonie communautaire',
      titleEn: 'Community-Acquired Pneumonia',
      titleAr: 'التهاب رئوي مكتسب من المجتمع',
      description: 'Cas de pneumonie bactérienne aiguë.',
      descriptionEn: 'Acute bacterial pneumonia case.',
      descriptionAr: 'حالة التهاب رئوي بكتيري حاد.',
      presentation: 'Homme de 42 ans, fièvre 39°C, toux productive, dyspnée depuis 3 jours.',
      presentationEn: '42-year-old man, fever 39°C, productive cough, dyspnea for 3 days.',
      presentationAr: 'رجل يبلغ من العمر 42 عامًا، حمى 39 درجة مئوية، سعال منتج، ضيق التنفس منذ 3 أيام.',
      history: 'Pas d\'ATCD particulier, non fumeur.',
      historyEn: 'No significant history, non-smoker.',
      historyAr: 'لا توجد سوابق مرضية خاصة، غير مدخن.',
      exam: 'T: 39.2°C, FR: 24/min, SpO2: 92%, râles crépitants base droite.',
      examEn: 'T: 39.2°C, RR: 24/min, SpO2: 92%, right base crackles.',
      examAr: 'الحرارة: 39.2 درجة مئوية، معدل التنفس: 24/دقيقة، إشباع الأكسجين: 92%، فرقعات في القاعدة اليمنى.',
      investigations: 'Radio thorax: opacité alvéolaire lobe inférieur droit. CRP: 180 mg/L.',
      investigationsEn: 'Chest X-ray: right lower lobe alveolar opacity. CRP: 180 mg/L.',
      investigationsAr: 'أشعة الصدر: عتامة سنخية في الفص السفلي الأيمن. بروتين سي التفاعلي: 180 ملغ/لتر.',
      management: 'Amoxicilline-acide clavulanique, kinésithérapie respiratoire.',
      managementEn: 'Amoxicillin-clavulanate, respiratory physiotherapy.',
      managementAr: 'أموكسيسيلين-حمض الكلافولانيك، علاج طبيعي تنفسي.',
      moduleId: 'pulmonology',
      difficulty: 'Easy',
      status: 'published' as const,
      createdBy: null,
      createdAt: new Date('2024-03-20'),
    },
    {
      id: 'd4e5f6a7-b8c9-0123-def0-234567890123',
      title: 'Appendicite aiguë',
      titleEn: 'Acute Appendicitis',
      titleAr: 'التهاب الزائدة الدودية الحاد',
      description: 'Douleur abdominale aiguë de la fosse iliaque droite.',
      descriptionEn: 'Acute right iliac fossa pain.',
      descriptionAr: 'ألم حاد في الحفرة الحرقفية اليمنى.',
      presentation: 'Jeune homme de 22 ans, douleur FID depuis 12h, nausées, vomissements.',
      presentationEn: '22-year-old man, RIF pain for 12h, nausea, vomiting.',
      presentationAr: 'شاب يبلغ من العمر 22 عامًا، ألم في الحفرة الحرقفية اليمنى منذ 12 ساعة، غثيان، قيء.',
      history: 'Aucun ATCD chirurgical.',
      historyEn: 'No surgical history.',
      historyAr: 'لا توجد سوابق جراحية.',
      exam: 'T: 38.5°C, défense FID, signe de Blumberg positif, signe du psoas.',
      examEn: 'T: 38.5°C, RIF guarding, positive Blumberg sign, psoas sign.',
      examAr: 'الحرارة: 38.5 درجة مئوية، دفاع في الحفرة الحرقفية اليمنى، علامة بلومبرغ إيجابية، علامة العضلة القطنية.',
      investigations: 'NFS: hyperleucocytose 15000/mm3. Echo: appendice dilaté 9mm, non compressible.',
      investigationsEn: 'CBC: leukocytosis 15000/mm3. US: dilated appendix 9mm, non-compressible.',
      investigationsAr: 'تعداد الدم: زيادة كريات الدم البيضاء 15000/مم3. الموجات فوق الصوتية: زائدة دودية متوسعة 9 مم، غير قابلة للضغط.',
      management: 'Appendicectomie en urgence par cœlioscopie.',
      managementEn: 'Emergency laparoscopic appendectomy.',
      managementAr: 'استئصال الزائدة الدودية الطارئ بالمنظار.',
      moduleId: 'gastro',
      difficulty: 'Easy',
      status: 'published' as const,
      createdBy: null,
      createdAt: new Date('2024-04-05'),
    },
    {
      id: 'e5f6a7b8-c9d0-1234-ef01-345678901234',
      title: 'Crise thyrotoxique',
      titleEn: 'Thyroid Storm',
      titleAr: 'عاصفة الغدة الدرقية',
      description: 'Urgence endocrinienne: hyperthyroïdie décompensée.',
      descriptionEn: 'Endocrine emergency: decompensated hyperthyroidism.',
      descriptionAr: 'حالة طوارئ الغدد الصماء: فرط نشاط الغدة الدرقية اللا تعويضي.',
      presentation: 'Femme de 35 ans, fièvre 40°C, agitation, tachycardie, confusion.',
      presentationEn: '35-year-old woman, fever 40°C, agitation, tachycardia, confusion.',
      presentationAr: 'امرأة تبلغ من العمر 35 عامًا، حمى 40 درجة مئوية، هياج، تسرع القلب، تشوش.',
      history: 'Maladie de Basedow connue, arrêt du traitement il y a 1 mois.',
      historyEn: 'Known Graves\' disease, stopped treatment 1 month ago.',
      historyAr: 'مرض غريفز المعروف، توقف عن العلاج منذ شهر واحد.',
      exam: 'T: 40.1°C, FC: 150/min, TA: 160/90, tremblements, goitre diffus, exophtalmie.',
      examEn: 'T: 40.1°C, HR: 150/min, BP: 160/90, tremor, diffuse goiter, exophthalmos.',
      examAr: 'الحرارة: 40.1 درجة مئوية، معدل القلب: 150/دقيقة، ضغط الدم: 160/90، رعشة، تضخم الغدة الدرقية المنتشر، جحوظ العين.',
      investigations: 'TSH effondrée < 0.01, T4 libre très élevée 60 pmol/L.',
      investigationsEn: 'Very low TSH < 0.01, very high free T4 60 pmol/L.',
      investigationsAr: 'هرمون TSH منخفض جدًا < 0.01، T4 الحر مرتفع جدًا 60 بمول/لتر.',
      management: 'Réanimation, propranolol IV, carbimazole, hydrocortisone, refroidissement.',
      managementEn: 'ICU, IV propranolol, carbimazole, hydrocortisone, cooling.',
      managementAr: 'العناية المركزة، بروبرانولول وريدي، كاربيمازول، هيدروكورتيزون، تبريد.',
      moduleId: 'endocrinology',
      difficulty: 'Hard',
      status: 'published' as const,
      createdBy: null,
      createdAt: new Date('2024-05-18'),
    }
  ];

  try {
    for (const caseData of casesData) {
      const existing = await db.select().from(cases).where(eq(cases.id, caseData.id));
      
      if (existing.length === 0) {
        await db.insert(cases).values(caseData);
        console.log(`✅ Created case: ${caseData.title}`);
      } else {
        console.log(`ℹ️  Case already exists: ${caseData.title}`);
      }
    }
    
    console.log('✅ Cases seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding cases:', error);
    throw error;
  }
}
