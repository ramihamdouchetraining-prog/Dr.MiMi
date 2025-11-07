import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  Clock, 
  Users, 
  Star, 
  Play,
  Bookmark,
  Heart,
  Brain,
  Stethoscope,
  Activity
} from 'lucide-react';
import { useTheme, useMedicalEmojis } from '../contexts/ThemeContext';
import { LoadingSpinner, EmptyState, ErrorState } from '../components/EmptyState';
import { apiFetch } from '../config/api';

interface Course {
  id: string;
  title: string;
  titleEn?: string;
  titleAr?: string;
  description: string;
  descriptionEn?: string;
  descriptionAr?: string;
  moduleId?: string;
  yearLevels?: string[];
  authors?: string[];
  language?: string;
  coverImage?: string;
  price?: string;
  currency?: string;
  rating?: string;
  status?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CourseCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

const CoursesPage: React.FC = () => {
  const { isFeminine } = useTheme();
  const emojis = useMedicalEmojis();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  
  // API State
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await apiFetch('/api/courses');
        setCourses(data);
      } catch (err: any) {
        console.error('Error fetching courses:', err);
        setError(err.message || 'Une erreur est survenue lors du chargement des cours');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const categories: CourseCategory[] = [
    { 
      id: 'all', 
      name: 'Tous les cours', 
      icon: <BookOpen size={20} />, 
      count: 42, 
      color: 'var(--color-primary)' 
    },
    { 
      id: 'anatomy', 
      name: 'Anatomie', 
      icon: <span>{emojis.heart}</span>, 
      count: 12, 
      color: '#EF4444' 
    },
    { 
      id: 'cardiology', 
      name: 'Cardiologie', 
      icon: <Heart size={20} />, 
      count: 8, 
      color: '#F59E0B' 
    },
    { 
      id: 'neurology', 
      name: 'Neurologie', 
      icon: <Brain size={20} />, 
      count: 6, 
      color: '#8B5CF6' 
    },
    { 
      id: 'internal', 
      name: 'Médecine Interne', 
      icon: <Stethoscope size={20} />, 
      count: 10, 
      color: '#10B981' 
    },
    { 
      id: 'emergency', 
      name: 'Urgences', 
      icon: <Activity size={20} />, 
      count: 6, 
      color: '#DC2626' 
    }
  ];


  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.titleEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.titleAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = selectedLevel === 'all' || (course.yearLevels && course.yearLevels.includes(selectedLevel));
    
    return matchesSearch && matchesLevel;
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--gradient-bg)' }}>
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--gradient-bg)' }}>
        <ErrorState 
          message={error} 
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
    const displayTitle = course.title || course.titleEn || course.titleAr || 'Untitled Course';
    const displayDescription = course.description || course.descriptionEn || course.descriptionAr || '';
    const displayPrice = course.price ? parseFloat(course.price) : 0;
    const displayRating = course.rating ? parseFloat(course.rating) : 0;
    const displayAuthors = course.authors && Array.isArray(course.authors) ? course.authors.join(', ') : 'Dr. MiMi';
    
    return (
    <motion.div
      className="rounded-xl overflow-hidden shadow-lg border group cursor-pointer"
      style={{ 
        backgroundColor: 'var(--color-surface)', 
        borderColor: 'var(--color-border)',
        boxShadow: isFeminine ? '0 10px 25px rgba(236, 72, 153, 0.08)' : '0 10px 25px rgba(15, 163, 177, 0.08)'
      }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
        {course.coverImage ? (
          <img
            src={course.coverImage}
            alt={displayTitle}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            📚
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Play Button */}
        <div className="absolute bottom-3 right-3">
          <motion.div
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play size={20} className="text-white ml-1" />
          </motion.div>
        </div>

        {/* Year Levels */}
        {course.yearLevels && course.yearLevels.length > 0 && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
              {course.yearLevels.join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors" 
            style={{ color: 'var(--color-text)' }}>
          {displayTitle}
        </h3>
        
        <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-textSecondary)' }}>
          {displayDescription}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {displayRating > 0 && (
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500 fill-current" />
                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                  {displayRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {displayPrice > 0 ? `${displayPrice.toLocaleString()} ${course.currency || 'DZD'}` : 'Gratuit'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
            Par {displayAuthors}
          </p>
          
          <div className="flex gap-2">
            <motion.button
              className="p-2 rounded-lg border"
              style={{ borderColor: 'var(--color-border)' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bookmark size={16} style={{ color: 'var(--color-textSecondary)' }} />
            </motion.button>
            
            <motion.button
              className="px-4 py-2 rounded-lg text-white font-semibold"
              style={{ backgroundColor: 'var(--color-primary)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              S'inscrire
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
    );
  };

  const CategoryCard: React.FC<{ category: CourseCategory }> = ({ category }) => (
    <motion.button
      onClick={() => setSelectedCategory(category.id)}
      className={`p-4 rounded-xl border transition-all ${
        selectedCategory === category.id 
          ? 'shadow-lg' 
          : 'hover:shadow-md'
      }`}
      style={{
        backgroundColor: selectedCategory === category.id 
          ? category.color 
          : 'var(--color-surface)',
        borderColor: selectedCategory === category.id 
          ? category.color 
          : 'var(--color-border)',
        color: selectedCategory === category.id 
          ? 'white' 
          : 'var(--color-text)'
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={selectedCategory === category.id ? 'text-white' : ''}>
          {category.icon}
        </div>
        <span className="text-sm font-semibold">
          {category.count}
        </span>
      </div>
      <p className="text-sm font-medium text-left">
        {category.name}
      </p>
    </motion.button>
  );

  return (
    <motion.div
      className="min-h-screen p-6"
      style={{ backgroundColor: 'var(--color-background)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            Cours Médicaux {emojis.stethoscope}
            {isFeminine && ' 💕'}
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-textSecondary)' }}>
            Explorez notre collection de cours médicaux créés par des experts pour enrichir vos connaissances
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                     style={{ color: 'var(--color-textSecondary)' }} />
              <input
                type="text"
                placeholder="Rechercher un cours, instructeur, ou sujet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
            
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-3 rounded-lg border transition-colors"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            >
              <option value="all">Tous les niveaux</option>
              <option value="Débutant">Débutant</option>
              <option value="Intermédiaire">Intermédiaire</option>
              <option value="Avancé">Avancé</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Catégories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {filteredCourses.length}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              Cours disponibles
            </p>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p className="text-3xl font-bold text-green-500">
              {courses.length}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              Cours disponibles
            </p>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p className="text-3xl font-bold text-purple-500">
              {courses.length > 0 ? 
                (courses.reduce((acc, course) => acc + (parseFloat(course.rating || '0')), 0) / courses.length).toFixed(1)
                : '0.0'
              }
            </p>
            <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              Note moyenne
            </p>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p className="text-3xl font-bold text-yellow-500">
              {courses.filter(c => c.status === 'published').length}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              Cours publiés
            </p>
          </div>
        </div>

        {/* Courses Grid */}
        <AnimatePresence>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            layout
          >
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* No Results */}
        {filteredCourses.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              Aucun cours trouvé
            </h3>
            <p style={{ color: 'var(--color-textSecondary)' }}>
              Essayez de modifier vos critères de recherche
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CoursesPage;