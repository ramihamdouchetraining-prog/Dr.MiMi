import express from 'express';
import { sql, eq, desc, and, gte } from 'drizzle-orm';
import { db } from '../db';
import {
  gameScores,
  gameProgress,
  gameLeaderboard,
  gameAchievements,
  medicalCases,
  anatomyPuzzles,
  medicineMatchPairs,
  emergencyScenarios,
  chemicalFormulas,
} from '../../shared/schema';

const router = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// GET /api/games/puzzles - Get list of available puzzles
router.get('/puzzles', async (req, res) => {
  try {
    const { type } = req.query;
    
    let puzzles;
    switch(type) {
      case 'anatomy':
        puzzles = await db.select().from(anatomyPuzzles).orderBy(anatomyPuzzles.orderIndex);
        break;
      case 'medicine':
        puzzles = await db.select().from(medicineMatchPairs);
        break;
      case 'emergency':
        puzzles = await db.select().from(emergencyScenarios);
        break;
      case 'chemistry':
        puzzles = await db.select().from(chemicalFormulas);
        break;
      default:
        // Return all types
        const [anatomy, medicine, emergency, chemistry] = await Promise.all([
          db.select().from(anatomyPuzzles).limit(5),
          db.select().from(medicineMatchPairs).limit(5),
          db.select().from(emergencyScenarios).limit(5),
          db.select().from(chemicalFormulas).limit(5),
        ]);
        puzzles = { anatomy, medicine, emergency, chemistry };
    }
    
    res.json(puzzles);
  } catch (error) {
    console.error('Error fetching puzzles:', error);
    res.status(500).json({ error: 'Failed to fetch puzzles' });
  }
});

// GET /api/games/cases - Get medical cases for Diagnostic Detective
router.get('/cases', async (req, res) => {
  try {
    const { difficulty, category } = req.query;
    
    let query = db.select().from(medicalCases).where(eq(medicalCases.isActive, true));
    
    const cases = await query;
    
    // Filter by difficulty if specified
    const filteredCases = cases.filter(c => {
      if (difficulty && c.difficulty !== difficulty) return false;
      if (category && c.category !== category) return false;
      return true;
    });
    
    res.json(filteredCases);
  } catch (error) {
    console.error('Error fetching medical cases:', error);
    res.status(500).json({ error: 'Failed to fetch medical cases' });
  }
});

// POST /api/games/score - Save game score
router.post('/score', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { gameType, score, timeSpent, difficulty, level, accuracy } = req.body;
    
    // Validate input
    if (!gameType || score === undefined || !timeSpent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Save score
    const [newScore] = await db.insert(gameScores).values({
      userId,
      gameType,
      score,
      timeSpent,
      difficulty: difficulty || 'facile',
      level: level || 1,
      accuracy,
    }).returning();
    
    // Update player progress
    const [existingProgress] = await db
      .select()
      .from(gameProgress)
      .where(and(
        eq(gameProgress.userId, userId),
        eq(gameProgress.gameType, gameType)
      ))
      .limit(1);
    
    if (existingProgress) {
      // Update existing progress
      const totalXp = existingProgress.totalXp + Math.floor(score / 10);
      const maxLevel = Math.max(existingProgress.maxLevel, level || 1);
      
      await db
        .update(gameProgress)
        .set({
          currentLevel: level || existingProgress.currentLevel,
          maxLevel,
          totalXp,
          lastPlayedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(gameProgress.id, existingProgress.id));
    } else {
      // Create new progress entry
      await db.insert(gameProgress).values({
        userId,
        gameType,
        currentLevel: level || 1,
        maxLevel: level || 1,
        totalXp: Math.floor(score / 10),
        achievements: [],
        unlockedItems: [],
        dailyStreak: 1,
      });
    }
    
    // Update leaderboard
    await updateLeaderboard(userId, gameType, score);
    
    // Check for achievements
    const newAchievements = await checkAchievements(userId, gameType, score, timeSpent, accuracy);
    
    res.json({
      score: newScore,
      newAchievements,
    });
  } catch (error) {
    console.error('Error saving game score:', error);
    res.status(500).json({ error: 'Failed to save game score' });
  }
});

// GET /api/games/leaderboard - Get top players
router.get('/leaderboard', async (req, res) => {
  try {
    const { gameType = 'overall', period = 'weekly' } = req.query;
    
    const leaderboardData = await db
      .select({
        userId: gameLeaderboard.userId,
        gameType: gameLeaderboard.gameType,
        score: gameLeaderboard.score,
        rank: gameLeaderboard.rank,
        gamesPlayed: gameLeaderboard.gamesPlayed,
        averageScore: gameLeaderboard.averageScore,
      })
      .from(gameLeaderboard)
      .where(and(
        eq(gameLeaderboard.gameType, gameType as string),
        eq(gameLeaderboard.period, period as any)
      ))
      .orderBy(desc(gameLeaderboard.score))
      .limit(10);
    
    res.json(leaderboardData);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/games/progress/:userId - Get user progress
router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const progress = await db
      .select()
      .from(gameProgress)
      .where(eq(gameProgress.userId, userId));
    
    const scores = await db
      .select()
      .from(gameScores)
      .where(eq(gameScores.userId, userId))
      .orderBy(desc(gameScores.completedAt))
      .limit(20);
    
    res.json({
      progress,
      recentScores: scores,
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

// GET /api/games/achievements - Get available achievements
router.get('/achievements', async (req, res) => {
  try {
    const achievements = await db
      .select()
      .from(gameAchievements)
      .orderBy(gameAchievements.category, gameAchievements.xpReward);
    
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// GET /api/games/stats - Get game statistics
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Get user's total stats
    const userScores = await db
      .select({
        totalGames: sql<number>`count(*)`,
        totalScore: sql<number>`sum(${gameScores.score})`,
        avgScore: sql<number>`avg(${gameScores.score})`,
        totalTime: sql<number>`sum(${gameScores.timeSpent})`,
      })
      .from(gameScores)
      .where(eq(gameScores.userId, userId));
    
    // Get progress for each game
    const progress = await db
      .select()
      .from(gameProgress)
      .where(eq(gameProgress.userId, userId));
    
    // Get recent achievements
    const userProgress = await db
      .select()
      .from(gameProgress)
      .where(eq(gameProgress.userId, userId));
    
    const allAchievementIds = userProgress.flatMap(p => p.achievements || []);
    
    res.json({
      stats: userScores[0],
      progress,
      achievementCount: allAchievementIds.length,
    });
  } catch (error) {
    console.error('Error fetching game stats:', error);
    res.status(500).json({ error: 'Failed to fetch game statistics' });
  }
});

// Helper function to update leaderboard
async function updateLeaderboard(userId: string, gameType: string, score: number) {
  const periods = ['daily', 'weekly', 'monthly', 'alltime'];
  
  for (const period of periods) {
    const [existing] = await db
      .select()
      .from(gameLeaderboard)
      .where(and(
        eq(gameLeaderboard.userId, userId),
        eq(gameLeaderboard.gameType, gameType),
        eq(gameLeaderboard.period, period as any)
      ))
      .limit(1);
    
    if (existing) {
      const newTotalScore = existing.score + score;
      const newGamesPlayed = existing.gamesPlayed + 1;
      const newAvgScore = newTotalScore / newGamesPlayed;
      
      await db
        .update(gameLeaderboard)
        .set({
          score: newTotalScore,
          gamesPlayed: newGamesPlayed,
          averageScore: newAvgScore.toString(),
          updatedAt: new Date(),
        })
        .where(eq(gameLeaderboard.id, existing.id));
    } else {
      await db.insert(gameLeaderboard).values({
        userId,
        gameType,
        period: period as any,
        score,
        gamesPlayed: 1,
        averageScore: score.toString(),
      });
    }
  }
  
  // Update overall score
  const overallScore = await db
    .select({
      totalScore: sql<number>`sum(${gameScores.score})`,
    })
    .from(gameScores)
    .where(eq(gameScores.userId, userId));
  
  if (overallScore[0]?.totalScore) {
    for (const period of periods) {
      await db
        .insert(gameLeaderboard)
        .values({
          userId,
          gameType: 'overall',
          period: period as any,
          score: overallScore[0].totalScore,
          gamesPlayed: 1,
        })
        .onConflictDoUpdate({
          target: [gameLeaderboard.userId, gameLeaderboard.gameType, gameLeaderboard.period],
          set: {
            score: overallScore[0].totalScore,
            updatedAt: new Date(),
          },
        });
    }
  }
}

// Helper function to check achievements
async function checkAchievements(
  userId: string,
  gameType: string,
  score: number,
  timeSpent: number,
  accuracy?: number
): Promise<any[]> {
  const achievements: any[] = [];
  
  // Check speed achievements
  if (timeSpent < 60 && score > 80) {
    achievements.push({
      type: 'speed',
      name: 'Éclair',
      description: 'Terminer un jeu en moins d\'une minute avec un score >80',
    });
  }
  
  // Check accuracy achievements
  if (accuracy && accuracy > 95) {
    achievements.push({
      type: 'accuracy',
      name: 'Précision Parfaite',
      description: 'Atteindre 95% de précision',
    });
  }
  
  // Check score achievements
  if (score === 100) {
    achievements.push({
      type: 'completion',
      name: 'Perfection',
      description: 'Score parfait de 100',
    });
  }
  
  // Update user's achievements
  if (achievements.length > 0) {
    const [progress] = await db
      .select()
      .from(gameProgress)
      .where(and(
        eq(gameProgress.userId, userId),
        eq(gameProgress.gameType, gameType)
      ))
      .limit(1);
    
    if (progress) {
      const currentAchievements = progress.achievements || [];
      const newAchievements = [...currentAchievements, ...achievements.map(a => a.name)];
      
      await db
        .update(gameProgress)
        .set({
          achievements: newAchievements,
          updatedAt: new Date(),
        })
        .where(eq(gameProgress.id, progress.id));
    }
  }
  
  return achievements;
}

export default router;