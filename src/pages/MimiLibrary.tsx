import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BookOpen, Upload, Search, Filter, Heart, Download, 
  Star, Book, BookMarked, Globe, Flag, Plus, X, Check, 
  Eye, FileText, Music, Video, Image as ImageIcon, Link as LinkIcon,
  AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { useRBAC } from '../hooks/useRBAC';

type LibrarySection = 'islamic' | 'diverse' | 'palestine';
type LibraryFormat = 'pdf' | 'epub' | 'audio' | 'video' | 'image' | 'article' | 'link';
type LibraryStatus = 'pending' | 'approved' | 'rejected' | 'archived';

interface LibraryItem {
  id: string;
  section: LibrarySection;
  title: string;
  titleEn?: string;
  titleAr?: string;
  description?: string;
  author?: string;
  authorEn?: string;
  authorAr?: string;
  categoryId?: string;
  tags?: string[];
  madhhab?: string;
  subject?: string;
  format: LibraryFormat;
  fileUrl?: string;
  coverImage?: string;
  audioUrl?: string;
  videoUrl?: string;
  rating?: number;
  ratingCount?: number;
  downloadCount?: number;
  favoriteCount?: number;
  status: LibraryStatus;
  submittedBy: string;
  submittedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

interface LibraryCategory {
  id: string;
  section: LibrarySection;
  name: string;
  nameEn?: string;
  nameAr?: string;
  madhhab?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  icon?: string;
}

export default function MimiLibrary() {
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();
  const { hasPermission } = useRBAC();
  const queryClient = useQueryClient();
  
  const [activeSection, setActiveSection] = useState<LibrarySection>('islamic');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<LibraryFormat | ''>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: categoriesData } = useQuery({
    queryKey: ['library-categories', activeSection],
    queryFn: async () => {
      const res = await fetch(`/api/library/categories?section=${activeSection}`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json() as Promise<LibraryCategory[]>;
    }
  });
  
  const { data: itemsData, isLoading } = useQuery({
    queryKey: ['library-items', activeSection, searchQuery, selectedCategory, selectedFormat, selectedLevel, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        section: activeSection,
        page: page.toString(),
        limit: '20'
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedFormat) params.append('format', selectedFormat);
      if (selectedLevel) params.append('level', selectedLevel);
      
      const res = await fetch(`/api/library/items?${params}`);
      if (!res.ok) throw new Error('Failed to fetch items');
      return res.json() as Promise<{ items: LibraryItem[]; pagination: any }>;
    }
  });
  
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/library/items', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload item');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-items'] });
      setShowUploadForm(false);
      alert(language === 'ar' ? 'تم رفع المحتوى بنجاح! في انتظار موافقة المسؤول.' : 
            language === 'en' ? 'Content uploaded successfully! Awaiting admin approval.' :
            'Contenu téléversé avec succès ! En attente d\'approbation par l\'admin.');
    },
    onError: (error: Error) => {
      alert(language === 'ar' ? `خطأ: ${error.message}` : 
            language === 'en' ? `Error: ${error.message}` :
            `Erreur: ${error.message}`);
    }
  });
  
  const approveMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/library/items/${itemId}/approve`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to approve item');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-items'] });
    }
  });
  
  const rejectMutation = useMutation({
    mutationFn: async ({ itemId, reason }: { itemId: string; reason: string }) => {
      const res = await fetch(`/api/library/items/${itemId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!res.ok) throw new Error('Failed to reject item');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-items'] });
    }
  });
  
  const favoriteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/library/favorites/${itemId}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to add favorite');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-items'] });
    }
  });
  
  const downloadTrackMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/library/downloads/${itemId}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to track download');
      return res.json();
    }
  });
  
  const getSectionConfig = (section: LibrarySection) => {
    switch (section) {
      case 'islamic':
        return {
          title: language === 'ar' ? 'مكتبة ميمي الإسلامية' : language === 'en' ? 'Islamic Library' : 'Bibliothèque Islamique',
          description: language === 'ar' ? 'مكتبة رقمية مجانية وتعاونية للنصوص الإسلامية' : language === 'en' ? 'Free collaborative digital library for Islamic texts' : 'Bibliothèque numérique gratuite et collaborative pour textes islamiques',
          icon: BookMarked,
          color: 'emerald',
          bgGradient: 'from-emerald-50 via-teal-50 to-cyan-50',
          darkBgGradient: 'dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20'
        };
      case 'diverse':
        return {
          title: language === 'ar' ? 'مكتبة متنوعة' : language === 'en' ? 'Diverse Library' : 'Bibliothèque Divers',
          description: language === 'ar' ? 'مكتبة مفتوحة لجميع الكتب' : language === 'en' ? 'Open library for all books' : 'Bibliothèque ouverte à tous les livres',
          icon: Globe,
          color: 'purple',
          bgGradient: 'from-purple-50 via-pink-50 to-rose-50',
          darkBgGradient: 'dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20'
        };
      case 'palestine':
        return {
          title: language === 'ar' ? 'فلسطين' : language === 'en' ? 'Palestine' : 'Palestine',
          description: language === 'ar' ? 'محتوى حول القضية الفلسطينية' : language === 'en' ? 'Content about the Palestinian cause' : 'Contenu sur la cause palestinienne',
          icon: Flag,
          color: 'red',
          bgGradient: 'from-red-50 via-green-50 to-black/5',
          darkBgGradient: 'dark:from-red-900/30 dark:via-green-900/30 dark:to-black/30'
        };
    }
  };
  
  const sectionConfig = getSectionConfig(activeSection);
  const SectionIcon = sectionConfig.icon;
  
  const getFormatIcon = (format: LibraryFormat) => {
    switch (format) {
      case 'pdf': return FileText;
      case 'epub': return BookOpen;
      case 'audio': return Music;
      case 'video': return Video;
      case 'image': return ImageIcon;
      case 'link': return LinkIcon;
      default: return Book;
    }
  };
  
  return (
    <div className={`min-h-screen bg-gradient-to-br ${sectionConfig.bgGradient} ${sectionConfig.darkBgGradient} py-20 px-4`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <SectionIcon className={`w-16 h-16 text-${sectionConfig.color}-600`} />
            <h1 className={`text-5xl font-bold text-${sectionConfig.color}-900 dark:text-${sectionConfig.color}-100`}>
              {sectionConfig.title}
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {sectionConfig.description}
          </p>
          
          {/* Section Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveSection('islamic')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeSection === 'islamic'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-emerald-50'
              }`}
            >
              <BookMarked className="w-5 h-5 inline mr-2" />
              {language === 'ar' ? 'إسلامية' : language === 'en' ? 'Islamic' : 'Islamique'}
            </button>
            <button
              onClick={() => setActiveSection('diverse')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeSection === 'diverse'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50'
              }`}
            >
              <Globe className="w-5 h-5 inline mr-2" />
              {language === 'ar' ? 'متنوعة' : language === 'en' ? 'Diverse' : 'Divers'}
            </button>
            <button
              onClick={() => setActiveSection('palestine')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeSection === 'palestine'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50'
              }`}
            >
              <Flag className="w-5 h-5 inline mr-2" />
              {language === 'ar' ? 'فلسطين' : language === 'en' ? 'Palestine' : 'Palestine'}
            </button>
          </div>
        </motion.div>
        
        {/* Search and Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-300" />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'البحث...' : language === 'en' ? 'Search...' : 'Rechercher...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Filter className="w-5 h-5 inline mr-2" />
                {language === 'ar' ? 'فلترة' : language === 'en' ? 'Filters' : 'Filtres'}
              </button>
              
              {user && (
                <button
                  onClick={() => setShowUploadForm(true)}
                  className={`px-6 py-3 bg-${sectionConfig.color}-600 text-white rounded-xl hover:bg-${sectionConfig.color}-700 transition-colors shadow-lg`}
                >
                  <Upload className="w-5 h-5 inline mr-2" />
                  {language === 'ar' ? 'رفع' : language === 'en' ? 'Upload' : 'Téléverser'}
                </button>
              )}
            </div>
          </div>
          
          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'ar' ? 'الفئة' : language === 'en' ? 'Category' : 'Catégorie'}
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">{language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Tous'}</option>
                      {categoriesData?.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {language === 'ar' && cat.nameAr ? cat.nameAr : language === 'en' && cat.nameEn ? cat.nameEn : cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Format Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'ar' ? 'الصيغة' : language === 'en' ? 'Format' : 'Format'}
                    </label>
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value as LibraryFormat | '')}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">{language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Tous'}</option>
                      <option value="pdf">PDF</option>
                      <option value="epub">EPUB</option>
                      <option value="audio">{language === 'ar' ? 'صوتي' : language === 'en' ? 'Audio' : 'Audio'}</option>
                      <option value="video">{language === 'ar' ? 'فيديو' : language === 'en' ? 'Video' : 'Vidéo'}</option>
                      <option value="image">{language === 'ar' ? 'صورة' : language === 'en' ? 'Image' : 'Image'}</option>
                    </select>
                  </div>
                  
                  {/* Level Filter (Islamic only) */}
                  {activeSection === 'islamic' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {language === 'ar' ? 'المستوى' : language === 'en' ? 'Level' : 'Niveau'}
                      </label>
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">{language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Tous'}</option>
                        <option value="beginner">{language === 'ar' ? 'مبتدئ' : language === 'en' ? 'Beginner' : 'Débutant'}</option>
                        <option value="intermediate">{language === 'ar' ? 'متوسط' : language === 'en' ? 'Intermediate' : 'Intermédiaire'}</option>
                        <option value="advanced">{language === 'ar' ? 'متقدم' : language === 'en' ? 'Advanced' : 'Avancé'}</option>
                      </select>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              </div>
            ))
          ) : itemsData?.items?.map((item) => (
            <LibraryItemCard 
              key={item.id} 
              item={item}
              sectionColor={sectionConfig.color}
              onApprove={() => approveMutation.mutate(item.id)}
              onReject={(reason) => rejectMutation.mutate({ itemId: item.id, reason })}
              onFavorite={() => favoriteMutation.mutate(item.id)}
              onDownload={() => downloadTrackMutation.mutate(item.id)}
              canModerate={hasPermission('content.approve')}
            />
          ))}
        </div>
        
        {/* Pagination */}
        {itemsData?.pagination && itemsData.pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            {Array.from({ length: itemsData.pagination.totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-4 py-2 rounded-lg ${
                  p === page
                    ? `bg-${sectionConfig.color}-600 text-white`
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadForm && (
          <UploadModal
            section={activeSection}
            categories={categoriesData || []}
            onClose={() => setShowUploadForm(false)}
            onUpload={(formData) => uploadMutation.mutate(formData)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Library Item Card Component
function LibraryItemCard({ 
  item, 
  sectionColor,
  onApprove, 
  onReject, 
  onFavorite, 
  onDownload,
  canModerate 
}: { 
  item: LibraryItem; 
  sectionColor: string;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onFavorite: () => void;
  onDownload: () => void;
  canModerate: boolean;
}) {
  const { language } = useLanguage();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  const FormatIcon = getFormatIcon(item.format);
  
  const title = language === 'ar' && item.titleAr ? item.titleAr 
    : language === 'en' && item.titleEn ? item.titleEn 
    : item.title;
  
  const author = language === 'ar' && item.authorAr ? item.authorAr 
    : language === 'en' && item.authorEn ? item.authorEn 
    : item.author;
  
  const handleDownload = () => {
    if (item.fileUrl) {
      onDownload();
      window.open(item.fileUrl, '_blank');
    }
  };
  
  const getStatusBadge = () => {
    switch (item.status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          {language === 'ar' ? 'قيد المراجعة' : language === 'en' ? 'Pending' : 'En attente'}
        </span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 inline mr-1" />
          {language === 'ar' ? 'موافق عليه' : language === 'en' ? 'Approved' : 'Approuvé'}
        </span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 inline mr-1" />
          {language === 'ar' ? 'مرفوض' : language === 'en' ? 'Rejected' : 'Rejeté'}
        </span>;
      default:
        return null;
    }
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
    >
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
        {item.coverImage ? (
          <img src={item.coverImage} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <FormatIcon className="w-20 h-20 text-gray-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          {getStatusBadge()}
        </div>
        
        {/* Format Badge */}
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full bg-${sectionColor}-600 text-white text-xs font-semibold`}>
          <FormatIcon className="w-3 h-3 inline mr-1" />
          {item.format.toUpperCase()}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
          {title}
        </h3>
        
        {author && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {language === 'ar' ? 'المؤلف' : language === 'en' ? 'Author' : 'Auteur'}: {author}
          </p>
        )}
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>{item.rating ? Number(item.rating).toFixed(1) : '0.0'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span>{item.downloadCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{item.favoriteCount || 0}</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          {item.status === 'approved' && (
            <>
              <button
                onClick={handleDownload}
                className={`flex-1 px-4 py-2 bg-${sectionColor}-600 text-white rounded-lg hover:bg-${sectionColor}-700 transition-colors text-sm font-semibold`}
              >
                <Download className="w-4 h-4 inline mr-2" />
                {language === 'ar' ? 'تحميل' : language === 'en' ? 'Download' : 'Télécharger'}
              </button>
              <button
                onClick={onFavorite}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Heart className="w-4 h-4" />
              </button>
            </>
          )}
          
          {canModerate && item.status === 'pending' && (
            <div className="flex gap-2 w-full">
              <button
                onClick={onApprove}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
              >
                <Check className="w-4 h-4 inline mr-2" />
                {language === 'ar' ? 'موافقة' : language === 'en' ? 'Approve' : 'Approuver'}
              </button>
              <button
                onClick={() => setShowRejectDialog(true)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
              >
                <X className="w-4 h-4 inline mr-2" />
                {language === 'ar' ? 'رفض' : language === 'en' ? 'Reject' : 'Rejeter'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Reject Dialog */}
      <AnimatePresence>
        {showRejectDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRejectDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">
                {language === 'ar' ? 'سبب الرفض' : language === 'en' ? 'Rejection Reason' : 'Raison du rejet'}
              </h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-4"
                rows={4}
                placeholder={language === 'ar' ? 'أدخل السبب...' : language === 'en' ? 'Enter reason...' : 'Entrez la raison...'}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onReject(rejectReason);
                    setShowRejectDialog(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {language === 'ar' ? 'تأكيد' : language === 'en' ? 'Confirm' : 'Confirmer'}
                </button>
                <button
                  onClick={() => setShowRejectDialog(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                  {language === 'ar' ? 'إلغاء' : language === 'en' ? 'Cancel' : 'Annuler'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function getFormatIcon(format: LibraryFormat) {
  switch (format) {
    case 'pdf': return FileText;
    case 'epub': return BookOpen;
    case 'audio': return Music;
    case 'video': return Video;
    case 'image': return ImageIcon;
    case 'link': return LinkIcon;
    default: return Book;
  }
}

// Upload Modal Component
function UploadModal({ 
  section, 
  categories, 
  onClose, 
  onUpload 
}: { 
  section: LibrarySection; 
  categories: LibraryCategory[]; 
  onClose: () => void;
  onUpload: (formData: FormData) => void;
}) {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    titleAr: '',
    description: '',
    author: '',
    categoryId: '',
    format: 'pdf' as LibraryFormat,
    madhhab: '',
    tags: '',
  });
  
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/epub+zip': ['.epub'],
      'audio/*': ['.mp3', '.wav'],
      'video/*': ['.mp4', '.webm'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    },
    maxSize: 50 * 1024 * 1024,
    multiple: false
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('section', section);
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value.toString());
    });
    
    if (acceptedFiles[0]) {
      data.append('file', acceptedFiles[0]);
    }
    
    onUpload(data);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-3xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {language === 'ar' ? 'رفع محتوى جديد' : language === 'en' ? 'Upload New Content' : 'Téléverser nouveau contenu'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Drop Zone */}
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 transition-colors"
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            {acceptedFiles.length > 0 ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">{acceptedFiles[0].name}</p>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'اسحب وأفلت الملف هنا أو انقر للتحديد' : language === 'en' ? 'Drag and drop file here or click to select' : 'Glissez-déposez le fichier ici ou cliquez pour sélectionner'}
              </p>
            )}
          </div>
          
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder={language === 'ar' ? 'العنوان (عربي)' : language === 'en' ? 'Title (Arabic)' : 'Titre (Arabe)'}
              value={formData.titleAr}
              onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            />
            
            <input
              type="text"
              placeholder={language === 'ar' ? 'العنوان (فرنسي)' : language === 'en' ? 'Title (French)' : 'Titre (Français)'}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            />
            
            <input
              type="text"
              placeholder={language === 'ar' ? 'المؤلف' : language === 'en' ? 'Author' : 'Auteur'}
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">{language === 'ar' ? 'اختر فئة' : language === 'en' ? 'Select category' : 'Sélectionner catégorie'}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            
            <select
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value as LibraryFormat })}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="pdf">PDF</option>
              <option value="epub">EPUB</option>
              <option value="audio">{language === 'ar' ? 'صوتي' : language === 'en' ? 'Audio' : 'Audio'}</option>
              <option value="video">{language === 'ar' ? 'فيديو' : language === 'en' ? 'Video' : 'Vidéo'}</option>
              <option value="image">{language === 'ar' ? 'صورة' : language === 'en' ? 'Image' : 'Image'}</option>
            </select>
            
            {section === 'islamic' && (
              <select
                value={formData.madhhab}
                onChange={(e) => setFormData({ ...formData, madhhab: e.target.value })}
                className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">{language === 'ar' ? 'المذهب' : language === 'en' ? 'Madhhab' : 'École'}</option>
                <option value="Maliki">{language === 'ar' ? 'مالكي' : language === 'en' ? 'Maliki' : 'Malékite'}</option>
                <option value="Hanafi">{language === 'ar' ? 'حنفي' : language === 'en' ? 'Hanafi' : 'Hanafite'}</option>
                <option value="Shafii">{language === 'ar' ? 'شافعي' : language === 'en' ? 'Shafii' : 'Chaféite'}</option>
                <option value="Hanbali">{language === 'ar' ? 'حنبلي' : language === 'en' ? 'Hanbali' : 'Hanbalite'}</option>
              </select>
            )}
          </div>
          
          <textarea
            placeholder={language === 'ar' ? 'الوصف' : language === 'en' ? 'Description' : 'Description'}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            rows={4}
          />
          
          <input
            type="text"
            placeholder={language === 'ar' ? 'الكلمات المفتاحية (مفصولة بفاصلة)' : language === 'en' ? 'Keywords (comma separated)' : 'Mots-clés (séparés par virgule)'}
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          
          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
            >
              {language === 'ar' ? 'رفع' : language === 'en' ? 'Upload' : 'Téléverser'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
            >
              {language === 'ar' ? 'إلغاء' : language === 'en' ? 'Cancel' : 'Annuler'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
