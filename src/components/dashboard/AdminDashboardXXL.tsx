import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, TrendingUp, Activity, DollarSign, 
  BarChart3, PieChart, Calendar, Clock,
  Target, Award, AlertCircle, CheckCircle,
  UserCheck, UserX, BookOpen, Brain,
  Zap, Globe, Briefcase, Settings
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart as RePieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Analytics {
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
    byRole: Record<string, number>;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    byPlan: Record<string, number>;
  };
  content: {
    courses: number;
    quizzes: number;
    cases: number;
    engagement: number;
  };
  performance: {
    avgScore: number;
    completionRate: number;
    timeSpent: number;
  };
}

export const AdminDashboardXXL: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics>({
    users: { total: 15420, active: 8932, new: 234, growth: 12.5, byRole: { student: 12500, resident: 2420, teacher: 500 } },
    revenue: { total: 450000, monthly: 45000, growth: 18.3, byPlan: { free: 8000, basic: 5000, premium: 2420 } },
    content: { courses: 450, quizzes: 1200, cases: 320, engagement: 78 },
    performance: { avgScore: 72.4, completionRate: 65, timeSpent: 4.5 }
  });

  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('users');
  const [isLive, setIsLive] = useState(false);

  // Données pour les graphiques
  const revenueData = [
    { month: 'Jan', revenue: 35000, users: 1200 },
    { month: 'Fév', revenue: 38000, users: 1350 },
    { month: 'Mar', revenue: 40000, users: 1500 },
    { month: 'Avr', revenue: 42000, users: 1650 },
    { month: 'Mai', revenue: 45000, users: 1800 },
    { month: 'Juin', revenue: 48000, users: 2000 }
  ];

  const userActivityData = [
    { hour: '00h', active: 120 },
    { hour: '06h', active: 450 },
    { hour: '09h', active: 1200 },
    { hour: '12h', active: 980 },
    { hour: '15h', active: 1450 },
    { hour: '18h', active: 1800 },
    { hour: '21h', active: 1100 }
  ];

  const contentEngagementData = [
    { name: 'Cours', value: 45, fill: '#0891b2' },
    { name: 'Quiz', value: 30, fill: '#8b5cf6' },
    { name: 'Cas cliniques', value: 20, fill: '#f59e0b' },
    { name: 'Résumés', value: 5, fill: '#10b981' }
  ];

  const modulePerformanceData = [
    { module: 'Anatomie', score: 85, students: 2450 },
    { module: 'Physiologie', score: 78, students: 2200 },
    { module: 'Pathologie', score: 72, students: 1980 },
    { module: 'Pharmacologie', score: 69, students: 1850 },
    { module: 'Sémiologie', score: 74, students: 1650 }
  ];

  const userSegmentData = [
    { segment: 'Performance', A: 85, B: 75, fullMark: 100 },
    { segment: 'Engagement', A: 92, B: 68, fullMark: 100 },
    { segment: 'Progression', A: 78, B: 82, fullMark: 100 },
    { segment: 'Collaboration', A: 88, B: 65, fullMark: 100 },
    { segment: 'Satisfaction', A: 95, B: 85, fullMark: 100 }
  ];

  // Simulation de données temps réel
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setAnalytics(prev => ({
        ...prev,
        users: {
          ...prev.users,
          active: prev.users.active + Math.floor(Math.random() * 10 - 5),
          new: prev.users.new + Math.floor(Math.random() * 3)
        },
        revenue: {
          ...prev.revenue,
          monthly: prev.revenue.monthly + Math.floor(Math.random() * 1000 - 500)
        }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Métriques principales
  const mainMetrics = [
    {
      icon: Users,
      label: 'Utilisateurs Actifs',
      value: analytics.users.active.toLocaleString(),
      change: `+${analytics.users.growth}%`,
      color: 'bg-blue-500'
    },
    {
      icon: DollarSign,
      label: 'Revenue Mensuel',
      value: `${(analytics.revenue.monthly / 1000).toFixed(1)}k €`,
      change: `+${analytics.revenue.growth}%`,
      color: 'bg-green-500'
    },
    {
      icon: BookOpen,
      label: 'Taux d\'Engagement',
      value: `${analytics.content.engagement}%`,
      change: '+5.2%',
      color: 'bg-purple-500'
    },
    {
      icon: Brain,
      label: 'Score Moyen',
      value: `${analytics.performance.avgScore}%`,
      change: '+3.1%',
      color: 'bg-amber-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Dashboard Admin XXL 🚀
            </h1>
            <p className="text-gray-600 mt-1">
              Centre de contrôle avancé avec analytics temps réel
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['24h', '7d', '30d', '12m'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    timeRange === range 
                      ? 'bg-white text-blue-600 shadow' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Live Mode Toggle */}
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
                isLive 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Activity className="w-4 h-4 mr-2" />
              {isLive ? 'LIVE' : 'Temps Réel'}
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {mainMetrics.map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 ${metric.color} rounded-lg text-white`}>
                  <metric.icon className="w-5 h-5" />
                </div>
                <span className="text-green-500 text-sm font-semibold">
                  {metric.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mt-3">
                {metric.value}
              </h3>
              <p className="text-gray-600 text-sm">{metric.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Growth Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Revenue & Croissance
            </h2>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-sm text-gray-600">Revenue</span>
              <span className="w-3 h-3 bg-purple-500 rounded-full ml-4"></span>
              <span className="text-sm text-gray-600">Utilisateurs</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis yAxisId="left" stroke="#9ca3af" />
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="users"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User Activity Heatmap */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Activité Temps Réel
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Bar 
                dataKey="active" 
                fill="#0891b2"
                radius={[8, 8, 0, 0]}
              >
                {userActivityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={
                    entry.active > 1500 ? '#ef4444' :
                    entry.active > 1000 ? '#f59e0b' :
                    entry.active > 500 ? '#10b981' : '#0891b2'
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 flex items-center justify-center space-x-6">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              <span className="text-sm text-gray-600">Pic</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
              <span className="text-sm text-gray-600">Élevé</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span className="text-sm text-gray-600">Normal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        {/* Content Engagement Pie */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Engagement Contenu
          </h2>
          <ResponsiveContainer width="100%" height={200}>
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
            {contentEngagementData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Module Performance */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Performance par Module
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={modulePerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="module" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Bar dataKey="score" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="students" fill="#0891b2" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Segments Radar */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Segments Utilisateurs
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={userSegmentData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="segment" stroke="#9ca3af" />
              <PolarRadiusAxis stroke="#9ca3af" />
              <Radar
                name="Premium"
                dataKey="A"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
              <Radar
                name="Basic"
                dataKey="B"
                stroke="#0891b2"
                fill="#0891b2"
                fillOpacity={0.6}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Real-time Alerts */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Alertes Temps Réel
          </h2>
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start p-3 bg-red-50 rounded-lg border border-red-200"
            >
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900">
                  Pic d'utilisation détecté
                </p>
                <p className="text-xs text-red-700 mt-1">
                  +45% d'utilisateurs actifs par rapport à la moyenne
                </p>
              </div>
              <span className="text-xs text-red-600 ml-auto">Maintenant</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-start p-3 bg-amber-50 rounded-lg border border-amber-200"
            >
              <Zap className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900">
                  Performance API dégradée
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Temps de réponse moyen: 850ms (seuil: 500ms)
                </p>
              </div>
              <span className="text-xs text-amber-600 ml-auto">Il y a 2 min</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start p-3 bg-green-50 rounded-lg border border-green-200"
            >
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Objectif mensuel atteint
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Revenue: 45,000€ (objectif: 40,000€)
                </p>
              </div>
              <span className="text-xs text-green-600 ml-auto">Il y a 1h</span>
            </motion.div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">IA Insights 🤖</h2>
            <Brain className="w-6 h-6" />
          </div>

          <div className="space-y-4">
            <div className="bg-white/20 backdrop-blur rounded-lg p-4">
              <h3 className="font-semibold mb-2">📈 Prédiction de croissance</h3>
              <p className="text-sm text-white/90">
                Basé sur les tendances actuelles, attendez-vous à une augmentation 
                de 23% des inscriptions d'ici la fin du mois.
              </p>
            </div>

            <div className="bg-white/20 backdrop-blur rounded-lg p-4">
              <h3 className="font-semibold mb-2">💡 Recommandation</h3>
              <p className="text-sm text-white/90">
                Le module "Anatomie" a le meilleur taux d'engagement. 
                Considérez créer plus de contenu similaire.
              </p>
            </div>

            <div className="bg-white/20 backdrop-blur rounded-lg p-4">
              <h3 className="font-semibold mb-2">⚠️ Point d'attention</h3>
              <p className="text-sm text-white/90">
                Le taux d'abandon sur les quiz est de 35%. 
                Optimisez la difficulté progressive.
              </p>
            </div>
          </div>

          <button className="w-full mt-4 bg-white/20 backdrop-blur rounded-lg py-2 font-medium hover:bg-white/30 transition">
            Voir plus d'insights →
          </button>
        </div>
      </div>
    </div>
  );
};