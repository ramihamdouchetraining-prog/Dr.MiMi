import express from 'express';
import { db } from './db';
import { users } from '../shared/schema';
import { eq, sql, and, or, gte, lte } from 'drizzle-orm';
// Middleware functions
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

const requirePermission = (permission: string) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    // For now, allow admin and owner roles
    const userRole = req.user.role || 'viewer';
    if (userRole !== 'admin' && userRole !== 'owner') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

const router = express.Router();

// Types pour le système de communication
interface EmailCampaign {
  id?: string;
  name: string;
  subject: string;
  content: string;
  recipientSegment: string;
  recipientCount: number;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledFor?: Date;
  sentAt?: Date;
  metrics?: {
    sent: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
}

interface Notification {
  id?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  targetAudience: 'all' | 'students' | 'admins' | 'custom';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  displayType: 'toast' | 'modal' | 'banner';
  status: 'active' | 'scheduled' | 'expired' | 'cancelled';
  expiresAt?: Date;
}

// Stockage temporaire en mémoire (remplacer par une table DB en production)
const campaigns: EmailCampaign[] = [];
const notifications: Notification[] = [];
const segments = [
  { id: 'all', name: 'Tous les utilisateurs', count: 0 },
  { id: 'students', name: 'Étudiants', count: 0 },
  { id: 'paces', name: 'Étudiants PACES', count: 0 },
  { id: 'dfgsm', name: 'Étudiants DFGSM', count: 0 },
  { id: 'dfasm', name: 'Étudiants DFASM', count: 0 },
  { id: 'admins', name: 'Administrateurs', count: 0 },
  { id: 'premium', name: 'Membres Premium', count: 0 },
  { id: 'active', name: 'Utilisateurs Actifs', count: 0 },
  { id: 'inactive', name: 'Utilisateurs Inactifs', count: 0 }
];

// GET /api/communications/emails - Récupérer toutes les campagnes email
router.get('/emails', requireAuth, requirePermission('content.read'), async (req, res) => {
  try {
    const { status, search, limit = 20, offset = 0 } = req.query;
    
    let filteredCampaigns = campaigns;
    
    // Filtrer par statut
    if (status && status !== 'all') {
      filteredCampaigns = filteredCampaigns.filter(c => c.status === status);
    }
    
    // Recherche
    if (search) {
      filteredCampaigns = filteredCampaigns.filter(c => 
        c.name.toLowerCase().includes(String(search).toLowerCase()) ||
        c.subject.toLowerCase().includes(String(search).toLowerCase())
      );
    }
    
    // Pagination
    const paginatedCampaigns = filteredCampaigns.slice(
      Number(offset),
      Number(offset) + Number(limit)
    );
    
    res.json({
      campaigns: paginatedCampaigns,
      total: filteredCampaigns.length,
      offset: Number(offset),
      limit: Number(limit)
    });
  } catch (error: any) {
    console.error('Error fetching email campaigns:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/communications/emails - Créer une nouvelle campagne email
router.post('/emails', requireAuth, requirePermission('content.create'), async (req, res) => {
  try {
    const campaign: EmailCampaign = {
      id: `campaign_${Date.now()}`,
      ...req.body,
      status: req.body.status || 'draft',
      metrics: {
        sent: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    campaigns.push(campaign);
    
    // Si la campagne est planifiée ou envoyée immédiatement
    if (campaign.status === 'scheduled' || req.body.sendNow) {
      // Simuler l'envoi (en production, intégrer avec service email)
      setTimeout(() => {
        const campaignIndex = campaigns.findIndex(c => c.id === campaign.id);
        if (campaignIndex !== -1) {
          campaigns[campaignIndex].status = 'sent';
          campaigns[campaignIndex].sentAt = new Date();
          campaigns[campaignIndex].metrics.sent = campaign.recipientCount;
          // Simuler des métriques
          campaigns[campaignIndex].metrics.opened = Math.floor(campaign.recipientCount * 0.35);
          campaigns[campaignIndex].metrics.clicked = Math.floor(campaign.recipientCount * 0.12);
        }
      }, 3000);
    }
    
    res.json({ success: true, campaign });
  } catch (error: any) {
    console.error('Error creating email campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/communications/emails/:id - Mettre à jour une campagne
router.put('/emails/:id', requireAuth, requirePermission('content.edit'), async (req, res) => {
  try {
    const campaignIndex = campaigns.findIndex(c => c.id === req.params.id);
    
    if (campaignIndex === -1) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    campaigns[campaignIndex] = {
      ...campaigns[campaignIndex],
      ...req.body,
      updatedAt: new Date()
    };
    
    res.json({ success: true, campaign: campaigns[campaignIndex] });
  } catch (error: any) {
    console.error('Error updating email campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/communications/emails/:id - Supprimer une campagne
router.delete('/emails/:id', requireAuth, requirePermission('content.delete'), async (req, res) => {
  try {
    const campaignIndex = campaigns.findIndex(c => c.id === req.params.id);
    
    if (campaignIndex === -1) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    campaigns.splice(campaignIndex, 1);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting email campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/communications/segments - Récupérer les segments d'audience
router.get('/segments', requireAuth, requirePermission('content.read'), async (req, res) => {
  try {
    // Compter les utilisateurs dans chaque segment
    const allUsers = await db.select().from(users);
    
    segments[0].count = allUsers.length; // Tous
    segments[1].count = allUsers.filter(u => u.role === 'student' || u.role === 'viewer').length; // Étudiants
    segments[2].count = allUsers.filter(u => u.yearOfStudy === 'paces').length; // PACES
    segments[3].count = allUsers.filter(u => u.yearOfStudy?.includes('dfgsm')).length; // DFGSM
    segments[4].count = allUsers.filter(u => u.yearOfStudy?.includes('dfasm')).length; // DFASM
    segments[5].count = allUsers.filter(u => u.role === 'admin' || u.role === 'owner').length; // Admins
    segments[6].count = allUsers.filter(u => u.isPremium).length; // Premium
    segments[7].count = allUsers.filter(u => {
      // Active = connecté dans les 7 derniers jours
      const lastActive = u.lastLoginAt ? new Date(u.lastLoginAt) : null;
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return lastActive && lastActive > sevenDaysAgo;
    }).length;
    segments[8].count = allUsers.filter(u => {
      // Inactive = pas connecté depuis plus de 30 jours
      const lastActive = u.lastLoginAt ? new Date(u.lastLoginAt) : null;
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return !lastActive || lastActive < thirtyDaysAgo;
    }).length;
    
    res.json(segments);
  } catch (error: any) {
    console.error('Error fetching segments:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/communications/send-test - Envoyer un email de test
router.post('/send-test', requireAuth, requirePermission('content.create'), async (req, res) => {
  try {
    const { email, subject, content } = req.body;
    
    // En production, intégrer avec service email (SendGrid, Mailgun, etc.)
    console.log(`📧 Test email to: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content preview: ${content.substring(0, 100)}...`);
    
    // Simuler l'envoi
    setTimeout(() => {
      console.log('✅ Test email sent successfully');
    }, 1000);
    
    res.json({ 
      success: true, 
      message: `Email de test envoyé à ${email}` 
    });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/communications/notifications - Récupérer les notifications
router.get('/notifications', requireAuth, async (req, res) => {
  try {
    const activeNotifications = notifications.filter(n => 
      n.status === 'active' && 
      (!n.expiresAt || new Date(n.expiresAt) > new Date())
    );
    
    res.json(activeNotifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/communications/notifications - Créer une notification
router.post('/notifications', requireAuth, requirePermission('content.create'), async (req, res) => {
  try {
    const notification: Notification = {
      id: `notif_${Date.now()}`,
      ...req.body,
      status: 'active',
      createdAt: new Date()
    };
    
    notifications.push(notification);
    
    // En production, envoyer via WebSocket ou SSE pour notification temps réel
    console.log(`🔔 New notification created: ${notification.title}`);
    
    res.json({ success: true, notification });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/communications/metrics - Métriques globales de communication
router.get('/metrics', requireAuth, requirePermission('analytics.view_advanced'), async (req, res) => {
  try {
    const totalCampaigns = campaigns.length;
    const sentCampaigns = campaigns.filter(c => c.status === 'sent').length;
    const totalEmailsSent = campaigns.reduce((sum, c) => sum + (c.metrics?.sent || 0), 0);
    const totalOpened = campaigns.reduce((sum, c) => sum + (c.metrics?.opened || 0), 0);
    const totalClicked = campaigns.reduce((sum, c) => sum + (c.metrics?.clicked || 0), 0);
    
    const avgOpenRate = totalEmailsSent > 0 ? (totalOpened / totalEmailsSent) * 100 : 0;
    const avgClickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
    
    const activeNotifications = notifications.filter(n => n.status === 'active').length;
    
    res.json({
      emails: {
        totalCampaigns,
        sentCampaigns,
        totalEmailsSent,
        avgOpenRate: avgOpenRate.toFixed(2),
        avgClickRate: avgClickRate.toFixed(2)
      },
      notifications: {
        active: activeNotifications,
        total: notifications.length
      },
      engagement: {
        dailyActiveUsers: Math.floor(Math.random() * 500) + 100, // Simulé
        weeklyActiveUsers: Math.floor(Math.random() * 2000) + 500, // Simulé
        monthlyActiveUsers: Math.floor(Math.random() * 5000) + 1000 // Simulé
      }
    });
  } catch (error: any) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;