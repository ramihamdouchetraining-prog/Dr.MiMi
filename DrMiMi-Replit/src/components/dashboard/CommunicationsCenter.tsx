import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Bell,
  MessageSquare,
  Send,
  Calendar,
  Users,
  Target,
  Eye,
  MousePointer,
  TrendingUp,
  Settings,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Megaphone,
  Newspaper,
  Shield,
  BarChart3,
  FileText,
  Image,
  Link,
  ExternalLink
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TipTapEditor } from '../TipTapEditor';

// Types
interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  recipientSegment: string;
  recipientCount: number;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledFor?: string;
  sentAt?: string;
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  targetAudience: 'all' | 'students' | 'admins' | 'custom';
  customFilters?: any;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  displayType: 'toast' | 'modal' | 'banner';
  scheduledFor?: string;
  expiresAt?: string;
  status: 'active' | 'scheduled' | 'expired' | 'cancelled';
  metrics: {
    shown: number;
    clicked: number;
    dismissed: number;
  };
  createdAt: string;
}

interface Banner {
  id: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'promotion';
  position: 'top' | 'bottom';
  dismissible: boolean;
  ctaText?: string;
  ctaLink?: string;
  startDate: string;
  endDate: string;
  targetPages: string[];
  status: 'active' | 'scheduled' | 'expired';
  metrics: {
    impressions: number;
    clicks: number;
    dismissed: number;
  };
}

interface NewsletterTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  thumbnail?: string;
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
}

interface EngagementMetrics {
  emails: {
    totalSent: number;
    avgOpenRate: number;
    avgClickRate: number;
    bounceRate: number;
    unsubscribeRate: number;
    topPerforming: Array<{
      campaign: string;
      openRate: number;
      clickRate: number;
    }>;
  };
  notifications: {
    totalSent: number;
    avgSeenRate: number;
    avgClickRate: number;
    dismissRate: number;
    byType: Record<string, number>;
  };
  overall: {
    totalReach: number;
    activeUsers: number;
    engagementScore: number;
    trend: number;
  };
}

interface Segment {
  id: string;
  name: string;
  filters: any;
  userCount: number;
  description: string;
}

const CommunicationsCenter: React.FC<{ userRole: string }> = ({ userRole }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'emails' | 'notifications' | 'banners' | 'newsletter' | 'metrics'>('emails');
  const [showComposer, setShowComposer] = useState(false);
  const [composerType, setComposerType] = useState<'email' | 'notification' | 'banner' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [emailForm, setEmailForm] = useState<Partial<EmailCampaign>>({
    name: '',
    subject: '',
    content: '',
    recipientSegment: 'all',
    status: 'draft'
  });
  
  const [notificationForm, setNotificationForm] = useState<Partial<Notification>>({
    title: '',
    message: '',
    type: 'info',
    targetAudience: 'all',
    priority: 'normal',
    displayType: 'toast',
    status: 'active'
  });

  const [bannerForm, setBannerForm] = useState<Partial<Banner>>({
    content: '',
    type: 'info',
    position: 'top',
    dismissible: true,
    startDate: '',
    endDate: '',
    targetPages: [],
    status: 'scheduled'
  });

  // Check permissions
  const hasAccess = ['owner', 'admin'].includes(userRole);

  // Fetch email campaigns
  const { data: campaigns } = useQuery({
    queryKey: ['emailCampaigns', filterStatus, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/communications/emails?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      return response.json();
    },
    enabled: hasAccess && activeTab === 'emails'
  });

  // Fetch notifications
  const { data: notifications } = useQuery({
    queryKey: ['notifications', filterStatus],
    queryFn: async () => {
      const params = filterStatus !== 'all' ? `?status=${filterStatus}` : '';
      const response = await fetch(`/api/communications/notifications${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    enabled: hasAccess && activeTab === 'notifications'
  });

  // Fetch banners
  const { data: banners } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const response = await fetch('/api/communications/banners', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch banners');
      return response.json();
    },
    enabled: hasAccess && activeTab === 'banners'
  });

  // Fetch newsletter templates
  const { data: templates } = useQuery({
    queryKey: ['newsletterTemplates'],
    queryFn: async () => {
      const response = await fetch('/api/communications/newsletter-templates', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
    enabled: hasAccess && activeTab === 'newsletter'
  });

  // Fetch engagement metrics
  const { data: metrics } = useQuery({
    queryKey: ['engagementMetrics'],
    queryFn: async () => {
      const response = await fetch('/api/communications/metrics', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
    enabled: hasAccess && activeTab === 'metrics'
  });

  // Fetch user segments
  const { data: segments } = useQuery({
    queryKey: ['userSegments'],
    queryFn: async () => {
      const response = await fetch('/api/communications/segments', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch segments');
      return response.json();
    },
    enabled: hasAccess
  });

  // Send email campaign
  const sendCampaign = useMutation({
    mutationFn: async (data: Partial<EmailCampaign>) => {
      const response = await fetch('/api/communications/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to send campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailCampaigns'] });
      setShowComposer(false);
      setEmailForm({
        name: '',
        subject: '',
        content: '',
        recipientSegment: 'all',
        status: 'draft'
      });
    }
  });

  // Create notification
  const createNotification = useMutation({
    mutationFn: async (data: Partial<Notification>) => {
      const response = await fetch('/api/communications/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setShowComposer(false);
      setNotificationForm({
        title: '',
        message: '',
        type: 'info',
        targetAudience: 'all',
        priority: 'normal',
        displayType: 'toast',
        status: 'active'
      });
    }
  });

  // Create banner
  const createBanner = useMutation({
    mutationFn: async (data: Partial<Banner>) => {
      const response = await fetch('/api/communications/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create banner');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setShowComposer(false);
      setBannerForm({
        content: '',
        type: 'info',
        position: 'top',
        dismissible: true,
        startDate: '',
        endDate: '',
        targetPages: [],
        status: 'scheduled'
      });
    }
  });

  // Delete campaign
  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/communications/emails/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailCampaigns'] });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
      case 'expired':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!hasAccess) {
    return (
      <div className="p-8 text-center">
        <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Accès Refusé
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Cette section est réservée aux administrateurs et propriétaires.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Megaphone className="w-8 h-8 mr-3 text-indigo-600" />
              Centre de Communications
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez vos campagnes email, notifications et annonces
            </p>
          </div>
          <button
            onClick={() => {
              setShowComposer(true);
              setComposerType(activeTab === 'emails' ? 'email' : activeTab === 'notifications' ? 'notification' : 'banner');
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mt-6 border-b overflow-x-auto">
          {['emails', 'notifications', 'banners', 'newsletter', 'metrics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-2 px-1 capitalize whitespace-nowrap ${
                activeTab === tab ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'
              }`}
            >
              {tab === 'emails' && <Mail className="w-4 h-4 inline mr-2" />}
              {tab === 'notifications' && <Bell className="w-4 h-4 inline mr-2" />}
              {tab === 'banners' && <Megaphone className="w-4 h-4 inline mr-2" />}
              {tab === 'newsletter' && <Newspaper className="w-4 h-4 inline mr-2" />}
              {tab === 'metrics' && <BarChart3 className="w-4 h-4 inline mr-2" />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Emails Tab */}
      {activeTab === 'emails' && (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher une campagne..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="scheduled">Programmé</option>
                <option value="sent">Envoyé</option>
                <option value="failed">Échoué</option>
              </select>
            </div>
          </div>

          {/* Campaigns List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(campaigns || []).map((campaign: EmailCampaign) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedItem(campaign)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {campaign.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                  {campaign.subject}
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>📧 {campaign.recipientCount} destinataires</p>
                  {campaign.scheduledFor && (
                    <p>📅 {new Date(campaign.scheduledFor).toLocaleDateString()}</p>
                  )}
                </div>
                {campaign.status === 'sent' && campaign.metrics && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Ouvertures</p>
                      <p className="font-bold text-sm">
                        {((campaign.metrics.opened / campaign.metrics.sent) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Clics</p>
                      <p className="font-bold text-sm">
                        {((campaign.metrics.clicked / campaign.metrics.sent) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Bounce</p>
                      <p className="font-bold text-sm">
                        {((campaign.metrics.bounced / campaign.metrics.sent) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}
                <div className="mt-4 flex space-x-2">
                  {campaign.status === 'draft' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEmailForm(campaign);
                          setComposerType('email');
                          setShowComposer(true);
                        }}
                        className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Éditer
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sendCampaign.mutate({ ...campaign, status: 'sent' });
                        }}
                        className="flex-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Envoyer
                      </button>
                    </>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Voulez-vous vraiment supprimer cette campagne?')) {
                        deleteCampaign.mutate(campaign.id);
                      }
                    }}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="scheduled">Programmé</option>
                <option value="expired">Expiré</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {(notifications || []).map((notification: Notification) => (
                <div
                  key={notification.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => setSelectedItem(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(notification.status)}`}>
                          {notification.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {notification.displayType}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>🎯 {notification.targetAudience}</span>
                        {notification.scheduledFor && (
                          <span>📅 {new Date(notification.scheduledFor).toLocaleDateString()}</span>
                        )}
                        {notification.expiresAt && (
                          <span>⏰ Expire: {new Date(notification.expiresAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>👁 {notification.metrics.shown} vues</p>
                        <p>👆 {notification.metrics.clicked} clics</p>
                        <p>❌ {notification.metrics.dismissed} fermées</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Banners Tab */}
      {activeTab === 'banners' && (
        <div className="grid grid-cols-1 gap-4">
          {(banners || []).map((banner: Banner) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(banner.status)}`}>
                    {banner.status}
                  </span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full bg-${
                    banner.type === 'warning' ? 'yellow' :
                    banner.type === 'success' ? 'green' :
                    banner.type === 'promotion' ? 'purple' :
                    'blue'
                  }-100 text-${
                    banner.type === 'warning' ? 'yellow' :
                    banner.type === 'success' ? 'green' :
                    banner.type === 'promotion' ? 'purple' :
                    'blue'
                  }-800`}>
                    {banner.type}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    Position: {banner.position}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setBannerForm(banner);
                    setComposerType('banner');
                    setShowComposer(true);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <p className="text-gray-900 dark:text-white">{banner.content}</p>
                {banner.ctaText && (
                  <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    {banner.ctaText} <ExternalLink className="w-3 h-3 inline ml-1" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Période</p>
                  <p className="font-medium">
                    {new Date(banner.startDate).toLocaleDateString()} - {new Date(banner.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Pages cibles</p>
                  <p className="font-medium">{banner.targetPages.length} pages</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Métriques</p>
                  <div className="flex space-x-3">
                    <span>👁 {banner.metrics.impressions}</span>
                    <span>👆 {banner.metrics.clicks}</span>
                    <span>❌ {banner.metrics.dismissed}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Newsletter Tab */}
      {activeTab === 'newsletter' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(templates || []).map((template: NewsletterTemplate) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            >
              {template.thumbnail && (
                <img src={template.thumbnail} alt={template.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {template.subject}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {template.category}
                  </span>
                  <span>Utilisé {template.usageCount} fois</span>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => {
                      setEmailForm({
                        name: `Campagne - ${template.name}`,
                        subject: template.subject,
                        content: template.content,
                        recipientSegment: 'all',
                        status: 'draft'
                      });
                      setComposerType('email');
                      setShowComposer(true);
                    }}
                    className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Utiliser
                  </button>
                  <button className="px-3 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && metrics && (
        <div className="space-y-6">
          {/* Overall Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Portée Totale</span>
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.overall.totalReach.toLocaleString()}
              </p>
              <p className={`text-xs mt-1 ${metrics.overall.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.overall.trend > 0 ? '+' : ''}{metrics.overall.trend}% vs mois dernier
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Taux d'Ouverture</span>
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.emails.avgOpenRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Moyenne emails</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Taux de Clic</span>
                <MousePointer className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.emails.avgClickRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Moyenne globale</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Score d'Engagement</span>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.overall.engagementScore}/100
              </p>
              <p className="text-xs text-gray-500 mt-1">Excellent</p>
            </motion.div>
          </div>

          {/* Email Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Top Campagnes Email
            </h3>
            <div className="space-y-3">
              {metrics.emails.topPerforming.map((campaign: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <span className="font-bold text-lg mr-3 text-gray-500">#{index + 1}</span>
                    <span className="font-medium">{campaign.campaign}</span>
                  </div>
                  <div className="flex space-x-4">
                    <span className="text-sm">
                      <Eye className="w-4 h-4 inline mr-1 text-green-600" />
                      {campaign.openRate.toFixed(1)}%
                    </span>
                    <span className="text-sm">
                      <MousePointer className="w-4 h-4 inline mr-1 text-blue-600" />
                      {campaign.clickRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notification Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Performance Notifications
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total envoyées</span>
                  <span className="font-bold">{metrics.notifications.totalSent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Taux de vue</span>
                  <span className="font-bold">{metrics.notifications.avgSeenRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Taux de clic</span>
                  <span className="font-bold">{metrics.notifications.avgClickRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Taux de rejet</span>
                  <span className="font-bold text-red-600">{metrics.notifications.dismissRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Distribution par Type
              </h3>
              <div className="space-y-2">
                {Object.entries(metrics.notifications.byType || {}).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="capitalize">{type}</span>
                    <span className="font-bold">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Composer Modal */}
      <AnimatePresence>
        {showComposer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowComposer(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {composerType === 'email' && 'Nouvelle Campagne Email'}
                  {composerType === 'notification' && 'Nouvelle Notification'}
                  {composerType === 'banner' && 'Nouvelle Bannière'}
                </h2>
                <button
                  onClick={() => setShowComposer(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Email Composer */}
              {composerType === 'email' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  sendCampaign.mutate(emailForm);
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nom de la campagne</label>
                      <input
                        type="text"
                        value={emailForm.name}
                        onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Objet</label>
                      <input
                        type="text"
                        value={emailForm.subject}
                        onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Segment de destinataires</label>
                      <select
                        value={emailForm.recipientSegment}
                        onChange={(e) => setEmailForm({ ...emailForm, recipientSegment: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="all">Tous les utilisateurs</option>
                        {(segments || []).map((segment: Segment) => (
                          <option key={segment.id} value={segment.id}>
                            {segment.name} ({segment.userCount} users)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Contenu</label>
                      <TipTapEditor
                        initialContent={emailForm.content || ''}
                        onChange={(content) => setEmailForm({ ...emailForm, content })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Programmer l'envoi</label>
                      <input
                        type="datetime-local"
                        onChange={(e) => setEmailForm({ ...emailForm, scheduledFor: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowComposer(false)}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      {emailForm.scheduledFor ? 'Programmer' : 'Envoyer'}
                    </button>
                  </div>
                </form>
              )}

              {/* Notification Composer */}
              {composerType === 'notification' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createNotification.mutate(notificationForm);
                }}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select
                          value={notificationForm.type}
                          onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value as any })}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="info">Info</option>
                          <option value="success">Succès</option>
                          <option value="warning">Avertissement</option>
                          <option value="error">Erreur</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Priorité</label>
                        <select
                          value={notificationForm.priority}
                          onChange={(e) => setNotificationForm({ ...notificationForm, priority: e.target.value as any })}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="low">Basse</option>
                          <option value="normal">Normale</option>
                          <option value="high">Haute</option>
                          <option value="urgent">Urgente</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Titre</label>
                      <input
                        type="text"
                        value={notificationForm.title}
                        onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Message</label>
                      <textarea
                        value={notificationForm.message}
                        onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg h-24"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Affichage</label>
                        <select
                          value={notificationForm.displayType}
                          onChange={(e) => setNotificationForm({ ...notificationForm, displayType: e.target.value as any })}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="toast">Toast</option>
                          <option value="modal">Modal</option>
                          <option value="banner">Bannière</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Audience</label>
                        <select
                          value={notificationForm.targetAudience}
                          onChange={(e) => setNotificationForm({ ...notificationForm, targetAudience: e.target.value as any })}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="all">Tous</option>
                          <option value="students">Étudiants</option>
                          <option value="admins">Admins</option>
                          <option value="custom">Personnalisé</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowComposer(false)}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Créer
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunicationsCenter;