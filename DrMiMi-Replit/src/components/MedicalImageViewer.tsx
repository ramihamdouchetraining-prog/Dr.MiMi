import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCw, Download, X, Maximize } from 'lucide-react';
import { useTheme, useMedicalEmojis } from '../contexts/ThemeContext';

export interface MedicalImage {
  id: string;
  src: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  credits?: string;
}

interface MedicalImageViewerProps {
  images: MedicalImage[];
  onImageSelect?: (imageId: string) => void;
}

export function MedicalImageViewer({ images, onImageSelect }: MedicalImageViewerProps) {
  const { isFeminine } = useTheme();
  const emojis = useMedicalEmojis();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const currentImage = images[currentImageIndex];

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImage.src;
    link.download = `${currentImage.title}.png`;
    link.click();
  };

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % images.length);
    handleReset();
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
    handleReset();
  };

  if (!currentImage) {
    return (
      <div className="text-center p-8" style={{ color: 'var(--color-textSecondary)' }}>
        Aucune image disponible
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Image Gallery Grid */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
          Bibliothèque Médicale {emojis.microscope}
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              className="relative cursor-pointer rounded-lg overflow-hidden shadow-md"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                border: index === currentImageIndex ? `2px solid var(--color-primary)` : '2px solid transparent'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentImageIndex(index);
                handleReset();
                if (onImageSelect) onImageSelect(image.id);
              }}
            >
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-32 object-cover"
              />
              <div className="p-2">
                <div className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>
                  {image.title}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                  {image.category}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Image Viewer */}
      <motion.div
        className="rounded-2xl shadow-lg overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)' }}
        layout
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h4 className="font-bold" style={{ color: 'var(--color-text)' }}>
              {currentImage.title}
            </h4>
            <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              {currentImage.category}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={handleZoomOut}
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--color-background)' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ZoomOut className="w-4 h-4" style={{ color: 'var(--color-text)' }} />
            </motion.button>
            
            <span className="text-sm px-2" style={{ color: 'var(--color-text)' }}>
              {Math.round(zoom * 100)}%
            </span>
            
            <motion.button
              onClick={handleZoomIn}
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--color-background)' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ZoomIn className="w-4 h-4" style={{ color: 'var(--color-text)' }} />
            </motion.button>
            
            <motion.button
              onClick={handleRotate}
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--color-background)' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <RotateCw className="w-4 h-4" style={{ color: 'var(--color-text)' }} />
            </motion.button>
            
            <motion.button
              onClick={() => setIsFullscreen(true)}
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--color-background)' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Maximize className="w-4 h-4" style={{ color: 'var(--color-text)' }} />
            </motion.button>
            
            <motion.button
              onClick={handleDownload}
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--color-primary)' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Download className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </div>

        {/* Image Display */}
        <div className="relative bg-gray-100 flex items-center justify-center" style={{ minHeight: '400px' }}>
          <motion.img
            src={currentImage.src}
            alt={currentImage.title}
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
              >
                ←
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
              >
                →
              </button>
            </>
          )}
        </div>

        {/* Image Info */}
        <div className="p-4">
          <p className="mb-3" style={{ color: 'var(--color-text)' }}>
            {currentImage.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {currentImage.tags.map((tag, index) => (
              <span
                key={index}
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
          
          {currentImage.credits && (
            <p className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
              Crédits: {currentImage.credits}
            </p>
          )}
        </div>
      </motion.div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              className="relative max-w-full max-h-full"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentImage.src}
                alt={currentImage.title}
                className="max-w-full max-h-full object-contain"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease'
                }}
              />
              
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MedicalImageViewer;