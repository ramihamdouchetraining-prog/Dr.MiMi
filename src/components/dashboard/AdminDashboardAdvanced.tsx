import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, TrendingUp, Activity, DollarSign, 
  BarChart3, PieChart, Calendar, Clock,
  Target, Award, AlertCircle, CheckCircle,
  UserCheck, UserX, BookOpen, Brain,
  Zap, Globe, Briefcase, Settings,
  Filter, Download, RefreshCw, Eye,
  ChevronDown, ArrowUp, ArrowDown,
  Search, Bell, Menu, X, Hash
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart as RePieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, ScatterChart, Scatter, Treemap
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
interface Analytics {
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
    byRole: Record<string, number>;
    retention: number;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    byPlan: Record<string, number>;
    mrr: number;
    arpu: number;
  };
  content: {
    courses: number;
    quizzes: number;
    cases: number;
    engagement: number;
    completionRate: number;
  };
  performance: {
    avgScore: number;
    completionRate: number;
    timeSpent: number;
    satisfaction: number;
  };
}

// Composant principal
export const AdminDashboardAdvanced: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics>({
    users: { 
      total: 15420, 
      active: 8932, 
      new: 234, 
      growth: 12.5, 
      byRole: { student: 12500, resident: 2420, teacher: 500 },
      retention: 85
    },
    revenue: { 
      total: 450000, 
      monthly: 45000, 
      growth: 18.3, 
      byPlan: { free: 8000, basic: 5000, premium: 2420 },
      mrr: 45000,
      arpu: 5.2
    },
    content: { 
      courses: 450, 
      quizzes: 1200, 
      cases: 320, 
      engagement: 78,
      completionRate: 65
    },
    performance: { 
      avgScore: 72.4, 
      completionRate: 65, 
      timeSpent: 4.5,
      satisfaction: 4.2
    }
  });

  const [timeRange, setTimeRange] = useState('7d');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isLive, setIsLive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications] = useState(12);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Données pour les graphiques
  const revenueData = [
    { month: 'Jan', revenue: 35000, users: 1200, profit: 28000 },
    { month: 'Fév', revenue: 38000, users: 1350, profit: 30400 },
    { month: 'Mar', revenue: 40000, users: 1500, profit: 32000 },
    { month: 'Avr', revenue: 42000, users: 1650, profit: 33600 },
    { month: 'Mai', revenue: 45000, users: 1800, profit: 36000 },
    { month: 'Juin', revenue: 48000, users: 2000, profit: 38400 },
    { month: 'Juil', revenue: 52000, users: 2200, profit: 41600 }
  ];

  const userActivityData = [
    { hour: '00h', active: 120, mobile: 80, desktop: 40 },
    { hour: '03h', active: 80, mobile: 60, desktop: 20 },
    { hour: '06h', active: 450, mobile: 300, desktop: 150 },
    { hour: '09h', active: 1200, mobile: 700, desktop: 500 },
    { hour: '12h', active: 980, mobile: 600, desktop: 380 },
    { hour: '15h', active: 1450, mobile: 900, desktop: 550 },
    { hour: '18h', active: 1800, mobile: 1100, desktop: 700 },
    { hour: '21h', active: 1100, mobile: 700, desktop: 400 },
    { hour: '23h', active: 400, mobile: 280, desktop: 120 }
  ];

  const contentEngagementData = [
    { name: 'Cours', value: 45, users: 8500, fill: '#0891b2' },
    { name: 'Quiz', value: 30, users: 6200, fill: '#8b5cf6' },
    { name: 'Cas cliniques', value: 20, users: 4100, fill: '#f59e0b' },
    { name: 'Résumés', value: 15, users: 3200, fill: '#10b981' },
    { name: 'Forums', value: 10, users: 2300, fill: '#ef4444' }
  ];

  const modulePerformanceData = [
    { module: 'Anatomie', score: 85, students: 2450, completion: 78 },
    { module: 'Physiologie', score: 78, students: 2200, completion: 72 },
    { module: 'Pathologie', score: 72, students: 1980, completion: 65 },
    { module: 'Pharmacologie', score: 69, students: 1850, completion: 60 },
    { module: 'Sémiologie', score: 74, students: 1650, completion: 68 },
    { module: 'Chirurgie', score: 80, students: 1450, completion: 75 }
  ];

  const userRetentionData = [
    { week: 'Semaine 1', retention: 100 },
    { week: 'Semaine 2', retention: 85 },
    { week: 'Semaine 4', retention: 72 },
    { week: 'Semaine 8', retention: 65 },
    { week: 'Semaine 12', retention: 60 },
    { week: 'Semaine 24', retention: 55 }
  ];

  const topPerformers = [
    { name: 'Sarah Benali', score: 98, courses: 42, badges: 15, trend: 'up' },
    { name: 'Ahmed Rachid', score: 96, courses: 38, badges: 12, trend: 'up' },
    { name: 'Fatima Zaoui', score: 94, courses: 40, badges: 14, trend: 'stable' },
    { name: 'Karim Mehdaoui', score: 92, courses: 35, badges: 11, trend: 'down' },
    { name: 'Amina Belkacem', score: 91, courses: 36, badges: 13, trend: 'up' }
  ];

  // Simulation de données temps réel
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setAnalytics(prev => ({
        ...prev,
        users: {
          ...prev.users,
          active: prev.users.active + Math.floor(Math.random() * 20 - 10),
          new: prev.users.new + Math.floor(Math.random() * 5)
        },
        revenue: {
          ...prev.revenue,
          monthly: prev.revenue.monthly + Math.floor(Math.random() * 2000 - 1000)
        }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Métriques principales avec icônes et couleurs
  const mainMetrics = [
    {
      title: 'Utilisateurs Actifs',
      value: analytics.users.active.toLocaleString('fr-FR'),
      change: `+${analytics.users.growth}%`,
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      subtitle: `${analytics.users.new} nouveaux aujourd'hui`
    },
    {
      title: 'Revenu Mensuel',
      value: `${(analytics.revenue.monthly / 1000).toFixed(1)}k DZD`,
      change: `+${analytics.revenue.growth}%`,
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      subtitle: `ARPU: ${analytics.revenue.arpu} DZD`
    },
    {
      title: 'Taux d\'Engagement',
      value: `${analytics.content.engagement}%`,
      change: '+5.2%',
      trend: 'up',
      icon: Activity,
      color: 'from-purple-500 to-pink-500',
      subtitle: 'Sur les 7 derniers jours'
    },
    {
      title: 'Score Moyen',
      value: `${analytics.performance.avgScore}%`,
      change: '+2.3%',
      trend: 'up',
      icon: Target,
      color: 'from-orange-500 to-red-500',
      subtitle: 'Tous modules confondus'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'revenue', label: 'Revenus', icon: DollarSign },
    { id: 'content', label: 'Contenu', icon: BookOpen },
    { id: 'performance', label: 'Performance', icon: Target }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header fixe avec navigation */}
      <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none lg:hidden"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              
              <h1 className="ml-4 text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Tableau de Bord Analytique Avancé
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Barre de recherche */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 px-4 py-2 pl-10 pr-4 text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              {/* Bouton Live */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLive(!isLive)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isLive 
                    ? 'bg-green-500 text-white animate-pulse' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Activity className="w-4 h-4 inline mr-2" />
                {isLive ? 'LIVE' : 'Activer Live'}
              </motion.button>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Bouton Export */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Download className="w-4 h-4 inline mr-2" />
                Exporter
              </motion.button>
            </div>
          </div>

          {/* Tabs de navigation */}
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-b-2 border-purple-500'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Contenu principal avec scrolling corrigé */}
      <main className="max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filtres de temps */}
          <div className="mb-8 flex justify-between items-center">
            <div className="flex space-x-2">
              {['24h', '7d', '30d', '90d', '1y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-purple-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {range === '24h' ? '24 heures' :
                   range === '7d' ? '7 jours' :
                   range === '30d' ? '30 jours' :
                   range === '90d' ? '3 mois' : '1 an'}
                </button>
              ))}
            </div>

            <button
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Actualiser
            </button>
          </div>

          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {mainMetrics.map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${metric.color}`} />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${metric.color} bg-opacity-10`}>
                      <metric.icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </div>
                    <span className={`flex items-center text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {metric.trend === 'up' ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                      {metric.change}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.title}</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{metric.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{metric.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Graphiques principaux */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Graphique des revenus */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Évolution des Revenus
                </h2>
                <select className="px-3 py-1 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                  <option>Mensuel</option>
                  <option>Hebdomadaire</option>
                  <option>Quotidien</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8b5cf6" name="Revenus" />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
                  <Area type="monotone" dataKey="users" fill="#0891b2" stroke="#0891b2" fillOpacity={0.3} name="Utilisateurs" />
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Graphique d'activité utilisateurs */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Activité des Utilisateurs
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Mobile</span>
                  <span className="w-3 h-3 bg-purple-500 rounded-full ml-2"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Desktop</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="hour" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Area type="monotone" dataKey="mobile" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="desktop" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Graphiques secondaires */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Engagement du contenu */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Engagement par Type de Contenu
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <RePieChart>
                  <Pie
                    data={contentEngagementData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {contentEngagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {contentEngagementData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.fill }} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.value}% ({item.users})
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Performance des modules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Performance par Module
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={modulePerformanceData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis type="number" stroke="#666" />
                  <YAxis dataKey="module" type="category" stroke="#666" width={80} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#8b5cf6" />
                  <Bar dataKey="completion" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Rétention utilisateurs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Rétention des Utilisateurs
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={userRetentionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="week" stroke="#666" angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="retention" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Tableau des top performers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500">
              <h3 className="text-xl font-bold text-white">Top Performers</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rang
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Étudiant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Cours Complétés
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Badges
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tendance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {topPerformers.map((performer, index) => (
                      <tr key={performer.name} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                              index === 0 ? 'bg-yellow-500' :
                              index === 1 ? 'bg-gray-400' :
                              index === 2 ? 'bg-amber-600' :
                              'bg-gray-300'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                              {performer.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {performer.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white font-semibold">
                            {performer.score}%
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                            <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{ width: `${performer.score}%` }} />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {performer.courses}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Award className="w-5 h-5 text-yellow-500 mr-1" />
                            <span className="text-sm text-gray-900 dark:text-white">{performer.badges}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {performer.trend === 'up' && (
                            <span className="flex items-center text-green-500">
                              <ArrowUp className="w-4 h-4" />
                            </span>
                          )}
                          {performer.trend === 'down' && (
                            <span className="flex items-center text-red-500">
                              <ArrowDown className="w-4 h-4" />
                            </span>
                          )}
                          {performer.trend === 'stable' && (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Alertes et notifications */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Alertes Système
              </h3>
              <div className="space-y-3">
                <div className="flex items-start p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-900 dark:text-red-300">
                      Charge serveur élevée
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                      Utilisation CPU à 85% - Il y a 5 minutes
                    </p>
                  </div>
                </div>
                <div className="flex items-start p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-300">
                      Espace disque faible
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                      15% d'espace restant - Il y a 2 heures
                    </p>
                  </div>
                </div>
                <div className="flex items-start p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-900 dark:text-green-300">
                      Sauvegarde réussie
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                      Backup quotidien complété - Il y a 4 heures
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Activité Récente
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <UserCheck className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Nouveau compte créé
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Sarah Martin - Il y a 10 min
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Cours publié
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Anatomie Avancée - Il y a 25 min
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-yellow-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Badge débloqué
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Ahmed R. - Expert Physiologie - Il y a 1h
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};