import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  Eye,
  Download,
  Filter,
  Activity
} from 'lucide-react';
import AvatarDrMimi from '../components/AvatarDrMimi';
import { exportToCSV } from '../utils/csvExport';

// Types
interface Stats {
  totalUsers: number;
  activeUsers: number;
  blacklistedUsers: number;
  totalArticles: number;
  todayVisitors: number;
  monthRevenue: number;
}

interface AnalyticsData {
  dailyVisitors: Array<{ date: string; count: number }>;
  dailyRevenue: Array<{ date: string; total: number }>;
  pageViews: Array<{ path: string; count: number }>;
}

// API functions
const fetchStats = async (): Promise<Stats> => {
  const response = await fetch('/api/admin/stats', {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
};

const fetchAnalytics = async (period: number): Promise<AnalyticsData> => {
  const response = await fetch(`/api/admin/analytics?period=${period}`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
};

// KPI Card component
const KPICard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  color: string;
}> = ({ title, value, icon, change, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-xl shadow-lg p-6"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
      {change && (
        <span className={`text-sm font-semibold ${
          change.startsWith('+') ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </span>
      )}
    </div>
    <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </motion.div>
);

const AdminAnalytics: React.FC = () => {
  const [period, setPeriod] = useState(30);
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: fetchStats
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['adminAnalytics', period],
    queryFn: () => fetchAnalytics(period)
  });

  // Export data to CSV
  const handleExportCSV = async () => {
    if (!analytics) return;
    
    setExportLoading(true);
    try {
      // Prepare data for export
      const visitorsData = analytics.dailyVisitors.map(item => ({
        Date: new Date(item.date).toLocaleDateString('fr-FR'),
        Visiteurs: item.count
      }));

      const revenueData = analytics.dailyRevenue.map(item => ({
        Date: new Date(item.date).toLocaleDateString('fr-FR'),
        'Revenus (DZD)': item.total || 0
      }));

      // Export multiple sheets
      exportToCSV(visitorsData, `visiteurs_${period}j.csv`);
      exportToCSV(revenueData, `revenus_${period}j.csv`);
    } finally {
      setExportLoading(false);
    }
  };

  // Chart colors
  const COLORS = ['#FF69B4', '#BA55D3', '#87CEEB', '#FFD700', '#98FB98'];

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD'
    }).format(value);
  };

  // Prepare chart data
  const visitorsChartData = analytics?.dailyVisitors.map(item => ({
    date: new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    visiteurs: item.count
  })) || [];

  const revenueChartData = analytics?.dailyRevenue.map(item => ({
    date: new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    revenus: item.total || 0
  })) || [];

  const pageViewsChartData = analytics?.pageViews.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <AvatarDrMimi pose="idea" size="small" animated />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord Analytics</h1>
                <p className="text-gray-600">Vue d'ensemble des performances</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              {/* Period filter */}
              <select
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={7}>7 jours</option>
                <option value={30}>30 jours</option>
                <option value={90}>90 jours</option>
                <option value={365}>1 an</option>
              </select>

              {/* Export button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportCSV}
                disabled={exportLoading || !analytics}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KPICard
            title="Utilisateurs actifs"
            value={stats?.activeUsers || 0}
            icon={<Users className="w-6 h-6 text-white" />}
            change="+12%"
            color="bg-gradient-to-r from-blue-500 to-blue-600"
          />
          <KPICard
            title="Revenus du mois"
            value={formatCurrency(stats?.monthRevenue || 0)}
            icon={<DollarSign className="w-6 h-6 text-white" />}
            change="+24%"
            color="bg-gradient-to-r from-green-500 to-emerald-600"
          />
          <KPICard
            title="Articles publiés"
            value={stats?.totalArticles || 0}
            icon={<FileText className="w-6 h-6 text-white" />}
            change="+8"
            color="bg-gradient-to-r from-purple-500 to-purple-600"
          />
          <KPICard
            title="Visiteurs aujourd'hui"
            value={stats?.todayVisitors || 0}
            icon={<Eye className="w-6 h-6 text-white" />}
            change="+5%"
            color="bg-gradient-to-r from-pink-500 to-pink-600"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visitors Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Visiteurs par jour
            </h2>
            {analyticsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={visitorsChartData}>
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#BA55D3" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#BA55D3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visiteurs"
                    stroke="#BA55D3"
                    fillOpacity={1}
                    fill="url(#colorVisitors)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Revenus par jour
            </h2>
            {analyticsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenus"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Page Views Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 lg:col-span-2"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Pages les plus visitées
            </h2>
            {analyticsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pageViewsChartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#666" fontSize={12} />
                  <YAxis dataKey="path" type="category" stroke="#666" fontSize={12} width={150} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]}>
                    {pageViewsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Additional Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mt-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Statistiques détaillées</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats?.totalUsers || 0}</p>
              <p className="text-gray-600 mt-1">Utilisateurs totaux</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{stats?.blacklistedUsers || 0}</p>
              <p className="text-gray-600 mt-1">Utilisateurs blacklistés</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {((stats?.activeUsers || 0) / (stats?.totalUsers || 1) * 100).toFixed(1)}%
              </p>
              <p className="text-gray-600 mt-1">Taux d'engagement</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnalytics;