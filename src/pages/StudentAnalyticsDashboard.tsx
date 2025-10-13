import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Brain, Target, Clock, Award, 
  Calendar, Zap, BookOpen, Activity, AlertCircle, Lightbulb 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

interface AnalyticsData {
  analytics: any;
  patterns: any;
  performance: any[];
  recommendations: any[];
  recentActivity: any[];
}

const StudentAnalyticsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'performance' | 'patterns' | 'recommendations'>('overview');

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.id) {
      fetchAnalytics();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchAnalytics = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/analytics/student/${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Si pas authentifié, afficher message de connexion
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-12 max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-10 h-10 text-teal-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              📊 Analytics Personnel
            </h2>
            <p className="text-gray-600 mb-6">
              Connectez-vous pour accéder à votre tableau de bord analytique et suivre votre progression
            </p>
          </div>
          
          <a
            href="/login"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg"
          >
            Se connecter
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
          
          <p className="mt-6 text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <a href="/register" className="text-teal-600 hover:text-teal-700 font-medium">
              S'inscrire gratuitement
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (!data || !data.analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-12 max-w-md">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t('analytics.noData', 'Pas encore de données')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('analytics.startLearning', 'Commencez à apprendre pour voir vos statistiques')}
          </p>
          <a
            href="/quiz"
            className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition"
          >
            Commencer un quiz
          </a>
        </div>
      </div>
    );
  }

  const { analytics, patterns, performance, recommendations, recentActivity } = data;

  // Prepare chart data from real API data
  const weeklyProgressData = recentActivity && recentActivity.length > 0 
    ? recentActivity.slice(0, 7).reverse().map((activity: any, i: number) => ({
        day: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][new Date(activity.createdAt || Date.now()).getDay()],
        score: Number(activity.score) || 0,
        time: Math.round((Number(activity.timeTaken) || 0) / 60)
      }))
    : [
        { day: 'Lun', score: Number(analytics?.overallAverageScore) || 0, time: Math.floor((analytics?.totalStudyTime || 0) / 7) },
        { day: 'Mar', score: Number(analytics?.overallAverageScore) || 0, time: Math.floor((analytics?.totalStudyTime || 0) / 7) },
        { day: 'Mer', score: Number(analytics?.overallAverageScore) || 0, time: Math.floor((analytics?.totalStudyTime || 0) / 7) },
        { day: 'Jeu', score: Number(analytics?.overallAverageScore) || 0, time: Math.floor((analytics?.totalStudyTime || 0) / 7) },
        { day: 'Ven', score: Number(analytics?.overallAverageScore) || 0, time: Math.floor((analytics?.totalStudyTime || 0) / 7) },
        { day: 'Sam', score: Number(analytics?.overallAverageScore) || 0, time: Math.floor((analytics?.totalStudyTime || 0) / 7) },
        { day: 'Dim', score: Number(analytics?.overallAverageScore) || 0, time: Math.floor((analytics?.totalStudyTime || 0) / 7) },
      ];

  const modulePerformanceData = performance && performance.length > 0
    ? performance.slice(0, 6).map(p => ({
        module: p.moduleId || 'Unknown',
        score: Number(p.averageScore) || 0,
        attempts: p.totalAttempts || 0
      }))
    : [];

  const learningStyleData = patterns ? [
    { skill: 'Visuel', score: patterns.visualLearnerScore || 50 },
    { skill: 'Pratique', score: patterns.practicalLearnerScore || 50 },
    { skill: 'Théorique', score: patterns.theoreticalLearnerScore || 50 },
    { skill: 'Consistance', score: patterns.consistentLearnerScore || 50 },
  ] : [
    { skill: 'Visuel', score: 50 },
    { skill: 'Pratique', score: 50 },
    { skill: 'Théorique', score: 50 },
    { skill: 'Consistance', score: 50 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
    color: string;
  }> = ({ icon, title, value, trend, trendValue, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl p-6 shadow-lg border-l-4 ${color}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 mr-1" />}
              {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500 mr-1" />}
              <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('border-', 'bg-').replace('500', '100')}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 {t('analytics.dashboard', 'Tableau de Bord Analytique')}
          </h1>
          <p className="text-gray-600">
            {t('analytics.subtitle', 'Suivez votre progression et optimisez votre apprentissage')}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Target className="w-6 h-6 text-teal-600" />}
            title={t('analytics.avgScore', 'Score Moyen')}
            value={`${analytics.overallAverageScore}%`}
            trend="up"
            trendValue="+5%"
            color="border-teal-500"
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-blue-600" />}
            title={t('analytics.studyTime', 'Temps d\'étude')}
            value={`${analytics.totalStudyTime}min`}
            color="border-blue-500"
          />
          <StatCard
            icon={<Award className="w-6 h-6 text-amber-600" />}
            title={t('analytics.coursesCompleted', 'Cours Complétés')}
            value={`${analytics.totalCoursesCompleted}/${analytics.totalCoursesEnrolled}`}
            color="border-amber-500"
          />
          <StatCard
            icon={<Zap className="w-6 h-6 text-purple-600" />}
            title={t('analytics.currentStreak', 'Série Actuelle')}
            value={`${analytics.currentStreak} jours`}
            trend="up"
            trendValue={`Max: ${analytics.longestStreak}`}
            color="border-purple-500"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
                { id: 'performance', label: 'Performance', icon: TrendingUp },
                { id: 'patterns', label: 'Patterns d\'étude', icon: Brain },
                { id: 'recommendations', label: 'Recommandations IA', icon: Lightbulb }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Weekly Progress Chart */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      📈 Progression Hebdomadaire
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={weeklyProgressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="score" stroke="#0d9488" strokeWidth={2} name="Score %" />
                        <Line type="monotone" dataKey="time" stroke="#3b82f6" strokeWidth={2} name="Temps (min)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Learning Style Radar */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      🧠 Style d'Apprentissage
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={learningStyleData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="skill" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-teal-600" />
                    Insights Clés
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600">Taux de Réussite</p>
                      <p className="text-2xl font-bold text-teal-600">{analytics.quizSuccessRate}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600">Vélocité d'Apprentissage</p>
                      <p className="text-2xl font-bold text-blue-600">{analytics.learningVelocityTrend || 'stable'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600">Taux de Complétion</p>
                      <p className="text-2xl font-bold text-purple-600">{analytics.courseCompletionRate}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {selectedTab === 'performance' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    📊 Performance par Module
                  </h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={modulePerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="module" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="score" fill="#0d9488" name="Score Moyen %" />
                      <Bar dataKey="attempts" fill="#3b82f6" name="Tentatives" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Weak & Strong Modules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-red-50 rounded-xl p-6">
                    <h4 className="font-semibold text-red-800 mb-3">⚠️ Modules à Renforcer</h4>
                    {analytics.weakModules && analytics.weakModules.length > 0 ? (
                      <ul className="space-y-2">
                        {analytics.weakModules.map((m: any, i: number) => (
                          <li key={i} className="flex justify-between items-center">
                            <span>{m.moduleId}</span>
                            <span className="font-bold text-red-600">{m.score.toFixed(1)}%</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">Aucun module faible détecté</p>
                    )}
                  </div>

                  <div className="bg-green-50 rounded-xl p-6">
                    <h4 className="font-semibold text-green-800 mb-3">✅ Modules Maîtrisés</h4>
                    {analytics.strongModules && analytics.strongModules.length > 0 ? (
                      <ul className="space-y-2">
                        {analytics.strongModules.map((m: any, i: number) => (
                          <li key={i} className="flex justify-between items-center">
                            <span>{m.moduleId}</span>
                            <span className="font-bold text-green-600">{m.score.toFixed(1)}%</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">Continuez à travailler pour maîtriser des modules</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Patterns Tab */}
            {selectedTab === 'patterns' && patterns && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                    <Calendar className="w-8 h-8 text-blue-600 mb-3" />
                    <h4 className="font-semibold text-blue-900 mb-2">Moment Préféré</h4>
                    <p className="text-2xl font-bold text-blue-700">{patterns.preferredStudyTime || 'Non défini'}</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                    <BookOpen className="w-8 h-8 text-purple-600 mb-3" />
                    <h4 className="font-semibold text-purple-900 mb-2">Contenu Préféré</h4>
                    <p className="text-2xl font-bold text-purple-700">{patterns.preferredContentType || 'Mixte'}</p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6">
                    <Clock className="w-8 h-8 text-amber-600 mb-3" />
                    <h4 className="font-semibold text-amber-900 mb-2">Heure de Pic</h4>
                    <p className="text-2xl font-bold text-amber-700">{patterns.peakProductivityHour || 0}h</p>
                  </div>
                </div>

                {/* Session Patterns */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-4">📅 Patterns de Session</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Sessions Courtes</p>
                      <p className="text-3xl font-bold text-teal-600">{patterns.shortSessionsCount || 0}</p>
                      <p className="text-xs text-gray-500">{'< 15 min'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Sessions Moyennes</p>
                      <p className="text-3xl font-bold text-blue-600">{patterns.mediumSessionsCount || 0}</p>
                      <p className="text-xs text-gray-500">15-45 min</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Sessions Longues</p>
                      <p className="text-3xl font-bold text-purple-600">{patterns.longSessionsCount || 0}</p>
                      <p className="text-xs text-gray-500">{'> 45 min'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations Tab */}
            {selectedTab === 'recommendations' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    💡 Recommandations IA Personnalisées
                  </h3>
                  <button
                    onClick={() => generateRecommendation()}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                  >
                    Générer Nouvelle Recommandation
                  </button>
                </div>

                {recommendations && recommendations.length > 0 ? (
                  recommendations.map((rec: any) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`rounded-xl p-6 border-l-4 ${
                        rec.priority === 'high'
                          ? 'bg-red-50 border-red-500'
                          : rec.priority === 'medium'
                          ? 'bg-amber-50 border-amber-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-gray-900">{rec.title}</h4>
                          <p className="text-gray-700 mt-2">{rec.description}</p>

                          {rec.actionItems && rec.actionItems.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">Actions à réaliser:</p>
                              <ul className="space-y-1">
                                {rec.actionItems.map((item: any, i: number) => (
                                  <li key={i} className="flex items-center text-sm text-gray-600">
                                    <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                                    {item.action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {rec.estimatedTimeRequired && (
                            <p className="text-sm text-gray-600 mt-3">
                              ⏱️ Temps estimé: {rec.estimatedTimeRequired} minutes
                            </p>
                          )}
                        </div>

                        <div className="ml-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            rec.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : rec.priority === 'medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {rec.priority === 'high' ? 'Priorité Haute' : rec.priority === 'medium' ? 'Priorité Moyenne' : 'Priorité Basse'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucune recommandation disponible pour le moment</p>
                    <p className="text-sm text-gray-500 mt-2">Cliquez sur "Générer" pour obtenir des suggestions personnalisées</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  async function generateRecommendation() {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/analytics/recommendations/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'study_plan', priority: 'high' })
      });
      const result = await response.json();
      // Refresh analytics to show new recommendation
      fetchAnalytics();
    } catch (error) {
      console.error('Error generating recommendation:', error);
    }
  }
};

export default StudentAnalyticsDashboard;
