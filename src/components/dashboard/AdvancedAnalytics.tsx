import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Treemap,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  Users,
  BookOpen,
  Clock,
  Award,
  Activity,
  Calendar,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Target,
  Brain,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import memoizee from 'memoizee';

// Types
interface CourseCompletion {
  moduleName: string;
  completed: number;
  inProgress: number;
  notStarted: number;
  totalStudents: number;
  completionRate: number;
}

interface StudentProgress {
  week: string;
  newStudents: number;
  activeStudents: number;
  completedCourses: number;
  avgProgress: number;
}

interface ActivityHeatMap {
  hour: number;
  day: string;
  activity: number;
}

interface QuizPerformance {
  difficulty: 'easy' | 'medium' | 'hard';
  successRate: number;
  avgAttempts: number;
  totalQuizzes: number;
}

interface RealTimeKPIs {
  activeToday: number;
  activeWeek: number;
  activeMonth: number;
  avgSessionTime: number;
  popularCourses: Array<{ id: string; title: string; views: number }>;
  failedQuestions: Array<{ id: string; question: string; failRate: number }>;
}

interface ModulePerformance {
  module: string;
  engagement: number;
  completion: number;
  satisfaction: number;
  difficulty: number;
  timeSpent: number;
}

// Cache API calls for performance
const fetchAnalyticsData = memoizee(
  async (endpoint: string) => {
    const response = await fetch(endpoint, { credentials: 'include' });
    if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
    return response.json();
  },
  { maxAge: 60000, promise: true } // Cache for 1 minute
);

// KPI Card Component
const KPICard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon, trend, color, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${color}`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 rounded-lg bg-gradient-to-br from-white/20 to-white/10">
        {icon}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
          <span className="ml-1 text-sm font-semibold">{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
  </motion.div>
);

// Heat Map Component for Activity
const ActivityHeatMapChart: React.FC<{ data: ActivityHeatMap[] }> = ({ data }) => {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const getIntensity = (value: number, max: number) => {
    const intensity = value / max;
    if (intensity > 0.8) return '#FF6B6B';
    if (intensity > 0.6) return '#FFA06B';
    if (intensity > 0.4) return '#FFD56B';
    if (intensity > 0.2) return '#9AE6B4';
    return '#E2E8F0';
  };

  const maxActivity = Math.max(...data.map(d => d.activity));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Heat Map des Heures d'Activité
      </h3>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-25 gap-1 min-w-[600px]">
          <div></div>
          {hours.map(hour => (
            <div key={hour} className="text-xs text-center text-gray-600 dark:text-gray-400">
              {hour}h
            </div>
          ))}
          {days.map(day => (
            <React.Fragment key={day}>
              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                {day}
              </div>
              {hours.map(hour => {
                const activity = data.find(d => d.day === day && d.hour === hour)?.activity || 0;
                return (
                  <motion.div
                    key={`${day}-${hour}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: Math.random() * 0.3 }}
                    className="aspect-square rounded cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: getIntensity(activity, maxActivity) }}
                    title={`${day} ${hour}h: ${activity} activités`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center mt-4 space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#E2E8F0' }}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Faible</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFD56B' }}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Moyen</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FF6B6B' }}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Élevé</span>
        </div>
      </div>
    </div>
  );
};

const AdvancedAnalytics: React.FC<{ userRole: string }> = ({ userRole }) => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  // Check permissions
  const hasAccess = ['owner', 'admin'].includes(userRole);

  // Fetch data using React Query
  const { data: completionData, refetch: refetchCompletion } = useQuery({
    queryKey: ['courseCompletion', timeRange, selectedModule],
    queryFn: () => fetchAnalyticsData(`/api/analytics/course-completion?range=${timeRange}&module=${selectedModule}`),
    enabled: hasAccess,
    staleTime: 60000
  });

  const { data: progressData } = useQuery({
    queryKey: ['studentProgress', timeRange],
    queryFn: () => fetchAnalyticsData(`/api/analytics/student-progress?range=${timeRange}`),
    enabled: hasAccess,
    staleTime: 60000
  });

  const { data: heatMapData } = useQuery({
    queryKey: ['activityHeatMap', timeRange],
    queryFn: () => fetchAnalyticsData(`/api/analytics/activity-heatmap?range=${timeRange}`),
    enabled: hasAccess,
    staleTime: 60000
  });

  const { data: quizData } = useQuery({
    queryKey: ['quizPerformance', selectedModule],
    queryFn: () => fetchAnalyticsData(`/api/analytics/quiz-performance?module=${selectedModule}`),
    enabled: hasAccess,
    staleTime: 60000
  });

  const { data: kpiData } = useQuery({
    queryKey: ['realtimeKPIs'],
    queryFn: () => fetchAnalyticsData('/api/analytics/realtime-kpis'),
    enabled: hasAccess,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: modulePerformance } = useQuery({
    queryKey: ['modulePerformance', timeRange],
    queryFn: () => fetchAnalyticsData(`/api/analytics/module-performance?range=${timeRange}`),
    enabled: hasAccess,
    staleTime: 60000
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/analytics/export?range=${timeRange}`, {
        credentials: 'include'
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${timeRange}-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!hasAccess) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Accès Refusé
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Cette section est réservée aux administrateurs et propriétaires.
        </p>
      </div>
    );
  }

  // Chart colors
  const chartColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
              Analytics Avancées
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Visualisez les performances détaillées de votre plateforme
            </p>
          </div>
          <div className="flex space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="day">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>
            <button
              onClick={() => {
                refetchCompletion();
              }}
              className="p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Export...' : 'Exporter'}
            </button>
          </div>
        </div>
      </div>

      {/* Real-time KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Utilisateurs actifs aujourd'hui"
          value={kpiData?.activeToday || 0}
          icon={<Users className="w-6 h-6 text-white" />}
          trend={12}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          subtitle="vs hier"
        />
        <KPICard
          title="Utilisateurs cette semaine"
          value={kpiData?.activeWeek || 0}
          icon={<Calendar className="w-6 h-6 text-white" />}
          trend={8}
          color="bg-gradient-to-br from-green-500 to-green-600"
          subtitle="vs semaine dernière"
        />
        <KPICard
          title="Utilisateurs ce mois"
          value={kpiData?.activeMonth || 0}
          icon={<Activity className="w-6 h-6 text-white" />}
          trend={-3}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          subtitle="vs mois dernier"
        />
        <KPICard
          title="Temps moyen par session"
          value={`${kpiData?.avgSessionTime || 0} min`}
          icon={<Clock className="w-6 h-6 text-white" />}
          trend={5}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          subtitle="durée moyenne"
        />
      </div>

      {/* Course Completion Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Taux de Complétion des Cours par Module
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={completionData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="moduleName" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" stackId="a" fill="#4ECDC4" name="Complété" />
            <Bar dataKey="inProgress" stackId="a" fill="#FFD56B" name="En cours" />
            <Bar dataKey="notStarted" stackId="a" fill="#FF6B6B" name="Non commencé" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Student Progress & Activity Heat Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Progression Hebdomadaire des Étudiants
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="newStudents" stroke="#FF6B6B" name="Nouveaux" />
              <Line type="monotone" dataKey="activeStudents" stroke="#4ECDC4" name="Actifs" />
              <Line type="monotone" dataKey="avgProgress" stroke="#45B7D1" name="Progression moy." />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Heat Map */}
        <ActivityHeatMapChart data={heatMapData || []} />
      </div>

      {/* Quiz Performance by Difficulty */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Taux de Réussite aux Quiz par Difficulté
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={quizData || []}
                dataKey="successRate"
                nameKey="difficulty"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {(quizData || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Module Performance Radar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Performance des Modules
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={modulePerformance || []}>
              <PolarGrid />
              <PolarAngleAxis dataKey="module" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Engagement" dataKey="engagement" stroke="#FF6B6B" fill="#FF6B6B" fillOpacity={0.6} />
              <Radar name="Complétion" dataKey="completion" stroke="#4ECDC4" fill="#4ECDC4" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Popular Courses & Failed Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Courses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-500" />
            Cours les Plus Populaires
          </h3>
          <div className="space-y-3">
            {(kpiData?.popularCourses || []).slice(0, 5).map((course: any, index: number) => (
              <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <span className="font-bold text-lg mr-3 text-gray-500">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{course.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{course.views} vues</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-green-600 font-semibold">+{course.growth}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Failed Questions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
            Questions les Plus Échouées
          </h3>
          <div className="space-y-3">
            {(kpiData?.failedQuestions || []).slice(0, 5).map((question: any, index: number) => (
              <div key={question.id} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  {question.question}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Module: {question.module}
                  </span>
                  <span className="text-red-600 font-semibold">
                    {question.failRate}% d'échec
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;