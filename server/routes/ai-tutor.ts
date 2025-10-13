import { Router } from 'express';
import {
  askAITutor,
  generateAdaptiveQuiz,
  analyzeLearningPath,
  generateVisualExplanation,
  type TutorRequest
} from '../ai-tutor';
import { db } from '../db';
import { quizAttempts, enrollments, users } from '../../shared/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// Middleware pour vérifier l'authentification
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  next();
};

// POST /api/ai-tutor/ask - Poser une question au tuteur IA
router.post('/ask', requireAuth, async (req, res) => {
  try {
    const { mode, question, context, language } = req.body;
    const userId = req.session.userId as string;

    if (!question) {
      return res.status(400).json({ error: 'Question requise' });
    }

    const tutorRequest: TutorRequest = {
      mode: mode || 'tutor',
      question,
      context,
      language: language || 'fr',
      userId: parseInt(userId) || undefined
    };

    const response = await askAITutor(tutorRequest);

    res.json({
      success: true,
      data: response
    });
  } catch (error: any) {
    console.error('❌ AI Tutor Ask Error:', error);
    res.status(500).json({ error: error.message || 'Erreur du tuteur IA' });
  }
});

// POST /api/ai-tutor/quiz/generate - Générer un quiz adaptatif
router.post('/quiz/generate', requireAuth, async (req, res) => {
  try {
    const { topic, level, questionCount = 5 } = req.body;
    const userId = req.session.userId as string;

    if (!topic || !level) {
      return res.status(400).json({ error: 'Sujet et niveau requis' });
    }

    const questions = await generateAdaptiveQuiz({
      topic,
      level,
      questionCount,
      userId: parseInt(userId) || undefined
    });

    res.json({
      success: true,
      data: {
        quiz: {
          title: `Quiz adaptatif : ${topic}`,
          topic,
          level,
          questions,
          generatedAt: new Date().toISOString()
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Quiz Generation Error:', error);
    res.status(500).json({ error: error.message || 'Erreur de génération du quiz' });
  }
});

// POST /api/ai-tutor/learning-path - Analyser et suggérer un parcours d'apprentissage
router.post('/learning-path', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId as string;

    // Récupérer l'historique de l'utilisateur
    const progress = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.userId, userId));

    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))
      .orderBy(desc(quizAttempts.createdAt));

    // Analyser les sujets maîtrisés et faibles
    const completedTopics = progress
      .filter(p => p.status === 'completed')
      .map(p => 'Cours terminé');

    const weakAreas = attempts
      .filter(a => a.score && a.score < 60)
      .map(a => 'Quiz avec faible score')
      .slice(0, 5);

    const { goals = [] } = req.body;

    const learningPath = await analyzeLearningPath({
      userId: parseInt(userId),
      completedTopics,
      weakAreas,
      goals
    });

    res.json({
      success: true,
      data: learningPath
    });
  } catch (error: any) {
    console.error('❌ Learning Path Error:', error);
    res.status(500).json({ error: error.message || 'Erreur d\'analyse du parcours' });
  }
});

// POST /api/ai-tutor/explain-visual - Générer une explication visuelle
router.post('/explain-visual', requireAuth, async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Sujet requis' });
    }

    const explanation = await generateVisualExplanation(topic);

    res.json({
      success: true,
      data: {
        topic,
        explanation,
        format: 'markdown+mermaid'
      }
    });
  } catch (error: any) {
    console.error('❌ Visual Explanation Error:', error);
    res.status(500).json({ error: error.message || 'Erreur d\'explication visuelle' });
  }
});

// GET /api/ai-tutor/stats - Statistiques d'utilisation du tuteur IA
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId as string;

    // Récupérer les statistiques d'utilisation (à implémenter avec un tracking)
    // Pour l'instant, retourner des stats basiques
    const progress = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.userId, userId));

    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId));

    const stats = {
      totalInteractions: attempts.length,
      averageScore: attempts.reduce((acc, a) => acc + (a.score || 0), 0) / attempts.length || 0,
      topicsCompleted: progress.filter(p => p.status === 'completed').length,
      studyStreak: 0, // À implémenter
      timeSpent: 0, // À implémenter
      strongAreas: [],
      weakAreas: []
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('❌ Stats Error:', error);
    res.status(500).json({ error: error.message || 'Erreur de statistiques' });
  }
});

// POST /api/ai-tutor/feedback - Envoyer un feedback sur une réponse IA
router.post('/feedback', requireAuth, async (req, res) => {
  try {
    const { interactionId, rating, comment } = req.body;
    const userId = req.session.userId as string;

    // Sauvegarder le feedback (à implémenter avec une table dédiée)
    console.log('📊 AI Feedback:', { userId, interactionId, rating, comment });

    res.json({
      success: true,
      message: 'Merci pour votre feedback !'
    });
  } catch (error: any) {
    console.error('❌ Feedback Error:', error);
    res.status(500).json({ error: error.message || 'Erreur de feedback' });
  }
});

export default router;
