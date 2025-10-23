// API Routes for Summaries
import type { Express } from "express";
import { db } from './db';
import { summaries } from '../shared/schema';
import { eq, desc } from 'drizzle-orm';

export function setupSummariesRoutes(app: Express) {

  // GET /api/summaries - Get all summaries with optional filters
  app.get('/api/summaries', async (req, res) => {
    try {
      const { status = 'published', language } = req.query;
      
      const allSummaries = await db.select().from(summaries);
      
      // Apply filters
      const filtered = allSummaries.filter(summary => {
        if (status && summary.status !== status) return false;
        if (language && language !== 'all' && summary.language !== language) return false;
        return true;
      });
      
      // Sort by recent
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      
      res.json(filtered);
    } catch (error) {
      console.error('Error fetching summaries:', error);
      res.status(500).json({ 
        message: 'Failed to fetch summaries',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/summaries/:id - Get a single summary by ID
  app.get('/api/summaries/:id', async (req, res) => {
    try {
      const summaryId = req.params.id;
      
      const [summary] = await db.select()
        .from(summaries)
        .where(eq(summaries.id, summaryId));
      
      if (!summary) {
        return res.status(404).json({ message: 'Summary not found' });
      }
      
      res.json(summary);
    } catch (error) {
      console.error('Error fetching summary:', error);
      res.status(500).json({ 
        message: 'Failed to fetch summary',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

}
