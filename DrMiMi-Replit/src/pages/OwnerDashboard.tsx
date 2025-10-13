import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Users, DollarSign, Settings,
  CheckCircle, XCircle, Upload, LogOut, Eye,
  UserCheck, UserX, Shield, Ban, Pause, Play, UserCog,
  MessageSquare, Activity, RefreshCw, Plus,
  Calendar, Package, BarChart3, FileSignature, Trash2, X, Trophy, Medal, Award,
  Search, History, Filter, ChevronDown, Megaphone, Route
} from 'lucide-react';
import FinancialAnalytics from '../components/owner/FinancialAnalytics';
import ContractManagement from '../components/owner/ContractManagement';
import RevenueSharing from '../components/owner/RevenueSharing';
import Chat from '../components/Chat';
import AdvancedAnalytics from '../components/dashboard/AdvancedAnalytics';
import ContentManagementHub from '../components/dashboard/ContentManagementHub';
import SupportTickets from '../components/dashboard/SupportTickets';
import PlatformHealth from '../components/dashboard/PlatformHealth';
import CommunicationsCenter from '../components/dashboard/CommunicationsCenter';
import LearningPaths from '../components/dashboard/LearningPaths';
import { ContentPlacementModal } from '../components/ContentPlacementModal';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalArticles: number;
  totalBlogPosts: number;
  todayVisitors: number;
  todayRevenue: number;
}

interface Submission {
  id: string;
  contentType: string;
  status: string;
  submittedAt: string;
  submittedBy: string;
  contentDetails: any;
}

interface Badge {
  id: string;
  badgeType: 'gold' | 'silver' | 'bronze';
  reason: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  role: string;
  isBlacklisted: boolean;
  blacklistReason?: string;
  isSuspended?: boolean;
  suspendedAt?: string;
  suspendedReason?: string;
  createdAt: string;
  badges?: Badge[];
  lastLoginAt?: string;
}

interface AuditLog {
  id: string;
  action: string;
  oldValues: any;
  newValues: any;
  createdAt: string;
  severity: string;
  performedByUser?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface SiteSetting {
  value: string;
  type: string;
  updatedAt: string;
}

// Component for status badge
const StatusBadge: React.FC<{ user: User }> = ({ user }) => {
  if (user.isBlacklisted) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        <Ban className="w-3 h-3" />
        Bloqué
      </span>
    );
  }
  if (user.isSuspended) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
        <Pause className="w-3 h-3" />
        Suspendu
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
      <CheckCircle className="w-3 h-3" />
      Actif
    </span>
  );
};

// Component for role badge
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const roleStyles = {
    owner: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white',
    admin: 'bg-gradient-to-r from-purple-400 to-purple-600 text-white',
    editor: 'bg-gradient-to-r from-blue-400 to-blue-600 text-white',
    consultant: 'bg-gradient-to-r from-indigo-400 to-indigo-600 text-white',
    viewer: 'bg-gray-500 text-white'
  };

  const roleLabels = {
    owner: 'Owner',
    admin: 'Admin',
    editor: 'Éditeur',
    consultant: 'Consultant',
    viewer: 'Viewer'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${roleStyles[role as keyof typeof roleStyles] || 'bg-gray-500 text-white'}`}>
      {roleLabels[role as keyof typeof roleLabels] || role}
    </span>
  );
};

const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  // Debug logs
  useEffect(() => {
    console.log('OwnerDashboard mounted');
    console.log('Active tab:', activeTab);
  }, []);
  const [pendingSubmissions, setPendingSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Record<string, SiteSetting>>({});
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [badgeStats, setBadgeStats] = useState<{ gold: number; silver: number; bronze: number; total: number } | null>(null);
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  
  // Content Placement Modal state
  const [showContentModal, setShowContentModal] = useState(false);
  
  // Filter states
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');
  
  // Modal states
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ 
    email: '', 
    firstName: '', 
    lastName: '', 
    role: 'editor',
    password: '' 
  });
  
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const [newRoleSelection, setNewRoleSelection] = useState('');
  
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedUserForSuspend, setSelectedUserForSuspend] = useState<User | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedUserForBlock, setSelectedUserForBlock] = useState<User | null>(null);
  const [blockReason, setBlockReason] = useState('');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<{ id: string; name: string } | null>(null);
  
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedUserForBadge, setSelectedUserForBadge] = useState<User | null>(null);
  const [newBadgeData, setNewBadgeData] = useState({ badgeType: 'bronze' as 'gold' | 'silver' | 'bronze', reason: '' });
  
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<User | null>(null);
  const [auditHistory, setAuditHistory] = useState<AuditLog[]>([]);

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter, dateFromFilter, dateToFilter]);

  const checkAuth = async () => {
    try {
      const ownerUserData = localStorage.getItem('ownerUser');
      if (ownerUserData) {
        const user = JSON.parse(ownerUserData);
        if (user.forcePasswordChange) {
          navigate('/owner/change-password');
          return;
        }
        // Set current user for chat
        setCurrentUser({ id: user.id, role: user.role || 'owner' });
        return; // User is authenticated as owner
      }

      const response = await fetch('/api/admin/check', {
        credentials: 'include'
      });

      if (!response.ok) {
        navigate('/owner/login');
      } else {
        const data = await response.json();
        if (data.user) {
          setCurrentUser({ id: data.user.id, role: data.user.role || 'owner' });
        } else {
          navigate('/owner/login'); // No user data, redirect
        }
      }
    } catch (error) {
      navigate('/owner/login');
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        role: roleFilter !== 'all' ? roleFilter : '',
        status: statusFilter !== 'all' ? statusFilter : '',
        dateFrom: dateFromFilter,
        dateTo: dateToFilter,
        limit: '100'
      });

      const [statsRes, submissionsRes, usersRes, settingsRes, badgesRes] = await Promise.all([
        fetch('/api/analytics/overview', { credentials: 'include' }),
        fetch('/api/approvals/pending', { credentials: 'include' }),
        fetch(`/api/owner/users?${queryParams}`, { credentials: 'include' }),
        fetch('/api/settings', { credentials: 'include' }),
        fetch('/api/admin/badges/stats', { credentials: 'include' })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats({
          totalUsers: statsData.realtime?.totalUsers || 0,
          activeUsers: statsData.snapshot?.activeUsers || 0,
          totalCourses: statsData.realtime?.totalArticles || 0,
          totalArticles: statsData.realtime?.totalArticles || 0,
          totalBlogPosts: statsData.realtime?.totalBlogPosts || 0,
          todayVisitors: statsData.snapshot?.uniqueVisitors || 0,
          todayRevenue: statsData.realtime?.todayRevenue || 0,
        });
      }

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json();
        setPendingSubmissions(submissionsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }

      if (badgesRes.ok) {
        const badgesData = await badgesRes.json();
        setBadgeStats(badgesData);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(user => !user.isBlacklisted && !user.isSuspended);
      } else if (statusFilter === 'suspended') {
        filtered = filtered.filter(user => user.isSuspended);
      } else if (statusFilter === 'blocked') {
        filtered = filtered.filter(user => user.isBlacklisted);
      }
    }

    // Date filter
    if (dateFromFilter) {
      filtered = filtered.filter(user => new Date(user.createdAt) >= new Date(dateFromFilter));
    }
    if (dateToFilter) {
      const endDate = new Date(dateToFilter);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(user => new Date(user.createdAt) <= endDate);
    }

    setFilteredUsers(filtered);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // User management actions
  const handleSuspendUser = (user: User) => {
    setSelectedUserForSuspend(user);
    setSuspendReason(user.suspendedReason || '');
    setShowSuspendModal(true);
  };

  const confirmSuspendUser = async () => {
    if (!selectedUserForSuspend) return;
    
    if (selectedUserForSuspend.isSuspended && !suspendReason) {
      // Reactivating, no reason needed
    } else if (!selectedUserForSuspend.isSuspended && !suspendReason) {
      showNotification('error', 'Veuillez indiquer une raison pour la suspension');
      return;
    }

    try {
      const response = await fetch(`/api/owner/users/${selectedUserForSuspend.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: suspendReason })
      });

      if (response.ok) {
        const data = await response.json();
        showNotification('success', data.message);
        setShowSuspendModal(false);
        setSelectedUserForSuspend(null);
        setSuspendReason('');
        loadDashboardData();
      } else {
        const error = await response.json();
        showNotification('error', error.message || 'Échec de l\'opération');
      }
    } catch (error) {
      showNotification('error', 'Erreur lors de l\'opération');
    }
  };

  const handleBlockUser = (user: User) => {
    setSelectedUserForBlock(user);
    setBlockReason(user.blacklistReason || '');
    setShowBlockModal(true);
  };

  const confirmBlockUser = async () => {
    if (!selectedUserForBlock) return;
    
    if (selectedUserForBlock.isBlacklisted && !blockReason) {
      // Unblocking, no reason needed
    } else if (!selectedUserForBlock.isBlacklisted && !blockReason) {
      showNotification('error', 'Veuillez indiquer une raison pour le blocage');
      return;
    }

    try {
      const response = await fetch(`/api/owner/users/${selectedUserForBlock.id}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: blockReason })
      });

      if (response.ok) {
        const data = await response.json();
        showNotification('success', data.message);
        setShowBlockModal(false);
        setSelectedUserForBlock(null);
        setBlockReason('');
        loadDashboardData();
      } else {
        const error = await response.json();
        showNotification('error', error.message || 'Échec de l\'opération');
      }
    } catch (error) {
      showNotification('error', 'Erreur lors de l\'opération');
    }
  };

  const handleChangeRole = (user: User) => {
    setSelectedUserForRole(user);
    setNewRoleSelection(user.role);
    setShowChangeRoleModal(true);
  };

  const confirmChangeRole = async () => {
    if (!selectedUserForRole) return;
    
    if (!['admin', 'editor', 'viewer', 'consultant'].includes(newRoleSelection)) {
      showNotification('error', 'Rôle invalide');
      return;
    }

    try {
      const response = await fetch(`/api/owner/users/${selectedUserForRole.id}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRoleSelection })
      });

      if (response.ok) {
        const data = await response.json();
        showNotification('success', data.message);
        setShowChangeRoleModal(false);
        setSelectedUserForRole(null);
        loadDashboardData();
      } else {
        const error = await response.json();
        showNotification('error', error.message || 'Échec du changement de rôle');
      }
    } catch (error) {
      showNotification('error', 'Erreur lors du changement de rôle');
    }
  };

  const handleCreateUser = async () => {
    if (!newUserData.email || !newUserData.firstName || !newUserData.lastName || !newUserData.password) {
      showNotification('error', 'Tous les champs sont requis');
      return;
    }

    try {
      const response = await fetch('/api/users/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newUserData)
      });

      if (response.ok) {
        showNotification('success', 'Utilisateur créé avec succès!');
        setShowCreateUserModal(false);
        setNewUserData({ email: '', firstName: '', lastName: '', role: 'editor', password: '' });
        loadDashboardData();
      } else {
        const error = await response.json();
        showNotification('error', error.message || 'Échec de la création');
      }
    } catch (error) {
      showNotification('error', 'Erreur lors de la création');
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setSelectedUserForDelete({ id: userId, name: userName });
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUserForDelete) return;

    try {
      const response = await fetch(`/api/users/${selectedUserForDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        showNotification('success', 'Utilisateur supprimé avec succès');
        setShowDeleteModal(false);
        setSelectedUserForDelete(null);
        loadDashboardData();
      } else {
        showNotification('error', 'Échec de la suppression');
      }
    } catch (error) {
      showNotification('error', 'Erreur lors de la suppression');
    }
  };

  const handleManageBadges = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}/badges`, {
        credentials: 'include'
      });
      if (response.ok) {
        const badges = await response.json();
        setSelectedUserForBadge({ ...user, badges });
        setShowBadgeModal(true);
      }
    } catch (error) {
      showNotification('error', 'Échec du chargement des badges');
    }
  };

  const handleAssignBadge = async () => {
    if (!selectedUserForBadge || !newBadgeData.reason.trim()) {
      showNotification('error', 'Veuillez fournir une raison pour le badge');
      return;
    }

    try {
      const response = await fetch(`/api/users/${selectedUserForBadge.id}/badge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newBadgeData)
      });

      if (response.ok) {
        showNotification('success', 'Badge attribué avec succès!');
        setNewBadgeData({ badgeType: 'bronze', reason: '' });
        handleManageBadges(selectedUserForBadge);
        loadDashboardData();
      } else {
        showNotification('error', 'Échec de l\'attribution du badge');
      }
    } catch (error) {
      showNotification('error', 'Erreur lors de l\'attribution du badge');
    }
  };

  const handleRemoveBadge = async (badgeId: string) => {
    if (!selectedUserForBadge) return;

    if (!confirm('Êtes-vous sûr de vouloir retirer ce badge?')) return;

    try {
      const response = await fetch(`/api/users/${selectedUserForBadge.id}/badge/${badgeId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        showNotification('success', 'Badge retiré avec succès!');
        handleManageBadges(selectedUserForBadge);
        loadDashboardData();
      } else {
        showNotification('error', 'Échec du retrait du badge');
      }
    } catch (error) {
      showNotification('error', 'Erreur lors du retrait du badge');
    }
  };

  const handleViewHistory = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}/audit-history?limit=50`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAuditHistory(data.history || []);
        setSelectedUserForHistory(user);
        setShowHistoryModal(true);
      }
    } catch (error) {
      showNotification('error', 'Échec du chargement de l\'historique');
    }
  };

  const handleApprove = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/approvals/${submissionId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reviewNotes: 'Approuvé par owner' })
      });

      if (response.ok) {
        showNotification('success', 'Contenu approuvé avec succès!');
        loadDashboardData();
      } else {
        throw new Error('Échec de l\'approbation');
      }
    } catch (error) {
      showNotification('error', 'Échec de l\'approbation du contenu');
    }
  };

  const handleReject = async (submissionId: string) => {
    const reason = prompt('Raison du rejet:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/approvals/${submissionId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reviewNotes: reason })
      });

      if (response.ok) {
        showNotification('success', 'Contenu rejeté');
        loadDashboardData();
      } else {
        throw new Error('Échec du rejet');
      }
    } catch (error) {
      showNotification('error', 'Échec du rejet du contenu');
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch('/api/settings/logo/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        showNotification('success', 'Logo téléchargé avec succès');
        loadDashboardData();
      }
    } catch (error) {
      showNotification('error', 'Échec du téléchargement du logo');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });
      localStorage.removeItem('ownerUser');
      navigate('/owner/login');
    } catch (error) {
      localStorage.removeItem('ownerUser');
      navigate('/owner/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {notification.message}
        </motion.div>
      )}

      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Owner Dashboard</h1>
                <p className="text-sm text-purple-100">Dr.MiMi Platform Administration</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={loadDashboardData}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="flex items-center gap-4 mb-6">
          <motion.button
            onClick={() => setShowContentModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg flex items-center gap-2 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau Contenu</span>
          </motion.button>
          
          <motion.button
            onClick={() => setIsChatOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg flex items-center gap-2 shadow-lg relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Messages</span>
            {unreadMessages > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </motion.button>
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
            { id: 'advanced-analytics', label: 'Analytics Avancées', icon: BarChart3 },
            { id: 'content-hub', label: 'Content Hub', icon: Package },
            { id: 'support', label: 'Support & Tickets', icon: MessageSquare },
            { id: 'platform-health', label: 'Santé Plateforme', icon: Activity },
            { id: 'communications', label: 'Communications', icon: Megaphone },
            { id: 'analytics', label: 'Analytics Financiers', icon: DollarSign },
            { id: 'users', label: 'Utilisateurs', icon: Users },
            { id: 'contracts', label: 'Contrats', icon: FileSignature },
            { id: 'revenue', label: 'Partage des Revenus', icon: DollarSign },
            { id: 'settings', label: 'Paramètres', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Title */}
              <div>
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                  Tableau de Bord Owner
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Vue d'ensemble complète de la plateforme
                </p>
              </div>

              {/* Section 1: Advanced Analytics */}
              <motion.div
                className="rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-800"
                whileHover={{ boxShadow: '0 20px 40px rgba(147, 51, 234, 0.15)' }}
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    <BarChart3 size={24} />
                    Analytics Avancées
                  </h2>
                </div>
                <div className="p-6">
                  <AdvancedAnalytics />
                </div>
              </motion.div>

              {/* Section 2: Content Management Hub */}
              <motion.div
                className="rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-800"
                whileHover={{ boxShadow: '0 20px 40px rgba(147, 51, 234, 0.15)' }}
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    <Package size={24} />
                    Hub de Gestion de Contenu
                  </h2>
                </div>
                <div className="p-6">
                  <ContentManagementHub />
                </div>
              </motion.div>

              {/* Section 3: Support Tickets */}
              <motion.div
                className="rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-800"
                whileHover={{ boxShadow: '0 20px 40px rgba(147, 51, 234, 0.15)' }}
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    <MessageSquare size={24} />
                    Tickets de Support
                  </h2>
                </div>
                <div className="p-6">
                  <SupportTickets />
                </div>
              </motion.div>

              {/* Section 4: Platform Health */}
              <motion.div
                className="rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-800"
                whileHover={{ boxShadow: '0 20px 40px rgba(147, 51, 234, 0.15)' }}
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    <Activity size={24} />
                    Santé de la Plateforme
                  </h2>
                </div>
                <div className="p-6">
                  <PlatformHealth />
                </div>
              </motion.div>

              {/* Section 5: Communications Center */}
              <motion.div
                className="rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-800"
                whileHover={{ boxShadow: '0 20px 40px rgba(147, 51, 234, 0.15)' }}
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    <Megaphone size={24} />
                    Centre de Communications
                  </h2>
                </div>
                <div className="p-6">
                  <CommunicationsCenter />
                </div>
              </motion.div>

              {/* Section 6: Learning Paths */}
              <motion.div
                className="rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-800"
                whileHover={{ boxShadow: '0 20px 40px rgba(147, 51, 234, 0.15)' }}
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    <Route size={24} />
                    Parcours d'Apprentissage
                  </h2>
                </div>
                <div className="p-6">
                  <LearningPaths />
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FinancialAnalytics />
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Users className="w-6 h-6 text-purple-600" />
                      Gestion des utilisateurs
                    </h3>
                    <button
                      onClick={() => setShowCreateUserModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Plus className="w-5 h-5" />
                      Nouvel utilisateur
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    {/* Role filter */}
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">Tous les rôles</option>
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="editor">Éditeur</option>
                      <option value="consultant">Consultant</option>
                      <option value="viewer">Viewer</option>
                    </select>

                    {/* Status filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="active">Actif</option>
                      <option value="suspended">Suspendu</option>
                      <option value="blocked">Bloqué</option>
                    </select>

                    {/* Date from */}
                    <input
                      type="date"
                      value={dateFromFilter}
                      onChange={(e) => setDateFromFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Date de début"
                    />

                    {/* Date to */}
                    <input
                      type="date"
                      value={dateToFilter}
                      onChange={(e) => setDateToFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Date de fin"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Utilisateur</th>
                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rôle</th>
                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inscription</th>
                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <RoleBadge role={user.role} />
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge user={user} />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {/* Change Role Button */}
                              {user.role !== 'owner' && (
                                <button
                                  onClick={() => handleChangeRole(user)}
                                  className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors group relative"
                                  title="Changer le rôle"
                                >
                                  <UserCog className="w-4 h-4" />
                                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Changer le rôle
                                  </span>
                                </button>
                              )}

                              {/* Suspend/Reactivate Button */}
                              {user.role !== 'owner' && (
                                <button
                                  onClick={() => handleSuspendUser(user)}
                                  className={`p-2 rounded-lg transition-colors group relative ${
                                    user.isSuspended 
                                      ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                                      : 'text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900'
                                  }`}
                                  title={user.isSuspended ? 'Réactiver' : 'Suspendre'}
                                >
                                  {user.isSuspended ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {user.isSuspended ? 'Réactiver' : 'Suspendre'}
                                  </span>
                                </button>
                              )}

                              {/* Block/Unblock Button */}
                              {user.role !== 'owner' && (
                                <button
                                  onClick={() => handleBlockUser(user)}
                                  className={`p-2 rounded-lg transition-colors group relative ${
                                    user.isBlacklisted 
                                      ? 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900'
                                      : 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900'
                                  }`}
                                  title={user.isBlacklisted ? 'Débloquer' : 'Bloquer'}
                                >
                                  {user.isBlacklisted ? <Shield className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {user.isBlacklisted ? 'Débloquer' : 'Bloquer'}
                                  </span>
                                </button>
                              )}

                              {/* Badges Button */}
                              <button
                                onClick={() => handleManageBadges(user)}
                                className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-lg transition-colors group relative"
                                title="Gérer les badges"
                              >
                                <Trophy className="w-4 h-4" />
                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Gérer les badges
                                </span>
                              </button>

                              {/* History Button */}
                              <button
                                onClick={() => handleViewHistory(user)}
                                className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group relative"
                                title="Historique"
                              >
                                <History className="w-4 h-4" />
                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Historique
                                </span>
                              </button>

                              {/* Delete Button */}
                              {user.role !== 'owner' && (
                                <button
                                  onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors group relative"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Supprimer
                                  </span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'contracts' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ContractManagement />
            </motion.div>
          )}

          {activeTab === 'revenue' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <RevenueSharing />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Paramètres du site
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Logo du site</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="block w-full text-sm text-gray-500 file:me-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'advanced-analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AdvancedAnalytics userRole="owner" />
            </motion.div>
          )}

          {activeTab === 'content-hub' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ContentManagementHub userRole="owner" />
            </motion.div>
          )}

          {activeTab === 'support' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SupportTickets userRole="owner" />
            </motion.div>
          )}

          {activeTab === 'platform-health' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PlatformHealth userRole="owner" />
            </motion.div>
          )}

          {activeTab === 'communications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CommunicationsCenter userRole="owner" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      {/* Change Role Modal */}
      {showChangeRoleModal && selectedUserForRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full m-4"
          >
            <h3 className="text-lg font-semibold mb-4">Changer le rôle de l'utilisateur</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Utilisateur: <strong>{selectedUserForRole.firstName} {selectedUserForRole.lastName}</strong>
            </p>
            <select
              value={newRoleSelection}
              onChange={(e) => setNewRoleSelection(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4"
            >
              <option value="viewer">Viewer</option>
              <option value="consultant">Consultant</option>
              <option value="editor">Éditeur</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowChangeRoleModal(false);
                  setSelectedUserForRole(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={confirmChangeRole}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Confirmer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && selectedUserForSuspend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full m-4"
          >
            <h3 className="text-lg font-semibold mb-4">
              {selectedUserForSuspend.isSuspended ? 'Réactiver l\'utilisateur' : 'Suspendre l\'utilisateur'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Utilisateur: <strong>{selectedUserForSuspend.firstName} {selectedUserForSuspend.lastName}</strong>
            </p>
            {!selectedUserForSuspend.isSuspended && (
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Raison de la suspension..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4"
                rows={3}
              />
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSelectedUserForSuspend(null);
                  setSuspendReason('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={confirmSuspendUser}
                className={`px-4 py-2 rounded-lg text-white ${
                  selectedUserForSuspend.isSuspended 
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {selectedUserForSuspend.isSuspended ? 'Réactiver' : 'Suspendre'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && selectedUserForBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full m-4"
          >
            <h3 className="text-lg font-semibold mb-4">
              {selectedUserForBlock.isBlacklisted ? 'Débloquer l\'utilisateur' : 'Bloquer l\'utilisateur'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Utilisateur: <strong>{selectedUserForBlock.firstName} {selectedUserForBlock.lastName}</strong>
            </p>
            {!selectedUserForBlock.isBlacklisted && (
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Raison du blocage..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4"
                rows={3}
              />
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setSelectedUserForBlock(null);
                  setBlockReason('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={confirmBlockUser}
                className={`px-4 py-2 rounded-lg text-white ${
                  selectedUserForBlock.isBlacklisted 
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {selectedUserForBlock.isBlacklisted ? 'Débloquer' : 'Bloquer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full m-4"
          >
            <h3 className="text-lg font-semibold mb-4">Créer un nouvel utilisateur</h3>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <input
                type="text"
                placeholder="Prénom"
                value={newUserData.firstName}
                onChange={(e) => setNewUserData({ ...newUserData, firstName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <input
                type="text"
                placeholder="Nom"
                value={newUserData.lastName}
                onChange={(e) => setNewUserData({ ...newUserData, lastName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <select
                value={newUserData.role}
                onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="viewer">Viewer</option>
                <option value="consultant">Consultant</option>
                <option value="editor">Éditeur</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="password"
                placeholder="Mot de passe"
                value={newUserData.password}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowCreateUserModal(false);
                  setNewUserData({ email: '', firstName: '', lastName: '', role: 'editor', password: '' });
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Créer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedUserForDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full m-4"
          >
            <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUserForDelete.name}</strong> ?
              Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUserForDelete(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Badge Modal */}
      {showBadgeModal && selectedUserForBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full m-4"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Gérer les badges
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Utilisateur: <strong>{selectedUserForBadge.firstName} {selectedUserForBadge.lastName}</strong>
            </p>
            
            {/* Existing badges */}
            {selectedUserForBadge.badges && selectedUserForBadge.badges.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Badges actuels:</p>
                <div className="space-y-2">
                  {selectedUserForBadge.badges.map(badge => (
                    <div key={badge.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        {badge.badgeType === 'gold' && <Trophy className="w-4 h-4 text-yellow-500" />}
                        {badge.badgeType === 'silver' && <Medal className="w-4 h-4 text-gray-400" />}
                        {badge.badgeType === 'bronze' && <Award className="w-4 h-4 text-orange-600" />}
                        <span className="text-sm">{badge.reason}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveBadge(badge.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add new badge */}
            <div className="space-y-3">
              <select
                value={newBadgeData.badgeType}
                onChange={(e) => setNewBadgeData({ ...newBadgeData, badgeType: e.target.value as 'gold' | 'silver' | 'bronze' })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="bronze">Bronze</option>
                <option value="silver">Argent</option>
                <option value="gold">Or</option>
              </select>
              <input
                type="text"
                placeholder="Raison du badge..."
                value={newBadgeData.reason}
                onChange={(e) => setNewBadgeData({ ...newBadgeData, reason: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <button
                onClick={handleAssignBadge}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Attribuer le badge
              </button>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setShowBadgeModal(false);
                  setSelectedUserForBadge(null);
                  setNewBadgeData({ badgeType: 'bronze', reason: '' });
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedUserForHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-3xl w-full m-4 max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-purple-600" />
              Historique des actions
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Utilisateur: <strong>{selectedUserForHistory.firstName} {selectedUserForHistory.lastName}</strong>
            </p>
            
            <div className="space-y-3">
              {auditHistory.length === 0 ? (
                <p className="text-gray-500">Aucun historique disponible</p>
              ) : (
                auditHistory.map(log => (
                  <div key={log.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-sm font-medium ${
                        log.severity === 'critical' ? 'text-red-600' :
                        log.severity === 'warning' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {log.performedByUser && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Par: {log.performedByUser.firstName} {log.performedByUser.lastName}
                      </p>
                    )}
                    {(log.oldValues || log.newValues) && (
                      <div className="mt-2 text-xs">
                        {log.oldValues && (
                          <p className="text-gray-500">Avant: {JSON.stringify(log.oldValues)}</p>
                        )}
                        {log.newValues && (
                          <p className="text-gray-500">Après: {JSON.stringify(log.newValues)}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedUserForHistory(null);
                  setAuditHistory([]);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Fixed Action Buttons at Bottom Right */}
      <div className="fixed bottom-4 right-4 flex gap-4 z-40">
        {/* Content Placement Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowContentModal(true)}
          className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
        >
          <Plus className="w-7 h-7" />
        </motion.button>

        {/* Chat Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1, transition: { delay: 0.1 } }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow relative"
        >
          <MessageSquare className="w-6 h-6" />
          {unreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
              {unreadMessages > 9 ? '9+' : unreadMessages}
            </span>
          )}
        </motion.button>
      </div>

      {/* Chat Component */}
      {currentUser && (
        <Chat
          currentUserId={currentUser.id}
          currentUserRole={currentUser.role}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          position="floating"
        />
      )}
      
      {/* Content Placement Modal */}
      <ContentPlacementModal
        isOpen={showContentModal}
        onClose={() => setShowContentModal(false)}
        onSubmit={(data) => {
          console.log('New content submitted:', data);
          showNotification('success', 'Contenu créé avec succès! ✨');
          setShowContentModal(false);
        }}
      />
    </div>
  );
};

export default OwnerDashboard;
