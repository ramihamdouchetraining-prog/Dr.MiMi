import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

// System prompts pour différents modes d'enseignement
const SYSTEM_PROMPTS = {
  tutor: `Tu es Dr.MiMi, une tutrice médicale intelligente et bienveillante spécialisée dans l'éducation médicale francophone.

**Ton identité :**
- Professeure de médecine expérimentée et chaleureuse
- Spécialiste en pédagogie médicale adaptative
- Maîtrise parfaite du français, anglais et arabe médical
- Passionnée par la réussite des étudiants

**Tes principes pédagogiques :**
1. SOCRATIQUE : Pose des questions pour guider la réflexion
2. ADAPTATIF : Ajuste ton niveau selon l'étudiant (PACES → Résidanat)
3. CLINIQUE : Relie toujours théorie et pratique médicale
4. MNÉMOTECHNIQUE : Propose des acronymes et astuces de mémorisation
5. BIENVEILLANT : Encourage, ne juge jamais

**Ta méthode d'enseignement :**
- Explique d'abord le concept simplement
- Donne des exemples cliniques concrets
- Propose des moyens mnémotechniques
- Vérifie la compréhension par des questions
- Relie aux connaissances antérieures

**Format de réponse :**
📚 CONCEPT : [Explication claire et structurée]
🏥 CLINIQUE : [Cas pratique ou application]
🧠 ASTUCE : [Moyen mnémotechnique si pertinent]
❓ VÉRIFIE : [Question pour tester la compréhension]

Utilise des emojis médicaux appropriés : 🩺💊🫀🧬🔬💉🩸🦴`,

  socratic: `Tu es Dr.MiMi en mode Socratique - tu enseignes par questionnement maïeutique.

**Méthode Socratique Médicale :**
1. Ne donne JAMAIS la réponse directement
2. Pose des questions qui guident vers la solution
3. Pars des connaissances existantes de l'étudiant
4. Construis progressivement le raisonnement clinique

**Structure de dialogue :**
- Commence par une question ouverte
- Approfondis avec des questions ciblées
- Guide vers les indices diagnostiques
- Fais émerger la conclusion par l'étudiant lui-même

**Exemple de progression :**
"Quels sont les signes qui t'alertent dans ce cas ?"
→ "Pourquoi la fièvre est-elle importante ici ?"
→ "Qu'est-ce que cela pourrait signifier pour les voies respiratoires ?"
→ "Excellent ! Tu as identifié le diagnostic toi-même !"`,

  exam: `Tu es Dr.MiMi en mode Examen - tu simules des questions d'examen médical.

**Types d'examens :**
1. QCM : Questions à choix multiples (5 options, 1-2 bonnes réponses)
2. QROC : Questions à réponse ouverte courte
3. Cas cliniques : Vignettes avec questions progressives
4. LCA : Lecture critique d'article

**Critères de qualité :**
- Questions au niveau demandé (PACES, DFGSM, DFASM, Résidanat)
- Distracteurs plausibles et instructifs
- Explications détaillées après chaque réponse
- Scoring et feedback personnalisé

**Format de sortie JSON :**
{
  "type": "qcm|qroc|cas_clinique",
  "question": "...",
  "options": ["A. ...", "B. ...", "C. ...", "D. ...", "E. ..."],
  "correct_answers": ["A", "C"],
  "explanation": "...",
  "difficulty": "paces|dfgsm|dfasm|residanat",
  "topic": "...",
  "learning_objectives": ["..."]
}`,

  clinical: `Tu es Dr.MiMi en mode Raisonnement Clinique - tu enseignes la pensée médicale structurée.

**Approche Hypothético-Déductive :**
1. COLLECTE : Anamnèse + Examen clinique
2. HYPOTHÈSES : Diagnostics différentiels
3. INVESTIGATION : Examens complémentaires ciblés
4. DIAGNOSTIC : Synthèse et conclusion
5. TRAITEMENT : Prise en charge adaptée

**Format de raisonnement :**
🔍 ANALYSE DES DONNÉES
→ Signes positifs : ...
→ Signes négatifs : ...
→ Éléments clés : ...

💭 HYPOTHÈSES DIAGNOSTIQUES
1. Diagnostic principal : ... (arguments pour)
2. Diagnostics différentiels : ...
3. Diagnostics à éliminer : ...

🧪 STRATÉGIE D'INVESTIGATION
→ Examens de première intention : ...
→ Examens de confirmation : ...
→ Critères de gravité : ...

✅ SYNTHÈSE
→ Diagnostic retenu : ...
→ Arguments : ...
→ Conduite à tenir : ...`,

  mnemonics: `Tu es Dr.MiMi en mode Mnémotechnique - spécialiste des astuces de mémorisation médicale.

**Techniques de mémorisation :**
1. ACRONYMES : Mots formés avec premières lettres
2. PHRASES : Histoires mnémotechniques
3. IMAGES : Associations visuelles
4. RIMES : Poèmes médicaux
5. LOCALISATION : Palais de mémoire anatomique

**Exemples de qualité :**
- RICE (Repos, Ice, Compression, Élévation)
- "Sur Le Pouce" : Scaphoïde, Lunatum, Pyramidal (os du carpe)
- Les 5 "P" de l'ischémie : Pain, Paleness, Pulseless, Paresthesia, Paralysis

**Format de sortie :**
🧠 CONCEPT À MÉMORISER : [terme médical]
✨ MOYEN MNÉMOTECHNIQUE : [acronyme/phrase/image]
📝 EXPLICATION : [comment utiliser l'astuce]
🎯 APPLICATION : [contexte d'utilisation]
💡 VARIANTES : [alternatives si utile]`
};

// Types pour l'IA Tutor
export interface TutorRequest {
  mode: 'tutor' | 'socratic' | 'exam' | 'clinical' | 'mnemonics';
  question: string;
  context?: {
    topic?: string;
    level?: 'paces' | 'dfgsm' | 'dfasm' | 'residanat';
    userHistory?: string[];
    previousMessages?: ChatCompletionMessageParam[];
  };
  language?: 'fr' | 'en' | 'ar';
  userId?: number;
}

export interface TutorResponse {
  answer: string;
  suggestions?: string[];
  relatedTopics?: string[];
  difficulty?: string;
  learningPath?: string[];
  metadata?: {
    tokensUsed: number;
    model: string;
    confidence: number;
  };
}

// Fonction principale du Tutor IA
export async function askAITutor(request: TutorRequest): Promise<TutorResponse> {
  const { mode, question, context, language = 'fr' } = request;

  // Construire les messages avec contexte
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: SYSTEM_PROMPTS[mode]
    }
  ];

  // Ajouter le contexte si présent
  if (context?.previousMessages) {
    messages.push(...context.previousMessages);
  }

  // Ajouter des informations contextuelles
  let enhancedQuestion = question;
  if (context?.topic) {
    enhancedQuestion = `[Sujet: ${context.topic}] ${question}`;
  }
  if (context?.level) {
    enhancedQuestion = `[Niveau: ${context.level.toUpperCase()}] ${enhancedQuestion}`;
  }
  if (language !== 'fr') {
    enhancedQuestion = `[Langue: ${language}] ${enhancedQuestion}`;
  }

  messages.push({
    role: "user",
    content: enhancedQuestion
  });

  try {
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages,
      max_completion_tokens: 2048
    });

    const answer = completion.choices[0]?.message?.content || "Désolée, je n'ai pas pu générer de réponse.";

    // Générer des suggestions basées sur le mode
    const suggestions = await generateSuggestions(mode, question, context?.topic);

    return {
      answer,
      suggestions,
      relatedTopics: extractRelatedTopics(answer),
      difficulty: context?.level,
      metadata: {
        tokensUsed: completion.usage?.total_tokens || 0,
        model: completion.model,
        confidence: 0.9
      }
    };
  } catch (error) {
    console.error('❌ AI Tutor Error:', error);
    throw new Error('Erreur lors de la consultation du tuteur IA');
  }
}

// Générer des quiz adaptatifs avec IA
export async function generateAdaptiveQuiz(params: {
  topic: string;
  level: string;
  questionCount: number;
  userId?: number;
}): Promise<any[]> {
  const { topic, level, questionCount } = params;

  const prompt = `Génère exactement ${questionCount} questions QCM de niveau ${level.toUpperCase()} sur le sujet "${topic}".

**Exigences :**
- Chaque question doit avoir 5 options (A à E)
- 1 ou 2 réponses correctes par question
- Difficulté progressive
- Distracteurs plausibles et instructifs
- Explications détaillées

**Format JSON strict :**
{
  "questions": [
    {
      "id": 1,
      "question": "Question médicale précise",
      "options": [
        "A. Option 1",
        "B. Option 2",
        "C. Option 3",
        "D. Option 4",
        "E. Option 5"
      ],
      "correctAnswers": ["A"],
      "explanation": "Explication complète avec références",
      "difficulty": "${level}",
      "topic": "${topic}",
      "subtopic": "Sous-thème spécifique",
      "learningObjectives": ["Objectif 1", "Objectif 2"]
    }
  ]
}`;

  try {
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: SYSTEM_PROMPTS.exam },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 4096
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{"questions": []}');
    return result.questions || [];
  } catch (error) {
    console.error('❌ Quiz Generation Error:', error);
    throw new Error('Erreur lors de la génération du quiz');
  }
}

// Analyser la performance et suggérer un parcours d'apprentissage
export async function analyzeLearningPath(params: {
  userId: number;
  completedTopics: string[];
  weakAreas: string[];
  goals: string[];
}): Promise<{
  recommendations: string[];
  nextTopics: string[];
  studyPlan: any;
  estimatedTime: string;
}> {
  const { completedTopics, weakAreas, goals } = params;

  const prompt = `Analyse ce profil d'étudiant en médecine et propose un parcours d'apprentissage personnalisé.

**Profil :**
- Sujets maîtrisés : ${completedTopics.join(', ')}
- Points faibles : ${weakAreas.join(', ')}
- Objectifs : ${goals.join(', ')}

**Génère un plan d'étude personnalisé au format JSON :**
{
  "analysis": "Analyse du profil de l'étudiant",
  "recommendations": ["Recommandation 1", "Recommandation 2", ...],
  "nextTopics": ["Sujet prioritaire 1", "Sujet 2", ...],
  "studyPlan": {
    "week1": { "topics": [...], "activities": [...], "goals": [...] },
    "week2": { "topics": [...], "activities": [...], "goals": [...] },
    "week3": { "topics": [...], "activities": [...], "goals": [...] },
    "week4": { "topics": [...], "activities": [...], "goals": [...] }
  },
  "estimatedTime": "4 semaines",
  "milestones": ["Milestone 1", "Milestone 2", ...],
  "resources": ["Ressource 1", "Ressource 2", ...]
}`;

  try {
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "Tu es un conseiller pédagogique médical expert en planification d'études."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 3072
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return {
      recommendations: result.recommendations || [],
      nextTopics: result.nextTopics || [],
      studyPlan: result.studyPlan || {},
      estimatedTime: result.estimatedTime || "Non défini"
    };
  } catch (error) {
    console.error('❌ Learning Path Error:', error);
    throw new Error('Erreur lors de l\'analyse du parcours');
  }
}

// Générer des explications visuelles et diagrammes (en markdown/mermaid)
export async function generateVisualExplanation(topic: string): Promise<string> {
  const prompt = `Explique "${topic}" avec un diagramme Mermaid et une explication visuelle.

**Format attendu :**
## 📊 Diagramme

\`\`\`mermaid
[Ton diagramme Mermaid ici - flowchart, sequence, class, etc.]
\`\`\`

## 📝 Explication Visuelle

[Explication qui accompagne le diagramme avec des emojis et une structure claire]

**Utilise le type de diagramme approprié :**
- Flowchart : Pour les processus, algorithmes
- Sequence : Pour les interactions temporelles
- Class : Pour les structures anatomiques
- Graph : Pour les relations entre concepts`;

  try {
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en visualisation de concepts médicaux avec Mermaid diagrams."
        },
        { role: "user", content: prompt }
      ],
      max_completion_tokens: 2048
    });

    return completion.choices[0]?.message?.content || "Erreur de génération";
  } catch (error) {
    console.error('❌ Visual Explanation Error:', error);
    throw new Error('Erreur lors de la génération visuelle');
  }
}

// Fonctions utilitaires
async function generateSuggestions(mode: string, question: string, topic?: string): Promise<string[]> {
  const suggestions: Record<string, string[]> = {
    tutor: [
      "Demande un exemple clinique concret",
      "Demande un moyen mnémotechnique",
      "Demande une explication plus simple"
    ],
    socratic: [
      "Continue le questionnement",
      "Demande un indice supplémentaire",
      "Vérifie ta compréhension"
    ],
    exam: [
      "Génère plus de questions similaires",
      "Demande l'explication détaillée",
      "Passe au niveau suivant"
    ],
    clinical: [
      "Analyse un cas similaire",
      "Explore les diagnostics différentiels",
      "Demande la stratégie thérapeutique"
    ],
    mnemonics: [
      "Demande d'autres astuces",
      "Crée ton propre moyen mnémotechnique",
      "Teste ta mémorisation"
    ]
  };

  return suggestions[mode] || [];
}

function extractRelatedTopics(answer: string): string[] {
  // Simple extraction basée sur des mots-clés médicaux courants
  const medicalTerms = answer.match(/\b[A-Z][a-zéèêàù]+(?:\s+[a-zéèêàù]+){0,2}\b/g) || [];
  return [...new Set(medicalTerms)].slice(0, 5);
}

// Export des fonctions principales
export default {
  askAITutor,
  generateAdaptiveQuiz,
  analyzeLearningPath,
  generateVisualExplanation
};
