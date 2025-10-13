import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Grid, List, Download, Eye } from 'lucide-react';
import { useTheme, useMedicalEmojis } from '../contexts/ThemeContext';
import { MedicalImageViewer } from '../components/MedicalImageViewer';
import { medicalImages, getImageCategories } from '../data/medicalContent';

export function MedicalLibraryPage() {
  const { isFeminine } = useTheme();
  const emojis = useMedicalEmojis();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showViewer, setShowViewer] = useState(false);

  const categories = ['all', ...getImageCategories()];
  
  const filteredImages = medicalImages.filter(image => {
    const matchesCategory = selectedCategory === 'all' || image.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleImageSelect = (imageId: string) => {
    console.log('Image selected:', imageId);
  };

  return (
    <motion.div
      className="min-h-screen p-8"
      style={{ backgroundColor: 'var(--color-background)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            Bibliothèque Médicale {emojis.microscope}
          </h1>
          <p className="text-xl" style={{ color: 'var(--color-textSecondary)' }}>
            Collection d'images anatomiques et médicales haute qualité pour l'éducation
          </p>
        </motion.div>

        {/* Statistics */}
        <motion.div
          className="grid md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {medicalImages.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              Images totales
            </div>
          </div>
          
          <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {categories.length - 1}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              Catégories
            </div>
          </div>
          
          <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
              HD
            </div>
            <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              Qualité
            </div>
          </div>
          
          <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
              FR
            </div>
            <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              Légendes
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-textSecondary)' }} />
              <input
                type="text"
                placeholder="Rechercher dans la bibliothèque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid className="w-5 h-5" style={{ color: 'var(--color-text)' }} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-5 h-5" style={{ color: 'var(--color-text)' }} />
              </button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="px-4 py-2 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: selectedCategory === category ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: selectedCategory === category ? 'white' : 'var(--color-text)',
                  border: `2px solid ${selectedCategory === category ? 'var(--color-primary)' : 'var(--color-border)'}`
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category === 'all' ? 'Toutes catégories' : category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Toggle Viewer */}
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.button
            onClick={() => setShowViewer(!showViewer)}
            className="px-6 py-3 rounded-xl font-medium text-white flex items-center space-x-2"
            style={{ backgroundColor: 'var(--color-primary)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="w-5 h-5" />
            <span>{showViewer ? 'Masquer la visionneuse' : 'Afficher la visionneuse'}</span>
          </motion.button>
        </motion.div>

        {/* Image Viewer */}
        {showViewer && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <MedicalImageViewer
              images={filteredImages}
              onImageSelect={handleImageSelect}
            />
          </motion.div>
        )}

        {/* Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
              {filteredImages.length} image(s) trouvée(s)
            </h3>
            
            <motion.button
              onClick={() => {
                // Download all visible images as a collection
                console.log('Download collection:', filteredImages.map(img => img.id));
              }}
              className="px-4 py-2 rounded-lg flex items-center space-x-2 text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4" />
              <span>Télécharger tout</span>
            </motion.button>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  className="rounded-xl overflow-hidden shadow-lg cursor-pointer"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: isFeminine 
                      ? '0 10px 25px -5px rgba(236, 72, 153, 0.2)'
                      : '0 10px 25px -5px rgba(15, 163, 177, 0.2)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                      {image.title}
                    </h4>
                    <p className="text-sm mb-3" style={{ color: 'var(--color-textSecondary)' }}>
                      {image.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {image.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 rounded-full text-xs"
                          style={{ 
                            backgroundColor: isFeminine ? '#fce7f3' : '#e0f2fe',
                            color: isFeminine ? '#be185d' : '#0369a1'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                      {image.category}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  className="flex items-center p-4 rounded-xl shadow-sm"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-16 h-16 object-cover rounded-lg mr-4"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                      {image.title}
                    </h4>
                    <p className="text-sm mb-2" style={{ color: 'var(--color-textSecondary)' }}>
                      {image.description}
                    </p>
                    <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                      {image.category} • {image.tags.join(', ')}
                    </div>
                  </div>
                  <button
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <Download className="w-4 h-4 text-white" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default MedicalLibraryPage;