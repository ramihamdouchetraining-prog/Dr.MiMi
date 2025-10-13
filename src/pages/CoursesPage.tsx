import React, { useState } from 'react';
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

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  students: number;
  rating: number;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  category: string;
  price: number;
  image: string;
  chapters: number;
  isPopular?: boolean;
  isNew?: boolean;
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

  const courses: Course[] = [
    {
      id: '1',
      title: 'Anatomie Cardiaque Fondamentale',
      description: 'Cours complet sur l\'anatomie du système cardiovasculaire avec modèles 3D interactifs et cas cliniques.',
      instructor: 'Dr. Amina Khelifi',
      duration: '8 semaines',
      students: 1247,
      rating: 4.9,
      level: 'Débutant',
      category: 'cardiology',
      price: 2500,
      image: '/images/anatomy/heart-diagram.png',
      chapters: 12,
      isPopular: true
    },
    {
      id: '2',
      title: 'Neuroanatomie Avancée',
      description: 'Exploration détaillée du système nerveux central et périphérique avec imagerie médicale moderne.',
      instructor: 'Prof. Youcef Benali',
      duration: '10 semaines',
      students: 856,
      rating: 4.8,
      level: 'Avancé',
      category: 'neurology',
      price: 3200,
      image: '/images/anatomy/brain-diagram.png',
      chapters: 15,
      isNew: true
    },
    {
      id: '3',
      title: 'Système Respiratoire - Physiologie',
      description: 'Étude complète de la physiologie respiratoire avec applications cliniques pratiques.',
      instructor: 'Dr. Sarah Mohand',
      duration: '6 semaines',
      students: 634,
      rating: 4.7,
      level: 'Intermédiaire',
      category: 'anatomy',
      price: 1800,
      image: '/images/anatomy/respiratory-system.png',
      chapters: 10
    },
    {
      id: '4',
      title: 'Médecine d\'Urgence Pratique',
      description: 'Protocoles d\'urgence, gestes de premiers secours et prise en charge des urgences vitales.',
      instructor: 'Dr. Karim Mansouri',
      duration: '4 semaines',
      students: 923,
      rating: 4.9,
      level: 'Avancé',
      category: 'emergency',
      price: 2200,
      image: '/images/anatomy/digestive-system.png',
      chapters: 8,
      isPopular: true
    },
    {
      id: '5',
      title: 'Pathologies Cardiovasculaires',
      description: 'Diagnostic et traitement des principales pathologies du système cardiovasculaire.',
      instructor: 'Prof. Merieme Benali',
      duration: '12 semaines',
      students: 1456,
      rating: 4.8,
      level: 'Avancé',
      category: 'cardiology',
      price: 4500,
      image: '/images/anatomy/skeletal-system.png',
      chapters: 20,
      isNew: true
    },
    {
      id: '6',
      title: 'Introduction à la Médecine Générale',
      description: 'Bases fondamentales de la médecine générale pour étudiants de première année.',
      instructor: 'Dr. Fatima Zeghdoud',
      duration: '16 semaines',
      students: 2134,
      rating: 4.6,
      level: 'Débutant',
      category: 'internal',
      price: 1500,
      image: '/images/heroes/medical-education.png',
      chapters: 24,
      isPopular: true
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const CourseCard: React.FC<{ course: Course }> = ({ course }) => (
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
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {course.isPopular && (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white">
              ⭐ Populaire
            </span>
          )}
          {course.isNew && (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
              🆕 Nouveau
            </span>
          )}
        </div>

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

        {/* Level */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            course.level === 'Débutant' 
              ? 'bg-green-500 text-white' 
              : course.level === 'Intermédiaire'
              ? 'bg-yellow-500 text-white'
              : 'bg-red-500 text-white'
          }`}>
            {course.level}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors" 
            style={{ color: 'var(--color-text)' }}>
          {course.title}
        </h3>
        
        <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-textSecondary)' }}>
          {course.description}
        </p>

        <div className="flex items-center gap-4 text-sm mb-4" style={{ color: 'var(--color-textSecondary)' }}>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen size={16} />
            <span>{course.chapters} chapitres</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{course.students.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-500 fill-current" />
              <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                {course.rating}
              </span>
            </div>
            <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              ({course.students} étudiants)
            </span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {course.price.toLocaleString()} DZD
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
            Par {course.instructor}
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
              {courses.reduce((acc, course) => acc + course.students, 0).toLocaleString()}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              Étudiants inscrits
            </p>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p className="text-3xl font-bold text-purple-500">
              {(courses.reduce((acc, course) => acc + course.rating, 0) / courses.length).toFixed(1)}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              Note moyenne
            </p>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p className="text-3xl font-bold text-yellow-500">
              {courses.reduce((acc, course) => acc + course.chapters, 0)}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              Chapitres totaux
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