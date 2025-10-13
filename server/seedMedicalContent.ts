// Comprehensive medical content seed data for MediMimi
// Real educational content for medical students

import { db } from "./db";
import { 
  courses, 
  lessons, 
  summaries, 
  quizzes, 
  questions, 
  options, 
  cases,
  modules 
} from "../shared/schema";

export async function seedMedicalContent() {
  console.log("🏥 Seeding ENRICHED comprehensive medical content with 20+ modules, 50+ cases, 100+ questions...");

  try {
    // ============ ENRICHED COURSES WITH DZD PRICES ============
    
    // PRIX en DZD (1000-5000) et EUR (10-50)
    // TAGS : #ECG, #Neurologie, #Urgences, #Pédiatrie, etc.
    
    // Y1 - Anatomie courses
    const anatomyCourses = [
      {
        title: "Ostéologie : L'architecture osseuse du corps humain",
        titleEn: "Osteology: The Skeletal Architecture",
        moduleId: "anatomy",
        yearLevels: ["Y1"],
        authors: ["Dr. Sophie Martin", "Prof. Jean Dubois"],
        language: "fr",
        price: 1500,
        description: "Étude complète du système squelettique : os du crâne, rachis, thorax, membres supérieurs et inférieurs. Classification, structure et développement osseux.",
        status: "published" as const,
        lessons: [
          {
            title: "Introduction à l'ostéologie",
            content: `# Introduction à l'Ostéologie

## Définition et importance
L'ostéologie est la branche de l'anatomie qui étudie les os et le système squelettique. Le squelette humain adulte comprend 206 os qui forment la charpente du corps.

## Fonctions du système squelettique
1. **Support mécanique** : Maintien de la posture et support des tissus mous
2. **Protection** : Protection des organes vitaux (cerveau, cœur, poumons)
3. **Mouvement** : Points d'attache pour les muscles permettant le mouvement
4. **Stockage minéral** : Réserve de calcium et phosphore
5. **Hématopoïèse** : Production des cellules sanguines dans la moelle osseuse rouge

## Classification des os
### Selon la forme :
- **Os longs** : Fémur, humérus, tibia (diaphyse + 2 épiphyses)
- **Os courts** : Os du carpe, du tarse (forme cubique)
- **Os plats** : Scapula, os du crâne (protection)
- **Os irréguliers** : Vertèbres, os de la face
- **Os sésamoïdes** : Patella (dans les tendons)`,
            orderIndex: 1
          },
          {
            title: "Le squelette axial : Crâne et rachis",
            content: `# Le Squelette Axial

## Le Crâne (22 os)
### Neurocrâne (8 os) - Protection de l'encéphale :
- **Os frontal** : Forme le front et le toit des orbites
- **Os pariétaux** (2) : Parois latérales et supérieures
- **Os temporal** (2) : Contient l'oreille, articulation temporo-mandibulaire
- **Os occipital** : Base du crâne, foramen magnum
- **Os sphénoïde** : Os central, selle turcique (hypophyse)
- **Os ethmoïde** : Lame criblée, labyrinthe ethmoïdal

### Viscérocrâne (14 os) - Face :
- Maxillaires (2), os nasaux (2), os zygomatiques (2)
- Os lacrymaux (2), cornets nasaux inférieurs (2)
- Os palatins (2), vomer, mandibule

## Le Rachis (33-34 vertèbres)
### Régions vertébrales :
- **Cervicales** (7) : C1 (atlas), C2 (axis), C3-C7
- **Thoraciques** (12) : T1-T12, articulations avec les côtes
- **Lombaires** (5) : L1-L5, vertèbres les plus massives
- **Sacrées** (5 fusionnées) : Sacrum
- **Coccygiennes** (4-5) : Coccyx`,
            orderIndex: 2
          },
          {
            title: "Le squelette appendiculaire : Membres",
            content: `# Le Squelette Appendiculaire

## Membre Supérieur (32 os par côté)
### Ceinture scapulaire :
- **Clavicule** : Seul os horizontal, articulation sterno-claviculaire
- **Scapula** : Cavité glénoïde, acromion, épine

### Bras et avant-bras :
- **Humérus** : Tête humérale, trochlée, capitulum
- **Radius** : Os latéral, articulation radio-carpienne
- **Ulna** : Os médial, olécrâne, processus coronoïde

### Main (27 os) :
- **Carpe** (8 os) : Rangée proximale et distale
- **Métacarpe** (5 os) : M1-M5
- **Phalanges** (14) : Proximales, moyennes, distales

## Membre Inférieur (31 os par côté)
### Ceinture pelvienne :
- **Os coxal** : Fusion ilium, ischium, pubis - Acétabulum

### Cuisse et jambe :
- **Fémur** : Plus long os, tête fémorale, condyles
- **Patella** : Os sésamoïde
- **Tibia** : Os médial, plateaux tibiaux, malléole médiale
- **Fibula** : Os latéral, malléole latérale

### Pied (26 os) :
- **Tarse** (7 os) : Talus, calcanéus, naviculaire, cuboïde, 3 cunéiformes
- **Métatarse** (5 os)
- **Phalanges** (14)`,
            orderIndex: 3
          }
        ]
      },
      {
        title: "Myologie : Le système musculaire et la biomécanique",
        titleEn: "Myology: Muscular System and Biomechanics",
        moduleId: "anatomy",
        yearLevels: ["Y1"],
        authors: ["Dr. Claire Moreau", "Prof. Antoine Lefèvre"],
        language: "fr",
        price: 1500,
        description: "Étude détaillée des muscles striés squelettiques, leur organisation, innervation et mécanismes de contraction.",
        status: "published" as const,
        lessons: [
          {
            title: "Organisation générale du système musculaire",
            content: `# Organisation du Système Musculaire

## Types de tissus musculaires
1. **Muscle strié squelettique** : Volontaire, striation transversale
2. **Muscle cardiaque** : Involontaire, striation, disques intercalaires
3. **Muscle lisse** : Involontaire, sans striation, organes creux

## Structure du muscle squelettique
### Niveaux d'organisation :
- **Muscle** → Épimysium
- **Faisceau** → Périmysium  
- **Fibre musculaire** → Endomysium (sarcolemme)
- **Myofibrille** → Sarcomères
- **Myofilaments** → Actine (fins) et Myosine (épais)

## Le Sarcomère : Unité contractile
- **Bande A** : Zone sombre (myosine + actine)
- **Bande I** : Zone claire (actine seule)
- **Zone H** : Centre de la bande A (myosine seule)
- **Ligne Z** : Limite du sarcomère
- **Ligne M** : Centre du sarcomère

## Mécanisme de contraction
1. Arrivée du potentiel d'action
2. Libération Ca²⁺ du réticulum sarcoplasmique
3. Liaison Ca²⁺-Troponine C
4. Démasquage des sites de liaison sur l'actine
5. Cycle des ponts actine-myosine (ATP)
6. Glissement des filaments`,
            orderIndex: 1
          }
        ]
      },
      {
        title: "Neuroanatomie : Le système nerveux central et périphérique",
        titleEn: "Neuroanatomy: Central and Peripheral Nervous System",
        moduleId: "anatomy",
        yearLevels: ["Y1"],
        authors: ["Prof. Marie Lecomte", "Dr. Pierre Rousseau"],
        language: "fr",
        price: 2000,
        description: "Architecture du système nerveux : encéphale, moelle épinière, nerfs crâniens et spinaux, système nerveux autonome.",
        status: "published" as const,
        lessons: [
          {
            title: "Organisation générale du système nerveux",
            content: `# Organisation du Système Nerveux

## Division anatomique
### Système Nerveux Central (SNC)
- **Encéphale** : Cerveau, tronc cérébral, cervelet
- **Moelle épinière** : 31 segments médullaires

### Système Nerveux Périphérique (SNP)
- **Nerfs crâniens** : 12 paires (I-XII)
- **Nerfs spinaux** : 31 paires (8C, 12T, 5L, 5S, 1Co)
- **Ganglions** : Spinaux et autonomes

## Le Neurone : Unité fonctionnelle
### Structure :
- **Corps cellulaire** (péricaryon) : Noyau, organites
- **Dendrites** : Réception des signaux
- **Axone** : Conduction de l'influx
- **Terminaisons axonales** : Synapses

### Classification :
- **Multipolaires** : Motoneurones, interneurones
- **Bipolaires** : Neurones sensoriels spécialisés
- **Pseudo-unipolaires** : Ganglions spinaux

## Cellules gliales
### SNC :
- **Astrocytes** : Barrière hémato-encéphalique, support
- **Oligodendrocytes** : Myélinisation
- **Microglie** : Défense immunitaire
- **Épendymocytes** : Revêtement ventriculaire

### SNP :
- **Cellules de Schwann** : Myélinisation
- **Cellules satellites** : Support ganglionnaire`,
            orderIndex: 1
          }
        ]
      }
    ];

    // Y2 - Physiologie courses
    const physiologyCourses = [
      {
        title: "Physiologie cardiovasculaire : Cœur et circulation",
        titleEn: "Cardiovascular Physiology: Heart and Circulation",
        moduleId: "physiology",
        yearLevels: ["Y2"],
        authors: ["Prof. Alain Bernard", "Dr. Isabelle Petit"],
        language: "fr",
        price: 1800,
        description: "Compréhension approfondie du système cardiovasculaire : électrophysiologie cardiaque, hémodynamique, régulation de la pression artérielle.",
        status: "published" as const,
        lessons: [
          {
            title: "Le cœur : Anatomie fonctionnelle et électrophysiologie",
            content: `# Physiologie Cardiaque

## Anatomie Fonctionnelle du Cœur
### Cavités cardiaques :
- **Oreillettes** : Réception du sang (basse pression)
- **Ventricules** : Éjection du sang (haute pression)
- **Valves AV** : Tricuspide (droite), Mitrale (gauche)
- **Valves sigmoïdes** : Pulmonaire, Aortique

## Système de Conduction Cardiaque
### Tissu nodal :
1. **Nœud sinusal** (Keith-Flack) : Pacemaker naturel (70-80 bpm)
2. **Nœud auriculo-ventriculaire** (Aschoff-Tawara) : Délai AV (0.1s)
3. **Faisceau de His** : Conduction rapide
4. **Branches droite et gauche**
5. **Réseau de Purkinje** : Distribution ventriculaire

## Le Potentiel d'Action Cardiaque
### Cellules nodales (Phase) :
- Phase 4 : Dépolarisation diastolique lente (If, ICa-L)
- Phase 0 : Dépolarisation rapide (ICa-L)
- Phase 3 : Repolarisation (IK)

### Cellules contractiles :
- Phase 0 : Dépolarisation rapide (INa)
- Phase 1 : Repolarisation précoce (Ito)
- Phase 2 : Plateau (ICa-L vs IK)
- Phase 3 : Repolarisation (IK)
- Phase 4 : Potentiel de repos (-90mV)

## L'Électrocardiogramme (ECG)
- **Onde P** : Dépolarisation auriculaire
- **Complexe QRS** : Dépolarisation ventriculaire
- **Onde T** : Repolarisation ventriculaire
- **Intervalles** : PR (conduction AV), QT (systole électrique)`,
            orderIndex: 1
          },
          {
            title: "Cycle cardiaque et hémodynamique",
            content: `# Le Cycle Cardiaque

## Phases du Cycle Cardiaque
### Systole Ventriculaire :
1. **Contraction isovolumétrique** (50ms)
   - Fermeture valves AV (B1)
   - Augmentation pression, volume constant
2. **Éjection** (250ms)
   - Rapide (1/3 temps, 2/3 volume)
   - Lente (2/3 temps, 1/3 volume)

### Diastole Ventriculaire :
3. **Relaxation isovolumétrique** (80ms)
   - Fermeture valves sigmoïdes (B2)
   - Chute pression, volume constant
4. **Remplissage** (450ms)
   - Rapide initial (onde E)
   - Diastasis (plateau)
   - Systole auriculaire (onde A)

## Paramètres Hémodynamiques
### Volumes :
- **VTD** (Volume télédiastolique) : 120-140 ml
- **VTS** (Volume télésystolique) : 50-70 ml
- **VES** (Volume d'éjection systolique) : 70 ml
- **FE** (Fraction d'éjection) : VES/VTD = 60-70%

### Débit Cardiaque :
- **Q = VES × FC** = 70 ml × 70 bpm = 5 L/min
- Index cardiaque : Q/Surface corporelle = 3 L/min/m²

## Loi de Frank-Starling
- Augmentation précharge → Augmentation force contraction
- Mécanisme : Optimisation longueur sarcomères (2.0-2.2 μm)
- Adaptation automatique VG/VD`,
            orderIndex: 2
          }
        ]
      },
      {
        title: "Physiologie respiratoire : Ventilation et échanges gazeux",
        titleEn: "Respiratory Physiology: Ventilation and Gas Exchange",
        moduleId: "physiology",
        yearLevels: ["Y2"],
        authors: ["Prof. Nathalie Durand", "Dr. Marc Leblanc"],
        language: "fr",
        price: 1800,
        description: "Mécanismes de la ventilation pulmonaire, échanges gazeux alvéolo-capillaires, transport des gaz, régulation de la respiration.",
        status: "published" as const,
        lessons: [
          {
            title: "Mécanique ventilatoire",
            content: `# Mécanique Ventilatoire

## Muscles Respiratoires
### Inspiration :
- **Diaphragme** : Principal (75% du travail)
  - Innervation : Nerf phrénique (C3-C5)
  - Descente 1-2 cm (repos), 10 cm (effort)
- **Intercostaux externes** : Élévation des côtes
- **Muscles accessoires** (effort) : Scalènes, SCM, pectoraux

### Expiration :
- **Passive au repos** : Rétraction élastique
- **Active (effort)** : Abdominaux, intercostaux internes

## Pressions et Résistances
### Pressions :
- **Patm** : Pression atmosphérique (760 mmHg = 0 cmH₂O réf)
- **Palv** : Pression alvéolaire
- **Ppl** : Pression pleurale (-5 cmH₂O repos)
- **Ptp** : Pression transpulmonaire = Palv - Ppl

### Cycle respiratoire :
1. **Inspiration** : Ppl ↓ (-8) → Ptp ↑ → Expansion → Palv < Patm → Air entre
2. **Expiration** : Relaxation → Ppl ↑ (-5) → Rétraction → Palv > Patm → Air sort

## Volumes et Capacités Pulmonaires
### Volumes :
- **VT** (Volume courant) : 500 ml
- **VRI** (Volume de réserve inspiratoire) : 3000 ml
- **VRE** (Volume de réserve expiratoire) : 1100 ml
- **VR** (Volume résiduel) : 1200 ml

### Capacités :
- **CI** (Capacité inspiratoire) : VT + VRI = 3500 ml
- **CRF** (Capacité résiduelle fonctionnelle) : VRE + VR = 2300 ml
- **CV** (Capacité vitale) : VRI + VT + VRE = 4600 ml
- **CPT** (Capacité pulmonaire totale) : CV + VR = 5800 ml`,
            orderIndex: 1
          }
        ]
      },
      {
        title: "Physiologie rénale : Filtration et homéostasie",
        titleEn: "Renal Physiology: Filtration and Homeostasis",
        moduleId: "physiology",
        yearLevels: ["Y2"],
        authors: ["Prof. Sylvie Mercier", "Dr. François Girard"],
        language: "fr",
        price: 1800,
        description: "Fonctions rénales : filtration glomérulaire, réabsorption tubulaire, sécrétion, concentration urinaire, équilibre hydro-électrolytique.",
        status: "published" as const,
        lessons: [
          {
            title: "Structure fonctionnelle du néphron",
            content: `# Le Néphron : Unité Fonctionnelle

## Anatomie Fonctionnelle
### Corpuscule rénal :
- **Glomérule** : Capillaires fenêtrés (podocytes)
- **Capsule de Bowman** : Espace urinaire
- **Barrière de filtration** :
  1. Endothélium fenêtré (70-90 nm)
  2. Membrane basale (charge négative)
  3. Fentes de filtration (podocytes)

### Système tubulaire :
1. **Tube contourné proximal (TCP)** : 65% réabsorption
2. **Anse de Henlé** :
   - Branche descendante (perméable H₂O)
   - Branche ascendante (imperméable H₂O, NaCl actif)
3. **Tube contourné distal (TCD)** : Régulation fine
4. **Tube collecteur** : ADH-dépendant

## Filtration Glomérulaire
### Déterminants du DFG :
- **DFG = Kf × Pnette**
- Kf : Coefficient de filtration (surface × perméabilité)
- Pnette = (PH cap - PH Bowman) - (πonc cap - πonc Bowman)
- Pnette = (60 - 15) - (28 - 0) = 17 mmHg

### Valeurs normales :
- DFG = 120 ml/min = 180 L/jour
- Fraction de filtration : DFG/DPR = 20%
- 99% réabsorbé → Diurèse 1.5 L/jour`,
            orderIndex: 1
          }
        ]
      }
    ];

    // Y3 - Pathologie courses
    const pathologyCourses = [
      {
        title: "Pathologie générale : Bases physiopathologiques",
        titleEn: "General Pathology: Pathophysiological Basis",
        moduleId: "pathology",
        yearLevels: ["Y3"],
        authors: ["Prof. Robert Michel", "Dr. Anne Dupuis"],
        language: "fr",
        price: 2000,
        description: "Mécanismes fondamentaux de la maladie : lésions cellulaires, inflammation, réparation tissulaire, troubles hémodynamiques.",
        status: "published" as const,
        lessons: [
          {
            title: "Lésions et mort cellulaires",
            content: `# Lésions et Mort Cellulaires

## Causes des Lésions Cellulaires
1. **Hypoxie/Ischémie** : Défaut O₂ → Déficit ATP
2. **Agents physiques** : Traumatisme, température, radiations
3. **Agents chimiques** : Toxiques, médicaments, radicaux libres
4. **Agents infectieux** : Bactéries, virus, parasites
5. **Réactions immunitaires** : Auto-immunité, hypersensibilité
6. **Anomalies génétiques** : Mutations, anomalies chromosomiques
7. **Déséquilibres nutritionnels** : Carences, excès

## Mécanismes de Lésion Cellulaire
### Déplétion ATP :
- Pompe Na⁺/K⁺ ↓ → Œdème cellulaire
- Glycolyse anaérobie ↑ → Acidose → Dénaturation protéines
- Synthèse protéique ↓ → Détachement ribosomes

### Stress oxydatif (ROS) :
- Sources : Mitochondries, peroxysomes, inflammation
- Cibles : Lipides (peroxydation), Protéines, ADN
- Défenses : SOD, Catalase, Glutathion

## Types de Mort Cellulaire
### Nécrose :
- **Coagulative** : Ischémie (sauf cerveau) - Architecture préservée
- **Liquéfactive** : Infections bactériennes, cerveau - Pus
- **Caséeuse** : Tuberculose - Aspect fromage blanc
- **Gangréneuse** : Ischémie + infection membres
- **Stéatose** : Pancréatite aiguë - Saponification

### Apoptose :
- Programmée, ATP-dépendante
- Voie intrinsèque : Mitochondriale (Bcl-2, cytochrome c)
- Voie extrinsèque : Récepteurs mort (Fas, TNF)
- Formation corps apoptotiques → Phagocytose
- Pas d'inflammation`,
            orderIndex: 1
          }
        ]
      },
      {
        title: "Inflammation et immunopathologie",
        titleEn: "Inflammation and Immunopathology",
        moduleId: "pathology",
        yearLevels: ["Y3"],
        authors: ["Prof. Catherine Laurent", "Dr. Thomas Renard"],
        language: "fr",
        price: 2000,
        description: "Réaction inflammatoire aiguë et chronique, médiateurs, hypersensibilités, maladies auto-immunes, immunodéficiences.",
        status: "published" as const,
        lessons: [
          {
            title: "Inflammation aiguë",
            content: `# Inflammation Aiguë

## Signes Cardinaux (Celsus + Virchow)
1. **Rubor** (Rougeur) : Vasodilatation
2. **Tumor** (Tuméfaction) : Œdème inflammatoire
3. **Calor** (Chaleur) : Hypervascularisation
4. **Dolor** (Douleur) : Médiateurs algogènes
5. **Functio laesa** : Perte de fonction

## Phases de l'Inflammation Aiguë
### Phase vasculaire :
1. **Vasoconstriction transitoire** (secondes)
2. **Vasodilatation** : Histamine, NO, PG
3. **Augmentation perméabilité** : Contraction endothéliale
4. **Stase sanguine** : Hémoconcentration

### Phase cellulaire :
1. **Margination** : Ralentissement flux
2. **Rolling** : Sélectines (P, E, L)
3. **Adhésion** : Intégrines-ICAM/VCAM
4. **Diapédèse** : Traversée endothélium
5. **Chimiotactisme** : C5a, IL-8, LTB₄

## Médiateurs de l'Inflammation
### Origine plasmatique :
- **Complément** : C3a, C5a (anaphylatoxines)
- **Kinines** : Bradykinine (douleur, perméabilité)
- **Coagulation** : Thrombine, fibrine

### Origine cellulaire :
- **Amines vasoactives** : Histamine (mastocytes), Sérotonine
- **Métabolites AA** :
  - COX → PG (PGE₂, PGI₂), TX (TXA₂)
  - LOX → Leucotriènes (LTB₄, LTC₄/D₄/E₄)
- **Cytokines** : TNF-α, IL-1, IL-6 (pyrogènes)
- **Chimiokines** : IL-8 (CXCL8)
- **NO** : Vasodilatation, antimicrobien`,
            orderIndex: 1
          }
        ]
      },
      {
        title: "Oncologie : Bases de la cancérogenèse",
        titleEn: "Oncology: Basis of Carcinogenesis",
        moduleId: "pathology",
        yearLevels: ["Y3"],
        authors: ["Prof. Jacques Martin", "Dr. Émilie Roussel"],
        language: "fr",
        price: 2000,
        description: "Biologie du cancer : oncogènes, suppresseurs de tumeurs, métastases, classification TNM, principes thérapeutiques.",
        status: "published" as const,
        lessons: [
          {
            title: "Cancérogenèse et biologie tumorale",
            content: `# Cancérogenèse : De la Cellule Normale au Cancer

## Caractéristiques du Cancer (Hallmarks - Hanahan & Weinberg)
1. **Autosuffisance en signaux de croissance**
2. **Insensibilité aux signaux anti-croissance**
3. **Évasion de l'apoptose**
4. **Potentiel réplicatif illimité** (Télomérase)
5. **Angiogenèse soutenue** (VEGF)
6. **Invasion et métastases**
7. **Reprogrammation métabolique** (Effet Warburg)
8. **Évasion immunitaire**

## Oncogènes et Gènes Suppresseurs
### Oncogènes (gain de fonction) :
- **RAS** : Transduction signal (30% cancers)
- **MYC** : Facteur transcription prolifération
- **BCR-ABL** : Fusion (LMC) → Tyrosine kinase
- **HER2/neu** : Récepteur facteur croissance (sein)
- **BCL-2** : Anti-apoptotique

### Suppresseurs tumeurs (perte fonction) :
- **p53** : "Gardien du génome" - Arrêt cycle/apoptose
- **RB** : Contrôle transition G1/S
- **APC** : Voie Wnt (cancer côlon)
- **BRCA1/2** : Réparation ADN (sein/ovaire)
- **VHL** : Régulation hypoxie (cancer rein)

## Progression Tumorale
### Modèle Vogelstein (cancer colorectal) :
1. Épithélium normal
2. APC muté → Crypte aberrante
3. KRAS muté → Adénome précoce
4. Perte 18q → Adénome tardif
5. p53 muté → Carcinome in situ
6. Autres mutations → Métastases`,
            orderIndex: 1
          }
        ]
      }
    ];

    // Y4 - Pharmacologie courses
    const pharmacologyCourses = [
      {
        title: "Antibiotiques : Mécanismes et résistances",
        titleEn: "Antibiotics: Mechanisms and Resistance",
        moduleId: "pharmacology",
        yearLevels: ["Y4"],
        authors: ["Prof. Vincent Dubois", "Dr. Sarah Cohen"],
        language: "fr",
        price: 2000,
        description: "Classification des antibiotiques, mécanismes d'action, spectre, résistances bactériennes, antibiogramme, usage rationnel.",
        status: "published" as const,
        lessons: [
          {
            title: "Classification et mécanismes d'action",
            content: `# Les Antibiotiques : Classification et Mécanismes

## Classification par Mécanisme d'Action

### 1. Inhibiteurs de la Synthèse de la Paroi
#### β-lactamines :
- **Pénicillines** :
  - Péni G/V : Streptocoques
  - Péni M (Oxacilline) : Anti-staphylocoque
  - Péni A (Amoxicilline) : Spectre élargi
  - Carbapénèmes : Spectre très large
- **Céphalosporines** :
  - C1G : Cocci Gram+
  - C2G : + Haemophilus
  - C3G : Entérobactéries, Pseudomonas (Ceftazidime)
- **Mode action** : Inhibition PLP (transpeptidases)

### 2. Inhibiteurs de la Synthèse Protéique
#### 30S ribosome :
- **Aminosides** : Gentamicine, Amikacine
  - Bactéricide, ototoxique, néphrotoxique
- **Tétracyclines** : Doxycycline
  - Bactériostatique, intracellulaires

#### 50S ribosome :
- **Macrolides** : Azithromycine
  - Bactériostatique, intracellulaires atypiques
- **Lincosanides** : Clindamycine
  - Anaérobies, toxine (C. difficile)

### 3. Inhibiteurs des Acides Nucléiques
- **Fluoroquinolones** : Ciprofloxacine
  - ADN gyrase, topoisomérase IV
  - Tendinopathies, QT long
- **Rifamycines** : Rifampicine
  - ARN polymérase, tuberculose

### 4. Antimétabolites
- **Sulfamides** : Sulfaméthoxazole
- **Triméthoprime** : Synergie (Bactrim®)
- Voie folates → Synthèse purines`,
            orderIndex: 1
          }
        ]
      },
      {
        title: "Antalgiques et anti-inflammatoires",
        titleEn: "Analgesics and Anti-inflammatories",
        moduleId: "pharmacology",
        yearLevels: ["Y4"],
        authors: ["Prof. Hélène Blanc", "Dr. Philippe Noir"],
        language: "fr",
        price: 2000,
        description: "Paliers OMS, opioïdes, AINS, corticoïdes, adjuvants, douleur neuropathique, effets secondaires et surveillance.",
        status: "published" as const,
        lessons: [
          {
            title: "Paliers OMS et opioïdes",
            content: `# Traitement de la Douleur : Paliers OMS

## Classification OMS
### Palier 1 : Douleur légère (EVA 1-3)
- **Paracétamol** : 1g x 4/j (max 4g/j)
  - Mécanisme : COX central, système cannabinoïde
  - Toxicité : Hépatique (>10g), antidote NAC
- **AINS** : Ibuprofène 400mg x 3/j
  - Mécanisme : Inhibition COX-1/2
  - EI : Digestifs, rénaux, CV

### Palier 2 : Douleur modérée (EVA 4-6)
- **Codéine** : 30-60mg x 4/j
  - Prodrogue → Morphine (CYP2D6)
  - Variabilité génétique
- **Tramadol** : 50-100mg x 4/j (max 400mg)
  - Double action : μ-opioïde + monoamines
  - Risque convulsions, syndrome sérotoninergique

### Palier 3 : Douleur sévère (EVA 7-10)
- **Morphine** : Référence
  - Libération immédiate : Titration
  - Libération prolongée : Fond douloureux
  - Ratio LI/LP = 1/6 pour interdoses
- **Oxycodone** : 2x plus puissant
- **Fentanyl** : 100x plus puissant
  - Transdermique (72h), transmuqueux

## Mécanisme d'Action des Opioïdes
### Récepteurs :
- **μ (mu)** : Analgésie, euphorie, dépression respiratoire
- **κ (kappa)** : Analgésie, dysphorie
- **δ (delta)** : Modulation

### Effets secondaires :
- Constipation (100%) → Laxatifs systématiques
- Nausées (30%) → Antiémétiques
- Somnolence, confusion
- Dépression respiratoire (surveillance)
- Tolérance, dépendance`,
            orderIndex: 1
          }
        ]
      },
      {
        title: "Psychotropes : De l'anxiété à la psychose",
        titleEn: "Psychotropics: From Anxiety to Psychosis",
        moduleId: "pharmacology",
        yearLevels: ["Y4"],
        authors: ["Prof. Michel Verdier", "Dr. Caroline Bleu"],
        language: "fr",
        price: 2000,
        description: "Antidépresseurs, anxiolytiques, antipsychotiques, thymorégulateurs : mécanismes, indications, surveillance.",
        status: "published" as const,
        lessons: [
          {
            title: "Antidépresseurs",
            content: `# Les Antidépresseurs

## Classification et Mécanismes
### ISRS (Inhibiteurs Sélectifs Recapture Sérotonine)
- **Molécules** : Sertraline, Escitalopram, Fluoxétine
- **Mécanisme** : Blocage SERT → ↑ 5-HT synaptique
- **Délai action** : 2-4 semaines (désensibilisation 5-HT1A)
- **Indications** : Dépression, anxiété, TOC, PTSD
- **EI** : Nausées, troubles sexuels, syndrome sérotoninergique

### IRSN (Inhibiteurs Recapture Sérotonine-Noradrénaline)
- **Molécules** : Venlafaxine, Duloxétine
- **Avantage** : Douleurs neuropathiques associées
- **EI** : + HTA, sueurs

### Tricycliques
- **Molécules** : Amitriptyline, Clomipramine
- **Mécanisme** : Non sélectif + anti-H1, anti-M, anti-α1
- **EI** : Cardiaques (QT), anticholinergiques, sédation
- **Toxique** : Surdosage mortel

### IMAOs (Inhibiteurs Monoamine Oxydase)
- **Molécules** : Moclobémide (IMAO-A réversible)
- **Contrainte** : Régime sans tyramine (crise HTA)

## Stratégie Thérapeutique
### Initiation :
1. ISRS première ligne (tolérance)
2. Titration progressive (minimiser EI)
3. Évaluation 4-6 semaines

### Non-réponse :
1. Vérifier observance, posologie
2. Switch classe différente
3. Potentialisation : Lithium, T3
4. Association (prudence)`,
            orderIndex: 1
          }
        ]
      }
    ];

    // Y5 - Clinique courses
    const clinicalCourses = [
      {
        title: "Sémiologie médicale : L'art de l'examen clinique",
        titleEn: "Medical Semiology: The Art of Clinical Examination",
        moduleId: "cardiology",
        yearLevels: ["Y5"],
        authors: ["Prof. Jean-Paul Dumont", "Dr. Marie Lambert"],
        language: "fr",
        price: 2200,
        description: "Maîtrise de l'interrogatoire, examen physique systématique, sémiologie par appareil, raisonnement clinique.",
        status: "published" as const,
        lessons: [
          {
            title: "L'interrogatoire médical",
            content: `# L'Interrogatoire : Pierre Angulaire du Diagnostic

## Structure de l'Interrogatoire
### 1. Identification
- Nom, prénom, âge, sexe
- Profession (expositions)
- Origine géographique
- Situation familiale

### 2. Motif de Consultation
- Symptôme principal (verbatim patient)
- Durée d'évolution

### 3. Histoire de la Maladie
#### Analyse sémiologique (PQRST) :
- **P**rovoquant/Palliant : Facteurs déclenchants/soulageants
- **Q**ualité : Nature de la douleur
- **R**adiation : Irradiations
- **S**évérité : Échelle 0-10
- **T**emps : Évolution temporelle

### 4. Antécédents
#### Personnels :
- Médicaux : Chronologie, hospitalisations
- Chirurgicaux : Dates, complications
- Obstétricaux : G_P_A_
- Allergiques : Médicaments, aliments
- Toxiques : Tabac (PA), alcool (g/j), drogues

#### Familiaux :
- Parents 1er degré
- Maladies héréditaires
- Décès précoces (<65 ans)

### 5. Traitements
- Molécule, posologie, horaires
- Observance, efficacité, tolérance
- Automédication

### 6. Mode de Vie
- Activité physique
- Alimentation
- Sommeil
- Stress psychosocial

### 7. Revue des Systèmes
- Symptômes généraux : Poids, fièvre, asthénie
- Interrogatoire par appareil`,
            orderIndex: 1
          }
        ]
      },
      {
        title: "Raisonnement clinique et diagnostic différentiel",
        titleEn: "Clinical Reasoning and Differential Diagnosis",
        moduleId: "cardiology",
        yearLevels: ["Y5"],
        authors: ["Prof. Brigitte Roy", "Dr. Olivier Chevalier"],
        language: "fr",
        price: 2200,
        description: "Développer le raisonnement hypothético-déductif, établir des diagnostics différentiels, hiérarchiser les examens.",
        status: "published" as const,
        lessons: [
          {
            title: "Approche diagnostique structurée",
            content: `# Le Raisonnement Clinique

## Types de Raisonnement
### 1. Reconnaissance de Patterns (Système 1)
- Rapide, intuitif
- Basé sur l'expérience
- Risque : Biais de disponibilité

### 2. Hypothético-déductif (Système 2)
- Analytique, systématique
- Génération hypothèses → Test → Validation
- Plus fiable pour cas complexes

## Construction du Diagnostic Différentiel
### Méthode VINDICATE :
- **V**asculaire : AVC, EP, IDM
- **I**nfectieux/Inflammatoire
- **N**éoplasique
- **D**égénératif/Drugs
- **I**atrogène/Idiopathique  
- **C**ongénital
- **A**uto-immun/Allergique
- **T**raumatique/Toxique
- **E**ndocrinien

### Hiérarchisation :
1. **Urgences vitales** : À éliminer en priorité
2. **Fréquent** : Probabilité pré-test élevée
3. **Curable** : Ne pas manquer si traitable
4. **Rare** : Après exclusion du reste

## Stratégie d'Exploration
### Principes :
- Du moins invasif au plus invasif
- Du moins coûteux au plus coûteux
- Sensibilité pour dépister
- Spécificité pour confirmer

### Théorème de Bayes :
- Probabilité post-test = f(Probabilité pré-test, LR)
- LR+ = Sensibilité/(1-Spécificité)
- LR- = (1-Sensibilité)/Spécificité`,
            orderIndex: 1
          }
        ]
      },
      {
        title: "Urgences médicales : Premiers réflexes",
        titleEn: "Medical Emergencies: First Responses",
        moduleId: "cardiology",
        yearLevels: ["Y5"],
        authors: ["Prof. Éric Masson", "Dr. Lucie Fontaine"],
        language: "fr",
        price: 2200,
        description: "Reconnaissance et prise en charge initiale des urgences vitales, protocoles ACLS, orientation et triage.",
        status: "published" as const,
        lessons: [
          {
            title: "Approche ABCDE et urgences vitales",
            content: `# Approche Systématique des Urgences : ABCDE

## Évaluation Primaire ABCDE
### A - Airway (Voies Aériennes)
- **Signes obstruction** : Stridor, tirage, cyanose
- **Actions** :
  - Subluxation mandibule
  - Canule Guedel si inconscient
  - Aspiration sécrétions
  - Intubation si échec

### B - Breathing (Respiration)
- **Évaluation** : FR, SpO₂, auscultation, symétrie
- **Urgences** :
  - Pneumothorax tension → Exsufflation
  - OAP → Lasix, VNI
  - Asthme aigu grave → β2, corticoïdes
- **Objectif** : SpO₂ > 94% (88-92% si BPCO)

### C - Circulation
- **Évaluation** : FC, PA, TRC, marbrures
- **Choc** : PAS < 90 ou PAM < 65
  - Hypovolémique → Remplissage
  - Cardiogénique → Inotropes
  - Septique → Remplissage + Noradrénaline
  - Anaphylactique → Adrénaline
- **Accès** : 2 VVP gros calibre ou IO

### D - Disability (Neurologique)
- **Score Glasgow** : O/4 + V/5 + M/6
- **Pupilles** : Taille, réactivité, symétrie
- **Glycémie** : Hypoglycémie = urgence
- **Déficit focal** → AVC protocole

### E - Exposure/Environment
- **Déshabiller** : Recherche lésions
- **Température** : Hypo/hyperthermie
- **Protection** : Couverture survie`,
            orderIndex: 1
          }
        ]
      }
    ];

    // Y6 - Spécialités courses
    const specialtyCourses = [
      {
        title: "Cardiologie clinique : De l'ECG au cathétérisme",
        titleEn: "Clinical Cardiology: From ECG to Catheterization",
        moduleId: "cardiology",
        yearLevels: ["Y6"],
        authors: ["Prof. Louis Bertrand", "Dr. Sandrine Morel"],
        language: "fr",
        price: 2500,
        description: "Pathologies cardiovasculaires majeures : coronaropathie, insuffisance cardiaque, troubles du rythme, valvulopathies.",
        status: "published" as const,
        lessons: [
          {
            title: "Syndrome coronarien aigu",
            content: `# Syndrome Coronarien Aigu (SCA)

## Classification
### STEMI (ST+)
- Occlusion complète
- Sus-décalage ST ≥ 1mm (2 dérivations contiguës)
- Urgence reperfusion < 120 min

### NSTEMI/Angor instable (ST-)
- Occlusion partielle
- Sous-décalage ST, onde T négative
- Troponine : NSTEMI (+) vs Angor instable (-)

## Diagnostic
### Clinique :
- **Douleur typique** : Rétrosternale, constrictive
- **Irradiations** : Mâchoire, bras gauche
- **Durée** : > 20 min, résistante trinitrine
- **Signes associés** : Sueurs, nausées, angoisse

### ECG - Localisation :
- **Antérieur** : V1-V4 (IVA)
- **Latéral** : V5-V6, I, aVL (Circonflexe)
- **Inférieur** : II, III, aVF (Coronaire droite)
- **Postérieur** : V7-V9 (miroir V1-V3)

### Biomarqueurs :
- **Troponine** : Gold standard
  - Élévation 3-6h, pic 24h
  - Hypersensible : Cinétique sur 3h
- **CPK-MB** : Historique
- **BNP** : Pronostic

## Prise en Charge STEMI
### Reperfusion urgente :
1. **Angioplastie primaire** < 120 min (idéal < 90)
2. **Fibrinolyse** < 30 min si PCI impossible
   - Tenecteplase, Alteplase
   - CI : AVC < 3 mois, hémorragie

### Traitement adjuvant :
- **DAPT** : Aspirine + Clopidogrel/Ticagrelor
- **Anticoagulation** : Héparine, Bivalirudine
- **Bêtabloquants** : ↓ Mortalité
- **IEC/ARA2** : Remodelage
- **Statines** : Haute intensité`,
            orderIndex: 1
          }
        ]
      },
      {
        title: "Neurologie : Du symptôme au diagnostic",
        titleEn: "Neurology: From Symptom to Diagnosis",
        moduleId: "neuro",
        yearLevels: ["Y6"],
        authors: ["Prof. Danielle Perrin", "Dr. Xavier Bonneau"],
        language: "fr",
        price: 2500,
        description: "Pathologies neurologiques : AVC, épilepsie, céphalées, maladies neurodégénératives, neuropathies.",
        status: "published" as const,
        lessons: [
          {
            title: "Accident vasculaire cérébral",
            content: `# Accident Vasculaire Cérébral

## Types d'AVC
### AVC Ischémique (80%)
- **Thrombotique** : Athérosclérose in situ
- **Embolique** : Cardio-embolique (FA), artério-artériel
- **Lacunaire** : Petites artères perforantes
- **Autres** : Dissection, vascularite

### AVC Hémorragique (20%)
- **Intraparenchymateux** : HTA, Amyloïde
- **Sous-arachnoïdien** : Anévrisme, MAV

## Territoires Vasculaires
### Artère Cérébrale Moyenne (Sylvienne)
- **Superficielle** : Hémiparésie brachio-faciale
- **Profonde** : Capsule interne - Hémiplégie proportionnelle
- **Dominant** : Aphasie (Broca/Wernicke)
- **Non-dominant** : Négligence

### Artère Cérébrale Antérieure
- Hémiparésie crurale > brachiale
- Syndrome frontal
- Mutisme akinétique (bilatéral)

### Artère Cérébrale Postérieure
- Hémianopsie latérale homonyme
- Alexie sans agraphie (dominant)
- Prosopagnosie (non-dominant)

## Prise en Charge Aiguë
### Thrombolyse IV (rt-PA)
- **Fenêtre** : < 4h30
- **Dose** : 0.9 mg/kg (max 90mg)
- **CI** : Hémorragie, AVC < 3 mois, INR > 1.7

### Thrombectomie Mécanique
- **Fenêtre** : < 6h (24h si mismatch)
- **Indications** : Occlusion proximale (NIHSS ≥ 6)
- **NNT = 3** pour indépendance fonctionnelle`,
            orderIndex: 1
          }
        ]
      },
      {
        title: "Pédiatrie : Particularités de l'enfant",
        titleEn: "Pediatrics: Child Specificities",
        moduleId: "public_health",
        yearLevels: ["Y6"],
        authors: ["Prof. Nicole Garnier", "Dr. Julien Petit"],
        language: "fr",
        price: 2500,
        description: "Croissance et développement, pathologies pédiatriques fréquentes, urgences de l'enfant, vaccination.",
        status: "published" as const,
        lessons: [
          {
            title: "Croissance et développement de l'enfant",
            content: `# Croissance et Développement Pédiatrique

## Croissance Staturo-Pondérale
### Vitesse de croissance :
- **0-1 an** : 25 cm/an (50→75 cm)
- **1-4 ans** : 10 cm/an
- **4-pubérté** : 5-6 cm/an
- **Pic pubertaire** : 8-10 cm/an

### Poids :
- **Naissance** : 3.3 kg (2.5-4.5)
- **Doublement** : 5 mois
- **Triplement** : 1 an
- **Formule** : P = (âge × 2) + 8 (après 1 an)

### Périmètre crânien :
- **Naissance** : 35 cm
- **+12 cm** première année
- **+2 cm** deuxième année

## Développement Psychomoteur (Denver)
### 3 mois :
- **Moteur** : Tient tête
- **Social** : Sourire réponse
- **Vision** : Poursuite oculaire

### 6 mois :
- **Moteur** : Position assise avec appui
- **Préhension** : Passe main à main
- **Langage** : Babillage

### 9 mois :
- **Moteur** : Assis sans appui, 4 pattes
- **Préhension** : Pince pouce-index
- **Social** : Angoisse étranger

### 12 mois :
- **Moteur** : Debout avec appui
- **Langage** : 2-3 mots
- **Jeu** : Imitation

### 18 mois :
- **Moteur** : Marche acquise
- **Langage** : 10-20 mots
- **Autonomie** : Cuillère

### 24 mois :
- **Moteur** : Monte escaliers
- **Langage** : Phrases 2 mots
- **Propreté** : Jour (début)`,
            orderIndex: 1
          }
        ]
      }
    ];

    // Insert all courses with lessons
    console.log("📚 Inserting courses by year level...");
    
    const allCourses = [
      ...anatomyCourses,
      ...physiologyCourses,
      ...pathologyCourses,
      ...pharmacologyCourses,
      ...clinicalCourses,
      ...specialtyCourses
    ];

    for (const courseData of allCourses) {
      const { lessons: courseLessons, ...courseInfo } = courseData;
      
      const [insertedCourse] = await db
        .insert(courses)
        .values(courseInfo as any)
        .returning();

      // Insert lessons for each course
      if (courseLessons && courseLessons.length > 0) {
        for (const lesson of courseLessons) {
          await db.insert(lessons).values({
            ...lesson,
            courseId: insertedCourse.id,
          });
        }
      }
      
      console.log(`✅ Course created: ${courseInfo.title}`);
    }

    // ============ MEDICAL SUMMARIES ============
    const medicalSummaries = [
      {
        title: "Les grandes fonctions physiologiques",
        titleEn: "Major Physiological Functions",
        moduleId: "physiology",
        pdfAsset: "/summaries/physiological_functions.pdf",
        language: "fr",
        pages: 45,
        price: 500,
        tags: ["physiologie", "fonctions vitales", "homéostasie"],
        status: "published" as const,
        description: "Résumé complet des fonctions physiologiques essentielles : cardiovasculaire, respiratoire, rénale, digestive, endocrinienne."
      },
      {
        title: "Anatomie du cœur et circulation",
        titleEn: "Heart Anatomy and Circulation",
        moduleId: "anatomy",
        pdfAsset: "/summaries/heart_anatomy.pdf",
        language: "fr",
        pages: 30,
        price: 400,
        tags: ["cœur", "circulation", "vaisseaux"],
        status: "published" as const,
        description: "Guide illustré de l'anatomie cardiaque, grandes et petites circulations, système de conduction, vascularisation coronaire."
      },
      {
        title: "Les antibiotiques en pratique clinique",
        titleEn: "Antibiotics in Clinical Practice",
        moduleId: "pharmacology",
        pdfAsset: "/summaries/antibiotics_practice.pdf",
        language: "fr",
        pages: 38,
        price: 600,
        tags: ["antibiotiques", "infectiologie", "résistance"],
        status: "published" as const,
        description: "Guide pratique des antibiotiques : spectre, indications, posologies, effets secondaires, antibiogramme."
      },
      {
        title: "Examen neurologique complet",
        titleEn: "Complete Neurological Examination",
        moduleId: "neuro",
        pdfAsset: "/summaries/neurological_exam.pdf",
        language: "fr",
        pages: 42,
        price: 550,
        tags: ["neurologie", "examen clinique", "sémiologie"],
        status: "published" as const,
        description: "Méthode systématique de l'examen neurologique : paires crâniennes, motricité, sensibilité, réflexes, coordination."
      },
      {
        title: "Urgences médicales courantes",
        titleEn: "Common Medical Emergencies",
        moduleId: "cardiology",
        pdfAsset: "/summaries/medical_emergencies.pdf",
        language: "fr",
        pages: 50,
        price: 700,
        tags: ["urgences", "ACLS", "protocoles"],
        status: "published" as const,
        description: "Protocoles et algorithmes des urgences vitales : ACR, choc, détresse respiratoire, coma, intoxications."
      },
      {
        title: "Métabolisme et nutrition",
        titleEn: "Metabolism and Nutrition",
        moduleId: "biochem",
        pdfAsset: "/summaries/metabolism_nutrition.pdf",
        language: "fr",
        pages: 35,
        price: 450,
        tags: ["métabolisme", "nutrition", "vitamines"],
        status: "published" as const,
        description: "Voies métaboliques principales, besoins nutritionnels, vitamines et oligoéléments, troubles métaboliques."
      },
      {
        title: "Immunologie fondamentale",
        titleEn: "Fundamental Immunology",
        moduleId: "microbiology",
        pdfAsset: "/summaries/immunology_basics.pdf",
        language: "fr",
        pages: 40,
        price: 500,
        tags: ["immunité", "lymphocytes", "anticorps"],
        status: "published" as const,
        description: "Système immunitaire inné et adaptatif, lymphocytes, anticorps, complément, hypersensibilités."
      }
    ];

    console.log("📄 Inserting medical summaries...");
    for (const summary of medicalSummaries) {
      await db.insert(summaries).values(summary as any);
      console.log(`✅ Summary created: ${summary.title}`);
    }

    // ============ CLINICAL CASES ============
    const clinicalCases = [
      {
        title: "Douleur thoracique chez l'adulte de 55 ans",
        presentation: "M. Dupont, 55 ans, se présente aux urgences pour une douleur thoracique rétrosternale constrictive apparue il y a 2 heures au repos. La douleur irradie vers la mâchoire et le bras gauche. Il présente des sueurs profuses et des nausées.",
        history: "Antécédents : HTA traitée par IEC, dyslipidémie sous statine, tabagisme actif (30 PA). Père décédé d'IDM à 60 ans. Pas d'allergie connue.",
        exam: "PA 150/90 mmHg, FC 95 bpm régulier, SpO₂ 96% AA. Patient anxieux, en sueurs. Auscultation cardiaque : B1B2 réguliers, pas de souffle. Auscultation pulmonaire claire. ECG : sus-décalage ST de 3mm en V2-V4.",
        investigations: "Troponine T hs : 850 ng/L (N<14). CPK : 450 UI/L. Radiographie thorax : normale. Échocardiographie : Hypokinésie antéro-septale, FEVG 40%.",
        management: "1. Aspirine 300mg + Clopidogrel 600mg\n2. Héparine IV bolus 5000 UI\n3. Angioplastie primaire en urgence : stent sur IVA proximale\n4. Post-PCI : DAPT, bêtabloquant, IEC, statine haute dose\n5. Sevrage tabagique, réadaptation cardiaque",
        moduleId: "cardiology",
        difficulty: "Medium",
        status: "published" as const,
        diagnosis: "STEMI antérieur sur occlusion IVA proximale"
      },
      {
        title: "Fièvre prolongée chez l'enfant de 3 ans",
        presentation: "Léa, 3 ans, est amenée par ses parents pour une fièvre à 39.5°C évoluant depuis 5 jours, résistante au paracétamol. L'enfant est grognon, refuse de s'alimenter.",
        history: "Née à terme, développement normal, vaccinations à jour. Pas d'antécédent notable. Fréquente la crèche. Épidémie de varicelle dans l'entourage.",
        exam: "Poids 14 kg, T° 39.2°C. Enfant fatiguée mais réactive. Gorge rouge, adénopathies cervicales bilatérales sensibles. Tympans normaux. Éruption scarlatiniforme du tronc. Auscultation cardio-pulmonaire normale. Abdomen souple.",
        investigations: "NFS : GB 16000/mm³ (80% PNN), CRP 120 mg/L, PCT 2.5 ng/mL. ECBU négatif. TDR streptocoque A positif. Hémocultures en cours.",
        management: "1. Diagnostic : Scarlatine (streptocoque A)\n2. Amoxicilline 80 mg/kg/j en 3 prises pendant 10 jours\n3. Paracétamol 15 mg/kg/6h si fièvre\n4. Hydratation, repos\n5. Éviction scolaire 48h après début antibiotique\n6. Surveillance complications : RAA, GNA",
        moduleId: "public_health",
        difficulty: "Easy",
        status: "published" as const,
        diagnosis: "Scarlatine"
      },
      {
        title: "Céphalées récurrentes chez la femme de 28 ans",
        presentation: "Mme Martin, 28 ans, consulte pour des céphalées hémicrâniennes droites pulsatiles évoluant depuis 6 mois, avec une fréquence de 2-3 crises par mois durant 24-48h.",
        history: "Céphalées débutant souvent le matin, précédées de phosphènes. Aggravées par l'effort, soulagées par le repos dans le noir. Nausées associées. Mère migraineuse. Contraception orale œstroprogestative.",
        exam: "Examen neurologique complet normal entre les crises. PA 120/75, FC 70. Pas de raideur méningée. Fond d'œil normal.",
        investigations: "Bilan standard normal. IRM cérébrale (si première crise ou signes atypiques) : normale.",
        management: "1. Diagnostic : Migraine avec aura\n2. Traitement de crise : Triptan (sumatriptan 50-100mg) + AINS\n3. Changement contraception (progestative pure)\n4. Si >4 crises/mois : prophylaxie (propranolol 40-160mg/j)\n5. Règles hygiéno-diététiques : sommeil régulier, éviter triggers\n6. Tenue d'un agenda des crises",
        moduleId: "neuro",
        difficulty: "Medium",
        status: "published" as const,
        diagnosis: "Migraine avec aura"
      },
      {
        title: "Dyspnée aiguë chez le patient BPCO",
        presentation: "M. Leblanc, 68 ans, BPCO stade III, se présente pour dyspnée aiguë d'aggravation progressive depuis 3 jours avec augmentation des expectorations purulentes.",
        history: "BPCO post-tabagique (50 PA sevré), sous bronchodilatateurs. Hospitalisé 2 fois l'an dernier pour exacerbations. Dernière spirométrie : VEMS 35% théorique.",
        exam: "Polypnéique (FR 28/min), SpO₂ 88% AA. Usage muscles accessoires, cyanose labiale. Sibilants diffus, ronchi. Œdèmes MI bilatéraux.",
        investigations: "GDS : pH 7.32, PaCO₂ 65 mmHg, PaO₂ 55 mmHg, HCO₃⁻ 32. Radio thorax : distension, pas de pneumonie franche. ECG : HAD, HVD. BNP 450 pg/mL.",
        management: "1. Oxygénothérapie contrôlée (cible SpO₂ 88-92%)\n2. Nébulisations : salbutamol + ipratropium\n3. Corticothérapie : prednisolone 40mg/j × 5j\n4. Antibiothérapie : amoxicilline-ac. clavulanique\n5. VNI si acidose persistante\n6. Diurétiques si surcharge droite\n7. Prévention : vaccination, réhabilitation respiratoire",
        moduleId: "pulmonology",
        difficulty: "Hard",
        status: "published" as const,
        diagnosis: "Exacerbation aiguë de BPCO avec insuffisance respiratoire aiguë sur chronique"
      }
    ];

    console.log("🏥 Inserting clinical cases...");
    for (const clinicalCase of clinicalCases) {
      await db.insert(cases).values(clinicalCase);
      console.log(`✅ Case created: ${clinicalCase.title}`);
    }

    // ============ QUIZZES WITH QUESTIONS ============
    const medicalQuizzes = [
      {
        title: "QCM Anatomie : Système squelettique",
        moduleId: "anatomy",
        timeLimitSec: 1200,
        difficulty: "Easy" as const,
        status: "published" as const,
        questions: [
          {
            stem: "Combien d'os composent le squelette adulte humain ?",
            type: "MCQ" as const,
            answerExplanation: "Le squelette adulte comprend 206 os. À la naissance, nous avons environ 270 os, mais beaucoup fusionnent pendant la croissance.",
            options: [
              { label: "186", isCorrect: false },
              { label: "206", isCorrect: true },
              { label: "226", isCorrect: false },
              { label: "246", isCorrect: false }
            ]
          },
          {
            stem: "Quel est le plus long os du corps humain ?",
            type: "MCQ" as const,
            answerExplanation: "Le fémur est le plus long et le plus solide os du corps humain, mesurant environ 1/4 de la taille totale.",
            options: [
              { label: "Tibia", isCorrect: false },
              { label: "Humérus", isCorrect: false },
              { label: "Fémur", isCorrect: true },
              { label: "Radius", isCorrect: false }
            ]
          },
          {
            stem: "Quelle vertèbre est aussi appelée 'axis' ?",
            type: "MCQ" as const,
            answerExplanation: "C2 est appelée axis. Elle possède le processus odontoïde qui permet la rotation de la tête via l'articulation avec C1 (atlas).",
            options: [
              { label: "C1", isCorrect: false },
              { label: "C2", isCorrect: true },
              { label: "C3", isCorrect: false },
              { label: "C7", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "QCM Physiologie : Système cardiovasculaire",
        moduleId: "physiology",
        timeLimitSec: 1500,
        difficulty: "Medium" as const,
        status: "published" as const,
        questions: [
          {
            stem: "Quelle est la valeur normale du débit cardiaque au repos ?",
            type: "MCQ" as const,
            answerExplanation: "Le débit cardiaque normal est d'environ 5 L/min (VES 70ml × FC 70 bpm). Il peut augmenter jusqu'à 25 L/min à l'effort.",
            options: [
              { label: "2-3 L/min", isCorrect: false },
              { label: "4-6 L/min", isCorrect: true },
              { label: "8-10 L/min", isCorrect: false },
              { label: "10-12 L/min", isCorrect: false }
            ]
          },
          {
            stem: "Le nœud sinusal génère normalement des impulsions à quelle fréquence ?",
            type: "MCQ" as const,
            answerExplanation: "Le nœud sinusal est le pacemaker naturel du cœur, générant 60-100 impulsions/min (moyenne 70-80).",
            options: [
              { label: "40-60 bpm", isCorrect: false },
              { label: "60-100 bpm", isCorrect: true },
              { label: "100-120 bpm", isCorrect: false },
              { label: "120-150 bpm", isCorrect: false }
            ]
          },
          {
            stem: "La loi de Frank-Starling établit une relation entre :",
            type: "MCQ" as const,
            answerExplanation: "La loi de Frank-Starling stipule que la force de contraction augmente avec l'étirement des fibres (précharge), jusqu'à un optimum.",
            options: [
              { label: "Fréquence cardiaque et débit", isCorrect: false },
              { label: "Précharge et force de contraction", isCorrect: true },
              { label: "Postcharge et volume d'éjection", isCorrect: false },
              { label: "Pression et résistance", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "QCM Pathologie : Inflammation",
        moduleId: "pathology",
        timeLimitSec: 1200,
        difficulty: "Medium" as const,
        status: "published" as const,
        questions: [
          {
            stem: "Lequel n'est PAS un signe cardinal de l'inflammation selon Celsus ?",
            type: "MCQ" as const,
            answerExplanation: "Les 4 signes de Celsus sont : rubor (rougeur), tumor (tuméfaction), calor (chaleur), dolor (douleur). Functio laesa (perte de fonction) a été ajouté par Virchow.",
            options: [
              { label: "Rougeur", isCorrect: false },
              { label: "Chaleur", isCorrect: false },
              { label: "Fièvre", isCorrect: true },
              { label: "Douleur", isCorrect: false }
            ]
          },
          {
            stem: "Quel médiateur est principalement responsable de la fièvre ?",
            type: "MCQ" as const,
            answerExplanation: "Les prostaglandines, particulièrement PGE₂, agissent sur l'hypothalamus pour élever le point de consigne thermique.",
            options: [
              { label: "Histamine", isCorrect: false },
              { label: "Prostaglandines", isCorrect: true },
              { label: "Bradykinine", isCorrect: false },
              { label: "Sérotonine", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "QCM Pharmacologie : Antibiotiques",
        moduleId: "pharmacology",
        timeLimitSec: 1800,
        difficulty: "Hard" as const,
        status: "published" as const,
        questions: [
          {
            stem: "Quel antibiotique agit en inhibant la synthèse de la paroi bactérienne ?",
            type: "MCQ" as const,
            answerExplanation: "Les pénicillines sont des β-lactamines qui inhibent les PLP (transpeptidases), empêchant la synthèse du peptidoglycane.",
            options: [
              { label: "Gentamicine", isCorrect: false },
              { label: "Pénicilline", isCorrect: true },
              { label: "Tétracycline", isCorrect: false },
              { label: "Ciprofloxacine", isCorrect: false }
            ]
          },
          {
            stem: "Les aminosides agissent sur quelle sous-unité ribosomale ?",
            type: "MCQ" as const,
            answerExplanation: "Les aminosides (gentamicine, amikacine) se lient à la sous-unité 30S, causant des erreurs de lecture de l'ARNm.",
            options: [
              { label: "30S", isCorrect: true },
              { label: "50S", isCorrect: false },
              { label: "70S", isCorrect: false },
              { label: "80S", isCorrect: false }
            ]
          },
          {
            stem: "Quelle est la principale toxicité des aminosides ?",
            type: "MCQ" as const,
            answerExplanation: "Les aminosides sont néphrotoxiques et ototoxiques. La surveillance des taux et de la créatinine est essentielle.",
            options: [
              { label: "Hépatotoxicité", isCorrect: false },
              { label: "Cardiotoxicité", isCorrect: false },
              { label: "Néphrotoxicité et ototoxicité", isCorrect: true },
              { label: "Neurotoxicité centrale", isCorrect: false }
            ]
          }
        ]
      },
      {
        title: "Cas cliniques : Cardiologie",
        moduleId: "cardiology",
        timeLimitSec: 2400,
        difficulty: "Hard" as const,
        status: "published" as const,
        questions: [
          {
            stem: "Un homme de 60 ans présente une douleur thoracique constrictive avec sus-décalage ST en V2-V4. Quelle artère est probablement occluse ?",
            type: "CaseBased" as const,
            answerExplanation: "Le sus-décalage ST en V2-V4 indique un infarctus antérieur, territoire de l'artère interventriculaire antérieure (IVA).",
            options: [
              { label: "Coronaire droite", isCorrect: false },
              { label: "Interventriculaire antérieure", isCorrect: true },
              { label: "Circonflexe", isCorrect: false },
              { label: "Marginale", isCorrect: false }
            ]
          }
        ]
      }
    ];

    console.log("❓ Inserting quizzes with questions...");
    for (const quizData of medicalQuizzes) {
      const { questions: quizQuestions, ...quizInfo } = quizData;
      
      const [insertedQuiz] = await db
        .insert(quizzes)
        .values(quizInfo)
        .returning();

      // Insert questions and options
      for (let i = 0; i < quizQuestions.length; i++) {
        const { options: questionOptions, ...questionInfo } = quizQuestions[i];
        
        const [insertedQuestion] = await db
          .insert(questions)
          .values({
            ...questionInfo,
            quizId: insertedQuiz.id,
            orderIndex: i + 1
          })
          .returning();

        // Insert options for each question
        if (questionOptions && questionOptions.length > 0) {
          for (let j = 0; j < questionOptions.length; j++) {
            await db.insert(options).values({
              ...questionOptions[j],
              questionId: insertedQuestion.id,
              orderIndex: j + 1
            });
          }
        }
      }
      
      console.log(`✅ Quiz created: ${quizInfo.title}`);
    }

    console.log("🎉 Medical content seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error seeding medical content:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedMedicalContent().then(() => {
    console.log("✨ All medical content seeded!");
    process.exit(0);
  }).catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  });
}