import { Router } from 'express';
import { db } from '../db';
import { z } from 'zod';
import { sql } from 'drizzle-orm';

const router = Router();

// Notification schema for validation
const createNotificationSchema = z.object({
  type: z.enum(['success', 'error', 'warning', 'info', 'message', 'achievement']),
  category: z.enum(['system', 'course', 'quiz', 'social', 'achievement', 'reminder']),
  title: z.string(),
  message: z.string(),
  actionUrl: z.string().optional(),
  actionLabel: z.string().optional(),
  sender: z.object({
    name: z.string(),
    avatar: z.string().optional()
  }).optional()
});

// Middleware to check if user is authenticated
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Get all notifications for the current user
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, unread } = req.query;
    
    // For now, we'll return mock notifications
    // In production, you would query from a notifications table
    const notifications = [
      {
        id: '1',
        type: 'success',
        category: 'course',
        title: 'Nouveau cours disponible',
        message: 'Le cours "Cardiologie avancée" est maintenant disponible',
        timestamp: new Date(Date.now() - 3600000),
        read: false,
        actionUrl: '/courses/cardiology-advanced',
        actionLabel: 'Voir le cours'
      },
      {
        id: '2',
        type: 'achievement',
        category: 'achievement',
        title: 'Badge débloqué !',
        message: 'Vous avez obtenu le badge "Étudiant assidu" pour 7 jours consécutifs',
        timestamp: new Date(Date.now() - 7200000),
        read: false
      },
      {
        id: '3',
        type: 'info',
        category: 'quiz',
        title: 'Quiz hebdomadaire',
        message: 'Le quiz de pharmacologie de cette semaine est disponible',
        timestamp: new Date(Date.now() - 86400000),
        read: true,
        actionUrl: '/quizzes/weekly-pharmacology',
        actionLabel: 'Commencer le quiz'
      },
      {
        id: '4',
        type: 'message',
        category: 'social',
        title: 'Nouveau message',
        message: 'Dr. Martin a répondu à votre question sur le forum',
        timestamp: new Date(Date.now() - 172800000),
        read: true,
        sender: {
          name: 'Dr. Martin',
          avatar: '/avatars/dr-martin.jpg'
        }
      },
      {
        id: '5',
        type: 'warning',
        category: 'reminder',
        title: 'Rappel : Examen demain',
        message: 'N\'oubliez pas votre examen de neurologie demain à 14h',
        timestamp: new Date(Date.now() - 259200000),
        read: true
      }
    ];

    // Filter by category if specified
    let filteredNotifications = notifications;
    if (category && category !== 'all') {
      filteredNotifications = notifications.filter(n => n.category === category);
    }
    
    // Filter by read status if specified
    if (unread === 'true') {
      filteredNotifications = filteredNotifications.filter(n => !n.read);
    }
    
    res.json({
      notifications: filteredNotifications,
      total: filteredNotifications.length,
      unread: filteredNotifications.filter(n => !n.read).length
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Create a new notification (admin only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user is admin
    const { users } = await import('../../shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const validatedData = createNotificationSchema.parse(req.body);
    
    // In production, you would insert into notifications table
    const notification = {
      id: Date.now().toString(),
      ...validatedData,
      timestamp: new Date(),
      read: false
    };
    
    // Broadcast via WebSocket if available
    // This would be handled by your WebSocket server
    
    res.json({ success: true, notification });
  } catch (error) {
    console.error('Failed to create notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Mark notification as read
router.put('/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // In production, update the notification in database
    // For now, just return success
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/read-all', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // In production, update all notifications for user in database
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to mark all as read:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// Delete a notification
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // In production, delete the notification from database
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Clear all notifications
router.delete('/clear', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // In production, delete all notifications for user from database
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to clear notifications:', error);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

// Get notification statistics
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // In production, aggregate from database
    const stats = {
      total: 5,
      unread: 2,
      today: 1,
      thisWeek: 3,
      categories: {
        system: 0,
        course: 1,
        quiz: 1,
        social: 1,
        achievement: 1,
        reminder: 1
      }
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Failed to get notification stats:', error);
    res.status(500).json({ error: 'Failed to get notification stats' });
  }
});

// Subscribe to push notifications
router.post('/subscribe', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscription } = req.body;
    
    // In production, save the subscription to database
    // This would be used for push notifications
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to subscribe to notifications:', error);
    res.status(500).json({ error: 'Failed to subscribe to notifications' });
  }
});

export default router;