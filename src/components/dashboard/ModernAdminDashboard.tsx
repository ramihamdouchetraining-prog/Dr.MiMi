import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Brain, FileText, MessageSquare,
  Settings, Bell, Search, Menu, X, ChevronDown, TrendingUp, TrendingDown,
  Calendar, Download, Upload, Filter, MoreVertical, Plus, Eye, Edit,
  Trash2, CheckCircle, XCircle, Clock, AlertTriangle, DollarSign,
  Activity, BarChart3, PieChart, Target, Award, Zap, Shield, Database,
  Globe, Cpu, HardDrive, Wifi, RefreshCw, ArrowUpRight, ArrowDownRight,
  UserPlus, UserMinus, Mail, Phone, MapPin, CreditCard, Package,
  Layers, Grid, List, ChevronRight, Star, Heart, Share2, Copy,
  ExternalLink, Info, HelpCircle, LogOut, Moon, Sun, Palette
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { AdminMessaging } from '../admin/AdminMessaging';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RePieChart, 
  Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap
} from 'recharts';

// Types
interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: any;
  color: string;
  subtitle?: string;
}

interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: Date;
  type: 'create' | 'update' | 'delete' | 'login' | 'payment';
}

// Données fictives pour les graphiques
const revenueData = [
  { month: 'Jan', revenue: 45000, users: 1200 },
  { month: 'Fév', revenue: 52000, users: 1400 },
  { month: 'Mar', revenue: 48000, users: 1600 },
  { month: 'Avr', revenue: 61000, users: 1900 },
  { month: 'Mai', revenue: 67000, users: 2200 },
  { month: 'Jun', revenue: 72000, users: 2500 },
];

const userDistribution = [
  { name: 'Étudiants', value: 3500, color: '#8B5CF6' },
  { name: 'Résidents', value: 1200, color: '#EC4899' },
  { name: 'Internes', value: 800, color: '#10B981' },
  { name: 'Professeurs', value: 150, color: '#F59E0B' },
];

const performanceData = [
  { subject: 'Anatomie', A: 120, B: 110, fullMark: 150 },
  { subject: 'Physiologie', A: 98, B: 130, fullMark: 150 },
  { subject: 'Pathologie', A: 86, B: 130, fullMark: 150 },
  { subject: 'Pharmacologie', A: 99, B: 100, fullMark: 150 },
  { subject: 'Clinique', A: 85, B: 90, fullMark: 150 },
];

const recentActivities: Activity[] = [
  {
    id: '1',
    user: 'Dr. Sarah Martin',
    action: 'a créé',
    target: 'Cours de Cardiologie Avancée',
    time: new Date(Date.now() - 600000),
    type: 'create'
  },
  {
    id: '2',
    user: 'Ahmed Benali',
    action: 's\'est inscrit',
    target: 'Plan Premium',
    time: new Date(Date.now() - 1800000),
    type: 'payment'
  },
  {
    id: '3',
    user: 'Fatima Zohra',
    action: 'a complété',
    target: 'Quiz Neurologie #15',
    time: new Date(Date.now() - 3600000),
    type: 'update'
  }
];

// Composant principal
export function ModernAdminDashboard() {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const { t, locale } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Métriques principales
  const metrics: MetricCard[] = [
    {
      title: 'Revenus Totaux',
      value: '€72,450',
      change: 12.5,
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      subtitle: 'Ce mois'
    },
    {
      title: 'Utilisateurs Actifs',
      value: '5,650',
      change: 8.2,
      trend: 'up',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      subtitle: '+320 cette semaine'
    },
    {
      title: 'Cours Publiés',
      value: '248',
      change: -2.4,
      trend: 'down',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      subtitle: '15 en attente'
    },
    {
      title: 'Taux Complétion',
      value: '78%',
      change: 5.1,
      trend: 'up',
      icon: Target,
      color: 'from-amber-500 to-orange-500',
      subtitle: 'Moyenne globale'
    }
  ];

  // Sidebar items
  const sidebarItems = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'users', name: 'Utilisateurs', icon: Users },
    { id: 'content', name: 'Contenu', icon: BookOpen },
    { id: 'analytics', name: 'Analytiques', icon: BarChart3 },
    { id: 'messages', name: 'Messages', icon: MessageSquare },
    { id: 'finance', name: 'Finance', icon: DollarSign },
    { id: 'settings', name: 'Paramètres', icon: Settings },
  ];

  // Format time
  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 60) return `Il y a ${minutes} min`;
    return `Il y a ${hours}h`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar moderne */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40"
          >
            {/* Logo */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Dr.MiMi Platform</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  {item.id === 'messages' && (
                    <span className="ml-auto px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      3
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* User info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Admin</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
                </div>
                <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                {/* Search */}
                <div className="relative w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Period selector */}
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="24h">24 heures</option>
                  <option value="7d">7 jours</option>
                  <option value="30d">30 jours</option>
                  <option value="90d">90 jours</option>
                </select>

                {/* View mode */}
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600' : ''}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600' : ''}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Dark mode toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  </button>

                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {recentActivities.map((activity) => (
                          <div
                            key={activity.id}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg ${
                                activity.type === 'create' ? 'bg-green-100 dark:bg-green-900/30' :
                                activity.type === 'payment' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                'bg-purple-100 dark:bg-purple-900/30'
                              }`}>
                                {activity.type === 'create' ? <Plus className="w-4 h-4" /> :
                                 activity.type === 'payment' ? <CreditCard className="w-4 h-4" /> :
                                 <Edit className="w-4 h-4" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 dark:text-white">
                                  <span className="font-medium">{activity.user}</span>
                                  {' '}{activity.action}{' '}
                                  <span className="font-medium">{activity.target}</span>
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {formatTime(activity.time)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                        <button className="w-full text-center text-sm text-purple-600 dark:text-purple-400 hover:underline">
                          Voir toutes les notifications
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Refresh */}
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          <AnimatePresence mode="wait">
            {activeSection === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {metrics.map((metric, index) => (
                    <motion.div
                      key={metric.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
                    >
                      <div className={`h-2 bg-gradient-to-r ${metric.color}`} />
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color} text-white`}>
                            <metric.icon className="w-6 h-6" />
                          </div>
                          <div className={`flex items-center space-x-1 text-sm ${
                            metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {metric.trend === 'up' ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                            <span>{Math.abs(metric.change)}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {metric.value}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {metric.title}
                          </p>
                          {metric.subtitle && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {metric.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Chart */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Évolution des Revenus
                      </h3>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#8B5CF6"
                          strokeWidth={2}
                          fill="url(#colorRevenue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </motion.div>

                  {/* User Distribution */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Répartition des Utilisateurs
                      </h3>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <RePieChart>
                        <Pie
                          data={userDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {userDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </motion.div>
                </div>

                {/* Activity Feed & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Activity */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Activité Récente
                      </h3>
                      <Link
                        to="/admin/activity"
                        className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        Voir tout
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className={`p-3 rounded-xl ${
                            activity.type === 'create' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                            activity.type === 'payment' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                            activity.type === 'delete' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                            'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          }`}>
                            {activity.type === 'create' ? <Plus className="w-5 h-5" /> :
                             activity.type === 'payment' ? <CreditCard className="w-5 h-5" /> :
                             activity.type === 'delete' ? <Trash2 className="w-5 h-5" /> :
                             activity.type === 'login' ? <LogOut className="w-5 h-5" /> :
                             <Edit className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">
                              <span className="font-semibold">{activity.user}</span>
                              {' '}{activity.action}{' '}
                              <span className="font-semibold">{activity.target}</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatTime(activity.time)}
                            </p>
                          </div>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
                  >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                      Actions Rapides
                    </h3>
                    <div className="space-y-3">
                      <button className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                        <Plus className="w-4 h-4 inline mr-2" />
                        Nouveau Cours
                      </button>
                      <button className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <UserPlus className="w-4 h-4 inline mr-2" />
                        Ajouter Utilisateur
                      </button>
                      <button className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Envoyer Newsletter
                      </button>
                      <button className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <Download className="w-4 h-4 inline mr-2" />
                        Export Données
                      </button>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Serveur</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm text-green-600 dark:text-green-400">En ligne</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">CPU</span>
                          <span className="text-sm font-medium">32%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">RAM</span>
                          <span className="text-sm font-medium">4.2 GB / 8 GB</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Stockage</span>
                          <span className="text-sm font-medium">67 GB / 100 GB</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeSection === 'messages' && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AdminMessaging />
              </motion.div>
            )}

            {/* Autres sections... */}
            {activeSection === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Gestion des Utilisateurs
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Section de gestion des utilisateurs...
                  </p>
                </div>
              </motion.div>
            )}

            {activeSection === 'content' && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Gestion du Contenu
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Section de gestion du contenu...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default ModernAdminDashboard;