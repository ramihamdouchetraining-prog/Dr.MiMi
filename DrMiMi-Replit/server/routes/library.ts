import { Router } from "express";
import { db } from "../db";
import { 
  libraryItems, 
  libraryCategories, 
  libraryFavorites, 
  libraryRatings,
  libraryDownloads 
} from "../../shared/schema";
import { eq, and, or, sql, desc, asc, like, ilike, SQL } from "drizzle-orm";
import { requirePermission } from "../rbac";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Helper to get authenticated user ID from RBAC middleware
function getAuthenticatedUserId(req: any): string {
  const userId = req.user?.claims?.sub || req.session?.adminUserId;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return userId;
}

// Helper to get authenticated user ID (returns null if not authenticated)
function tryGetAuthenticatedUserId(req: any): string | null {
  return req.user?.claims?.sub || req.session?.adminUserId || null;
}

const uploadDir = path.join(process.cwd(), 'uploads', 'library');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|epub|mp3|mp4|jpg|jpeg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, EPUB, MP3, MP4, and images are allowed.'));
    }
  }
});

// ================== CATEGORIES ==================

router.get('/categories', async (req, res) => {
  try {
    const { section } = req.query;
    
    const categories = section
      ? await db.select().from(libraryCategories).where(eq(libraryCategories.section, section as any))
      : await db.select().from(libraryCategories);
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching library categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/categories', requirePermission('content.create'), async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    
    const [category] = await db.insert(libraryCategories)
      .values({
        ...req.body,
        createdBy: userId,
      })
      .returning();
    
    res.json(category);
  } catch (error) {
    console.error('Error creating library category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// ================== LIBRARY ITEMS ==================

router.get('/items', async (req, res) => {
  try {
    const { 
      section, 
      categoryId, 
      status, 
      format, 
      madhhab, 
      level,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    const conditions: SQL<unknown>[] = [];
    
    if (section) {
      conditions.push(eq(libraryItems.section, section as any));
    }
    
    if (categoryId) {
      conditions.push(eq(libraryItems.categoryId, categoryId as any));
    }
    
    if (status) {
      conditions.push(eq(libraryItems.status, status as any));
    } else {
      conditions.push(eq(libraryItems.status, 'approved'));
    }
    
    if (format) {
      conditions.push(eq(libraryItems.format, format as any));
    }
    
    if (madhhab) {
      conditions.push(eq(libraryItems.madhhab, madhhab as any));
    }
    
    if (level) {
      const category = await db.select()
        .from(libraryCategories)
        .where(eq(libraryCategories.level, level as any));
      
      if (category.length > 0) {
        conditions.push(eq(libraryItems.categoryId, category[0].id));
      }
    }
    
    if (search) {
      conditions.push(
        or(
          ilike(libraryItems.title, `%${search}%`),
          ilike(libraryItems.titleEn, `%${search}%`),
          ilike(libraryItems.titleAr, `%${search}%`),
          ilike(libraryItems.author, `%${search}%`),
          ilike(libraryItems.description, `%${search}%`)
        )!
      );
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const sortByColumn = sortBy === 'createdAt' ? libraryItems.createdAt :
                         sortBy === 'rating' ? libraryItems.rating :
                         sortBy === 'downloadCount' ? libraryItems.downloadCount :
                         libraryItems.createdAt;
    
    const orderByClause = sortOrder === 'asc' ? asc(sortByColumn) : desc(sortByColumn);
    
    const items = await db.select()
      .from(libraryItems)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(Number(limit))
      .offset(offset);
    
    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(libraryItems)
      .where(whereClause);
    
    res.json({
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil(count / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching library items:', error);
    res.status(500).json({ error: 'Failed to fetch library items' });
  }
});

router.get('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [item] = await db.select()
      .from(libraryItems)
      .where(eq(libraryItems.id, id));
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    await db.update(libraryItems)
      .set({ viewCount: sql`${libraryItems.viewCount} + 1` })
      .where(eq(libraryItems.id, id));
    
    res.json(item);
  } catch (error) {
    console.error('Error fetching library item:', error);
    res.status(500).json({ error: 'Failed to fetch library item' });
  }
});

router.post('/items', upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
  { name: 'audioFile', maxCount: 1 },
  { name: 'videoFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const userId = tryGetAuthenticatedUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const fileUrl = files['file']?.[0]?.filename 
      ? `/uploads/library/${files['file'][0].filename}` 
      : null;
    const coverImage = files['coverImage']?.[0]?.filename 
      ? `/uploads/library/${files['coverImage'][0].filename}` 
      : null;
    const audioUrl = files['audioFile']?.[0]?.filename 
      ? `/uploads/library/${files['audioFile'][0].filename}` 
      : null;
    const videoUrl = files['videoFile']?.[0]?.filename 
      ? `/uploads/library/${files['videoFile'][0].filename}` 
      : null;
    
    const fileSize = files['file']?.[0]?.size || 0;
    
    const itemData = {
      ...req.body,
      fileUrl,
      coverImage,
      audioUrl,
      videoUrl,
      fileSize,
      submittedBy: userId,
      status: 'pending' as const,
      tags: req.body.tags ? JSON.parse(req.body.tags) : null,
      keywords: req.body.keywords ? JSON.parse(req.body.keywords) : null,
      previewImages: req.body.previewImages ? JSON.parse(req.body.previewImages) : null,
    };
    
    const [item] = await db.insert(libraryItems)
      .values(itemData)
      .returning();
    
    res.json(item);
  } catch (error) {
    console.error('Error creating library item:', error);
    res.status(500).json({ error: 'Failed to create library item' });
  }
});

router.patch('/items/:id', requirePermission('content.edit'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [item] = await db.update(libraryItems)
      .set({
        ...req.body,
        updatedAt: new Date()
      })
      .where(eq(libraryItems.id, id))
      .returning();
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error updating library item:', error);
    res.status(500).json({ error: 'Failed to update library item' });
  }
});

router.post('/items/:id/approve', requirePermission('content.approve'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getAuthenticatedUserId(req);
    
    const [item] = await db.update(libraryItems)
      .set({
        status: 'approved',
        approvedBy: userId,
        approvedAt: new Date()
      })
      .where(eq(libraryItems.id, id))
      .returning();
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error approving library item:', error);
    res.status(500).json({ error: 'Failed to approve library item' });
  }
});

router.post('/items/:id/reject', requirePermission('content.approve'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = getAuthenticatedUserId(req);
    
    const [item] = await db.update(libraryItems)
      .set({
        status: 'rejected',
        rejectionReason: reason,
        rejectedBy: userId,
        rejectedAt: new Date()
      })
      .where(eq(libraryItems.id, id))
      .returning();
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error rejecting library item:', error);
    res.status(500).json({ error: 'Failed to reject library item' });
  }
});

router.delete('/items/:id', requirePermission('content.delete'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [item] = await db.select()
      .from(libraryItems)
      .where(eq(libraryItems.id, id));
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    if (item.fileUrl) {
      const filePath = path.join(process.cwd(), item.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await db.delete(libraryItems)
      .where(eq(libraryItems.id, id));
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting library item:', error);
    res.status(500).json({ error: 'Failed to delete library item' });
  }
});

// ================== FAVORITES ==================

router.get('/favorites', async (req, res) => {
  try {
    const userId = tryGetAuthenticatedUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const favorites = await db.select({
      favorite: libraryFavorites,
      item: libraryItems
    })
      .from(libraryFavorites)
      .innerJoin(libraryItems, eq(libraryFavorites.itemId, libraryItems.id))
      .where(eq(libraryFavorites.userId, userId));
    
    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

router.post('/favorites/:itemId', async (req, res) => {
  try {
    const userId = tryGetAuthenticatedUserId(req);
    const { itemId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const [favorite] = await db.insert(libraryFavorites)
      .values({
        userId,
        itemId,
        notes: req.body.notes
      })
      .returning();
    
    await db.update(libraryItems)
      .set({ favoriteCount: sql`${libraryItems.favoriteCount} + 1` })
      .where(eq(libraryItems.id, itemId));
    
    res.json(favorite);
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

router.delete('/favorites/:itemId', async (req, res) => {
  try {
    const userId = tryGetAuthenticatedUserId(req);
    const { itemId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    await db.delete(libraryFavorites)
      .where(
        and(
          eq(libraryFavorites.userId, userId),
          eq(libraryFavorites.itemId, itemId)
        )
      );
    
    await db.update(libraryItems)
      .set({ favoriteCount: sql`${libraryItems.favoriteCount} - 1` })
      .where(eq(libraryItems.id, itemId));
    
    res.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// ================== RATINGS ==================

router.post('/ratings/:itemId', async (req, res) => {
  try {
    const userId = tryGetAuthenticatedUserId(req);
    const { itemId } = req.params;
    const { rating, review } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const existing = await db.select()
      .from(libraryRatings)
      .where(
        and(
          eq(libraryRatings.userId, userId),
          eq(libraryRatings.itemId, itemId)
        )
      );
    
    let ratingRecord;
    
    if (existing.length > 0) {
      [ratingRecord] = await db.update(libraryRatings)
        .set({ rating, review, updatedAt: new Date() })
        .where(eq(libraryRatings.id, existing[0].id))
        .returning();
    } else {
      [ratingRecord] = await db.insert(libraryRatings)
        .values({ userId, itemId, rating, review })
        .returning();
    }
    
    const ratings = await db.select()
      .from(libraryRatings)
      .where(eq(libraryRatings.itemId, itemId));
    
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    
    await db.update(libraryItems)
      .set({ 
        rating: avgRating.toFixed(2),
        ratingCount: ratings.length
      })
      .where(eq(libraryItems.id, itemId));
    
    res.json(ratingRecord);
  } catch (error) {
    console.error('Error rating item:', error);
    res.status(500).json({ error: 'Failed to rate item' });
  }
});

// ================== DOWNLOADS ==================

router.post('/downloads/:itemId', async (req, res) => {
  try {
    const userId = tryGetAuthenticatedUserId(req);
    const { itemId } = req.params;
    
    await db.insert(libraryDownloads)
      .values({
        userId,
        itemId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
    
    await db.update(libraryItems)
      .set({ downloadCount: sql`${libraryItems.downloadCount} + 1` })
      .where(eq(libraryItems.id, itemId));
    
    res.json({ message: 'Download tracked successfully' });
  } catch (error) {
    console.error('Error tracking download:', error);
    res.status(500).json({ error: 'Failed to track download' });
  }
});

// ================== SEARCH ==================

router.get('/search', async (req, res) => {
  try {
    const { q, section, format, limit = 20 } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const conditions: SQL<unknown>[] = [
      eq(libraryItems.status, 'approved'),
      or(
        ilike(libraryItems.title, `%${q}%`),
        ilike(libraryItems.titleEn, `%${q}%`),
        ilike(libraryItems.titleAr, `%${q}%`),
        ilike(libraryItems.author, `%${q}%`),
        ilike(libraryItems.authorEn, `%${q}%`),
        ilike(libraryItems.authorAr, `%${q}%`),
        ilike(libraryItems.description, `%${q}%`),
        sql`${libraryItems.tags}::text ILIKE ${'%' + q + '%'}`,
        sql`${libraryItems.keywords}::text ILIKE ${'%' + q + '%'}`
      )!
    ];
    
    if (section) {
      conditions.push(eq(libraryItems.section, section as any));
    }
    
    if (format) {
      conditions.push(eq(libraryItems.format, format as any));
    }
    
    const items = await db.select()
      .from(libraryItems)
      .where(and(...conditions))
      .orderBy(desc(libraryItems.rating), desc(libraryItems.downloadCount))
      .limit(Number(limit));
    
    res.json(items);
  } catch (error) {
    console.error('Error searching library:', error);
    res.status(500).json({ error: 'Failed to search library' });
  }
});

// ================== STATS ==================

router.get('/stats', async (req, res) => {
  try {
    const { section } = req.query;
    
    const conditions = section 
      ? eq(libraryItems.section, section as any)
      : undefined;
    
    const [stats] = await db.select({
      total: sql<number>`count(*)`,
      approved: sql<number>`count(*) FILTER (WHERE status = 'approved')`,
      pending: sql<number>`count(*) FILTER (WHERE status = 'pending')`,
      rejected: sql<number>`count(*) FILTER (WHERE status = 'rejected')`,
      totalDownloads: sql<number>`sum(${libraryItems.downloadCount})`,
      avgRating: sql<number>`avg(${libraryItems.rating})`
    })
      .from(libraryItems)
      .where(conditions);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
