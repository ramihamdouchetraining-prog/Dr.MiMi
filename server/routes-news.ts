// Routes for News/Articles/Blog Posts - Public and Admin
import type { Express } from "express";
import { storage } from "./storage";
import { isAuthenticated } from "./replitAuth";

export function setupNewsRoutes(app: Express) {
  
  // ===== PUBLIC ROUTES =====
  
  /**
   * GET /api/news
   * Get all published blog posts/articles (public access)
   * Query params: ?category=Research&featured=true&sort=recent|popular|trending
   */
  app.get('/api/news', async (req, res) => {
    try {
      const { category, featured, sort = 'recent' } = req.query;
      
      const filters: any = {
        status: 'published' // Only show published articles to public
      };
      
      if (category && category !== 'all') {
        filters.category = category as string;
      }
      
      if (featured === 'true') {
        filters.featured = true;
      }
      
      let posts = await storage.getBlogPosts(filters);
      
      // Sort logic
      if (sort === 'popular') {
        posts = posts.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      } else if (sort === 'trending') {
        // Trending = combination of recent + popular + likes
        posts = posts.sort((a, b) => {
          const scoreA = (a.likeCount || 0) * 2 + (a.viewCount || 0) / 10;
          const scoreB = (b.likeCount || 0) * 2 + (b.viewCount || 0) / 10;
          return scoreB - scoreA;
        });
      }
      // Default: recent (already sorted by createdAt desc in storage)
      
      res.json(posts);
    } catch (error) {
      console.error('Error fetching news:', error);
      res.status(500).json({ 
        error: 'Failed to fetch news',
        message: 'Une erreur est survenue lors du chargement des actualités.'
      });
    }
  });
  
  /**
   * GET /api/news/:id
   * Get a single article by ID
   */
  app.get('/api/news/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const post = await storage.getBlogPost(id);
      
      if (!post) {
        return res.status(404).json({ 
          error: 'Article non trouvé',
          message: 'Cet article n\'existe pas ou a été supprimé.',
          code: 'ARTICLE_NOT_FOUND'
        });
      }
      
      // Only show published articles to non-authenticated users
      if (post.status !== 'published' && !req.isAuthenticated?.()) {
        return res.status(404).json({ 
          error: 'Article non trouvé',
          message: 'Cet article n\'est pas encore publié.',
          code: 'ARTICLE_NOT_PUBLISHED'
        });
      }
      
      // Increment view count (optional: track unique views)
      await storage.updateBlogPost(id, {
        viewCount: (post.viewCount || 0) + 1
      });
      
      res.json(post);
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({ 
        error: 'Erreur serveur',
        message: 'Une erreur est survenue lors du chargement de l\'article.'
      });
    }
  });
  
  /**
   * POST /api/news/:id/like
   * Like an article (requires authentication)
   */
  app.post('/api/news/:id/like', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const post = await storage.getBlogPost(id);
      
      if (!post) {
        return res.status(404).json({ error: 'Article not found' });
      }
      
      // Increment like count
      const updated = await storage.updateBlogPost(id, {
        likeCount: (post.likeCount || 0) + 1
      });
      
      res.json({ success: true, likes: updated.likeCount });
    } catch (error) {
      console.error('Error liking article:', error);
      res.status(500).json({ error: 'Failed to like article' });
    }
  });
  
  /**
   * GET /api/news/categories
   * Get all available news categories
   */
  app.get('/api/news/categories', async (req, res) => {
    try {
      const categories = [
        { id: 'Actualités', name: 'Actualités', nameEn: 'News', nameAr: 'أخبار', icon: '📰' },
        { id: 'Conseils', name: 'Conseils', nameEn: 'Advice', nameAr: 'نصائح', icon: '💡' },
        { id: 'Études', name: 'Études', nameEn: 'Studies', nameAr: 'دراسات', icon: '🔬' },
        { id: 'Carrière', name: 'Carrière', nameEn: 'Career', nameAr: 'مسيرة مهنية', icon: '💼' },
        { id: 'Innovation', name: 'Innovation', nameEn: 'Innovation', nameAr: 'ابتكار', icon: '🚀' },
      ];
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });
  
  /**
   * GET /api/news/trending
   * Get trending articles (shortcut)
   */
  app.get('/api/news/trending', async (req, res) => {
    try {
      const posts = await storage.getBlogPosts({ status: 'published' });
      
      // Calculate trending score
      const trending = posts
        .map(post => ({
          ...post,
          trendingScore: (post.likeCount || 0) * 2 + (post.viewCount || 0) / 10
        }))
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, 10); // Top 10 trending
      
      res.json(trending);
    } catch (error) {
      console.error('Error fetching trending:', error);
      res.status(500).json({ error: 'Failed to fetch trending articles' });
    }
  });
  
  /**
   * GET /api/news/featured
   * Get featured articles
   */
  app.get('/api/news/featured', async (req, res) => {
    try {
      const featured = await storage.getBlogPosts({ 
        status: 'published', 
        featured: true 
      });
      res.json(featured);
    } catch (error) {
      console.error('Error fetching featured:', error);
      res.status(500).json({ error: 'Failed to fetch featured articles' });
    }
  });

  console.log('✅ News routes configured');
}
