import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Tag,
  Search,
  Filter,
  Plus,
  ChevronDown,
  Send,
  Paperclip,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Archive,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  responseTime?: number;
  resolutionTime?: number;
  messages: TicketMessage[];
  attachments?: string[];
  tags?: string[];
}

interface TicketMessage {
  id: string;
  ticketId: string;
  message: string;
  author: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  createdAt: string;
  isInternal: boolean;
  attachments?: string[];
}

interface TicketStats {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  todayCreated: number;
  todayResolved: number;
  satisfactionRate: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  views: number;
  helpful: number;
  createdAt: string;
  tags: string[];
}

const SupportTickets: React.FC<{ userRole: string }> = ({ userRole }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'tickets' | 'faq' | 'stats'>('tickets');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newTicketData, setNewTicketData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: 'general'
  });

  // Check permissions
  const hasAccess = ['owner', 'admin', 'editor', 'consultant'].includes(userRole);
  const canManageTickets = ['owner', 'admin'].includes(userRole);
  const canAssignTickets = ['owner', 'admin'].includes(userRole);

  // Fetch tickets
  const { data: tickets, isLoading: ticketsLoading, refetch: refetchTickets } = useQuery({
    queryKey: ['supportTickets', filterStatus, filterPriority, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterPriority !== 'all') params.append('priority', filterPriority);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/support/tickets?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch tickets');
      return response.json();
    },
    enabled: hasAccess
  });

  // Fetch ticket stats
  const { data: stats } = useQuery({
    queryKey: ['ticketStats'],
    queryFn: async () => {
      const response = await fetch('/api/support/stats', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: hasAccess && activeTab === 'stats'
  });

  // Fetch FAQs
  const { data: faqs } = useQuery({
    queryKey: ['supportFAQ', selectedCategory],
    queryFn: async () => {
      const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
      const response = await fetch(`/api/support/faq${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch FAQs');
      return response.json();
    },
    enabled: hasAccess && activeTab === 'faq'
  });

  // Create ticket mutation
  const createTicket = useMutation({
    mutationFn: async (data: typeof newTicketData) => {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create ticket');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
      setShowNewTicket(false);
      setNewTicketData({
        subject: '',
        description: '',
        priority: 'medium',
        category: 'general'
      });
    }
  });

  // Reply to ticket mutation
  const replyToTicket = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const response = await fetch(`/api/support/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message })
      });
      if (!response.ok) throw new Error('Failed to reply');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
      setReplyMessage('');
      setShowReplyForm(false);
    }
  });

  // Update ticket status
  const updateTicketStatus = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const response = await fetch(`/api/support/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    }
  });

  // Assign ticket mutation
  const assignTicket = useMutation({
    mutationFn: async ({ ticketId, userId }: { ticketId: string; userId: string }) => {
      const response = await fetch(`/api/support/tickets/${ticketId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ assignedTo: userId })
      });
      if (!response.ok) throw new Error('Failed to assign ticket');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <Archive className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
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
          Cette section est réservée aux administrateurs.
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
              <MessageSquare className="w-8 h-8 mr-3 text-green-600" />
              Support & Tickets
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les demandes de support et les tickets
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => refetchTickets()}
              className="p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowNewTicket(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Ticket
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mt-6 border-b">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`pb-2 px-1 ${activeTab === 'tickets' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
          >
            Tickets
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`pb-2 px-1 ${activeTab === 'faq' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-2 px-1 ${activeTab === 'stats' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
          >
            Statistiques
          </button>
        </div>
      </div>

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher un ticket..."
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
                <option value="open">Ouvert</option>
                <option value="in_progress">En cours</option>
                <option value="resolved">Résolu</option>
                <option value="closed">Fermé</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">Toutes les priorités</option>
                <option value="urgent">Urgent</option>
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ouverts</p>
                  <p className="text-2xl font-bold text-blue-600">{stats?.open || 0}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">En cours</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats?.inProgress || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Résolus</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.resolved || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Temps moy.</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats?.avgResolutionTime || 0}h
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </motion.div>
          </div>

          {/* Tickets List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {ticketsLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {tickets?.map((ticket: Ticket) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm text-gray-500">#{ticket.ticketNumber}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)} flex items-center space-x-1`}>
                            {getStatusIcon(ticket.status)}
                            <span>{ticket.status.replace('_', ' ')}</span>
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority === 'urgent' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                            {ticket.priority}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {ticket.subject}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            Par {ticket.createdBy.name}
                          </span>
                          {ticket.assignedTo && (
                            <span className="text-xs text-gray-500">
                              Assigné à {ticket.assignedTo.name}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(ticket.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        {ticket.messages && (
                          <span className="flex items-center text-sm text-gray-500">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {ticket.messages.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg ${
                  selectedCategory === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Toutes
              </button>
              {['général', 'technique', 'paiement', 'contenu', 'compte'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg ${
                    selectedCategory === cat
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs?.map((faq: FAQ) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {faq.answer}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {faq.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {faq.views} vues
                    </span>
                  </div>
                  <button className="text-xs text-green-600 hover:text-green-700">
                    👍 Utile ({faq.helpful})
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Métriques de Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Temps de réponse moyen</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {stats?.avgResponseTime || 0} min
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Temps de résolution moyen</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {stats?.avgResolutionTime || 0} heures
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Taux de satisfaction</span>
                <span className="font-bold text-green-600">
                  {stats?.satisfactionRate || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Tickets créés aujourd'hui</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {stats?.todayCreated || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Tickets résolus aujourd'hui</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {stats?.todayResolved || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Distribution des Tickets
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Ouverts</span>
                    <span className="text-sm font-bold">{stats?.open || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${((stats?.open || 0) / ((stats?.open || 0) + (stats?.inProgress || 0) + (stats?.resolved || 0) + (stats?.closed || 0)) * 100) || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">En cours</span>
                    <span className="text-sm font-bold">{stats?.inProgress || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{ width: `${((stats?.inProgress || 0) / ((stats?.open || 0) + (stats?.inProgress || 0) + (stats?.resolved || 0) + (stats?.closed || 0)) * 100) || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Résolus</span>
                    <span className="text-sm font-bold">{stats?.resolved || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${((stats?.resolved || 0) / ((stats?.open || 0) + (stats?.inProgress || 0) + (stats?.resolved || 0) + (stats?.closed || 0)) * 100) || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      <AnimatePresence>
        {showNewTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowNewTicket(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Nouveau Ticket
              </h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                createTicket.mutate(newTicketData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Sujet</label>
                    <input
                      type="text"
                      value={newTicketData.subject}
                      onChange={(e) => setNewTicketData({ ...newTicketData, subject: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={newTicketData.description}
                      onChange={(e) => setNewTicketData({ ...newTicketData, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg h-32"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Priorité</label>
                      <select
                        value={newTicketData.priority}
                        onChange={(e) => setNewTicketData({ ...newTicketData, priority: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="low">Basse</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Haute</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Catégorie</label>
                      <select
                        value={newTicketData.category}
                        onChange={(e) => setNewTicketData({ ...newTicketData, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="general">Général</option>
                        <option value="technique">Technique</option>
                        <option value="paiement">Paiement</option>
                        <option value="contenu">Contenu</option>
                        <option value="compte">Compte</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowNewTicket(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    #{selectedTicket.ticketNumber} - {selectedTicket.subject}
                  </h2>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                    <span className="text-sm text-gray-600">
                      Créé par {selectedTicket.createdBy.name} • {new Date(selectedTicket.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Ticket Actions */}
              {canManageTickets && (
                <div className="flex space-x-3 mb-4">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => {
                      updateTicketStatus.mutate({
                        ticketId: selectedTicket.id,
                        status: e.target.value
                      });
                    }}
                    className="px-3 py-1 border rounded-lg text-sm"
                  >
                    <option value="open">Ouvert</option>
                    <option value="in_progress">En cours</option>
                    <option value="resolved">Résolu</option>
                    <option value="closed">Fermé</option>
                  </select>
                </div>
              )}

              {/* Description */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300">{selectedTicket.description}</p>
              </div>

              {/* Messages */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold">Messages</h3>
                {selectedTicket.messages?.map((message: TicketMessage) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      message.author.role === 'admin' || message.author.role === 'owner'
                        ? 'bg-blue-50 dark:bg-blue-900/20 ml-8'
                        : 'bg-gray-50 dark:bg-gray-700 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{message.author.name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{message.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              {!showReplyForm ? (
                <button
                  onClick={() => setShowReplyForm(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Répondre
                </button>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  replyToTicket.mutate({
                    ticketId: selectedTicket.id,
                    message: replyMessage
                  });
                }}>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg h-24 mb-3"
                    placeholder="Votre réponse..."
                    required
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyMessage('');
                      }}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer
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

export default SupportTickets;