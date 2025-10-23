// API Routes for Modules
import type { Express } from "express";
import { db } from './db';
import { modules } from '../shared/schema';
import { eq } from 'drizzle-orm';

export function setupModulesRoutes(app: Express) {

  // GET /api/modules - Get all modules with optional filters
  app.get('/api/modules', async (req, res) => {
    try {
      const { category } = req.query;
      
      const allModules = await db.select().from(modules);
      
      // Apply filters
      const filtered = allModules.filter(module => {
        if (category && category !== 'all' && module.category !== category) return false;
        return true;
      });
      
      // Sort by name
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      
      res.json(filtered);
    } catch (error) {
      console.error('Error fetching modules:', error);
      res.status(500).json({ 
        message: 'Failed to fetch modules',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/modules/:id - Get a single module by ID
  app.get('/api/modules/:id', async (req, res) => {
    try {
      const moduleId = req.params.id;
      
      const [module] = await db.select()
        .from(modules)
        .where(eq(modules.id, moduleId));
      
      if (!module) {
        return res.status(404).json({ message: 'Module not found' });
      }
      
      res.json(module);
    } catch (error) {
      console.error('Error fetching module:', error);
      res.status(500).json({ 
        message: 'Failed to fetch module',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

}
