import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Edit3, Trash2, Eye, Archive, DollarSign,
  Filter, Search, Calendar, Tag, Globe, CheckCircle, Clock,
  Save, X, Copy, Download, Upload, RefreshCw, Settings
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TipTapEditor } from '../../components/TipTapEditor';
import { format } from 'date-fns';
import { fr, enUS, ar } from 'date-fns/locale';
import slugify from 'slugify';

interface Article {
  id: string;
  title: string;
  titleEn?: string;
  titleAr?: string;
  slug: string;
  content: any;
  contentEn?: any;
  contentAr?: any;
  metaDescription?: string;
  metaDescriptionEn?: string;
  metaDescriptionAr?: string;
  featuredImage?: string;
  priceDzd: string;
  priceEur: string;
  taxRate: string;
  isPaid: boolean;
  status: 'draft' | 'published' | 'archived';
  translationStatus: 'complete' | 'needs_review' | 'in_progress';
  moduleId?: string;
  tags?: string[];
  yearLevels?: string[];
  readingTime?: number;
  viewCount: number;
  authorId?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ArticleTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'Course' | 'ClinicalCase' | 'RevisionSheet' | 'Quiz' | 'Custom';
  content: any;
  thumbnail?: string;
  isPublic: boolean;
  usageCount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCMS() {
  const [selectedTab, setSelectedTab] = useState<'articles' | 'editor' | 'templates'>('articles');
  const [selectedLanguage, setSelectedLanguage] = useState<'fr' | 'en' | 'ar'>('fr');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPaid, setFilterPaid] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  // Form state for article editor
  const [articleForm, setArticleForm] = useState({
    title: '',
    titleEn: '',
    titleAr: '',
    slug: '',
    content: {},
    contentEn: {},
    contentAr: {},
    metaDescription: '',
    metaDescriptionEn: '',
    metaDescriptionAr: '',
    featuredImage: '',
    priceDzd: '0',
    priceEur: '0',
    taxRate: '19',
    isPaid: false,
    status: 'draft' as 'draft' | 'published' | 'archived',
    translationStatus: 'in_progress' as 'complete' | 'needs_review' | 'in_progress',
    moduleId: '',
    tags: [] as string[],
    yearLevels: [] as string[],
  });

  // Fetch articles
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['articles', filterStatus, filterPaid],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterPaid !== 'all') params.append('isPaid', filterPaid);
      
      const response = await fetch(`/api/admin/cms/articles?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    },
  });

  // Fetch templates
  const { data: templates } = useQuery({
    queryKey: ['articleTemplates'],
    queryFn: async () => {
      const response = await fetch('/api/admin/cms/templates', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
  });

  // Create/Update article mutation
  const saveArticleMutation = useMutation({
    mutationFn: async (article: Partial<Article>) => {
      const url = article.id 
        ? `/api/admin/cms/articles/${article.id}` 
        : '/api/admin/cms/articles';
      const method = article.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(article),
      });
      
      if (!response.ok) throw new Error('Failed to save article');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setEditingArticle(null);
      setIsCreating(false);
      resetForm();
    },
  });

  // Delete article mutation
  const deleteArticleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/cms/articles/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete article');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (articleForm.title && !editingArticle) {
      const slug = slugify(articleForm.title, { lower: true, strict: true });
      setArticleForm(prev => ({ ...prev, slug }));
    }
  }, [articleForm.title]);

  const resetForm = () => {
    setArticleForm({
      title: '',
      titleEn: '',
      titleAr: '',
      slug: '',
      content: {},
      contentEn: {},
      contentAr: {},
      metaDescription: '',
      metaDescriptionEn: '',
      metaDescriptionAr: '',
      featuredImage: '',
      priceDzd: '0',
      priceEur: '0',
      taxRate: '19',
      isPaid: false,
      status: 'draft',
      translationStatus: 'in_progress',
      moduleId: '',
      tags: [],
      yearLevels: [],
    });
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setArticleForm({
      title: article.title,
      titleEn: article.titleEn || '',
      titleAr: article.titleAr || '',
      slug: article.slug,
      content: article.content || {},
      contentEn: article.contentEn || {},
      contentAr: article.contentAr || {},
      metaDescription: article.metaDescription || '',
      metaDescriptionEn: article.metaDescriptionEn || '',
      metaDescriptionAr: article.metaDescriptionAr || '',
      featuredImage: article.featuredImage || '',
      priceDzd: article.priceDzd,
      priceEur: article.priceEur,
      taxRate: article.taxRate,
      isPaid: article.isPaid,
      status: article.status,
      translationStatus: article.translationStatus,
      moduleId: article.moduleId || '',
      tags: article.tags || [],
      yearLevels: article.yearLevels || [],
    });
    setSelectedTab('editor');
  };

  const handleSaveArticle = () => {
    const articleData = {
      ...articleForm,
      id: editingArticle?.id,
    };
    saveArticleMutation.mutate(articleData);
  };

  const handleUseTemplate = (template: ArticleTemplate) => {
    setArticleForm(prev => ({
      ...prev,
      content: template.content,
    }));
  };

  // Articles list view
  const ArticlesList = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
            <option value="archived">Archivé</option>
          </select>

          <select
            value={filterPaid}
            onChange={(e) => setFilterPaid(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="all">Tous les articles</option>
            <option value="true">Payant</option>
            <option value="false">Gratuit</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsCreating(true);
              setSelectedTab('editor');
              resetForm();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Nouvel Article
          </motion.button>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articlesLoading ? (
          <div className="col-span-full text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Chargement des articles...</p>
          </div>
        ) : (
          articles?.filter((article: Article) => 
            article.title.toLowerCase().includes(searchQuery.toLowerCase())
          ).map((article: Article) => (
            <motion.div
              key={article.id}
              whileHover={{ y: -2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              {article.featuredImage && (
                <img 
                  src={article.featuredImage} 
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold line-clamp-2 flex-1">
                    {article.title}
                  </h3>
                  <div className="flex gap-1 ml-2">
                    {article.isPaid && (
                      <DollarSign className="w-5 h-5 text-green-600" />
                    )}
                    {article.translationStatus === 'complete' && (
                      <Globe className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>

                {article.metaDescription && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {article.metaDescription}
                  </p>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    article.status === 'published' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : article.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {article.status === 'published' ? 'Publié' : 
                     article.status === 'draft' ? 'Brouillon' : 'Archivé'}
                  </span>

                  <span className="text-xs text-gray-500">
                    {format(new Date(article.updatedAt), 'dd MMM yyyy', { locale: fr })}
                  </span>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEditArticle(article)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Edit3 className="w-4 h-4" />
                    Éditer
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (confirm('Voulez-vous vraiment supprimer cet article ?')) {
                        deleteArticleMutation.mutate(article.id);
                      }
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  // Article editor view
  const ArticleEditor = () => (
    <div className="space-y-6">
      {/* Language tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedLanguage('fr')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedLanguage === 'fr'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              🇫🇷 Français
            </button>
            <button
              onClick={() => setSelectedLanguage('en')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedLanguage === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => setSelectedLanguage('ar')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedLanguage === 'ar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              🇸🇦 العربية
            </button>
          </div>

          <select
            value={articleForm.translationStatus}
            onChange={(e) => setArticleForm(prev => ({ 
              ...prev, 
              translationStatus: e.target.value as 'complete' | 'needs_review' | 'in_progress'
            }))}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="in_progress">En cours de traduction</option>
            <option value="needs_review">À réviser</option>
            <option value="complete">Traduction complète</option>
          </select>
        </div>

        {/* Title input */}
        <input
          type="text"
          placeholder={`Titre de l'article (${selectedLanguage.toUpperCase()})`}
          value={
            selectedLanguage === 'fr' ? articleForm.title :
            selectedLanguage === 'en' ? articleForm.titleEn :
            articleForm.titleAr
          }
          onChange={(e) => {
            const field = selectedLanguage === 'fr' ? 'title' : 
                         selectedLanguage === 'en' ? 'titleEn' : 'titleAr';
            setArticleForm(prev => ({ ...prev, [field]: e.target.value }));
          }}
          className="w-full px-4 py-2 text-xl font-semibold border-b border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* SEO & Settings Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Column */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow">
          <TipTapEditor
            content={
              selectedLanguage === 'fr' ? articleForm.content :
              selectedLanguage === 'en' ? articleForm.contentEn :
              articleForm.contentAr
            }
            onChange={(content) => {
              const field = selectedLanguage === 'fr' ? 'content' : 
                           selectedLanguage === 'en' ? 'contentEn' : 'contentAr';
              setArticleForm(prev => ({ ...prev, [field]: content }));
            }}
            onSave={handleSaveArticle}
            placeholder="Commencez à écrire votre article..."
          />
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-4">
          {/* SEO Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Search className="w-5 h-5" />
              SEO
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  value={articleForm.slug}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Meta Description ({selectedLanguage.toUpperCase()})
                </label>
                <textarea
                  rows={3}
                  value={
                    selectedLanguage === 'fr' ? articleForm.metaDescription :
                    selectedLanguage === 'en' ? articleForm.metaDescriptionEn :
                    articleForm.metaDescriptionAr
                  }
                  onChange={(e) => {
                    const field = selectedLanguage === 'fr' ? 'metaDescription' : 
                                 selectedLanguage === 'en' ? 'metaDescriptionEn' : 'metaDescriptionAr';
                    setArticleForm(prev => ({ ...prev, [field]: e.target.value }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 resize-none"
                  placeholder="Description pour les moteurs de recherche..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image à la une</label>
                <input
                  type="text"
                  value={articleForm.featuredImage}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, featuredImage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="URL de l'image..."
                />
              </div>
            </div>
          </div>

          {/* Pricing Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Tarification
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={articleForm.isPaid}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, isPaid: e.target.checked }))}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium">Article payant</span>
              </label>

              {articleForm.isPaid && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Prix (DZD)</label>
                    <input
                      type="number"
                      value={articleForm.priceDzd}
                      onChange={(e) => setArticleForm(prev => ({ ...prev, priceDzd: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Prix (EUR)</label>
                    <input
                      type="number"
                      value={articleForm.priceEur}
                      onChange={(e) => setArticleForm(prev => ({ ...prev, priceEur: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Taux de taxe (%)</label>
                    <input
                      type="number"
                      value={articleForm.taxRate}
                      onChange={(e) => setArticleForm(prev => ({ ...prev, taxRate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Publication Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">Publication</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select
                  value={articleForm.status}
                  onChange={(e) => setArticleForm(prev => ({ 
                    ...prev, 
                    status: e.target.value as 'draft' | 'published' | 'archived'
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveArticle}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedTab('articles');
                    setEditingArticle(null);
                    setIsCreating(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Templates view
  const TemplatesView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates?.map((template: ArticleTemplate) => (
        <motion.div
          key={template.id}
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-4"
        >
          <div className="mb-3">
            <h3 className="text-lg font-semibold">{template.name}</h3>
            <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
              template.category === 'Course' ? 'bg-blue-100 text-blue-800' :
              template.category === 'ClinicalCase' ? 'bg-purple-100 text-purple-800' :
              template.category === 'RevisionSheet' ? 'bg-green-100 text-green-800' :
              template.category === 'Quiz' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {template.category}
            </span>
          </div>

          {template.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {template.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span>Utilisé {template.usageCount} fois</span>
            {template.isPublic && <Globe className="w-4 h-4" />}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleUseTemplate(template)}
            className="w-full px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Utiliser ce modèle
          </motion.button>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Système de Gestion de Contenu</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Créez et gérez vos articles médicaux avec l'éditeur TipTap
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSelectedTab('articles')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedTab === 'articles'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <FileText className="inline-block w-5 h-5 mr-2" />
          Articles
        </button>
        <button
          onClick={() => setSelectedTab('editor')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedTab === 'editor'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Edit3 className="inline-block w-5 h-5 mr-2" />
          Éditeur
        </button>
        <button
          onClick={() => setSelectedTab('templates')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedTab === 'templates'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Copy className="inline-block w-5 h-5 mr-2" />
          Modèles
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {selectedTab === 'articles' && <ArticlesList />}
          {selectedTab === 'editor' && <ArticleEditor />}
          {selectedTab === 'templates' && <TemplatesView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}