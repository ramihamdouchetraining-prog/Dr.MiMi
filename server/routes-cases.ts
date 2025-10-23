// API Routes for Clinical Cases
import type { Express } from "express";
import { db } from './db';
import { cases } from '../shared/schema';
import { eq } from 'drizzle-orm';

export function setupCasesRoutes(app: Express) {

  // GET /api/cases - Get all cases with optional filters
  app.get('/api/cases', async (req, res) => {
    try {
      const { status = 'published', difficulty } = req.query;
      
      const allCases = await db.select().from(cases);
      
      // Apply filters
      const filtered = allCases.filter(caseItem => {
        if (status && caseItem.status !== status) return false;
        if (difficulty && difficulty !== 'all' && caseItem.difficulty !== difficulty) return false;
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
      console.error('Error fetching cases:', error);
      res.status(500).json({ 
        message: 'Failed to fetch cases',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/cases/:id - Get a single case by ID
  app.get('/api/cases/:id', async (req, res) => {
    try {
      const caseId = req.params.id;
      
      const [clinicalCase] = await db.select()
        .from(cases)
        .where(eq(cases.id, caseId));
      
      if (!clinicalCase) {
        return res.status(404).json({ message: 'Case not found' });
      }
      
      res.json(clinicalCase);
    } catch (error) {
      console.error('Error fetching case:', error);
      res.status(500).json({ 
        message: 'Failed to fetch case',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

}
