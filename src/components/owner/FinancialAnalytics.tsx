import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Download,
  PieChart,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RevenueByArticle {
  id: string;
  title: string;
  author: string;
  authorId: string;
  revenue: number;
  sales: number;
  currency: 'DZD' | 'EUR';
  ownerShare: number;
  adminShare: number;
  editorShare: number;
}

interface RevenueByAuthor {
  authorId: string;
  authorName: string;
  role: 'owner' | 'admin' | 'editor';
  totalRevenue: number;
  articleCount: number;
  totalShare: number;
  sharePercentage: number;
}

interface MonthlyRevenue {
  month: string;
  dzd: number;
  eur: number;
  total: number;
}

const FinancialAnalytics: React.FC = () => {
  const { language } = useLanguage();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedCurrency, setSelectedCurrency] = useState<'all' | 'DZD' | 'EUR'>('all');
  const [loading, setLoading] = useState(true);
  const [revenueByArticle, setRevenueByArticle] = useState<RevenueByArticle[]>([]);
  const [revenueByAuthor, setRevenueByAuthor] = useState<RevenueByAuthor[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [summary, setSummary] = useState({
    totalRevenueDZD: 0,
    totalRevenueEUR: 0,
    totalSales: 0,
    paidArticlesCount: 0,
  });

  useEffect(() => {
    fetchFinancialData();
  }, [timeRange, selectedCurrency]);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/financial/analytics?timeRange=${timeRange}&currency=${selectedCurrency}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setRevenueByArticle(data.revenueByArticle || []);
        setRevenueByAuthor(data.revenueByAuthor || []);
        setMonthlyRevenue(data.monthlyRevenue || []);
        setSummary(data.summary || {
          totalRevenueDZD: 0,
          totalRevenueEUR: 0,
          totalSales: 0,
          paidArticlesCount: 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // REMOVED: Old mock data
  /* const revenueByArticle: RevenueByArticle[] = [
    {
      id: '1',
      title: 'Anatomie Cardiaque Avancée',
      author: 'Dr. Merieme',
      authorId: 'owner-1',
      revenue: 45000,
      sales: 90,
      currency: 'DZD',
      ownerShare: 31500, // 70%
      adminShare: 9000,  // 20%
      editorShare: 4500, // 10%
    },
    {
      id: '2',
      title: 'Pharmacologie Clinique',
      author: 'Dr. Sarah Admin',
      authorId: 'admin-1',
      revenue: 180,
      sales: 45,
      currency: 'EUR',
      ownerShare: 72,    // 40%
      adminShare: 90,    // 50%
      editorShare: 18,   // 10%
    },
    {
      id: '3',
      title: 'Cas Cliniques Cardiologie',
      author: 'Dr. Ahmed Editor',
      authorId: 'editor-1',
      revenue: 32000,
      sales: 64,
      currency: 'DZD',
      ownerShare: 9600,  // 30%
      adminShare: 9600,  // 30%
      editorShare: 12800, // 40%
    },
    {
      id: '4',
      title: 'Neurologie Pratique',
      author: 'Dr. Merieme',
      authorId: 'owner-1',
      revenue: 250,
      sales: 50,
      currency: 'EUR',
      ownerShare: 175,   // 70%
      adminShare: 50,    // 20%
      editorShare: 25,   // 10%
    },
  ]; */

  const shareDistribution = [
    { name: 'Owner (70%)', value: 70, color: '#0FA3B1' },
    { name: 'Admin (20%)', value: 20, color: '#1363DF' },
    { name: 'Editor (10%)', value: 10, color: '#F59E0B' },
  ];

  const exportToCSV = () => {
    const headers = ['Article', 'Auteur', 'Revenus', 'Devise', 'Ventes', 'Part Owner', 'Part Admin', 'Part Editor'];
    const rows = revenueByArticle.map(a => [
      a.title,
      a.author,
      a.revenue,
      a.currency,
      a.sales,
      a.ownerShare,
      a.adminShare,
      a.editorShare,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const data = {
      timeRange,
      generatedAt: new Date().toISOString(),
      summary,
      revenueByArticle,
      revenueByAuthor,
      monthlyRevenue,
      shareDistribution,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial_analytics_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters and export */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            💰 {language === 'en' ? 'Financial Analytics' : language === 'ar' ? 'التحليلات المالية' : 'Analytics Financiers'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {language === 'en' 
              ? 'Revenue tracking, author shares, and performance metrics'
              : language === 'ar'
              ? 'تتبع الإيرادات، حصص المؤلفين، ومقاييس الأداء'
              : 'Suivi des revenus, parts des auteurs, et métriques de performance'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="week">Semaine</option>
            <option value="month">Mois</option>
            <option value="quarter">Trimestre</option>
            <option value="year">Année</option>
          </select>

          {/* Currency Filter */}
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Toutes devises</option>
            <option value="DZD">DZD uniquement</option>
            <option value="EUR">EUR uniquement</option>
          </select>

          {/* Export buttons */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>

          <button
            onClick={exportToJSON}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            JSON
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Revenus DZD</p>
              <p className="text-2xl font-bold mt-1">{summary.totalRevenueDZD.toLocaleString()} DZD</p>
            </div>
            <DollarSign className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Revenus EUR</p>
              <p className="text-2xl font-bold mt-1">{summary.totalRevenueEUR.toLocaleString()} €</p>
            </div>
            <DollarSign className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Ventes totales</p>
              <p className="text-2xl font-bold mt-1">{summary.totalSales}</p>
            </div>
            <TrendingUp className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Articles payants</p>
              <p className="text-2xl font-bold mt-1">{summary.paidArticlesCount}</p>
            </div>
            <FileText className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>
      </div>

      {/* Revenue by Article Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {language === 'en' ? 'Revenue by Article' : language === 'ar' ? 'الإيرادات حسب المقال' : 'Revenus par Article'}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Article</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Auteur</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Revenus</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Ventes</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Part Owner</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Part Admin</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Part Editor</th>
              </tr>
            </thead>
            <tbody>
              {revenueByArticle.map((article) => (
                <tr key={article.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{article.title}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{article.author}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {article.revenue.toLocaleString()} {article.currency}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">{article.sales}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-teal-600 dark:text-teal-400 font-medium">
                      {article.ownerShare.toLocaleString()} {article.currency}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {article.adminShare.toLocaleString()} {article.currency}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      {article.editorShare.toLocaleString()} {article.currency}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Revenus Mensuels
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6',
                }}
              />
              <Legend />
              <Bar dataKey="dzd" fill="#0FA3B1" name="DZD" />
              <Bar dataKey="eur" fill="#1363DF" name="EUR (x100)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Share Distribution Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Répartition des Parts
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={shareDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name }) => `${name}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {shareDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue by Author */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          {language === 'en' ? 'Revenue by Author' : language === 'ar' ? 'الإيرادات حسب المؤلف' : 'Revenus par Auteur'}
        </h3>

        <div className="space-y-3">
          {revenueByAuthor.map((author) => (
            <div
              key={author.authorId}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{author.authorName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {author.articleCount} article{author.articleCount > 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
                  {author.totalShare.toLocaleString()} DZD
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {author.sharePercentage.toFixed(1)}% de part
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialAnalytics;
