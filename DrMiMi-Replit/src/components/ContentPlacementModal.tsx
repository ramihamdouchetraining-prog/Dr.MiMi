import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, Calendar, Globe, Lock, Users, Tag, 
  Eye, Save, FileText, Video, File, Image,
  Home, BookOpen, FileArchive, Layers, CheckCircle,
  Activity, Library, ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ContentPlacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContentData) => void;
}

interface ContentData {
  title: string;
  titleAr?: string;
  titleEn?: string;
  type: 'article' | 'pdf' | 'video' | 'document' | 'image';
  file?: File;
  content?: string;
  placement: {
    page: string;
    module?: string;
    category?: string;
    position: string;
    visibility: string;
    publishDate: Date;
    tags: string[];
  };
  description?: string;
  thumbnail?: string;
}

const pages = [
  { value: 'home', label: 'Accueil', icon: Home },
  { value: 'courses', label: 'Cours', icon: BookOpen },
  { value: 'summaries', label: 'Résumés', icon: FileText },
  { value: 'modules', label: 'Modules', icon: Layers },
  { value: 'quiz', label: 'Quiz', icon: CheckCircle },
  { value: 'cases', label: 'Cas cliniques', icon: Activity },
  { value: 'library', label: 'Bibliothèque', icon: Library },
];

const positions = [
  { value: 'featured', label: 'En vedette', description: 'Affiché en premier' },
  { value: 'main', label: 'Liste principale', description: 'Dans la liste principale' },
  { value: 'sidebar', label: 'Sidebar', description: 'Dans la barre latérale' },
  { value: 'footer', label: 'Footer', description: 'En bas de page' },
];

const visibilities = [
  { value: 'public', label: 'Public', icon: Globe, color: 'green' },
  { value: 'members', label: 'Membres', icon: Users, color: 'blue' },
  { value: 'premium', label: 'Premium', icon: Lock, color: 'purple' },
  { value: 'role', label: 'Rôle spécifique', icon: Users, color: 'orange' },
];

const contentTypes = [
  { value: 'article', label: 'Article', icon: FileText, color: 'blue' },
  { value: 'pdf', label: 'PDF', icon: FileArchive, color: 'red' },
  { value: 'video', label: 'Vidéo', icon: Video, color: 'purple' },
  { value: 'document', label: 'Document', icon: File, color: 'green' },
  { value: 'image', label: 'Image', icon: Image, color: 'pink' },
];

export const ContentPlacementModal: React.FC<ContentPlacementModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<ContentData>({
    title: '',
    type: 'article',
    placement: {
      page: 'home',
      position: 'main',
      visibility: 'public',
      publishDate: new Date(),
      tags: []
    }
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData({ ...formData, file: e.dataTransfer.files[0] });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleAddTag = () => {
    if (currentTag && !formData.placement.tags.includes(currentTag)) {
      setFormData({
        ...formData,
        placement: {
          ...formData.placement,
          tags: [...formData.placement.tags, currentTag]
        }
      });
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      placement: {
        ...formData.placement,
        tags: formData.placement.tags.filter(tag => tag !== tagToRemove)
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const getModulesByPage = (page: string) => {
    // Dynamic modules based on selected page
    const modules: Record<string, string[]> = {
      courses: ['Anatomie', 'Physiologie', 'Pathologie', 'Pharmacologie', 'Sémiologie'],
      summaries: ['1ère année', '2ème année', '3ème année', '4ème année', '5ème année', '6ème année'],
      modules: ['Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5'],
      quiz: ['QCM', 'Cas cliniques', 'Révisions', 'Examens blancs'],
      library: ['Livres', 'Articles', 'Vidéos', 'Présentations', 'Cours'],
    };
    return modules[page] || [];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[900px] z-50"
          >
            <div className="h-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col">
              {/* Header */}
              <div className="p-6 border-b dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    Ajouter du contenu à la plateforme
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-pink-500" />
                      Informations de base
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Titre *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800"
                          placeholder="Titre du contenu"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Type *
                        </label>
                        <div className="flex gap-2">
                          {contentTypes.map((type) => (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => setFormData({ ...formData, type: type.value as any })}
                              className={`flex-1 p-2 rounded-lg border transition-all ${
                                formData.type === type.value
                                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                                  : 'border-gray-300 dark:border-gray-700'
                              }`}
                            >
                              <type.icon className={`w-4 h-4 mx-auto text-${type.color}-500`} />
                              <span className="text-xs mt-1 block">{type.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800"
                        rows={3}
                        placeholder="Description du contenu..."
                      />
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Upload className="w-5 h-5 text-purple-500" />
                      Fichier / Contenu
                    </h3>
                    
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive 
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' 
                          : 'border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Glissez-déposez votre fichier ici ou
                      </p>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-block mt-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        Choisir un fichier
                      </label>
                      {formData.file && (
                        <p className="mt-2 text-sm text-green-600">
                          ✓ {formData.file.name}
                        </p>
                      )}
                    </div>

                    {formData.type === 'article' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Contenu de l'article
                        </label>
                        <textarea
                          value={formData.content || ''}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800"
                          rows={6}
                          placeholder="Rédigez votre article..."
                        />
                      </div>
                    )}
                  </div>

                  {/* Placement Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-500" />
                      Placement dans la plateforme
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Page cible *
                        </label>
                        <select
                          value={formData.placement.page}
                          onChange={(e) => setFormData({
                            ...formData,
                            placement: { ...formData.placement, page: e.target.value }
                          })}
                          className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800"
                        >
                          {pages.map(page => (
                            <option key={page.value} value={page.value}>
                              {page.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {getModulesByPage(formData.placement.page).length > 0 && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Module / Catégorie
                          </label>
                          <select
                            value={formData.placement.module || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              placement: { ...formData.placement, module: e.target.value }
                            })}
                            className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800"
                          >
                            <option value="">Sélectionner...</option>
                            {getModulesByPage(formData.placement.page).map(module => (
                              <option key={module} value={module}>
                                {module}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Position
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {positions.map(pos => (
                            <button
                              key={pos.value}
                              type="button"
                              onClick={() => setFormData({
                                ...formData,
                                placement: { ...formData.placement, position: pos.value }
                              })}
                              className={`p-2 rounded-lg border text-sm transition-all ${
                                formData.placement.position === pos.value
                                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                                  : 'border-gray-300 dark:border-gray-700'
                              }`}
                            >
                              <div className="font-medium">{pos.label}</div>
                              <div className="text-xs opacity-70">{pos.description}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Visibilité
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {visibilities.map(vis => (
                            <button
                              key={vis.value}
                              type="button"
                              onClick={() => setFormData({
                                ...formData,
                                placement: { ...formData.placement, visibility: vis.value }
                              })}
                              className={`p-2 rounded-lg border text-sm transition-all ${
                                formData.placement.visibility === vis.value
                                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                                  : 'border-gray-300 dark:border-gray-700'
                              }`}
                            >
                              <vis.icon className={`w-4 h-4 mx-auto mb-1 text-${vis.color}-500`} />
                              <div className="text-xs">{vis.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Date de publication
                        </label>
                        <input
                          type="datetime-local"
                          value={format(formData.placement.publishDate, "yyyy-MM-dd'T'HH:mm")}
                          onChange={(e) => setFormData({
                            ...formData,
                            placement: { ...formData.placement, publishDate: new Date(e.target.value) }
                          })}
                          className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Tags
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={currentTag}
                            onChange={(e) => setCurrentTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800"
                            placeholder="Ajouter un tag..."
                          />
                          <button
                            type="button"
                            onClick={handleAddTag}
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                          >
                            <Tag className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.placement.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm flex items-center gap-1"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:text-purple-900 dark:hover:text-purple-100"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center gap-2 text-pink-500 hover:text-pink-600"
                    >
                      <Eye className="w-5 h-5" />
                      {showPreview ? 'Masquer' : 'Afficher'} l'aperçu
                      <ChevronDown className={`w-4 h-4 transition-transform ${showPreview ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showPreview && (
                      <div className="p-4 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <h4 className="font-semibold mb-2">Aperçu du placement</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Page:</strong> {pages.find(p => p.value === formData.placement.page)?.label}</p>
                          {formData.placement.module && <p><strong>Module:</strong> {formData.placement.module}</p>}
                          <p><strong>Position:</strong> {positions.find(p => p.value === formData.placement.position)?.label}</p>
                          <p><strong>Visibilité:</strong> {visibilities.find(v => v.value === formData.placement.visibility)?.label}</p>
                          <p><strong>Publication:</strong> {format(formData.placement.publishDate, 'PPpp', { locale: fr })}</p>
                          {formData.placement.tags.length > 0 && (
                            <p><strong>Tags:</strong> {formData.placement.tags.join(', ')}</p>
                          )}
                        </div>
                        
                        {/* Visual mockup */}
                        <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-lg">
                          <div className="text-xs text-gray-500 mb-2">
                            Simulation visuelle sur la page {pages.find(p => p.value === formData.placement.page)?.label}
                          </div>
                          <div className={`p-3 rounded-lg ${
                            formData.placement.position === 'featured' 
                              ? 'bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 border-2 border-pink-300 dark:border-pink-700' 
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <div className="flex items-start gap-3">
                              {formData.type === 'video' && <Video className="w-8 h-8 text-purple-500" />}
                              {formData.type === 'pdf' && <FileArchive className="w-8 h-8 text-red-500" />}
                              {formData.type === 'article' && <FileText className="w-8 h-8 text-blue-500" />}
                              <div className="flex-1">
                                <h5 className="font-semibold">{formData.title || 'Titre du contenu'}</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {formData.description || 'Description du contenu...'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="p-6 border-t dark:border-gray-800">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:opacity-90 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Publier le contenu
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};