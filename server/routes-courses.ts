// API Routes for Courses
import type { Express } from "express";
import { db } from './db';
import { courses } from '../shared/schema';
import { eq, desc, and, like, or, sql } from 'drizzle-orm';

export function setupCoursesRoutes(app: Express) {

  // GET /api/courses - Get all courses with optional filters
  app.get('/api/courses', async (req, res) => {
    try {
      const { yearLevel, search, sortBy = 'recent', status = 'published' } = req.query;
      
      // Build query with filters
      let allCourses = await db.select().from(courses);
      
      // Apply filters
      allCourses = allCourses.filter(course => {
        // Status filter
        if (status && course.status !== status) return false;
        
        // Year level filter (yearLevels is jsonb array)
        if (yearLevel && yearLevel !== 'all') {
          const yearLevelsArray = course.yearLevels as any as string[];
          if (!yearLevelsArray || !yearLevelsArray.includes(yearLevel as string)) return false;
        }
        
        // Search filter
        if (search) {
          const searchLower = (search as string).toLowerCase();
          const searchableText = [
            course.title,
            course.titleEn,
            course.titleAr,
            course.description,
            course.descriptionEn,
            course.descriptionAr
          ].filter(Boolean).join(' ').toLowerCase();
          
          if (!searchableText.includes(searchLower)) return false;
        }
        
        return true;
      });
      
      // Sorting
      if (sortBy === 'rating') {
        allCourses.sort((a, b) => {
          const ratingA = parseFloat(a.rating || '0');
          const ratingB = parseFloat(b.rating || '0');
          return ratingB - ratingA;
        });
      } else {
        // Sort by recent (createdAt)
        allCourses.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
      }
      
      res.json(allCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ 
        message: 'Failed to fetch courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/courses/:id - Get a single course by ID
  app.get('/api/courses/:id', async (req, res) => {
    try {
      const courseId = req.params.id;
      
      const [course] = await db.select()
        .from(courses)
        .where(eq(courses.id, courseId));
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      res.json(course);
    } catch (error) {
      console.error('Error fetching course:', error);
      res.status(500).json({ 
        message: 'Failed to fetch course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/courses/by-year/:year - Get courses by year level
  app.get('/api/courses/by-year/:year', async (req, res) => {
    try {
      const year = req.params.year;
      
      const allCourses = await db.select().from(courses);
      
      const yearCourses = allCourses.filter(course => {
        if (course.status !== 'published') return false;
        
        const yearLevelsArray = course.yearLevels as any as string[];
        return yearLevelsArray && yearLevelsArray.includes(year);
      });
      
      // Sort by recent
      yearCourses.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      
      res.json(yearCourses);
    } catch (error) {
      console.error('Error fetching courses by year:', error);
      res.status(500).json({ message: 'Failed to fetch courses by year' });
    }
  });

}
