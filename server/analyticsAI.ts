import OpenAI from 'openai';
import { db } from './db';
import { 
  learningAnalytics, 
  studyPatterns, 
  aiRecommendations, 
  performanceMetrics,
  quizAttempts,
  courseEnrollments,
  caseCompletions,
  modules
} from '../shared/schema';
import { eq, sql, and, desc } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AnalyticsData {
  userId: string;
  analytics?: any;
  patterns?: any;
  performance?: any[];
  recentActivity?: any[];
}

export interface AIRecommendationInput {
  type: 'study_plan' | 'content_suggestion' | 'schedule_optimization' | 'weakness_focus' | 'exam_prep' | 'learning_style';
  priority?: 'high' | 'medium' | 'low';
  userId: string;
  analyticsData: AnalyticsData;
}

export class AnalyticsAIService {
  
  // Generate AI-powered recommendations based on user analytics
  static async generateRecommendations(input: AIRecommendationInput): Promise<any> {
    const { userId, analyticsData, type } = input;

    // Build context for AI
    const context = await this.buildAnalyticsContext(analyticsData);

    // Create AI prompt based on recommendation type
    const prompt = this.buildRecommendationPrompt(type, context);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        max_completion_tokens: 1000,
        messages: [
          {
            role: 'system',
            content: `Tu es Dr.MiMi AI Analytics, un assistant expert en éducation médicale qui analyse les performances des étudiants et génère des recommandations personnalisées pour améliorer leur apprentissage. 
            
Tu dois analyser les données analytiques et fournir des recommandations SMART (Spécifiques, Mesurables, Atteignables, Réalistes, Temporelles).

Réponds TOUJOURS en JSON avec cette structure exacte:
{
  "title": "Titre court de la recommandation",
  "description": "Description détaillée (2-3 phrases)",
  "priority": "high|medium|low",
  "actionItems": [
    {
      "action": "Action concrète à réaliser",
      "link": "/path/to/resource (optionnel)",
      "estimatedTime": 30 (minutes, optionnel)
    }
  ],
  "reasoning": "Explication de pourquoi cette recommandation",
  "expectedImpact": "significant_improvement|moderate_improvement|minor_improvement",
  "targetedModules": ["moduleId1", "moduleId2"],
  "targetedSkills": ["skill1", "skill2"],
  "estimatedTimeRequired": 120 (minutes total)
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const aiResponse = completion.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('No AI response generated');
      }

      // Parse AI response (should be JSON)
      let recommendation;
      try {
        recommendation = JSON.parse(aiResponse);
      } catch (e) {
        // If AI didn't return valid JSON, extract key info manually
        recommendation = {
          title: type === 'weakness_focus' ? 'Renforcer vos points faibles' : 'Recommandation personnalisée',
          description: aiResponse.substring(0, 500),
          priority: input.priority || 'medium',
          actionItems: [],
          reasoning: 'Recommandation générée par IA',
          expectedImpact: 'moderate_improvement',
          targetedModules: [],
          targetedSkills: [],
          estimatedTimeRequired: 60
        };
      }

      // Save recommendation to database
      const [savedRecommendation] = await db.insert(aiRecommendations).values({
        userId,
        recommendationType: type,
        priority: recommendation.priority || 'medium',
        title: recommendation.title,
        description: recommendation.description,
        actionItems: recommendation.actionItems,
        aiReasoning: recommendation.reasoning,
        expectedImpact: recommendation.expectedImpact || 'moderate_improvement',
        basedOnMetrics: {
          totalStudyTime: analyticsData.analytics?.totalStudyTime,
          averageScore: analyticsData.analytics?.overallAverageScore,
          weakModules: analyticsData.analytics?.weakModules
        },
        targetedModules: recommendation.targetedModules,
        targetedSkills: recommendation.targetedSkills,
        estimatedTimeRequired: recommendation.estimatedTimeRequired,
        aiModel: 'gpt-4o',
        status: 'active',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
      }).returning();

      return savedRecommendation;

    } catch (error: any) {
      console.error('Error generating AI recommendation:', error);
      throw new Error(`Failed to generate recommendation: ${error.message}`);
    }
  }

  // Predict exam performance based on current analytics
  static async predictExamPerformance(userId: string): Promise<{
    predictedScore: number;
    confidence: number;
    reasoning: string;
    recommendations: string[];
  }> {
    
    // Get user analytics
    const [analytics] = await db.select()
      .from(learningAnalytics)
      .where(eq(learningAnalytics.userId, userId))
      .limit(1);

    const performance = await db.select()
      .from(performanceMetrics)
      .where(eq(performanceMetrics.userId, userId));

    if (!analytics) {
      return {
        predictedScore: 0,
        confidence: 0,
        reasoning: 'Pas assez de données pour faire une prédiction',
        recommendations: ['Complétez plus de quiz pour améliorer la précision de la prédiction']
      };
    }

    const context = {
      averageScore: analytics.overallAverageScore,
      quizSuccessRate: analytics.quizSuccessRate,
      studyTime: analytics.totalStudyTime,
      completionRate: analytics.courseCompletionRate,
      currentStreak: analytics.currentStreak,
      weakModules: analytics.weakModules,
      strongModules: analytics.strongModules
    };

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        max_completion_tokens: 800,
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en prédiction de performance académique médicale. Analyse les données et prédit le score probable à un examen.

Réponds en JSON avec cette structure:
{
  "predictedScore": 75.5,
  "confidence": 85,
  "reasoning": "Explication de la prédiction",
  "recommendations": ["Conseil 1", "Conseil 2", "Conseil 3"]
}`
          },
          {
            role: 'user',
            content: `Analyse ces données et prédit le score d'examen:
            
${JSON.stringify(context, null, 2)}

Fournis une prédiction basée sur:
1. Score moyen actuel et tendances
2. Taux de réussite aux quiz
3. Temps d'étude et régularité
4. Modules faibles vs forts
5. Taux de complétion des cours`
          }
        ]
      });

      const aiResponse = completion.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('No AI prediction generated');
      }

      const prediction = JSON.parse(aiResponse);
      return prediction;

    } catch (error) {
      console.error('Error predicting exam performance:', error);
      return {
        predictedScore: Number(analytics.overallAverageScore) || 0,
        confidence: 50,
        reasoning: 'Prédiction basée sur la moyenne actuelle',
        recommendations: ['Continuez votre travail régulier']
      };
    }
  }

  // Analyze study patterns and detect learning style
  static async analyzeLearningStyle(userId: string): Promise<any> {
    const [patterns] = await db.select()
      .from(studyPatterns)
      .where(eq(studyPatterns.userId, userId))
      .limit(1);

    const recentQuizzes = await db.select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))
      .orderBy(desc(quizAttempts.createdAt))
      .limit(10);

    if (!patterns) {
      return {
        learningStyle: 'unknown',
        recommendations: ['Plus de données nécessaires pour déterminer votre style d\'apprentissage']
      };
    }

    const context = {
      preferredContentType: patterns.preferredContentType,
      visualScore: patterns.visualLearnerScore,
      practicalScore: patterns.practicalLearnerScore,
      theoreticalScore: patterns.theoreticalLearnerScore,
      studyTime: patterns.preferredStudyTime,
      consistencyScore: patterns.consistentLearnerScore,
      cramDetected: patterns.cramStudyDetected
    };

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        max_completion_tokens: 600,
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en styles d'apprentissage médical. Analyse les patterns et détermine le style d'apprentissage optimal.

Réponds en JSON:
{
  "learningStyle": "visual|practical|theoretical|mixed",
  "dominantTraits": ["trait1", "trait2"],
  "recommendations": ["conseil1", "conseil2", "conseil3"],
  "studyTips": ["tip1", "tip2"]
}`
          },
          {
            role: 'user',
            content: `Analyse ce profil d'apprentissage:
            
${JSON.stringify(context, null, 2)}

Détermine le style d'apprentissage et donne des recommandations personnalisées.`
          }
        ]
      });

      const aiResponse = completion.choices[0]?.message?.content;
      return JSON.parse(aiResponse || '{}');

    } catch (error) {
      console.error('Error analyzing learning style:', error);
      return {
        learningStyle: 'mixed',
        recommendations: ['Variez vos méthodes d\'apprentissage']
      };
    }
  }

  // Build comprehensive analytics context for AI
  private static async buildAnalyticsContext(data: AnalyticsData): Promise<string> {
    const { analytics, patterns, performance, recentActivity } = data;

    let context = '# Profil d\'apprentissage de l\'étudiant\n\n';

    if (analytics) {
      context += `## Métriques Générales
- Temps d'étude total: ${analytics.totalStudyTime || 0} minutes
- Score moyen: ${analytics.overallAverageScore || 0}%
- Taux de réussite quiz: ${analytics.quizSuccessRate || 0}%
- Cours complétés: ${analytics.totalCoursesCompleted || 0}/${analytics.totalCoursesEnrolled || 0}
- Série actuelle: ${analytics.currentStreak || 0} jours
- Tendance vélocité: ${analytics.learningVelocityTrend || 'stable'}\n\n`;
    }

    if (patterns) {
      context += `## Patterns d'étude
- Moment préféré: ${patterns.preferredStudyTime || 'non défini'}
- Type de contenu préféré: ${patterns.preferredContentType || 'mixte'}
- Score apprenant visuel: ${patterns.visualLearnerScore || 0}/100
- Score apprenant pratique: ${patterns.practicalLearnerScore || 0}/100
- Score consistance: ${patterns.consistentLearnerScore || 0}/100
- Bachotage détecté: ${patterns.cramStudyDetected ? 'Oui' : 'Non'}\n\n`;
    }

    if (performance && performance.length > 0) {
      context += `## Performance par Module\n`;
      performance.slice(0, 5).forEach((p: any) => {
        context += `- ${p.moduleId}: Score moyen ${p.averageScore}%, ${p.totalAttempts} tentatives, Tendance: ${p.trendDirection}\n`;
      });
      context += '\n';
    }

    if (analytics?.weakModules) {
      context += `## Modules Faibles\n${JSON.stringify(analytics.weakModules, null, 2)}\n\n`;
    }

    if (analytics?.strongModules) {
      context += `## Modules Forts\n${JSON.stringify(analytics.strongModules, null, 2)}\n\n`;
    }

    return context;
  }

  // Build recommendation prompt based on type
  private static buildRecommendationPrompt(type: string, context: string): string {
    const prompts: Record<string, string> = {
      study_plan: `Basé sur ce profil, crée un plan d'étude personnalisé pour la semaine prochaine:

${context}

Génère un plan d'étude SMART qui:
1. Cible les modules faibles
2. Maintient les modules forts
3. Optimise le temps d'étude selon les patterns
4. Inclut des objectifs mesurables`,

      weakness_focus: `Identifie les faiblesses principales et propose un plan de renforcement:

${context}

Analyse les modules faibles et crée des actions concrètes pour améliorer.`,

      exam_prep: `Crée un plan de préparation d'examen optimal:

${context}

Propose une stratégie de révision basée sur:
- Les modules à risque
- Le temps disponible
- Le style d'apprentissage`,

      schedule_optimization: `Optimise l'emploi du temps d'étude:

${context}

Propose un planning hebdomadaire optimal basé sur:
- Les moments de productivité maximale
- Les patterns de session
- Les objectifs d'apprentissage`,

      content_suggestion: `Suggère du contenu pertinent:

${context}

Recommande cours, quiz et cas cliniques adaptés au niveau et aux besoins.`,

      learning_style: `Analyse le style d'apprentissage:

${context}

Identifie le style dominant et donne des conseils pour optimiser l'apprentissage.`
    };

    return prompts[type] || prompts.study_plan;
  }
}

export default AnalyticsAIService;
