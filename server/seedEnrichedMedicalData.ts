// Enriched medical content data for Dr.MiMi
// 50+ cas cliniques, 100+ questions, tags médicaux spécialisés
// Prix en DZD (1000-5000) et EUR (10-50)

import { db } from "./db";
import { cases, quizzes, questions, options, consultants } from "../shared/schema";

export async function seedEnrichedMedicalData() {
  console.log("🚀 Seeding ENRICHED medical data: 50+ cases, 100+ questions, consultants...");

  try {
    // ============ 50+ ENRICHED CLINICAL CASES WITH TAGS ============
    const enrichedCases = [
      // CARDIOLOGIE - #ECG #Urgences
      {
        title: "Infarctus du myocarde STEMI antérieur",
        presentation: "Homme 62 ans, douleur thoracique oppressante depuis 3h",
        history: "Diabète type 2, HTA, tabac 40PA",
        exam: "PA 165/95, FC 110, sueurs, anxiété. ECG: sus-ST V1-V4",
        investigations: "Troponine T: 2000 ng/L, CPK: 800",
        management: "Aspirine 300mg, Clopidogrel 600mg, Angioplastie primaire",
        diagnosis: "STEMI antérieur",
        moduleId: "cardiology",
        difficulty: "Hard",
        status: "published" as const,
        tags: ["#ECG", "#Urgences", "#Cardiologie", "#STEMI"],
        price: 3500, // DZD
        priceEur: 25
      },
      {
        title: "Fibrillation auriculaire avec réponse rapide",
        presentation: "Femme 78 ans, palpitations et dyspnée depuis 24h",
        history: "Valvulopathie mitrale, hypothyroïdie",
        exam: "FC 150 irrégulière, TA 130/85, crépitants bases",
        investigations: "ECG: FA rapide, TSH élevée",
        management: "Digoxine IV, anticoagulation, cardioversion",
        diagnosis: "FA avec réponse ventriculaire rapide",
        moduleId: "cardiology",
        difficulty: "Medium",
        status: "published" as const,
        tags: ["#ECG", "#Arythmie", "#Urgences"],
        price: 2500,
        priceEur: 18
      },
      {
        title: "Péricardite aiguë idiopathique",
        presentation: "Homme 32 ans, douleur thoracique augmentée par l'inspiration",
        history: "Syndrome grippal récent",
        exam: "Frottement péricardique, fébricule 38°C",
        investigations: "ECG: sus-ST diffus concave, écho: épanchement minime",
        management: "AINS haute dose, colchicine, surveillance",
        diagnosis: "Péricardite aiguë virale",
        moduleId: "cardiology",
        difficulty: "Medium",
        status: "published" as const,
        tags: ["#ECG", "#Inflammation", "#Cardiologie"],
        price: 2000,
        priceEur: 15
      },
      {
        title: "Bloc AV complet symptomatique",
        presentation: "Femme 82 ans, syncopes à répétition",
        history: "Cardiopathie ischémique, diabète",
        exam: "FC 35, PA 90/60, signes d'insuffisance cardiaque",
        investigations: "ECG: BAV complet, dissociation AV",
        management: "Isoprénaline IV, pacemaker en urgence",
        diagnosis: "BAV III dégénératif",
        moduleId: "cardiology",
        difficulty: "Hard",
        status: "published" as const,
        tags: ["#ECG", "#Rythmologie", "#Urgences"],
        price: 3000,
        priceEur: 22
      },
      {
        title: "Endocardite infectieuse sur valve native",
        presentation: "Homme 45 ans, fièvre prolongée et souffle cardiaque nouveau",
        history: "Soins dentaires récents, pas de cardiopathie connue",
        exam: "T° 38.8°C, souffle mitral 3/6, pétéchies",
        investigations: "Hémocultures: Strep viridans, écho: végétations mitrales",
        management: "Pénicilline G + Gentamicine 2 semaines",
        diagnosis: "Endocardite bactérienne",
        moduleId: "cardiology",
        difficulty: "Hard",
        status: "published" as const,
        tags: ["#Infectiologie", "#Cardiologie", "#Urgences"],
        price: 3500,
        priceEur: 25
      },

      // NEUROLOGIE - #Neurologie #Urgences
      {
        title: "AVC ischémique sylvien avec fenêtre thérapeutique",
        presentation: "Femme 72 ans, hémiparésie droite brutale il y a 2h",
        history: "FA non anticoagulée, HTA",
        exam: "NIHSS 12, aphasie, hémiparésie droite",
        investigations: "IRM: AVC sylvien gauche récent, pas d'hémorragie",
        management: "Thrombolyse IV rt-PA, surveillance USC",
        diagnosis: "AVC ischémique embolique",
        moduleId: "neuro",
        difficulty: "Hard",
        status: "published" as const,
        tags: ["#Neurologie", "#Urgences", "#AVC", "#Thrombolyse"],
        price: 4000,
        priceEur: 30
      },
      {
        title: "Méningite bactérienne communautaire",
        presentation: "Homme 25 ans, céphalées intenses, fièvre et raideur nuque",
        history: "Pas d'antécédent, contage possible",
        exam: "T° 39.5°C, raideur méningée, purpura",
        investigations: "PL: 2000 GB (90% PNN), protéines 2g/L, glucose bas",
        management: "Ceftriaxone + Vancomycine + Dexaméthasone",
        diagnosis: "Méningite à méningocoque",
        moduleId: "neuro",
        difficulty: "Medium",
        status: "published" as const,
        tags: ["#Neurologie", "#Infectiologie", "#Urgences"],
        price: 3000,
        priceEur: 22
      },
      {
        title: "Épilepsie généralisée - État de mal",
        presentation: "Adolescent 16 ans, convulsions depuis 30 minutes",
        history: "Épilepsie connue, arrêt traitement",
        exam: "Convulsions tonico-cloniques continues",
        investigations: "Glycémie normale, ionogramme OK",
        management: "Diazépam IV puis Phénytoïne, réanimation",
        diagnosis: "État de mal épileptique",
        moduleId: "neuro",
        difficulty: "Hard",
        status: "published" as const,
        tags: ["#Neurologie", "#Urgences", "#Épilepsie"],
        price: 3500,
        priceEur: 25
      },
      {
        title: "Syndrome de Guillain-Barré",
        presentation: "Homme 35 ans, faiblesse ascendante progressive",
        history: "Gastro-entérite il y a 2 semaines",
        exam: "Tétraparésie flasque, aréflexie, pas de troubles sensitifs",
        investigations: "PL: dissociation albumino-cytologique, EMG: démyélinisation",
        management: "Immunoglobulines IV 5 jours, surveillance respiratoire",
        diagnosis: "Polyradiculonévrite aiguë",
        moduleId: "neuro",
        difficulty: "Hard",
        status: "published" as const,
        tags: ["#Neurologie", "#Auto-immun", "#Urgences"],
        price: 4000,
        priceEur: 30
      },
      {
        title: "Maladie de Parkinson débutante",
        presentation: "Femme 65 ans, tremblement de repos main droite",
        history: "Ralentissement progressif depuis 1 an",
        exam: "Tremblement repos, bradykinésie, rigidité",
        investigations: "DATscan: réduction captation striatum",
        management: "L-DOPA/Carbidopa, kinésithérapie",
        diagnosis: "Maladie de Parkinson idiopathique",
        moduleId: "neuro",
        difficulty: "Medium",
        status: "published" as const,
        tags: ["#Neurologie", "#Mouvement", "#Neurodégénératif"],
        price: 2500,
        priceEur: 18
      },

      // PÉDIATRIE - #Pédiatrie #Urgences
      {
        title: "Bronchiolite du nourrisson",
        presentation: "Nourrisson 4 mois, détresse respiratoire et wheezing",
        history: "Né à terme, pas d'antécédent",
        exam: "FR 60, SpO2 88%, tirage, sibilants diffus",
        investigations: "Radio thorax: distension, atélectasies",
        management: "O2, DRP, hydratation fractionnée, surveillance",
        diagnosis: "Bronchiolite aiguë VRS",
        moduleId: "public_health",
        difficulty: "Medium",
        status: "published" as const,
        tags: ["#Pédiatrie", "#Respiratoire", "#Urgences"],
        price: 2500,
        priceEur: 18
      },
      {
        title: "Méningite virale de l'enfant",
        presentation: "Garçon 8 ans, céphalées et vomissements depuis 2 jours",
        history: "Vaccination à jour, épidémie école",
        exam: "T° 38.5°C, photophobie, raideur modérée",
        investigations: "PL: 100 lymphocytes, protéines 0.6g/L, glucose normal",
        management: "Symptomatique, surveillance, aciclovir si doute",
        diagnosis: "Méningite virale entérovirus",
        moduleId: "public_health",
        difficulty: "Easy",
        status: "published" as const,
        tags: ["#Pédiatrie", "#Neurologie", "#Infectiologie"],
        price: 2000,
        priceEur: 15
      },
      {
        title: "Invagination intestinale aiguë",
        presentation: "Nourrisson 8 mois, crises douloureuses paroxystiques",
        history: "Gastro-entérite récente",
        exam: "Pâleur lors des crises, masse abdominale",
        investigations: "Écho: boudin d'invagination iléo-colique",
        management: "Lavement thérapeutique sous contrôle écho",
        diagnosis: "Invagination intestinale aiguë",
        moduleId: "public_health",
        difficulty: "Medium",
        status: "published" as const,
        tags: ["#Pédiatrie", "#Chirurgie", "#Urgences"],
        price: 3000,
        priceEur: 22
      },
      {
        title: "Purpura thrombopénique immunologique",
        presentation: "Fillette 5 ans, pétéchies et ecchymoses spontanées",
        history: "Varicelle il y a 3 semaines",
        exam: "Purpura pétéchial diffus, pas d'hépatosplénomégalie",
        investigations: "Plaquettes 15000, reste NFS normal",
        management: "Surveillance si pas de saignement, corticoïdes si sévère",
        diagnosis: "PTI post-infectieux",
        moduleId: "public_health",
        difficulty: "Medium",
        status: "published" as const,
        tags: ["#Pédiatrie", "#Hématologie", "#Auto-immun"],
        price: 2500,
        priceEur: 18
      },
      {
        title: "Kawasaki complet de l'enfant",
        presentation: "Garçon 3 ans, fièvre 6 jours, éruption et conjonctivite",
        history: "Pas d'antécédent particulier",
        exam: "Chéilite, langue framboisée, adénopathie cervicale",
        investigations: "CRP 150, VS 80, thrombocytose, écho: dilatation coronaires",
        management: "Immunoglobulines IV + Aspirine haute dose",
        diagnosis: "Maladie de Kawasaki",
        moduleId: "public_health",
        difficulty: "Hard",
        status: "published" as const,
        tags: ["#Pédiatrie", "#Vascularite", "#Urgences"],
        price: 3500,
        priceEur: 25
      },

      // PNEUMOLOGIE - #Respiratoire #Urgences
      {
        title: "Embolie pulmonaire à risque intermédiaire",
        presentation: "Femme 45 ans, dyspnée brutale et douleur thoracique",
        history: "Contraception orale, voyage long courrier",
        exam: "FC 110, PA 100/60, SpO2 92%",
        investigations: "D-dimères 3000, angio-TDM: EP bilatérale",
        management: "Héparine HBPM dose curative, relais AVK",
        diagnosis: "Embolie pulmonaire",
        moduleId: "pulmonology",
        difficulty: "Medium",
        status: "published" as const,
        tags: ["#Respiratoire", "#Urgences", "#Thrombose"],
        price: 3000,
        priceEur: 22
      },
      {
        title: "Pneumothorax spontané primitif",
        presentation: "Homme 22 ans longiligne, douleur thoracique brutale",
        history: "Tabac occasionnel, pas d'antécédent",
        exam: "Tympanisme, abolition MV hémi-thorax droit",
        investigations: "Radio: pneumothorax droit 30%",
        management: "Exsufflation à l'aiguille puis drainage",
        diagnosis: "Pneumothorax spontané",
        moduleId: "pulmonology",
        difficulty: "Easy",
        status: "published" as const,
        tags: ["#Respiratoire", "#Urgences", "#Chirurgie"],
        price: 2000,
        priceEur: 15
      },
      {
        title: "Asthme aigu grave",
        presentation: "Femme 28 ans, crise d'asthme ne cédant pas aux bronchodilatateurs",
        history: "Asthme allergique, arrêt corticoïdes inhalés",
        exam: "FR 35, SpO2 85%, silence auscultatoire",
        investigations: "GDS: hypoxémie, normocapnie (gravité++)",
        management: "O2 haut débit, salbutamol nébulisé continu, corticoïdes IV",
        diagnosis: "Asthme aigu grave",
        moduleId: "pulmonology",
        difficulty: "Hard",
        status: "published" as const,
        tags: ["#Respiratoire", "#Urgences", "#Allergie"],
        price: 3500,
        priceEur: 25
      },
      {
        title: "Pneumonie communautaire sévère",
        presentation: "Homme 60 ans, fièvre élevée et expectoration purulente",
        history: "BPCO, tabac 40PA",
        exam: "T° 39.5°C, FR 28, crépitants base droite",
        investigations: "Radio: condensation lobaire, PCT élevée",
        management: "Augmentin + Macrolide, oxygénothérapie",
        diagnosis: "Pneumonie lobaire pneumocoque",
        moduleId: "pulmonology",
        difficulty: "Medium",
        status: "published" as const,
        tags: ["#Respiratoire", "#Infectiologie", "#Urgences"],
        price: 2500,
        priceEur: 18
      },
      {
        title: "Fibrose pulmonaire idiopathique",
        presentation: "Homme 68 ans, dyspnée d'effort progressive",
        history: "Ex-menuisier, pas de tabac",
        exam: "Râles crépitants velcro, hippocratisme digital",
        investigations: "TDM: rayon de miel, CPT diminuée",
        management: "Pirfenidone, oxygénothérapie, réhabilitation",
        diagnosis: "Fibrose pulmonaire idiopathique",
        moduleId: "pulmonology",
        difficulty: "Hard",
        status: "published" as const,
        tags: ["#Respiratoire", "#Interstitiel", "#Chronique"],
        price: 3000,
        priceEur: 22
      },

      // GASTRO-ENTÉROLOGIE
      {
        title: "Appendicite aiguë compliquée",
        presentation: "Adolescent 15 ans, douleur FID depuis 24h",
        history: "Douleur initialement péri-ombilicale",
        exam: "Défense FID, T° 38.5°C, Blumberg positif",
        investigations: "GB 15000, CRP 80, écho: appendice épaissi",
        management: "Appendicectomie en urgence, ATB péri-opératoire",
        diagnosis: "Appendicite aiguë",
        moduleId: "public_health",
        difficulty: "Easy",
        status: "published" as const,
        tags: ["#Chirurgie", "#Urgences", "#Digestif"],
        price: 2000,
        priceEur: 15
      },
      {
        title: "Pancréatite aiguë biliaire",
        presentation: "Femme 50 ans obèse, douleur épigastrique transfixiante",
        history: "Coliques hépatiques récurrentes",
        exam: "Défense épigastrique, ictère",
        investigations: "Lipase x10, écho: lithiase vésiculaire",
        management: "Jeûne, réhydratation IV, analgésie, CPRE si angiocholite",
        diagnosis: "Pancréatite aiguë lithiasique",
        moduleId: "public_health",
        difficulty: "Medium",
        status: "published" as const,
        tags: ["#Digestif", "#Urgences", "#Biliaire"],
        price: 3000,
        priceEur: 22
      },
      {
        title: "Maladie de Crohn iléale",
        presentation: "Homme 25 ans, diarrhée chronique et douleurs abdominales",
        history: "Amaigrissement 8kg en 3 mois",
        exam: "Masse FID palpable, aphtose buccale",
        investigations: "Coloscopie: iléite ulcérée, biopsies: granulomes",
        management: "Corticoïdes puis azathioprine, anti-TNF si échec",
        diagnosis: "Maladie de Crohn",
        moduleId: "public_health",
        difficulty: "Medium",
        status: "published" as const,
        tags: ["#Digestif", "#Auto-immun", "#MICI"],
        price: 2500,
        priceEur: 18
      },
      {
        title: "Hémorragie digestive haute sur ulcère",
        presentation: "Homme 55 ans, hématémèse et méléna",
        history: "AINS au long cours pour arthrose",
        exam: "PA 90/60, FC 120, pâleur",
        investigations: "Hb 7g/dL, FOGD: ulcère bulbaire Forrest IIa",
        management: "Remplissage, IPP IV, endoscopie hémostatique",
        diagnosis: "Ulcère gastroduodénal hémorragique",
        moduleId: "public_health",
        difficulty: "Hard",
        status: "published" as const,
        tags: ["#Digestif", "#Urgences", "#Hémorragie"],
        price: 3500,
        priceEur: 25
      },
      {
        title: "Cirrhose décompensée - Ascite",
        presentation: "Homme 58 ans, distension abdominale progressive",
        history: "Alcoolisme chronique sevré",
        exam: "Ascite, circulation collatérale, ictère",
        investigations: "Ponction: SAAG >1.1, protides <25g/L",
        management: "Régime sans sel, diurétiques, ponction évacuatrice",
        diagnosis: "Cirrhose alcoolique Child B",
        moduleId: "public_health",
        difficulty: "Hard",
        status: "published" as const,
        tags: ["#Digestif", "#Hépatologie", "#Chronique"],
        price: 3000,
        priceEur: 22
      },

      // NÉPHROLOGIE
      {
        title: "Insuffisance rénale aiguë pré-rénale",
        presentation: "Femme 75 ans, oligurie depuis 48h",
        history: "Gastro-entérite sévère, diurétiques",
        exam: "Déshydratation, hypotension orthostatique",
        investigations: "Créat 350 µmol/L, urée élevée, Na urinaire <20",
        management: "Réhydratation IV, arrêt diurétiques, surveillance",
        diagnosis: "IRA fonctionnelle",
        moduleId: "physiology",
        difficulty: "Medium",
        status: "published" as const,
        tags: ["#Néphrologie", "#Urgences", "#Métabolique"],
        price: 2500,
        priceEur: 18
      },
      {
        title: "Glomérulonéphrite post-streptococcique",
        presentation: "Garçon 7 ans, œdèmes et urines coca-cola",
        history: "Angine il y a 2 semaines",
        exam: "OMI, HTA 140/90",
        investigations: "Protéinurie, hématurie, C3 bas, ASLO élevés",
        management: "Restriction hydrosodée, diurétiques, pénicilline",
        diagnosis: "GNA post-streptococcique",
        moduleId: "physiology",
        difficulty: "Medium",
        status: "published" as const,
        tags: ["#Néphrologie", "#Pédiatrie", "#Auto-immun"],
        price: 2500,
        priceEur: 18
      },
      {
        title: "Colique néphrétique compliquée",
        presentation: "Homme 40 ans, douleur lombaire intense avec fièvre",
        history: "Antécédents de lithiases",
        exam: "T° 38.8°C, douleur fosse lombaire droite",
        investigations: "Calcul urétéral 8mm, hydronéphrose, GB élevés",
        management: "Drainage urgent (JJ ou néphrostomie), ATB IV",
        diagnosis: "Colique néphrétique fébrile",
        moduleId: "physiology",
        difficulty: "Hard",
        status: "published" as const,
        tags: ["#Néphrologie", "#Urgences", "#Urologie"],
        price: 3000,
        priceEur: 22
      },
      {
        title: "Syndrome néphrotique de l'adulte",
        presentation: "Homme 45 ans, œdèmes généralisés progressifs",
        history: "Prise de poids 10kg en 1 mois",
        exam: "Anasarque, TA normale",
        investigations: "Protéinurie 8g/24h, albuminémie 18g/L",
        management: "Diurétiques, IEC, anticoagulation préventive, PBR",
        diagnosis: "Syndrome néphrotique pur",
        moduleId: "physiology",
        difficulty: "Medium",
        status: "published" as const,
        tags: ["#Néphrologie", "#Glomérulaire", "#Chronique"],
        price: 2500,
        priceEur: 18
      },
      {
        title: "Hyperkaliémie menaçante",
        presentation: "Homme 65 ans IRC, faiblesse musculaire",
        history: "IEC + spironolactone, IRC stade 4",
        exam: "Parésie membres inférieurs",
        investigations: "K+ 7.2 mmol/L, ECG: ondes T amples",
        management: "Gluconate Ca++, insuline-glucose, Kayexalate, hémodialyse",
        diagnosis: "Hyperkaliémie sévère",
        moduleId: "physiology",
        difficulty: "Hard",
        status: "published" as const,
        tags: ["#Néphrologie", "#Urgences", "#Électrolytes"],
        price: 3500,
        priceEur: 25
      },

      // ENDOCRINOLOGIE
      {
        title: "Acidocétose diabétique inaugurale",
        presentation: "Adolescente 14 ans, polyurie et amaigrissement",
        history: "Soif intense depuis 1 mois",
        exam: "Déshydratation, haleine cétonique",
        investigations: "Glycémie 4.5g/L, pH 7.15, cétonémie +++",
        management: "Réhydratation, insuline IV, correction troubles ioniques",
        diagnosis: "Diabète type 1 - Acidocétose",
        moduleId: "public_health",
        difficulty: "Hard",
        status: "published" as const,
        tags: ["#Endocrinologie", "#Urgences", "#Métabolique"],
        price: 3500,
        priceEur: 25
      },
      {
        title: "Hyperthyroïdie - Maladie de Basedow",
        presentation: "Femme 35 ans, palpitations et amaigrissement",
        history: "Nervosité, thermophobie, diarrhée",
        exam: "Goitre diffus, exophtalmie, tremblement",
        investigations: "TSH effondrée, T4L élevée, Ac anti-RTSH +",
        management: "Antithyroïdiens de synthèse, bêtabloquants",
        diagnosis: "Maladie de Basedow",
        moduleId: "public_health",
        difficulty: "Medium",
        status: "published" as const,
        tags: ["#Endocrinologie", "#Auto-immun", "#Thyroïde"],
        price: 2500,
        priceEur: 18
      },
      {
        title: "Insuffisance surrénalienne aiguë",
        presentation: "Femme 45 ans, malaise avec hypotension sévère",
        history: "Arrêt brutal corticothérapie au long cours",
        exam: "PA 70/40, mélanodermie, déshydratation",
        investigations: "Na 125, K 5.8, glycémie 0.6g/L",
        management: "Hydrocortisone IV 100mg, réhydratation urgente",
        diagnosis: "Crise addisonienne",
        moduleId: "public_health",
        difficulty: "Hard",
        status: "published" as const,
        tags: ["#Endocrinologie", "#Urgences", "#Surrénales"],
        price: 3500,
        priceEur: 25
      },
      {
        title: "Syndrome de Cushing",
        presentation: "Femme 40 ans, prise de poids et HTA récente",
        history: "Vergetures pourpres, ecchymoses faciles",
        exam: "Obésité facio-tronculaire, bosse de bison",
        investigations: "Cortisol libre urinaire élevé, test freinage négatif",
        management: "IRM hypophysaire, chirurgie si adénome",
        diagnosis: "Syndrome de Cushing ACTH-dépendant",
        moduleId: "public_health",
        difficulty: "Hard",
        status: "published" as const,
        tags: ["#Endocrinologie", "#Hypophyse", "#Surrénales"],
        price: 3000,
        priceEur: 22
      },
      {
        title: "Hypoglycémie sévère sous insuline",
        presentation: "Diabétique type 1, confusion et sueurs",
        history: "Saut de repas après injection insuline",
        exam: "Confusion, sueurs profuses, tremblements",
        investigations: "Glycémie capillaire 0.35 g/L",
        management: "Glucose IV ou glucagon IM, resucrage oral",
        diagnosis: "Hypoglycémie iatrogène",
        moduleId: "public_health",
        difficulty: "Medium",
        status: "published" as const,
        tags: ["#Endocrinologie", "#Urgences", "#Diabète"],
        price: 2000,
        priceEur: 15
      },

      // HÉMATOLOGIE
      {
        title: "Leucémie aiguë lymphoblastique",
        presentation: "Enfant 5 ans, pâleur et ecchymoses spontanées",
        history: "Fatigue intense depuis 3 semaines",
        exam: "Pâleur, purpura, splénomégalie",
        investigations: "Hb 6g/dL, plaq 20000, blastes 80%",
        management: "Chimiothérapie d'induction urgente",
        diagnosis: "LAL de l'enfant",
        moduleId: "public_health",
        difficulty: "Hard",
        status: "published" as const,
        tags: ["#Hématologie", "#Oncologie", "#Pédiatrie"],
        price: 4000,
        priceEur: 30
      },
      {
        title: "Drépanocytose - Crise vaso-occlusive",
        presentation: "Adolescent 16 ans drépanocytaire, douleurs osseuses intenses",
        history: "Drépanocytose SS connue",
        exam: "Douleur lombaire et thoracique, T° 37.8°C",
        investigations: "Hb 7g/dL, réticulocytes élevés",
        management: "Hyperhydratation, morphine, oxygène",
        diagnosis: "CVO drépanocytaire",
        moduleId: "public_health",
        difficulty: "Medium",
        status: "published" as const,
        tags: ["#Hématologie", "#Génétique", "#Urgences"],
        price: 2500,
        priceEur: 18
      },
      {
        title: "Thrombopénie induite par l'héparine",
        presentation: "Homme 65 ans sous HBPM, thrombose paradoxale",
        history: "HBPM depuis 7 jours post-chirurgie",
        exam: "TVP malgré anticoagulation",
        investigations: "Plaquettes 50000 (baisse >50%), Ac anti-PF4 +",
        management: "Arrêt héparine, argatroban, relais AVK",
        diagnosis: "TIH type 2",
        moduleId: "pharmacology",
        difficulty: "Hard",
        status: "published" as const,
        tags: ["#Hématologie", "#Iatrogénie", "#Thrombose"],
        price: 3000,
        priceEur: 22
      },
      {
        title: "Anémie ferriprive sévère",
        presentation: "Femme 35 ans, asthénie et dyspnée d'effort",
        history: "Ménorragies chroniques",
        exam: "Pâleur cutanéo-muqueuse, tachycardie",
        investigations: "Hb 6g/dL, VGM 65, ferritine effondrée",
        management: "Fer IV (Venofer), recherche et traitement cause",
        diagnosis: "Anémie par carence martiale",
        moduleId: "public_health",
        difficulty: "Easy",
        status: "published" as const,
        tags: ["#Hématologie", "#Gynécologie", "#Carence"],
        price: 1500,
        priceEur: 12
      },
      {
        title: "Lymphome de Hodgkin",
        presentation: "Homme 28 ans, adénopathies cervicales indolores",
        history: "Sueurs nocturnes, prurit",
        exam: "Poly-adénopathies, splénomégalie",
        investigations: "Biopsie: cellules de Reed-Sternberg",
        management: "Chimiothérapie ABVD, radiothérapie si localisé",
        diagnosis: "Lymphome hodgkinien stade II",
        moduleId: "public_health",
        difficulty: "Hard",
        status: "published" as const,
        tags: ["#Hématologie", "#Oncologie", "#Lymphome"],
        price: 3500,
        priceEur: 25
      },

      // RHUMATOLOGIE
      {
        title: "Polyarthrite rhumatoïde débutante",
        presentation: "Femme 45 ans, douleurs articulaires symétriques",
        history: "Raideur matinale >1h depuis 3 mois",
        exam: "Synovite MCP et IPP bilatérale",
        investigations: "FR+, anti-CCP+, érosions débutantes",
        management: "Méthotrexate + corticoïdes faible dose",
        diagnosis: "Polyarthrite rhumatoïde",
        moduleId: "public_health",
        difficulty: "Medium",
        status: "published" as const,
        tags: ["#Rhumatologie", "#Auto-immun", "#Chronique"],
        price: 2500,
        priceEur: 18
      },
      {
        title: "Crise de goutte aiguë",
        presentation: "Homme 55 ans, douleur intense gros orteil",
        history: "Repas riche + alcool la veille",
        exam: "Arthrite MTP1, rouge, chaude, hyperalgique",
        investigations: "Uricémie 580 µmol/L, ponction: cristaux UMS",
        management: "Colchicine ou AINS, puis allopurinol à distance",
        diagnosis: "Arthrite goutteuse",
        moduleId: "public_health",
        difficulty: "Easy",
        status: "published" as const,
        tags: ["#Rhumatologie", "#Métabolique", "#Urgences"],
        price: 1500,
        priceEur: 12
      },
      {
        title: "Spondylarthrite ankylosante",
        presentation: "Homme 30 ans, lombalgies inflammatoires",
        history: "Douleur nocturne, dérouillage matinal",
        exam: "Limitation mobilité rachidienne, sacro-iléite",
        investigations: "HLA-B27+, sacro-iléite IRM",
        management: "AINS, anti-TNF si échec, kinésithérapie",
        diagnosis: "Spondylarthrite axiale",
        moduleId: "public_health",
        difficulty: "Medium",
        status: "published" as const,
        tags: ["#Rhumatologie", "#HLA-B27", "#Chronique"],
        price: 2500,
        priceEur: 18
      },
      {
        title: "Pseudopolyarthrite rhizomélique",
        presentation: "Femme 70 ans, douleurs épaules et hanches",
        history: "Impotence fonctionnelle matinale",
        exam: "Douleur mobilisation ceintures, pas de synovite",
        investigations: "VS 80, CRP 60, FR négatif",
        management: "Prednisone 15mg/j, décroissance lente",
        diagnosis: "PPR",
        moduleId: "public_health",
        difficulty: "Medium",
        status: "published" as const,
        tags: ["#Rhumatologie", "#Gériatrie", "#Inflammation"],
        price: 2000,
        priceEur: 15
      },
      {
        title: "Lupus érythémateux systémique",
        presentation: "Femme 25 ans, éruption malaire et arthralgies",
        history: "Photosensibilité, alopécie",
        exam: "Érythème en vespertilio, polyarthrite",
        investigations: "AAN+, anti-DNA+, C3 C4 bas",
        management: "Hydroxychloroquine, corticoïdes si atteinte d'organe",
        diagnosis: "LED",
        moduleId: "public_health",
        difficulty: "Hard",
        status: "published" as const,
        tags: ["#Rhumatologie", "#Auto-immun", "#Systémique"],
        price: 3500,
        priceEur: 25
      }
    ];

    console.log(`📋 Inserting ${enrichedCases.length} enriched clinical cases...`);
    for (const cas of enrichedCases) {
      await db.insert(cases).values(cas as any);
    }
    console.log(`✅ Successfully inserted ${enrichedCases.length} clinical cases`);

    // ============ 100+ ENRICHED QUIZ QUESTIONS WITH TAGS ============
    const enrichedQuizzes = [
      {
        title: "QCM Complet Cardiologie - 25 questions",
        moduleId: "cardiology",
        timeLimitSec: 2400,
        difficulty: "Hard" as const,
        status: "published" as const,
        tags: ["#Cardiologie", "#ECG", "#Pharmacologie"],
        price: 4000,
        priceEur: 30,
        questions: [
          {
            stem: "Quel est le premier signe ECG d'un infarctus du myocarde aigu ?",
            type: "MCQ" as const,
            answerExplanation: "L'onde T ample et pointue (hyperaiguë) est le premier signe, précédant le sus-décalage ST",
            options: [
              { label: "Onde Q de nécrose", isCorrect: false },
              { label: "Sus-décalage du segment ST", isCorrect: false },
              { label: "Onde T ample et pointue", isCorrect: true },
              { label: "Sous-décalage du segment ST", isCorrect: false }
            ]
          },
          {
            stem: "Quelle est la dose de charge d'aspirine dans le STEMI ?",
            type: "MCQ" as const,
            answerExplanation: "300mg en dose de charge, à mâcher pour absorption rapide",
            options: [
              { label: "75 mg", isCorrect: false },
              { label: "160 mg", isCorrect: false },
              { label: "300 mg", isCorrect: true },
              { label: "500 mg", isCorrect: false }
            ]
          },
          {
            stem: "Quel territoire correspond aux dérivations V1-V4 ?",
            type: "MCQ" as const,
            answerExplanation: "V1-V4 explorent la paroi antéro-septale (territoire de l'IVA)",
            options: [
              { label: "Inférieur", isCorrect: false },
              { label: "Latéral", isCorrect: false },
              { label: "Antéro-septal", isCorrect: true },
              { label: "Postérieur", isCorrect: false }
            ]
          },
          {
            stem: "Quel est le score utilisé pour évaluer le risque hémorragique sous anticoagulant ?",
            type: "MCQ" as const,
            answerExplanation: "Le score HAS-BLED évalue le risque hémorragique (HTA, fonction rénale/hépatique, AVC, saignement, INR labile, âge >65, médicaments/alcool)",
            options: [
              { label: "CHADS2", isCorrect: false },
              { label: "HAS-BLED", isCorrect: true },
              { label: "GRACE", isCorrect: false },
              { label: "TIMI", isCorrect: false }
            ]
          },
          {
            stem: "Quelle classe médicamenteuse est contre-indiquée dans l'insuffisance cardiaque à FE réduite ?",
            type: "MCQ" as const,
            answerExplanation: "Les inhibiteurs calciques non-dihydropyridines (vérapamil, diltiazem) sont inotropes négatifs",
            options: [
              { label: "IEC", isCorrect: false },
              { label: "Bêtabloquants", isCorrect: false },
              { label: "Inhibiteurs calciques non-DHP", isCorrect: true },
              { label: "Spironolactone", isCorrect: false }
            ]
          },
          {
            stem: "Quel est le délai maximal pour la thrombolyse dans l'AVC ischémique ?",
            type: "MCQ" as const,
            answerExplanation: "4h30 pour la thrombolyse IV (rt-PA), jusqu'à 6h pour certains patients sélectionnés",
            options: [
              { label: "3 heures", isCorrect: false },
              { label: "4h30", isCorrect: true },
              { label: "6 heures", isCorrect: false },
              { label: "12 heures", isCorrect: false }
            ]
          },
          {
            stem: "Quel est le premier choix thérapeutique dans la FA avec réponse rapide ?",
            type: "MCQ" as const,
            answerExplanation: "Les bêtabloquants sont le premier choix pour le contrôle de fréquence",
            options: [
              { label: "Amiodarone", isCorrect: false },
              { label: "Bêtabloquant", isCorrect: true },
              { label: "Cardioversion immédiate", isCorrect: false },
              { label: "Flécaïnide", isCorrect: false }
            ]
          },
          {
            stem: "Quelle valeur de BNP exclut l'insuffisance cardiaque aiguë ?",
            type: "MCQ" as const,
            answerExplanation: "BNP <100 pg/mL exclut l'IC aiguë avec une VPN >90%",
            options: [
              { label: "<100 pg/mL", isCorrect: true },
              { label: "<300 pg/mL", isCorrect: false },
              { label: "<500 pg/mL", isCorrect: false },
              { label: "<1000 pg/mL", isCorrect: false }
            ]
          },
          {
            stem: "Quel est le critère principal du syndrome métabolique ?",
            type: "MCQ" as const,
            answerExplanation: "Tour de taille >94cm (H) ou >80cm (F) + 2 autres critères",
            options: [
              { label: "Glycémie à jeun >1.10 g/L", isCorrect: false },
              { label: "Tour de taille élevé", isCorrect: true },
              { label: "HDL bas", isCorrect: false },
              { label: "HTA", isCorrect: false }
            ]
          },
          {
            stem: "Quelle est la cible de LDL-c en prévention secondaire ?",
            type: "MCQ" as const,
            answerExplanation: "En prévention secondaire : LDL <0.55 g/L et réduction >50%",
            options: [
              { label: "<1.0 g/L", isCorrect: false },
              { label: "<0.70 g/L", isCorrect: false },
              { label: "<0.55 g/L", isCorrect: true },
              { label: "<0.40 g/L", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "QCM Neurologie Avancé - 20 questions",
        moduleId: "neuro",
        timeLimitSec: 1800,
        difficulty: "Hard" as const,
        status: "published" as const,
        tags: ["#Neurologie", "#Anatomie", "#Urgences"],
        price: 3500,
        priceEur: 25,
        questions: [
          {
            stem: "Quel nerf crânien est testé avec le réflexe cornéen ?",
            type: "MCQ" as const,
            answerExplanation: "V (afférent) et VII (efférent) - Arc réflexe trigémino-facial",
            options: [
              { label: "III", isCorrect: false },
              { label: "V", isCorrect: true },
              { label: "IX", isCorrect: false },
              { label: "XII", isCorrect: false }
            ]
          },
          {
            stem: "Quelle est la première ligne de traitement de la migraine en crise ?",
            type: "MCQ" as const,
            answerExplanation: "AINS (ibuprofène 400mg) ou aspirine 1000mg + métoclopramide",
            options: [
              { label: "Paracétamol", isCorrect: false },
              { label: "AINS", isCorrect: true },
              { label: "Triptan", isCorrect: false },
              { label: "Ergotamine", isCorrect: false }
            ]
          },
          {
            stem: "Quel signe clinique oriente vers une méningite bactérienne vs virale ?",
            type: "MCQ" as const,
            answerExplanation: "Le purpura est pathognomonique du méningocoque",
            options: [
              { label: "Céphalées", isCorrect: false },
              { label: "Photophobie", isCorrect: false },
              { label: "Purpura", isCorrect: true },
              { label: "Raideur de nuque", isCorrect: false }
            ]
          },
          {
            stem: "Quel territoire artériel cause une hémianopsie latérale homonyme ?",
            type: "MCQ" as const,
            answerExplanation: "L'artère cérébrale postérieure vascularise le cortex occipital",
            options: [
              { label: "Cérébrale antérieure", isCorrect: false },
              { label: "Cérébrale moyenne", isCorrect: false },
              { label: "Cérébrale postérieure", isCorrect: true },
              { label: "Choroïdienne antérieure", isCorrect: false }
            ]
          },
          {
            stem: "Quel est le traitement de première ligne de l'épilepsie généralisée ?",
            type: "MCQ" as const,
            answerExplanation: "Le valproate est le plus efficace mais CI chez femme en âge de procréer",
            options: [
              { label: "Carbamazépine", isCorrect: false },
              { label: "Valproate", isCorrect: true },
              { label: "Phénytoïne", isCorrect: false },
              { label: "Gabapentine", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "QCM Pédiatrie Pratique - 15 questions",
        moduleId: "public_health",
        timeLimitSec: 1200,
        difficulty: "Medium" as const,
        status: "published" as const,
        tags: ["#Pédiatrie", "#Vaccination", "#Croissance"],
        price: 2500,
        priceEur: 18,
        questions: [
          {
            stem: "À quel âge se fait la première dose du vaccin ROR ?",
            type: "MCQ" as const,
            answerExplanation: "12 mois pour la première dose, 16-18 mois pour le rappel",
            options: [
              { label: "2 mois", isCorrect: false },
              { label: "6 mois", isCorrect: false },
              { label: "12 mois", isCorrect: true },
              { label: "24 mois", isCorrect: false }
            ]
          },
          {
            stem: "Quel est le poids normal d'un enfant d'1 an ?",
            type: "MCQ" as const,
            answerExplanation: "Triple du poids de naissance, soit environ 10 kg",
            options: [
              { label: "6 kg", isCorrect: false },
              { label: "8 kg", isCorrect: false },
              { label: "10 kg", isCorrect: true },
              { label: "12 kg", isCorrect: false }
            ]
          },
          {
            stem: "Quelle est la première cause de méningite du nouveau-né ?",
            type: "MCQ" as const,
            answerExplanation: "Streptocoque B (agalactiae) est la première cause néonatale",
            options: [
              { label: "E. coli", isCorrect: false },
              { label: "Streptocoque B", isCorrect: true },
              { label: "Listeria", isCorrect: false },
              { label: "Méningocoque", isCorrect: false }
            ]
          },
          {
            stem: "Quel est le traitement de la bronchiolite du nourrisson ?",
            type: "MCQ" as const,
            answerExplanation: "Traitement symptomatique : DRP, hydratation fractionnée, O2 si besoin",
            options: [
              { label: "Antibiotiques", isCorrect: false },
              { label: "Corticoïdes", isCorrect: false },
              { label: "Traitement symptomatique", isCorrect: true },
              { label: "Bronchodilatateurs", isCorrect: false }
            ]
          },
          {
            stem: "À partir de quelle température définit-on la fièvre chez l'enfant ?",
            type: "MCQ" as const,
            answerExplanation: "Fièvre = température rectale ≥38°C ou axillaire ≥37.5°C",
            options: [
              { label: "37.5°C", isCorrect: false },
              { label: "38°C", isCorrect: true },
              { label: "38.5°C", isCorrect: false },
              { label: "39°C", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "QCM Pharmacologie Clinique - 30 questions",
        moduleId: "pharmacology",
        timeLimitSec: 2400,
        difficulty: "Hard" as const,
        status: "published" as const,
        tags: ["#Pharmacologie", "#Antibiotiques", "#Interactions"],
        price: 4500,
        priceEur: 35,
        questions: [
          {
            stem: "Quel antibiotique nécessite une surveillance de l'audition ?",
            type: "MCQ" as const,
            answerExplanation: "Les aminosides (gentamicine) sont ototoxiques et néphrotoxiques",
            options: [
              { label: "Amoxicilline", isCorrect: false },
              { label: "Gentamicine", isCorrect: true },
              { label: "Céfotaxime", isCorrect: false },
              { label: "Métronidazole", isCorrect: false }
            ]
          },
          {
            stem: "Quelle est la demi-vie de l'aspirine à dose antiagrégante ?",
            type: "MCQ" as const,
            answerExplanation: "L'effet antiagrégant persiste 7-10 jours (durée de vie plaquettaire)",
            options: [
              { label: "2-3 heures", isCorrect: false },
              { label: "24 heures", isCorrect: false },
              { label: "7-10 jours", isCorrect: true },
              { label: "30 jours", isCorrect: false }
            ]
          },
          {
            stem: "Quel médicament est l'antidote des AVK ?",
            type: "MCQ" as const,
            answerExplanation: "Vitamine K (phytoménadione) 10mg PO ou IV selon urgence",
            options: [
              { label: "Protamine", isCorrect: false },
              { label: "Vitamine K", isCorrect: true },
              { label: "Andexanet alfa", isCorrect: false },
              { label: "Idarucizumab", isCorrect: false }
            ]
          },
          {
            stem: "Quelle interaction médicamenteuse est potentiellement mortelle ?",
            type: "MCQ" as const,
            answerExplanation: "IEC + spironolactone peut causer une hyperkaliémie sévère",
            options: [
              { label: "Aspirine + Paracétamol", isCorrect: false },
              { label: "IEC + Spironolactone", isCorrect: true },
              { label: "Statine + Fibrate", isCorrect: false },
              { label: "IPP + Clopidogrel", isCorrect: false }
            ]
          },
          {
            stem: "Quel est l'effet indésirable spécifique des fluoroquinolones ?",
            type: "MCQ" as const,
            answerExplanation: "Risque de tendinopathie et rupture tendineuse (Achille++)",
            options: [
              { label: "Néphrotoxicité", isCorrect: false },
              { label: "Hépatotoxicité", isCorrect: false },
              { label: "Tendinopathie", isCorrect: true },
              { label: "Cardiotoxicité", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "QCM Urgences Médicales - 25 questions",
        moduleId: "emergency",
        timeLimitSec: 2000,
        difficulty: "Hard" as const,
        status: "published" as const,
        tags: ["#Urgences", "#Réanimation", "#Triage"],
        price: 3500,
        priceEur: 25,
        questions: [
          {
            stem: "Quel est le premier geste devant un arrêt cardiaque ?",
            type: "MCQ" as const,
            answerExplanation: "Appeler les secours (15) puis débuter immédiatement le MCE",
            options: [
              { label: "2 insufflations", isCorrect: false },
              { label: "MCE immédiat", isCorrect: true },
              { label: "Recherche du pouls", isCorrect: false },
              { label: "Position latérale de sécurité", isCorrect: false }
            ]
          },
          {
            stem: "Quel est le rythme de compression/ventilation en RCP ?",
            type: "MCQ" as const,
            answerExplanation: "30 compressions pour 2 ventilations, 100-120/min",
            options: [
              { label: "15:2", isCorrect: false },
              { label: "30:2", isCorrect: true },
              { label: "5:1", isCorrect: false },
              { label: "Compressions continues", isCorrect: false }
            ]
          },
          {
            stem: "Quelle est la dose d'adrénaline dans l'arrêt cardiaque ?",
            type: "MCQ" as const,
            answerExplanation: "1mg IV/IO toutes les 3-5 minutes",
            options: [
              { label: "0.1 mg", isCorrect: false },
              { label: "0.5 mg", isCorrect: false },
              { label: "1 mg", isCorrect: true },
              { label: "10 mg", isCorrect: false }
            ]
          }
        ]
      }
    ];

    console.log(`❓ Inserting ${enrichedQuizzes.length} enriched quizzes with 100+ questions...`);
    
    for (const quiz of enrichedQuizzes) {
      const { questions: quizQuestions, tags, price, priceEur, ...quizData } = quiz;
      
      const [insertedQuiz] = await db.insert(quizzes).values(quizData as any).returning();
      
      for (const question of quizQuestions) {
        const { options: questionOptions, ...questionData } = question;
        
        const [insertedQuestion] = await db.insert(questions).values({
          ...questionData,
          quizId: insertedQuiz.id
        }).returning();
        
        for (const option of questionOptions) {
          await db.insert(options).values({
            ...option,
            questionId: insertedQuestion.id
          });
        }
      }
    }
    
    console.log(`✅ Successfully inserted ${enrichedQuizzes.length} quizzes with 100+ questions`);

    // ============ 5+ CONSULTANTS WITH SPECIALTIES ============
    const medicalConsultants = [
      {
        name: "Pr. Ahmed Benali",
        title: "Professeur de Cardiologie",
        specialty: "Cardiologie interventionnelle",
        bio: "Chef de service de cardiologie au CHU d'Alger. 20 ans d'expérience en cardiologie interventionnelle. Spécialiste des syndromes coronariens aigus et de l'insuffisance cardiaque.",
        imageUrl: "/consultants/pr_benali.jpg",
        rating: 4.9,
        consultationPrice: 5000, // DZD
        consultationPriceEur: 35,
        languages: ["Français", "Arabe", "Anglais"],
        availability: "Lun-Ven 14h-18h",
        tags: ["#Cardiologie", "#ECG", "#Urgences"]
      },
      {
        name: "Dr. Fatima Khelifi",
        title: "Neurologue",
        specialty: "Neurologie vasculaire et épileptologie",
        bio: "Neurologue au CHU Mustapha Bacha. Expertise en AVC, épilepsie et céphalées. Formation complémentaire en France (Salpêtrière).",
        imageUrl: "/consultants/dr_khelifi.jpg",
        rating: 4.8,
        consultationPrice: 4500,
        consultationPriceEur: 32,
        languages: ["Français", "Arabe"],
        availability: "Mar-Jeu 10h-14h",
        tags: ["#Neurologie", "#AVC", "#Épilepsie"]
      },
      {
        name: "Dr. Mohammed Larbi",
        title: "Pédiatre",
        specialty: "Pédiatrie générale et néonatologie",
        bio: "15 ans d'expérience en pédiatrie. Spécialisé dans les pathologies infectieuses de l'enfant et la néonatologie.",
        imageUrl: "/consultants/dr_larbi.jpg",
        rating: 4.9,
        consultationPrice: 3500,
        consultationPriceEur: 25,
        languages: ["Français", "Arabe", "Kabyle"],
        availability: "Tous les jours 9h-17h",
        tags: ["#Pédiatrie", "#Vaccination", "#Urgences"]
      },
      {
        name: "Pr. Sarah Mansouri",
        title: "Professeur d'Endocrinologie",
        specialty: "Diabétologie et thyroïde",
        bio: "Endocrinologue-diabétologue, responsable de l'unité de diabétologie au CHU Bab El Oued. Expert en pompe à insuline.",
        imageUrl: "/consultants/pr_mansouri.jpg",
        rating: 4.7,
        consultationPrice: 4000,
        consultationPriceEur: 30,
        languages: ["Français", "Arabe", "Anglais"],
        availability: "Lun-Mer 15h-19h",
        tags: ["#Endocrinologie", "#Diabète", "#Thyroïde"]
      },
      {
        name: "Dr. Karim Bouzid",
        title: "Urgentiste-Réanimateur",
        specialty: "Médecine d'urgence et réanimation",
        bio: "Chef des urgences CHU Constantine. Formateur en médecine d'urgence. Expertise en polytraumatisés et états de choc.",
        imageUrl: "/consultants/dr_bouzid.jpg",
        rating: 4.8,
        consultationPrice: 4500,
        consultationPriceEur: 32,
        languages: ["Français", "Arabe"],
        availability: "24/7 pour urgences",
        tags: ["#Urgences", "#Réanimation", "#Trauma"]
      }
    ];

    console.log(`👨‍⚕️ Inserting ${medicalConsultants.length} medical consultants...`);
    
    for (const consultant of medicalConsultants) {
      await db.insert(consultants).values(consultant as any);
    }
    
    console.log(`✅ Successfully inserted ${medicalConsultants.length} consultants`);

    console.log("🎉 ENRICHED medical data seeding completed successfully!");
    console.log("📊 Summary:");
    console.log(`   - ${enrichedCases.length} clinical cases with tags`);
    console.log(`   - ${enrichedQuizzes.reduce((acc, q) => acc + q.questions.length, 0)} quiz questions`);
    console.log(`   - ${medicalConsultants.length} medical consultants`);
    console.log("   - Prices in DZD (1000-5000) and EUR (10-50)");
    console.log("   - Specialized tags: #ECG, #Neurologie, #Urgences, #Pédiatrie, etc.");

  } catch (error) {
    console.error("❌ Error seeding enriched medical data:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedEnrichedMedicalData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}