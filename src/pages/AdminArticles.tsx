import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDropzone } from 'react-dropzone';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  Eye,
  EyeOff,
  DollarSign,
  Tag,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Image,
  Video,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Sticker, useSticker } from '../components/Sticker';
import AvatarDrMimi from '../components/AvatarDrMimi';
import slugify from 'slugify';

// Types
interface Article {
  id?: string;
  title: string;
  titleEn?: string;
  titleAr?: string;
  slug: string;
  content: string;
  excerpt: string;
  category: 'Actualités' | 'Conseils' | 'Études' | 'Carrière' | 'Innovation';
  coverImage?: string;
  images?: string[];
  tags: string[];
  readingTime?: number;
  viewCount?: number;
  likeCount?: number;
  featured: boolean;
  price: number;
  currency: string;
  taxRate: number;
  isPremium: boolean;
  metaTitle?: string;
  metaDescription?: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  publishedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ArticleFormData {
  title: string;
  content: string;
  excerpt: string;
  category: Article['category'];
  tags: string;
  price: string;
  isPremium: boolean;
  featured: boolean;
  status: Article['status'];
  metaTitle: string;
  metaDescription: string;
}

// Quill modules configuration
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['clean']
  ]
};

// API functions
const fetchArticles = async (): Promise<Article[]> => {
  const response = await fetch('/api/admin/articles', {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch articles');
  return response.json();
};

const fetchArticle = async (id: string): Promise<Article> => {
  const response = await fetch(`/api/admin/articles/${id}`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch article');
  return response.json();
};

const createArticle = async (article: Partial<Article>): Promise<Article> => {
  const response = await fetch('/api/admin/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(article)
  });
  if (!response.ok) throw new Error('Failed to create article');
  return response.json();
};

const updateArticle = async ({ id, ...article }: Partial<Article>): Promise<Article> => {
  const response = await fetch(`/api/admin/articles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(article)
  });
  if (!response.ok) throw new Error('Failed to update article');
  return response.json();
};

const deleteArticle = async (id: string): Promise<void> => {
  const response = await fetch(`/api/admin/articles/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to delete article');
};

const uploadImage = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/admin/upload', {
    method: 'POST',
    credentials: 'include',
    body: formData
  });
  
  if (!response.ok) throw new Error('Failed to upload image');
  return response.json();
};

// Main component
const AdminArticles: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { stickerState, showSticker, hideSticker } = useSticker();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<Article['status'] | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    excerpt: '',
    category: 'Actualités',
    tags: '',
    price: '0',
    isPremium: false,
    featured: false,
    status: 'draft',
    metaTitle: '',
    metaDescription: ''
  });

  // Queries
  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ['articles'],
    queryFn: fetchArticles
  });

  const { data: article } = useQuery({
    queryKey: ['article', id],
    queryFn: () => fetchArticle(id!),
    enabled: !!id
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setIsFormOpen(false);
      resetForm();
      showSticker('Article créé avec succès !', { 
        emoji: '✅',
        gradient: 'linear-gradient(135deg, #10b981, #059669)'
      });
    },
    onError: () => {
      showSticker('Erreur lors de la création', { 
        emoji: '❌',
        gradient: 'linear-gradient(135deg, #ef4444, #dc2626)'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', id] });
      navigate('/admin/articles');
      showSticker('Article mis à jour !', { 
        emoji: '✅',
        gradient: 'linear-gradient(135deg, #10b981, #059669)'
      });
    },
    onError: () => {
      showSticker('Erreur lors de la mise à jour', { 
        emoji: '❌',
        gradient: 'linear-gradient(135deg, #ef4444, #dc2626)'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      showSticker('Article supprimé', { 
        emoji: '🗑️',
        gradient: 'linear-gradient(135deg, #6b7280, #4b5563)'
      });
    }
  });

  // Load article data for editing
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        tags: article.tags?.join(', ') || '',
        price: article.price?.toString() || '0',
        isPremium: article.isPremium || false,
        featured: article.featured || false,
        status: article.status,
        metaTitle: article.metaTitle || '',
        metaDescription: article.metaDescription || ''
      });
      setCoverImage(article.coverImage || null);
      setIsFormOpen(true);
    }
  }, [article]);

  // Image upload handler
  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await uploadImage(file);
      setCoverImage(result.url);
      showSticker('Image téléchargée !', { 
        emoji: '🖼️',
        gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)'
      });
    } catch (error) {
      showSticker('Erreur lors du téléchargement', { 
        emoji: '❌',
        gradient: 'linear-gradient(135deg, #ef4444, #dc2626)'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  // Form handlers
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: 'Actualités',
      tags: '',
      price: '0',
      isPremium: false,
      featured: false,
      status: 'draft',
      metaTitle: '',
      metaDescription: ''
    });
    setCoverImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const slug = slugify(formData.title, { lower: true, strict: true });
    const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    const articleData: Partial<Article> = {
      title: formData.title,
      slug,
      content: formData.content,
      excerpt: formData.excerpt,
      category: formData.category,
      tags,
      price: parseFloat(formData.price) || 0,
      currency: 'DZD',
      taxRate: 19,
      isPremium: formData.isPremium,
      featured: formData.featured,
      status: formData.status,
      metaTitle: formData.metaTitle || formData.title,
      metaDescription: formData.metaDescription || formData.excerpt,
      coverImage: coverImage || undefined,
      readingTime: Math.ceil(formData.content.split(' ').length / 200) // Estimation
    };

    if (id) {
      updateMutation.mutate({ id, ...articleData });
    } else {
      createMutation.mutate(articleData);
    }
  };

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Status badge colors
  const getStatusColor = (status: Article['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
      {/* Sticker component */}
      <Sticker {...stickerState} onClose={hideSticker} />

      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <AvatarDrMimi pose="writing" size="small" animated />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Gestion des Articles</h1>
                <p className="text-gray-600">Créez et gérez le contenu de votre blog</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="w-5 h-5" />
              Nouvel Article
            </motion.button>
          </div>

          {/* Search and filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as Article['status'] | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="review">En révision</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </div>
        </motion.div>

        {/* Articles list */}
        {!isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                <p>Erreur lors du chargement des articles</p>
              </div>
            ) : paginatedArticles.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Aucun article trouvé</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Titre</th>
                        <th className="text-left py-3 px-4">Catégorie</th>
                        <th className="text-left py-3 px-4">Statut</th>
                        <th className="text-left py-3 px-4">Prix</th>
                        <th className="text-left py-3 px-4">Vues</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-right py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedArticles.map((article) => (
                        <motion.tr
                          key={article.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {article.coverImage && (
                                <img
                                  src={article.coverImage}
                                  alt={article.title}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              )}
                              <div>
                                <p className="font-semibold">{article.title}</p>
                                <p className="text-sm text-gray-600 truncate max-w-xs">
                                  {article.excerpt}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                              {article.category}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(article.status)}`}>
                              {article.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {article.isPremium ? (
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                {article.price} DZD
                              </span>
                            ) : (
                              <span className="text-gray-500">Gratuit</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4 text-gray-400" />
                              {article.viewCount || 0}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {article.createdAt && new Date(article.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => navigate(`/admin/articles/${article.id}/edit`)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
                                    deleteMutation.mutate(article.id!);
                                  }
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 rounded-lg border ${
                          currentPage === i + 1
                            ? 'bg-purple-600 text-white'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Article form */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {id ? 'Modifier l\'article' : 'Nouvel article'}
                </h2>
                <button
                  onClick={() => {
                    setIsFormOpen(false);
                    navigate('/admin/articles');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre de l'article *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catégorie *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as Article['category'] })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="Actualités">Actualités</option>
                        <option value="Conseils">Conseils</option>
                        <option value="Études">Études</option>
                        <option value="Carrière">Carrière</option>
                        <option value="Innovation">Innovation</option>
                      </select>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (séparés par des virgules)
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="médecine, étudiant, conseil"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prix (DZD)
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Taxe de 19% appliquée automatiquement
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Statut
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Article['status'] })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="draft">Brouillon</option>
                        <option value="review">En révision</option>
                        <option value="published">Publié</option>
                        <option value="archived">Archivé</option>
                      </select>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.isPremium}
                          onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Article Premium</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Article à la une</span>
                      </label>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-6">
                    {/* Cover image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image de couverture
                      </label>
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
                        }`}
                      >
                        <input {...getInputProps()} />
                        {uploadingImage ? (
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto"></div>
                        ) : coverImage ? (
                          <div>
                            <img
                              src={coverImage}
                              alt="Cover"
                              className="w-full h-40 object-cover rounded-lg mb-3"
                            />
                            <p className="text-sm text-gray-600">Cliquez ou glissez pour remplacer</p>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p className="text-sm text-gray-600">
                              Glissez une image ici ou cliquez pour sélectionner
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG jusqu'à 10MB
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SEO Meta */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Title (SEO)
                      </label>
                      <input
                        type="text"
                        value={formData.metaTitle}
                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                        placeholder="Titre pour les moteurs de recherche"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Description (SEO)
                      </label>
                      <textarea
                        value={formData.metaDescription}
                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                        placeholder="Description pour les moteurs de recherche"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Excerpt */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extrait *
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Résumé court de l'article..."
                    required
                  />
                </div>

                {/* Content */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu de l'article *
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <ReactQuill
                      value={formData.content}
                      onChange={(content) => setFormData({ ...formData, content })}
                      modules={quillModules}
                      theme="snow"
                      className="bg-white"
                      style={{ minHeight: '300px' }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      navigate('/admin/articles');
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {id ? 'Mettre à jour' : 'Créer l\'article'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminArticles;