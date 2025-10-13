import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  XCircle,
  Calendar,
  User,
  FileText,
  MessageSquare,
  Award,
  TrendingUp,
  BookOpen,
  Activity
} from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';

// Notification types
type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'message' | 'achievement';
type NotificationCategory = 'system' | 'course' | 'quiz' | 'social' | 'achievement' | 'reminder';

interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
  sender?: {
    name: string;
    avatar?: string;
  };
  data?: any;
}

interface NotificationStats {
  unreadCount: number;
  todayCount: number;
  categories: Record<NotificationCategory, number>;
}

// Notification icons mapping
const notificationIcons: Record<NotificationCategory, React.ElementType> = {
  system: AlertCircle,
  course: BookOpen,
  quiz: FileText,
  social: MessageSquare,
  achievement: Award,
  reminder: Calendar
};

// Notification colors
const notificationColors: Record<NotificationType, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
  message: 'bg-purple-500',
  achievement: 'bg-amber-500'
};

export const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [filter, setFilter] = useState<NotificationCategory | 'all'>('all');
  const [stats, setStats] = useState<NotificationStats>({
    unreadCount: 0,
    todayCount: 0,
    categories: {
      system: 0,
      course: 0,
      quiz: 0,
      social: 0,
      achievement: 0,
      reminder: 0
    }
  });
  
  const { ws, isConnected } = useWebSocket();

  // Load notifications from API
  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        updateStats(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  // Update notification stats
  const updateStats = (notifs: Notification[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const unreadCount = notifs.filter(n => !n.read).length;
    const todayCount = notifs.filter(n => 
      new Date(n.timestamp) >= today
    ).length;
    
    const categories: Record<NotificationCategory, number> = {
      system: 0,
      course: 0,
      quiz: 0,
      social: 0,
      achievement: 0,
      reminder: 0
    };
    
    notifs.forEach(n => {
      categories[n.category]++;
    });
    
    setStats({
      unreadCount,
      todayCount,
      categories
    });
  };

  // Handle WebSocket messages
  useEffect(() => {
    if (!ws || !isConnected) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'notification') {
          const newNotification: Notification = {
            ...data.payload,
            timestamp: new Date(data.payload.timestamp)
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          updateStats([newNotification, ...notifications]);
          
          // Show browser notification if permission granted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/icon-192x192.png',
              tag: newNotification.id
            });
          }
        }
      } catch (error) {
        console.error('Error processing notification:', error);
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, [ws, isConnected, notifications]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    loadNotifications();
  }, [loadNotifications]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        credentials: 'include'
      });
      
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      
      updateStats(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        credentials: 'include'
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setStats(prev => ({ ...prev, unreadCount: 0 }));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      updateStats(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    try {
      await fetch('/api/notifications/clear', {
        method: 'DELETE',
        credentials: 'include'
      });
      
      setNotifications([]);
      setStats({
        unreadCount: 0,
        todayCount: 0,
        categories: {
          system: 0,
          course: 0,
          quiz: 0,
          social: 0,
          achievement: 0,
          reminder: 0
        }
      });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  // Filter notifications
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.category === filter);

  // Get icon for notification
  const getNotificationIcon = (notification: Notification) => {
    const Icon = notificationIcons[notification.category];
    return <Icon size={20} />;
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    
    return timestamp.toLocaleDateString('fr-FR');
  };

  return (
    <>
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <Bell size={24} />
        {stats.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {stats.unreadCount > 99 ? '99+' : stats.unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-12 w-96 max-h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{stats.unreadCount} non lues</span>
                <div className="flex gap-2">
                  <button
                    onClick={markAllAsRead}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Tout marquer comme lu
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-red-600 hover:text-red-700"
                  >
                    Tout effacer
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-2 border-b border-gray-200 flex gap-2 overflow-x-auto">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  filter === 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tout ({notifications.length})
              </button>
              
              {Object.entries(stats.categories).map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat as NotificationCategory)}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    filter === cat 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={48} className="mx-auto mb-3 opacity-30" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${
                          notificationColors[notification.type]
                        } bg-opacity-20 flex items-center justify-center`}>
                          <div className={`${notificationColors[notification.type].replace('bg-', 'text-')}`}>
                            {getNotificationIcon(notification)}
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {notification.message}
                              </p>
                              
                              {notification.actionUrl && (
                                <a
                                  href={notification.actionUrl}
                                  className="inline-flex items-center mt-2 text-xs text-blue-600 hover:text-blue-700"
                                >
                                  {notification.actionLabel || 'Voir plus'}
                                  <ChevronRight size={14} className="ml-1" />
                                </a>
                              )}
                            </div>
                            
                            {/* Delete button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="ml-2 p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={16} className="text-gray-400" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span>{formatTimestamp(notification.timestamp)}</span>
                            {notification.sender && (
                              <>
                                <span>•</span>
                                <span>{notification.sender.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications
          .filter(n => {
            const age = Date.now() - new Date(n.timestamp).getTime();
            return age < 5000 && !n.read;
          })
          .slice(0, 3)
          .map(notification => (
            <div
              key={notification.id}
              className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px] animate-slide-in-right"
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${
                  notificationColors[notification.type]
                } bg-opacity-20 flex items-center justify-center`}>
                  <div className={`${notificationColors[notification.type].replace('bg-', 'text-')}`}>
                    {getNotificationIcon(notification)}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {notification.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {notification.message}
                  </p>
                </div>
                
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};