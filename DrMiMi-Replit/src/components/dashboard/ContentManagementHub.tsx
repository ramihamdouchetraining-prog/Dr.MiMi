import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  FileText,
  Calendar as CalendarIcon,
  Users,
  Copy,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Edit,
  Trash2,
  Eye,
  Plus,
  Filter,
  Search,
  Image,
  FileCode,
  BarChart3,
  Star,
  TrendingUp,
  Package,
  Settings,
  GitBranch,
  RefreshCw,
  Archive,
  Shield
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TipTapEditor } from '../TipTapEditor';
import Papa from 'papaparse';

// Types
interface ContentItem {
  id: string;
  title: string;
  type: 'course' | 'article' | 'quiz' | 'case' | 'summary';
  status: 'draft' | 'review' | 'published' | 'archived';
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  metrics: {
    views: number;
    likes: number;
    completions: number;
  };
  quality: {
    score: number;
    hasImages: boolean;
    hasQuiz: boolean;
    wordCount: number;
    readingTime: number;
  };
}

interface ContentTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  structure: any;
  usageCount: number;
}

interface PublicationSchedule {
  id: string;
  contentId: string;
  contentTitle: string;
  scheduledFor: Date;
  status: 'pending' | 'published' | 'failed';
}

interface AuthorStats {
  id: string;
  name: string;
  totalContent: number;
  publishedContent: number;
  avgQuality: number;
  totalViews: number;
  recentActivity: string;
}

const ContentManagementHub: React.FC<{ userRole: string }> = ({ userRole }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pipeline' | 'calendar' | 'authors' | 'tools'>('pipeline');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showQualityChecker, setShowQualityChecker] = useState(false);

  // Check permissions
  const hasAccess = ['owner', 'admin', 'editor'].includes(userRole);
  const canEdit = ['owner', 'admin', 'editor'].includes(userRole);
  const canDelete = ['owner', 'admin'].includes(userRole);
  const canPublish = ['owner', 'admin'].includes(userRole);

  // Fetch content pipeline
  const { data: contentPipeline } = useQuery({
    queryKey: ['contentPipeline', filterStatus, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/content/pipeline?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch content pipeline');
      return response.json();
    },
    enabled: hasAccess
  });

  // Fetch publication calendar
  const { data: publicationSchedule } = useQuery({
    queryKey: ['publicationSchedule'],
    queryFn: async () => {
      const response = await fetch('/api/content/schedule', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch schedule');
      return response.json();
    },
    enabled: hasAccess && activeTab === 'calendar'
  });

  // Fetch author statistics
  const { data: authorStats } = useQuery({
    queryKey: ['authorStats'],
    queryFn: async () => {
      const response = await fetch('/api/content/author-stats', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch author stats');
      return response.json();
    },
    enabled: hasAccess && activeTab === 'authors'
  });

  // Fetch content templates
  const { data: templates } = useQuery({
    queryKey: ['contentTemplates'],
    queryFn: async () => {
      const response = await fetch('/api/content/templates', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
    enabled: hasAccess && showTemplates
  });

  // Duplicate content mutation
  const duplicateContent = useMutation({
    mutationFn: async (contentId: string) => {
      const response = await fetch(`/api/content/${contentId}/duplicate`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to duplicate content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentPipeline'] });
      alert('Contenu dupliqué avec succès!');
    }
  });

  // Bulk import/export handlers
  const handleBulkExport = async () => {
    try {
      const response = await fetch('/api/content/export?format=csv', {
        credentials: 'include'
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `content-export-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        Papa.parse(file, {
          complete: async (results) => {
            try {
              const response = await fetch('/api/content/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ data: results.data })
              });
              
              if (response.ok) {
                queryClient.invalidateQueries({ queryKey: ['contentPipeline'] });
                alert('Import réussi!');
              } else {
                alert('Échec de l\'import');
              }
            } catch (error) {
              console.error('Import error:', error);
              alert('Erreur lors de l\'import');
            }
          },
          header: true
        });
      } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            const response = await fetch('/api/content/import', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ data, format: 'json' })
            });
            
            if (response.ok) {
              queryClient.invalidateQueries({ queryKey: ['contentPipeline'] });
              alert('Import JSON réussi!');
            }
          } catch (error) {
            console.error('JSON import error:', error);
            alert('Erreur lors de l\'import JSON');
          }
        };
        reader.readAsText(file);
      }
    });
  }, [queryClient]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    noClick: true
  });

  // Quality checker function
  const checkContentQuality = (content: ContentItem) => {
    const checks = {
      hasTitle: content.title.length > 5,
      hasImages: content.quality.hasImages,
      hasQuiz: content.quality.hasQuiz,
      goodLength: content.quality.wordCount >= 500,
      hasMetadata: true,
      readingTime: content.quality.readingTime > 0
    };

    const score = Object.values(checks).filter(Boolean).length;
    const maxScore = Object.keys(checks).length;
    
    return {
      score: (score / maxScore) * 100,
      checks,
      recommendations: []
    };
  };

  // Pipeline status card
  const PipelineCard: React.FC<{ content: ContentItem }> = ({ content }) => {
    const quality = checkContentQuality(content);
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setSelectedContent(content)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">{content.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Par {content.author.name} • {new Date(content.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {content.quality.hasImages && <Image className="w-4 h-4 text-green-500" />}
            {content.quality.hasQuiz && <CheckCircle className="w-4 h-4 text-blue-500" />}
            <span className={`text-xs px-2 py-1 rounded-full ${
              quality.score >= 80 ? 'bg-green-100 text-green-800' :
              quality.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {quality.score.toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {content.metrics.views}
            </span>
            <span className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              {content.metrics.likes}
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              {content.metrics.completions}
            </span>
          </div>
          {canEdit && (
            <div className="flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateContent.mutate(content.id);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Dupliquer"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedContent(content);
                  setShowEditor(true);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Éditer"
              >
                <Edit className="w-4 h-4" />
              </button>
              {canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Voulez-vous vraiment archiver ce contenu?')) {
                      // Archive content
                    }
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="Archiver"
                >
                  <Archive className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (!hasAccess) {
    return (
      <div className="p-8 text-center">
        <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Accès Refusé
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Cette section est réservée aux éditeurs, administrateurs et propriétaires.
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
              <Package className="w-8 h-8 mr-3 text-purple-600" />
              Content Management Hub
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez et optimisez votre contenu médical
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowTemplates(true)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FileCode className="w-4 h-4 inline mr-2" />
              Templates
            </button>
            <button
              onClick={handleBulkExport}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Download className="w-4 h-4 inline mr-2" />
              Export
            </button>
            <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
              <Upload className="w-4 h-4 inline mr-2" />
              Import
              <input
                type="file"
                accept=".csv,.json"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    onDrop(Array.from(files));
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mt-6 border-b">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`pb-2 px-1 ${activeTab === 'pipeline' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            <GitBranch className="w-4 h-4 inline mr-2" />
            Pipeline
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`pb-2 px-1 ${activeTab === 'calendar' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            <CalendarIcon className="w-4 h-4 inline mr-2" />
            Calendrier
          </button>
          <button
            onClick={() => setActiveTab('authors')}
            className={`pb-2 px-1 ${activeTab === 'authors' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Auteurs
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`pb-2 px-1 ${activeTab === 'tools' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Outils
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'pipeline' && (
        <div {...getRootProps()} className={`${isDragActive ? 'border-2 border-dashed border-blue-500 bg-blue-50' : ''} rounded-xl p-2`}>
          <input {...getInputProps()} />
          
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher du contenu..."
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
                <option value="draft">Brouillon</option>
                <option value="review">En révision</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
              {selectedItems.length > 0 && (
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="">Actions en masse</option>
                  <option value="publish">Publier</option>
                  <option value="archive">Archiver</option>
                  <option value="delete">Supprimer</option>
                </select>
              )}
            </div>
          </div>

          {/* Pipeline Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['draft', 'review', 'published', 'archived'].map(status => (
              <div key={status} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 capitalize flex items-center justify-between">
                  {status === 'draft' && 'Brouillon'}
                  {status === 'review' && 'En révision'}
                  {status === 'published' && 'Publié'}
                  {status === 'archived' && 'Archivé'}
                  <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-1 rounded-full">
                    {contentPipeline?.filter((c: ContentItem) => c.status === status).length || 0}
                  </span>
                </h3>
                <div className="space-y-3">
                  <AnimatePresence>
                    {contentPipeline
                      ?.filter((content: ContentItem) => content.status === status)
                      .map((content: ContentItem) => (
                        <PipelineCard key={content.id} content={content} />
                      ))
                    }
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Calendrier de Publication
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Calendar
                className="w-full rounded-lg border"
                tileContent={({ date }) => {
                  const scheduled = publicationSchedule?.find(
                    (s: PublicationSchedule) =>
                      new Date(s.scheduledFor).toDateString() === date.toDateString()
                  );
                  return scheduled ? (
                    <div className="text-xs mt-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto"></div>
                    </div>
                  ) : null;
                }}
              />
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Publications à venir</h4>
              {publicationSchedule?.map((schedule: PublicationSchedule) => (
                <div key={schedule.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="font-medium text-sm">{schedule.contentTitle}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(schedule.scheduledFor).toLocaleString()}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full inline-block mt-2 ${
                    schedule.status === 'published' ? 'bg-green-100 text-green-800' :
                    schedule.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {schedule.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'authors' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Statistiques par Auteur
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Auteur</th>
                  <th className="text-center p-3">Contenu Total</th>
                  <th className="text-center p-3">Publié</th>
                  <th className="text-center p-3">Qualité Moy.</th>
                  <th className="text-center p-3">Vues Totales</th>
                  <th className="text-center p-3">Dernière Activité</th>
                </tr>
              </thead>
              <tbody>
                {authorStats?.map((author: AuthorStats) => (
                  <tr key={author.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3">
                          {author.name.charAt(0)}
                        </div>
                        <span className="font-medium">{author.name}</span>
                      </div>
                    </td>
                    <td className="text-center p-3">{author.totalContent}</td>
                    <td className="text-center p-3">{author.publishedContent}</td>
                    <td className="text-center p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        author.avgQuality >= 80 ? 'bg-green-100 text-green-800' :
                        author.avgQuality >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {author.avgQuality.toFixed(0)}%
                      </span>
                    </td>
                    <td className="text-center p-3">{author.totalViews.toLocaleString()}</td>
                    <td className="text-center p-3 text-sm text-gray-600">
                      {author.recentActivity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quality Checker */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Vérificateur de Qualité
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Analysez la qualité de votre contenu en temps réel
            </p>
            <button
              onClick={() => setShowQualityChecker(!showQualityChecker)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Analyser le Contenu
            </button>
          </div>

          {/* Templates */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Templates Médicaux
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {templates?.length || 0} templates disponibles
            </p>
            <button
              onClick={() => setShowTemplates(true)}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <FileCode className="w-4 h-4 inline mr-2" />
              Explorer les Templates
            </button>
          </div>

          {/* Bulk Operations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Opérations en Masse
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleBulkExport}
                className="w-full px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                <Download className="w-4 h-4 inline mr-2" />
                Exporter en CSV/JSON
              </button>
              <label className="block w-full px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <Upload className="w-4 h-4 inline mr-2" />
                Importer du Contenu
                <input type="file" accept=".csv,.json" className="hidden" onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    onDrop(Array.from(files));
                  }
                }} />
              </label>
            </div>
          </div>

          {/* Content Duplication */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Duplication Rapide
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Dupliquez facilement vos contenus existants
            </p>
            <select className="w-full px-4 py-2 border rounded-lg mb-3">
              <option>Sélectionner un contenu</option>
              {contentPipeline?.map((content: ContentItem) => (
                <option key={content.id} value={content.id}>{content.title}</option>
              ))}
            </select>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Copy className="w-4 h-4 inline mr-2" />
              Dupliquer
            </button>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && selectedContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowEditor(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Éditer: {selectedContent.title}
                </h2>
                <button
                  onClick={() => setShowEditor(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  ✕
                </button>
              </div>
              
              <TipTapEditor
                initialContent=""
                onChange={(content) => {
                  // Handle content change
                }}
              />
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentManagementHub;