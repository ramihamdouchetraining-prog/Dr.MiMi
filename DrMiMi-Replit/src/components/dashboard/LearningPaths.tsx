import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Route,
  BookOpen,
  Award,
  Users,
  Target,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Trophy,
  Star,
  Lock,
  Unlock,
  BarChart3,
  Calendar,
  Filter,
  Search,
  GraduationCap,
  Zap,
  Shield
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // in hours
  courses: PathCourse[];
  prerequisites: string[];
  outcomes: string[];
  certificate: {
    enabled: boolean;
    type: 'completion' | 'achievement' | 'mastery';
    criteria: string;
  };
  enrolledCount: number;
  completedCount: number;
  averageRating: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
  category: string;
}

interface PathCourse {
  id: string;
  courseId: string;
  title: string;
  order: number;
  required: boolean;
  estimatedTime: number;
  dependencies: string[]; // IDs of prerequisite courses
}

interface StudentProgress {
  pathId: string;
  studentId: string;
  studentName: string;
  enrolledAt: string;
  currentCourse: string;
  completedCourses: number;
  totalCourses: number;
  progressPercentage: number;
  estimatedCompletion: string;
  lastActivity: string;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
}

interface PathMetrics {
  pathId: string;
  enrollmentRate: number;
  completionRate: number;
  abandonmentRate: number;
  averageTimeToComplete: number;
  satisfactionScore: number;
  courseCompletionRates: Record<string, number>;
  dropoffPoints: Array<{
    courseId: string;
    courseName: string;
    dropoffRate: number;
  }>;
  monthlyEnrollments: Array<{
    month: string;
    enrollments: number;
  }>;
}

interface PathRecommendation {
  pathId: string;
  pathTitle: string;
  reason: string;
  matchScore: number;
  estimatedTime: number;
  difficulty: string;
}

const LearningPaths: React.FC<{ userRole: string }> = ({ userRole }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'paths' | 'students' | 'metrics' | 'builder'>('paths');
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'completion' | 'newest'>('popularity');
  
  // Path builder state
  const [newPath, setNewPath] = useState<Partial<LearningPath>>({
    title: '',
    description: '',
    level: 'beginner',
    courses: [],
    prerequisites: [],
    outcomes: [],
    certificate: {
      enabled: false,
      type: 'completion',
      criteria: ''
    },
    tags: [],
    category: '',
    status: 'draft'
  });

  // Check permissions
  const hasAccess = ['admin', 'editor'].includes(userRole);
  const canCreate = ['admin', 'editor'].includes(userRole);
  const canEdit = ['admin', 'editor'].includes(userRole);
  const canDelete = ['admin'].includes(userRole);

  // Fetch learning paths
  const { data: paths, isLoading: pathsLoading } = useQuery({
    queryKey: ['learningPaths', filterLevel, searchQuery, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterLevel !== 'all') params.append('level', filterLevel);
      if (searchQuery) params.append('search', searchQuery);
      params.append('sort', sortBy);
      
      const response = await fetch(`/api/learning-paths?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch paths');
      return response.json();
    },
    enabled: hasAccess
  });

  // Fetch student progress
  const { data: studentProgress } = useQuery({
    queryKey: ['pathStudentProgress', selectedPath?.id],
    queryFn: async () => {
      if (!selectedPath) return [];
      const response = await fetch(`/api/learning-paths/${selectedPath.id}/students`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch student progress');
      return response.json();
    },
    enabled: hasAccess && activeTab === 'students' && !!selectedPath
  });

  // Fetch path metrics
  const { data: pathMetrics } = useQuery({
    queryKey: ['pathMetrics', selectedPath?.id],
    queryFn: async () => {
      if (!selectedPath) return null;
      const response = await fetch(`/api/learning-paths/${selectedPath.id}/metrics`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
    enabled: hasAccess && activeTab === 'metrics' && !!selectedPath
  });

  // Fetch available courses for builder
  const { data: availableCourses } = useQuery({
    queryKey: ['availableCourses'],
    queryFn: async () => {
      const response = await fetch('/api/courses/list', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
    enabled: hasAccess && activeTab === 'builder'
  });

  // Fetch recommendations
  const { data: recommendations } = useQuery({
    queryKey: ['pathRecommendations'],
    queryFn: async () => {
      const response = await fetch('/api/learning-paths/recommendations', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      return response.json();
    },
    enabled: hasAccess
  });

  // Create learning path
  const createPath = useMutation({
    mutationFn: async (data: Partial<LearningPath>) => {
      const response = await fetch('/api/learning-paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create path');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningPaths'] });
      setShowCreateModal(false);
      setNewPath({
        title: '',
        description: '',
        level: 'beginner',
        courses: [],
        prerequisites: [],
        outcomes: [],
        certificate: {
          enabled: false,
          type: 'completion',
          criteria: ''
        },
        tags: [],
        category: '',
        status: 'draft'
      });
    }
  });

  // Update learning path
  const updatePath = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LearningPath> }) => {
      const response = await fetch(`/api/learning-paths/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update path');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningPaths'] });
      setShowEditModal(false);
    }
  });

  // Delete learning path
  const deletePath = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/learning-paths/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete path');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningPaths'] });
    }
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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
          Cette section est réservée aux administrateurs et éditeurs.
        </p>
      </div>
    );
  }

  // Path card component
  const PathCard: React.FC<{ path: LearningPath }> = ({ path }) => {
    const completionRate = path.enrolledCount > 0 
      ? (path.completedCount / path.enrolledCount * 100).toFixed(1)
      : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
        onClick={() => setSelectedPath(path)}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              {path.title}
            </h3>
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(path.level)}`}>
                {path.level}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(path.status)}`}>
                {path.status}
              </span>
              {path.certificate.enabled && (
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                  <Award className="w-3 h-3 inline mr-1" />
                  Certifié
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {path.description}
            </p>
          </div>
          {canEdit && (
            <div className="flex space-x-1 ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPath(path);
                  setShowEditModal(true);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Edit className="w-4 h-4" />
              </button>
              {canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Voulez-vous vraiment supprimer ce parcours?')) {
                      deletePath.mutate(path.id);
                    }
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <p className="text-xs text-gray-500 dark:text-gray-400">Cours</p>
            <p className="font-bold text-lg">{path.courses.length}</p>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <p className="text-xs text-gray-500 dark:text-gray-400">Durée</p>
            <p className="font-bold text-lg">{path.duration}h</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4 inline mr-1" />
              Inscrits
            </span>
            <span className="font-medium">{path.enrolledCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              <Trophy className="w-4 h-4 inline mr-1" />
              Complétés
            </span>
            <span className="font-medium">{path.completedCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Taux de réussite
            </span>
            <span className="font-medium text-green-600">{completionRate}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              <Star className="w-4 h-4 inline mr-1" />
              Note moyenne
            </span>
            <span className="font-medium">{path.averageRating.toFixed(1)}/5</span>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Route className="w-8 h-8 mr-3 text-orange-600" />
              Learning Paths
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Créez et gérez des parcours pédagogiques structurés
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Parcours
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mt-6 border-b overflow-x-auto">
          {['paths', 'students', 'metrics', 'builder'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-2 px-1 capitalize whitespace-nowrap ${
                activeTab === tab ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-600'
              }`}
            >
              {tab === 'paths' && <BookOpen className="w-4 h-4 inline mr-2" />}
              {tab === 'students' && <Users className="w-4 h-4 inline mr-2" />}
              {tab === 'metrics' && <BarChart3 className="w-4 h-4 inline mr-2" />}
              {tab === 'builder' && <Zap className="w-4 h-4 inline mr-2" />}
              {tab === 'paths' && 'Parcours'}
              {tab === 'students' && 'Étudiants'}
              {tab === 'metrics' && 'Métriques'}
              {tab === 'builder' && 'Créateur'}
            </button>
          ))}
        </div>
      </div>

      {/* Paths Tab */}
      {activeTab === 'paths' && (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher un parcours..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">Tous les niveaux</option>
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
                <option value="expert">Expert</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="popularity">Popularité</option>
                <option value="completion">Taux de réussite</option>
                <option value="newest">Plus récents</option>
              </select>
            </div>
          </div>

          {/* Paths Grid */}
          {pathsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(paths || []).map((path: LearningPath) => (
                <PathCard key={path.id} path={path} />
              ))}
            </div>
          )}

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Parcours Recommandés
              </h3>
              <div className="space-y-3">
                {recommendations.map((rec: PathRecommendation) => (
                  <div key={rec.pathId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{rec.pathTitle}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{rec.reason}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-orange-600">{rec.matchScore}% match</span>
                      <p className="text-xs text-gray-500">{rec.estimatedTime}h</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && selectedPath && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Progression des Étudiants - {selectedPath.title}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étudiant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progression
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cours Actuel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscrit Depuis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière Activité
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {(studentProgress || []).map((student: StudentProgress) => (
                  <tr key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white mr-3">
                          {student.studentName.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {student.studentName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 mr-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-600 h-2 rounded-full" 
                              style={{ width: `${student.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium">{student.progressPercentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {student.currentCourse}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.enrolledAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        student.status === 'active' ? 'bg-green-100 text-green-800' :
                        student.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        student.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.lastActivity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && selectedPath && pathMetrics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Taux d'Inscription</span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pathMetrics.enrollmentRate.toFixed(1)}%
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Taux de Complétion</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pathMetrics.completionRate.toFixed(1)}%
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Taux d'Abandon</span>
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pathMetrics.abandonmentRate.toFixed(1)}%
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Temps Moyen</span>
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pathMetrics.averageTimeToComplete}h
              </p>
            </motion.div>
          </div>

          {/* Enrollment Trends */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Tendance des Inscriptions
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={pathMetrics.monthlyEnrollments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="enrollments" stroke="#FB923C" fill="#FB923C" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Dropoff Points */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Points d'Abandon
            </h3>
            <div className="space-y-3">
              {pathMetrics.dropoffPoints.map(point => (
                <div key={point.courseId} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="font-medium">{point.courseName}</span>
                  <span className="text-red-600 font-bold">{point.dropoffRate.toFixed(1)}% abandons</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Path Builder Tab */}
      {activeTab === 'builder' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Créateur de Parcours Visuel
          </h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Glissez et déposez des cours pour créer votre parcours pédagogique
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Commencer un Nouveau Parcours
            </button>
          </div>

          {/* Available Courses */}
          {availableCourses && (
            <div className="mt-6">
              <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Cours Disponibles</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {availableCourses.map((course: any) => (
                  <div
                    key={course.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-move hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <p className="font-medium text-sm">{course.title}</p>
                    <p className="text-xs text-gray-500">{course.duration}h • {course.level}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                {showCreateModal ? 'Nouveau Parcours' : 'Modifier le Parcours'}
              </h2>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                if (showCreateModal) {
                  createPath.mutate(newPath);
                } else if (selectedPath) {
                  updatePath.mutate({ id: selectedPath.id, data: newPath });
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Titre</label>
                    <input
                      type="text"
                      value={newPath.title}
                      onChange={(e) => setNewPath({ ...newPath, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={newPath.description}
                      onChange={(e) => setNewPath({ ...newPath, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg h-24"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Niveau</label>
                      <select
                        value={newPath.level}
                        onChange={(e) => setNewPath({ ...newPath, level: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="beginner">Débutant</option>
                        <option value="intermediate">Intermédiaire</option>
                        <option value="advanced">Avancé</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Catégorie</label>
                      <input
                        type="text"
                        value={newPath.category}
                        onChange={(e) => setNewPath({ ...newPath, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Ex: Cardiologie"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <input
                        type="checkbox"
                        checked={newPath.certificate?.enabled}
                        onChange={(e) => setNewPath({
                          ...newPath,
                          certificate: {
                            ...newPath.certificate!,
                            enabled: e.target.checked
                          }
                        })}
                        className="mr-2"
                      />
                      Certificat disponible
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                    }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    {showCreateModal ? 'Créer' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningPaths;