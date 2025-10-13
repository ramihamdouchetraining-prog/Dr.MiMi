import { QuizQuestion } from '../components/QuizComponent';
import { MedicalImage } from '../components/MedicalImageViewer';

// Comprehensive QCM Data for Medical Education
export const cardiologyQuiz: QuizQuestion[] = [
  {
    id: 'cardio-1',
    question: 'Quel est le nombre normal de battements cardiaques par minute au repos chez un adulte ?',
    options: [
      '40-60 bpm',
      '60-100 bpm', 
      '100-120 bpm',
      '120-150 bpm'
    ],
    correctAnswer: 1,
    explanation: 'La fréquence cardiaque normale au repos chez un adulte se situe entre 60 et 100 battements par minute. En dessous de 60, on parle de bradycardie, au-dessus de 100, de tachycardie.',
    difficulty: 'facile',
    category: 'Cardiologie',
    points: 5,
    image: '/images/anatomy/heart-diagram.png'
  },
  {
    id: 'cardio-2',
    question: 'Quelle valve cardiaque sépare le ventricule gauche de l\'aorte ?',
    options: [
      'Valve tricuspide',
      'Valve pulmonaire',
      'Valve mitrale',
      'Valve aortique'
    ],
    correctAnswer: 3,
    explanation: 'La valve aortique (ou valve sigmoïde aortique) contrôle le flux sanguin du ventricule gauche vers l\'aorte. Elle empêche le reflux du sang de l\'aorte vers le ventricule pendant la diastole.',
    difficulty: 'moyen',
    category: 'Cardiologie',
    points: 10,
    image: '/images/anatomy/heart-diagram.png'
  },
  {
    id: 'cardio-3',
    question: 'Quel est le principal facteur de risque modifiable de l\'infarctus du myocarde ?',
    options: [
      'L\'âge',
      'Le sexe masculin',
      'Le tabagisme',
      'L\'hérédité'
    ],
    correctAnswer: 2,
    explanation: 'Le tabagisme est le principal facteur de risque cardiovasculaire modifiable. Il augmente de 2 à 4 fois le risque d\'infarctus du myocarde. L\'arrêt du tabac diminue rapidement ce risque.',
    difficulty: 'moyen',
    category: 'Cardiologie',
    points: 10
  },
  {
    id: 'cardio-4',
    question: 'Quelle est la pression artérielle normale chez un adulte ?',
    options: [
      '90/60 mmHg',
      '120/80 mmHg',
      '140/90 mmHg',
      '160/100 mmHg'
    ],
    correctAnswer: 1,
    explanation: 'La pression artérielle normale est de 120/80 mmHg. Une pression supérieure à 140/90 mmHg définit l\'hypertension artérielle, un facteur de risque cardiovasculaire majeur.',
    difficulty: 'facile',
    category: 'Cardiologie',
    points: 5
  }
];

export const neurologyQuiz: QuizQuestion[] = [
  {
    id: 'neuro-1',
    question: 'Quel lobe cérébral est principalement responsable de la motricité volontaire ?',
    options: [
      'Lobe temporal',
      'Lobe pariétal',
      'Lobe frontal',
      'Lobe occipital'
    ],
    correctAnswer: 2,
    explanation: 'Le lobe frontal contient le cortex moteur primaire (aire de Brodmann 4) qui contrôle la motricité volontaire. Il est situé dans le gyrus précentral.',
    difficulty: 'moyen',
    category: 'Neurologie',
    points: 10,
    image: '/images/anatomy/brain-diagram.png'
  },
  {
    id: 'neuro-2',
    question: 'Combien de paires de nerfs crâniens existe-t-il ?',
    options: [
      '10 paires',
      '12 paires',
      '14 paires',
      '16 paires'
    ],
    correctAnswer: 1,
    explanation: 'Il existe 12 paires de nerfs crâniens, numérotées de I à XII : olfactif, optique, oculomoteur, trochléaire, trijumeau, abducens, facial, auditif, glossopharyngien, vague, accessoire et hypoglosse.',
    difficulty: 'facile',
    category: 'Neurologie',
    points: 5
  },
  {
    id: 'neuro-3',
    question: 'Quelle structure cérébrale est principalement affectée dans la maladie d\'Alzheimer ?',
    options: [
      'Le cervelet',
      'L\'hippocampe',
      'Le tronc cérébral',
      'Le thalamus'
    ],
    correctAnswer: 1,
    explanation: 'L\'hippocampe est la structure principalement affectée dans la maladie d\'Alzheimer. Cette région est cruciale pour la formation de nouveaux souvenirs, expliquant les troubles mnésiques précoces de la maladie.',
    difficulty: 'difficile',
    category: 'Neurologie',
    points: 15
  }
];

export const anatomyQuiz: QuizQuestion[] = [
  {
    id: 'anat-1',
    question: 'Combien d\'os contient le squelette humain adulte ?',
    options: [
      '186 os',
      '206 os',
      '226 os',
      '246 os'
    ],
    correctAnswer: 1,
    explanation: 'Le squelette humain adulte contient 206 os. Ce nombre diminue avec l\'âge car certains os se soudent (par exemple, les os du crâne). À la naissance, un bébé a environ 270 os.',
    difficulty: 'facile',
    category: 'Anatomie',
    points: 5,
    image: '/images/anatomy/skeleton-chart.png'
  },
  {
    id: 'anat-2',
    question: 'Quel est l\'os le plus long du corps humain ?',
    options: [
      'L\'humérus',
      'Le tibia',
      'Le fémur',
      'Le radius'
    ],
    correctAnswer: 2,
    explanation: 'Le fémur (os de la cuisse) est l\'os le plus long et le plus robuste du corps humain. Il mesure environ 1/4 de la taille totale d\'une personne.',
    difficulty: 'facile',
    category: 'Anatomie',
    points: 5
  },
  {
    id: 'anat-3',
    question: 'Combien de vertèbres comprend la colonne vertébrale ?',
    options: [
      '24 vertèbres',
      '26 vertèbres',
      '33 vertèbres',
      '35 vertèbres'
    ],
    correctAnswer: 2,
    explanation: 'La colonne vertébrale comprend 33 vertèbres : 7 cervicales, 12 thoraciques, 5 lombaires, 5 sacrées (soudées en sacrum) et 4 coccygiennes (soudées en coccyx).',
    difficulty: 'moyen',
    category: 'Anatomie',
    points: 10
  }
];

// Medical Images Library
export const medicalImages: MedicalImage[] = [
  {
    id: 'heart-anatomy',
    src: '/images/anatomy/heart-diagram.png',
    title: 'Anatomie du Cœur',
    description: 'Diagramme détaillé du cœur humain montrant les quatre chambres, les valves et les principaux vaisseaux sanguins.',
    category: 'Cardiologie',
    tags: ['cœur', 'anatomie', 'circulation', 'valves'],
    credits: 'Généré par IA - MediMimi'
  },
  {
    id: 'brain-anatomy',
    src: '/images/anatomy/brain-diagram.png',
    title: 'Anatomie du Cerveau',
    description: 'Coupe sagittale du cerveau humain illustrant les principales structures neurologiques et leurs fonctions.',
    category: 'Neurologie',
    tags: ['cerveau', 'neuroanatomie', 'système nerveux', 'lobes'],
    credits: 'Généré par IA - MediMimi'
  },
  {
    id: 'skeleton-chart',
    src: '/images/anatomy/skeleton-chart.png',
    title: 'Système Squelettique',
    description: 'Schéma complet du squelette humain avec nomenclature française des principaux os.',
    category: 'Anatomie',
    tags: ['squelette', 'os', 'ostéologie', 'anatomie'],
    credits: 'Généré par IA - MediMimi'
  },
  {
    id: 'dr-mimi-avatar',
    src: '/images/logos/icon.png',
    title: 'Dr. Mimi - Avatar Médical',
    description: 'Avatar de Dr. Mimi, assistante pédagogique virtuelle spécialisée en éducation médicale.',
    category: 'Personnel',
    tags: ['dr-mimi', 'avatar', 'assistant', 'éducation'],
    credits: 'Généré par IA - Dr.MiMi'
  },
  {
    id: 'respiratory-system-3d',
    src: '/images/anatomy/respiratory-system.png',
    title: 'Système Respiratoire 3D',
    description: 'Modèle anatomique 3D détaillé du système respiratoire montrant les poumons, bronches, trachée et diaphragme.',
    category: 'Anatomie',
    tags: ['poumons', 'respiration', '3D', 'pneumologie'],
    credits: 'Généré par IA - Dr.MiMi'
  },
  {
    id: 'skeletal-system-3d',
    src: '/images/anatomy/skeletal-system.png',
    title: 'Squelette Humain 3D',
    description: 'Visualisation 3D complète du squelette humain avec détails des articulations et structure osseuse.',
    category: 'Anatomie',
    tags: ['squelette', 'os', '3D', 'orthopédie'],
    credits: 'Généré par IA - Dr.MiMi'
  },
  {
    id: 'digestive-system-3d',
    src: '/images/anatomy/digestive-system.png',
    title: 'Système Digestif 3D',
    description: 'Modèle 3D du système digestif présentant l\'estomac, le foie, les intestins et organes annexes.',
    category: 'Anatomie',
    tags: ['digestion', 'estomac', '3D', 'gastroentérologie'],
    credits: 'Généré par IA - Dr.MiMi'
  }
];

// Medical Modules Data
export const medicalModules = [
  {
    id: 'cardiologie',
    name: 'Cardiologie',
    icon: '🫀',
    description: 'Étude du système cardiovasculaire, des pathologies cardiaques et de leur traitement',
    category: 'Clinical',
    difficulty: 'moyen',
    duration: '8 semaines',
    chapters: 12,
    quizCount: cardiologyQuiz.length,
    imageCount: 1,
    color: '#EF4444'
  },
  {
    id: 'neurologie',
    name: 'Neurologie',
    icon: '🧠',
    description: 'Exploration du système nerveux central et périphérique, neuroanatomie et pathologies',
    category: 'Clinical',
    difficulty: 'difficile',
    duration: '10 semaines',
    chapters: 15,
    quizCount: neurologyQuiz.length,
    imageCount: 1,
    color: '#8B5CF6'
  },
  {
    id: 'anatomie',
    name: 'Anatomie',
    icon: '🦴',
    description: 'Structure et organisation du corps humain, de la cellule aux systèmes d\'organes',
    category: 'Preclinical',
    difficulty: 'moyen',
    duration: '12 semaines',
    chapters: 20,
    quizCount: anatomyQuiz.length,
    imageCount: 1,
    color: '#10B981'
  },
  {
    id: 'pharmacologie',
    name: 'Pharmacologie',
    icon: '💊',
    description: 'Mécanismes d\'action des médicaments, pharmacocinétique et pharmacodynamie',
    category: 'Preclinical',
    difficulty: 'difficile',
    duration: '6 semaines',
    chapters: 10,
    quizCount: 0,
    imageCount: 0,
    color: '#F59E0B'
  },
  {
    id: 'dermatologie',
    name: 'Dermatologie',
    icon: '🔬',
    description: 'Pathologies cutanées, diagnostic dermatologique et thérapeutiques spécialisées',
    category: 'Clinical',
    difficulty: 'moyen',
    duration: '4 semaines',
    chapters: 8,
    quizCount: 0,
    imageCount: 0,
    color: '#EC4899'
  },
  {
    id: 'pneumologie',
    name: 'Pneumologie',
    icon: '🫁',
    description: 'Système respiratoire, pathologies pulmonaires et explorations fonctionnelles',
    category: 'Clinical',
    difficulty: 'moyen',
    duration: '6 semaines',
    chapters: 10,
    quizCount: 0,
    imageCount: 0,
    color: '#06B6D4'
  }
];

// Get quiz by module
export const getQuizByModule = (moduleId: string): QuizQuestion[] => {
  switch (moduleId) {
    case 'cardiologie':
      return cardiologyQuiz;
    case 'neurologie':
      return neurologyQuiz;
    case 'anatomie':
      return anatomyQuiz;
    default:
      return [];
  }
};

// Get images by category
export const getImagesByCategory = (category: string): MedicalImage[] => {
  return medicalImages.filter(image => 
    image.category.toLowerCase() === category.toLowerCase()
  );
};

// Get all available categories
export const getImageCategories = (): string[] => {
  return [...new Set(medicalImages.map(image => image.category))];
};