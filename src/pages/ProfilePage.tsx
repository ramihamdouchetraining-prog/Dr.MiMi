// XXL User Profile Page for Dr.MiMi platform
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Award,
  BookOpen,
  Brain,
  Target,
  TrendingUp,
  Clock,
  Star,
  Settings,
  LogOut,
  Bell,
  Shield,
  Download,
  BarChart3,
  GraduationCap,
  Trophy,
  Activity,
  Edit,
  Save,
  Camera,
  Mail,
  MapPin
} from 'lucide-react';
import { useTheme, useMedicalEmojis } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';

interface Achievement {
  id: string;
  title: string;
  titleEn: string;
  titleAr: string;
  description: string;
  icon: string;
  date: string;
  points: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

interface StudyStats {
  coursesCompleted: number;
  totalCourses: number;
  quizzesPassed: number;
  totalQuizzes: number;
  casesResolved: number;
  totalCases: number;
  summariesDownloaded: number;
  studyStreak: number;
  totalStudyHours: number;
  averageScore: number;
}

const ProfilePage: React.FC = () => {
  const { isFeminine } = useTheme();
  const emojis = useMedicalEmojis();
  const { t, language, isRTL } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'statistics' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // User profile data (from database)
  const userProfile = {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || 'Utilisateur',
    email: user?.email || 'user@example.com',
    studyLevel: user?.yearOfStudy || 'Y3',
    university: user?.university || 'Université de Boumerdès',
    country: user?.country || 'Algérie',
    joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2024-01-15',
    avatar: user?.profileImageUrl || null,
    bio: user?.bio || (language === 'en' 
      ? 'Medical student passionate about learning. Always seeking to improve!'
      : language === 'ar'
      ? 'طالب طب شغوف بالتعلم. دائماً أسعى للتحسين!'
      : 'Étudiant(e) en médecine passionné(e) par l\'apprentissage. Toujours en quête de progresser !'),
    specialties: ['Cardiologie', 'Neurologie', 'Pharmacologie'],
    rank: 142,
    totalUsers: 3456,
    isPremium: false
  };

  const [editedProfile, setEditedProfile] = useState({
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    bio: userProfile.bio,
    university: userProfile.university,
    country: userProfile.country,
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editedProfile),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      await response.json();
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(language === 'en' ? 'Failed to update profile' : language === 'ar' ? 'فشل تحديث الملف الشخصي' : 'Échec de la mise à jour du profil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      await response.json();
      window.location.reload();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert(language === 'en' ? 'Failed to upload avatar' : language === 'ar' ? 'فشل تحميل الصورة' : 'Échec du téléchargement de l\'avatar');
    }
  };

  // Study statistics - Fetched from API
  const [stats, setStats] = useState<StudyStats>({
    coursesCompleted: 0,
    totalCourses: 0,
    quizzesPassed: 0,
    totalQuizzes: 0,
    casesResolved: 0,
    totalCases: 0,
    summariesDownloaded: 0,
    studyStreak: 0,
    totalStudyHours: 0,
    averageScore: 0
  });
  const [apiBadges, setApiBadges] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res = await fetch('/api/users/stats', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setApiBadges(data.badges || []);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  // Achievements
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Premier Pas',
      titleEn: 'First Step',
      titleAr: 'الخطوة الأولى',
      description: 'Complétez votre premier cours',
      icon: '👣',
      date: '2024-01-20',
      points: 10,
      rarity: 'Common'
    },
    {
      id: '2',
      title: 'Cardiologue en Herbe',
      titleEn: 'Budding Cardiologist',
      titleAr: 'طبيب قلب ناشئ',
      description: 'Complétez 10 cours de cardiologie',
      icon: emojis.heart,
      date: '2024-02-15',
      points: 50,
      rarity: 'Rare'
    },
    {
      id: '3',
      title: 'Maître Quiz',
      titleEn: 'Quiz Master',
      titleAr: 'سيد الاختبارات',
      description: 'Obtenez 90% ou plus dans 20 quiz',
      icon: '🎯',
      date: '2024-03-01',
      points: 100,
      rarity: 'Epic'
    },
    {
      id: '4',
      title: 'Étudiant Assidu',
      titleEn: 'Diligent Student',
      titleAr: 'طالب مجتهد',
      description: '30 jours de connexion consécutifs',
      icon: '🔥',
      date: '2024-03-15',
      points: 200,
      rarity: 'Legendary'
    }
  ];

  // Recent activity
  const recentActivity = [
    {
      type: 'course',
      title: language === 'en' ? 'Completed Cardiac Anatomy course' : language === 'ar' ? 'أكمل دورة تشريح القلب' : 'Terminé le cours d\'Anatomie Cardiaque',
      time: '2 heures',
      icon: BookOpen,
      color: 'var(--color-primary)'
    },
    {
      type: 'quiz',
      title: language === 'en' ? 'Scored 95% on Pharmacology quiz' : language === 'ar' ? 'حصل على 95% في اختبار علم الأدوية' : 'Obtenu 95% au quiz de Pharmacologie',
      time: '5 heures',
      icon: Brain,
      color: 'var(--color-success)'
    },
    {
      type: 'case',
      title: language === 'en' ? 'Resolved chest pain case' : language === 'ar' ? 'حل حالة ألم الصدر' : 'Résolu le cas de douleur thoracique',
      time: '1 jour',
      icon: Activity,
      color: 'var(--color-warning)'
    },
    {
      type: 'summary',
      title: language === 'en' ? 'Downloaded Neurology summary' : language === 'ar' ? 'حمّل ملخص طب الأعصاب' : 'Téléchargé le résumé de Neurologie',
      time: '2 jours',
      icon: Download,
      color: 'var(--color-accent)'
    }
  ];

  // Weekly progress data
  const weeklyProgress = [
    { day: language === 'en' ? 'Mon' : language === 'ar' ? 'الإثنين' : 'Lun', hours: 3 },
    { day: language === 'en' ? 'Tue' : language === 'ar' ? 'الثلاثاء' : 'Mar', hours: 2 },
    { day: language === 'en' ? 'Wed' : language === 'ar' ? 'الأربعاء' : 'Mer', hours: 4 },
    { day: language === 'en' ? 'Thu' : language === 'ar' ? 'الخميس' : 'Jeu', hours: 1 },
    { day: language === 'en' ? 'Fri' : language === 'ar' ? 'الجمعة' : 'Ven', hours: 5 },
    { day: language === 'en' ? 'Sat' : language === 'ar' ? 'السبت' : 'Sam', hours: 3 },
    { day: language === 'en' ? 'Sun' : language === 'ar' ? 'الأحد' : 'Dim', hours: 2 },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return '#9CA3AF';
      case 'Rare': return '#3B82F6';
      case 'Epic': return '#8B5CF6';
      case 'Legendary': return '#F59E0B';
      default: return 'var(--color-text)';
    }
  };

  if (!isAuthenticated) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: 'var(--color-background)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <User size={64} className="mx-auto mb-4" style={{ color: 'var(--color-textSecondary)' }} />
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            {language === 'en' 
              ? 'Please sign in to view your profile'
              : language === 'ar'
              ? 'الرجاء تسجيل الدخول لعرض ملفك الشخصي'
              : 'Veuillez vous connecter pour voir votre profil'}
          </h2>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 rounded-lg font-medium transition-transform hover:scale-105 cursor-pointer"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
              }}
            >
              {language === 'en' ? 'Sign In' : language === 'ar' ? 'تسجيل الدخول' : 'Se Connecter'}
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 rounded-lg font-medium transition-transform hover:scale-105 cursor-pointer"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              }}
            >
              {language === 'en' ? 'Sign Up' : language === 'ar' ? 'سجل' : 'S\'inscrire'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen p-6"
      style={{ backgroundColor: 'var(--color-background)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      dir={isRTL ? 'rtl' : 'ltr'}
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
            {t('nav.profile')} {emojis.stethoscope}
            {isFeminine && ' 💕'}
          </h1>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          className="mb-8 p-6 rounded-xl shadow-lg"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Avatar */}
            <div className="relative">
              <div
                className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-4xl font-bold"
              >
                {userProfile.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                hidden
                onChange={handleAvatarUpload}
              />
              {isEditing && (
                <button
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  className="absolute bottom-0 right-0 p-2 rounded-full"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                >
                  <Camera size={20} />
                </button>
              )}
              {userProfile.isPremium && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-2 rounded-full">
                    <Award size={20} />
                  </div>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editedProfile.firstName}
                      onChange={(e) => setEditedProfile({ ...editedProfile, firstName: e.target.value })}
                      placeholder={language === 'en' ? 'First Name' : language === 'ar' ? 'الاسم الأول' : 'Prénom'}
                      className="px-3 py-2 rounded-lg border text-lg font-bold"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-text)',
                        borderColor: 'var(--color-border)',
                      }}
                    />
                    <input
                      type="text"
                      value={editedProfile.lastName}
                      onChange={(e) => setEditedProfile({ ...editedProfile, lastName: e.target.value })}
                      placeholder={language === 'en' ? 'Last Name' : language === 'ar' ? 'اسم العائلة' : 'Nom'}
                      className="px-3 py-2 rounded-lg border text-lg font-bold"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-text)',
                        borderColor: 'var(--color-border)',
                      }}
                    />
                  </div>
                ) : (
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {userProfile.name}
                  </h2>
                )}
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                  }}
                >
                  {userProfile.studyLevel}
                </span>
              </div>
              
              {isEditing ? (
                <textarea
                  value={editedProfile.bio}
                  onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                  placeholder={language === 'en' ? 'Bio' : language === 'ar' ? 'السيرة الذاتية' : 'Bio'}
                  rows={3}
                  className="w-full mb-3 px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)',
                    borderColor: 'var(--color-border)',
                  }}
                />
              ) : (
                <p className="mb-3" style={{ color: 'var(--color-textSecondary)' }}>
                  {userProfile.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-4 mb-4 justify-center md:justify-start">
                <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  <Mail size={16} />
                  <input
                    type="email"
                    value={userProfile.email}
                    readOnly
                    className="bg-transparent border-none outline-none"
                    style={{ color: 'var(--color-textSecondary)' }}
                  />
                </span>
                <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  <GraduationCap size={16} />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.university}
                      onChange={(e) => setEditedProfile({ ...editedProfile, university: e.target.value })}
                      placeholder={language === 'en' ? 'University' : language === 'ar' ? 'الجامعة' : 'Université'}
                      className="px-2 py-1 rounded border"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-text)',
                        borderColor: 'var(--color-border)',
                      }}
                    />
                  ) : (
                    userProfile.university
                  )}
                </span>
                <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  <MapPin size={16} />
                  {isEditing ? (
                    <select
                      value={editedProfile.country}
                      onChange={(e) => setEditedProfile({ ...editedProfile, country: e.target.value })}
                      className="px-2 py-1 rounded border"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-text)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <option value="Algérie">Algérie</option>
                      <option value="Maroc">Maroc</option>
                      <option value="Tunisie">Tunisie</option>
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Canada">Canada</option>
                    </select>
                  ) : (
                    userProfile.country
                  )}
                </span>
              </div>

              {/* Specialties */}
              <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                {userProfile.specialties.map(spec => (
                  <span
                    key={spec}
                    className="px-3 py-1 rounded-lg text-sm"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-text)',
                    }}
                  >
                    {spec}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-center md:justify-start">
                <button
                  onClick={() => {
                    if (isEditing) {
                      handleSaveProfile();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  style={{
                    backgroundColor: isEditing ? 'var(--color-success)' : 'var(--color-primary)',
                    color: 'white',
                    opacity: isSaving ? 0.6 : 1,
                  }}
                >
                  {isEditing ? <Save size={18} /> : <Edit size={18} />}
                  {isSaving 
                    ? (language === 'en' ? 'Saving...' : language === 'ar' ? 'جاري الحفظ...' : 'Enregistrement...')
                    : isEditing 
                    ? (language === 'en' ? 'Save' : language === 'ar' ? 'حفظ' : 'Sauvegarder')
                    : (language === 'en' ? 'Edit' : language === 'ar' ? 'تعديل' : 'Modifier')}
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <Settings size={18} />
                  {language === 'en' ? 'Settings' : language === 'ar' ? 'الإعدادات' : 'Paramètres'}
                </button>
              </div>
            </div>

            {/* Rank Card */}
            <div
              className="p-4 rounded-xl text-center"
              style={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
              }}
            >
              <Trophy size={32} className="mx-auto mb-2" style={{ color: 'var(--color-warning)' }} />
              <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                #{userProfile.rank}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                {language === 'en' ? 'out of' : language === 'ar' ? 'من' : 'sur'} {userProfile.totalUsers}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-primary)' }}>
                {language === 'en' ? 'National Rank' : language === 'ar' ? 'الترتيب الوطني' : 'Classement National'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {(['overview', 'achievements', 'statistics', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab ? '' : 'opacity-70'
              }`}
              style={{
                backgroundColor: activeTab === tab ? 'var(--color-primary)' : 'var(--color-surface)',
                color: activeTab === tab ? 'white' : 'var(--color-text)',
                border: '1px solid var(--color-border)',
              }}
            >
              {tab === 'overview' && (language === 'en' ? 'Overview' : language === 'ar' ? 'نظرة عامة' : 'Aperçu')}
              {tab === 'achievements' && (language === 'en' ? 'Achievements' : language === 'ar' ? 'الإنجازات' : 'Succès')}
              {tab === 'statistics' && (language === 'en' ? 'Statistics' : language === 'ar' ? 'الإحصائيات' : 'Statistiques')}
              {tab === 'settings' && (language === 'en' ? 'Settings' : language === 'ar' ? 'الإعدادات' : 'Paramètres')}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {statsLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
          </div>
        )}
        
        {!statsLoading && activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Study Progress */}
            <motion.div
              className="p-6 rounded-xl"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                <Target className="inline mr-2" size={20} />
                {language === 'en' ? 'Study Progress' : language === 'ar' ? 'تقدم الدراسة' : 'Progression d\'Étude'}
              </h3>
              
              <div className="space-y-4">
                <ProgressItem
                  label={language === 'en' ? 'Courses' : language === 'ar' ? 'الدورات' : 'Cours'}
                  current={stats.coursesCompleted}
                  total={stats.totalCourses}
                  color="var(--color-primary)"
                />
                <ProgressItem
                  label={language === 'en' ? 'Quizzes' : language === 'ar' ? 'الاختبارات' : 'Quiz'}
                  current={stats.quizzesPassed}
                  total={stats.totalQuizzes}
                  color="var(--color-success)"
                />
                <ProgressItem
                  label={language === 'en' ? 'Cases' : language === 'ar' ? 'الحالات' : 'Cas'}
                  current={stats.casesResolved}
                  total={stats.totalCases}
                  color="var(--color-warning)"
                />
              </div>

              <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--color-textSecondary)' }}>
                    <Clock size={16} className="inline mr-1" />
                    {language === 'en' ? 'Total Study Time' : language === 'ar' ? 'إجمالي وقت الدراسة' : 'Temps Total d\'Étude'}
                  </span>
                  <span className="font-bold" style={{ color: 'var(--color-text)' }}>
                    {stats.totalStudyHours}h
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span style={{ color: 'var(--color-textSecondary)' }}>
                    <TrendingUp size={16} className="inline mr-1" />
                    {language === 'en' ? 'Study Streak' : language === 'ar' ? 'سلسلة الدراسة' : 'Série d\'Étude'}
                  </span>
                  <span className="font-bold" style={{ color: 'var(--color-text)' }}>
                    🔥 {stats.studyStreak} {language === 'en' ? 'days' : language === 'ar' ? 'يوم' : 'jours'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              className="p-6 rounded-xl"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                <Activity className="inline mr-2" size={20} />
                {language === 'en' ? 'Recent Activity' : language === 'ar' ? 'النشاط الأخير' : 'Activité Récente'}
              </h3>

              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${activity.color}22` }}
                    >
                      <activity.icon size={20} style={{ color: activity.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                        {activity.title}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                        {language === 'en' ? 'ago' : language === 'ar' ? 'منذ' : 'il y a'} {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Weekly Progress Chart */}
            <motion.div
              className="p-6 rounded-xl md:col-span-2"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                <BarChart3 className="inline mr-2" size={20} />
                {language === 'en' ? 'Weekly Study Hours' : language === 'ar' ? 'ساعات الدراسة الأسبوعية' : 'Heures d\'Étude Hebdomadaires'}
              </h3>

              <div className="flex items-end justify-between gap-2" style={{ height: '200px' }}>
                {weeklyProgress.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center justify-end">
                    <div
                      className="w-full bg-primary rounded-t transition-all duration-500"
                      style={{
                        height: `${(day.hours / 5) * 100}%`,
                        backgroundColor: 'var(--color-primary)',
                      }}
                    />
                    <div className="text-xs mt-2" style={{ color: 'var(--color-textSecondary)' }}>
                      {day.day}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {!statsLoading && activeTab === 'achievements' && (
          <div className="space-y-8">
            {/* Real Badges from Database */}
            {apiBadges && apiBadges.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                  <Trophy className="inline mr-2" size={24} />
                  {language === 'en' ? 'Your Badges' : language === 'ar' ? 'أوسمتك' : 'Vos Badges'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {apiBadges.map((badge: any) => (
                    <motion.div
                      key={badge.id}
                      className="p-6 rounded-xl text-center"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        border: `2px solid ${
                          badge.badgeType === 'gold' ? '#F59E0B' :
                          badge.badgeType === 'silver' ? '#9CA3AF' :
                          '#CD7F32'
                        }`,
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="text-6xl mb-3">
                        {badge.badgeType === 'gold' ? '🥇' :
                         badge.badgeType === 'silver' ? '🥈' : '🥉'}
                      </div>
                      <h3 className="font-bold text-lg mb-2" style={{ 
                        color: badge.badgeType === 'gold' ? '#F59E0B' :
                               badge.badgeType === 'silver' ? '#9CA3AF' : '#CD7F32'
                      }}>
                        {badge.badgeType === 'gold' 
                          ? (language === 'en' ? 'Gold Badge' : language === 'ar' ? 'وسام ذهبي' : 'Badge Or')
                          : badge.badgeType === 'silver'
                          ? (language === 'en' ? 'Silver Badge' : language === 'ar' ? 'وسام فضي' : 'Badge Argent')
                          : (language === 'en' ? 'Bronze Badge' : language === 'ar' ? 'وسام برونزي' : 'Badge Bronze')}
                      </h3>
                      <p className="text-sm mb-3" style={{ color: 'var(--color-textSecondary)' }}>
                        {badge.reason}
                      </p>
                      <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                        {new Date(badge.createdAt).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                <Award className="inline mr-2" size={24} />
                {language === 'en' ? 'Achievements' : language === 'ar' ? 'الإنجازات' : 'Succès'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    className="p-6 rounded-xl text-center"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: `2px solid ${getRarityColor(achievement.rarity)}`,
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h3 className="font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                      {language === 'en' ? achievement.titleEn : language === 'ar' ? achievement.titleAr : achievement.title}
                    </h3>
                    <p className="text-sm mb-3" style={{ color: 'var(--color-textSecondary)' }}>
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-center gap-3 text-sm">
                      <span style={{ color: getRarityColor(achievement.rarity) }}>
                        {achievement.rarity}
                      </span>
                      <span style={{ color: 'var(--color-text)' }}>
                        +{achievement.points} pts
                      </span>
                    </div>
                    <div className="text-xs mt-2" style={{ color: 'var(--color-textSecondary)' }}>
                      {new Date(achievement.date).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!statsLoading && activeTab === 'statistics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<BookOpen size={24} />}
              value={stats.coursesCompleted}
              label={language === 'en' ? 'Courses Completed' : language === 'ar' ? 'الدورات المكتملة' : 'Cours Complétés'}
              color="var(--color-primary)"
              trend="+12%"
            />
            <StatCard
              icon={<Brain size={24} />}
              value={stats.quizzesPassed}
              label={language === 'en' ? 'Quizzes Passed' : language === 'ar' ? 'الاختبارات المجتازة' : 'Quiz Réussis'}
              color="var(--color-success)"
              trend="+8%"
            />
            <StatCard
              icon={<Activity size={24} />}
              value={stats.casesResolved}
              label={language === 'en' ? 'Cases Resolved' : language === 'ar' ? 'الحالات المحلولة' : 'Cas Résolus'}
              color="var(--color-warning)"
              trend="+15%"
            />
            <StatCard
              icon={<Star size={24} />}
              value={`${stats.averageScore}%`}
              label={language === 'en' ? 'Average Score' : language === 'ar' ? 'المعدل' : 'Score Moyen'}
              color="var(--color-accent)"
              trend="+5%"
            />
            <StatCard
              icon={<Download size={24} />}
              value={stats.summariesDownloaded}
              label={language === 'en' ? 'Summaries Downloaded' : language === 'ar' ? 'الملخصات المحملة' : 'Résumés Téléchargés'}
              color="var(--color-info)"
              trend="+20%"
            />
            <StatCard
              icon={<Clock size={24} />}
              value={`${stats.totalStudyHours}h`}
              label={language === 'en' ? 'Study Hours' : language === 'ar' ? 'ساعات الدراسة' : 'Heures d\'Étude'}
              color="var(--color-primary)"
              trend="+10%"
            />
            <StatCard
              icon={<TrendingUp size={24} />}
              value={`${stats.studyStreak}d`}
              label={language === 'en' ? 'Study Streak' : language === 'ar' ? 'سلسلة الدراسة' : 'Série d\'Étude'}
              color="var(--color-error)"
              trend="🔥"
            />
            <StatCard
              icon={<Trophy size={24} />}
              value={`#${userProfile.rank}`}
              label={language === 'en' ? 'National Rank' : language === 'ar' ? 'الترتيب الوطني' : 'Classement National'}
              color="var(--color-warning)"
              trend="↑23"
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Notifications */}
            <motion.div
              className="p-6 rounded-xl"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                <Bell className="inline mr-2" size={20} />
                {language === 'en' ? 'Notifications' : language === 'ar' ? 'الإشعارات' : 'Notifications'}
              </h3>
              
              <div className="space-y-3">
                <SettingToggle
                  label={language === 'en' ? 'Study reminders' : language === 'ar' ? 'تذكيرات الدراسة' : 'Rappels d\'étude'}
                  enabled={true}
                />
                <SettingToggle
                  label={language === 'en' ? 'New content alerts' : language === 'ar' ? 'تنبيهات المحتوى الجديد' : 'Alertes de nouveau contenu'}
                  enabled={true}
                />
                <SettingToggle
                  label={language === 'en' ? 'Quiz results' : language === 'ar' ? 'نتائج الاختبارات' : 'Résultats des quiz'}
                  enabled={false}
                />
                <SettingToggle
                  label={language === 'en' ? 'Weekly progress reports' : language === 'ar' ? 'تقارير التقدم الأسبوعية' : 'Rapports hebdomadaires'}
                  enabled={true}
                />
              </div>
            </motion.div>

            {/* Privacy */}
            <motion.div
              className="p-6 rounded-xl"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                <Shield className="inline mr-2" size={20} />
                {language === 'en' ? 'Privacy' : language === 'ar' ? 'الخصوصية' : 'Confidentialité'}
              </h3>
              
              <div className="space-y-3">
                <SettingToggle
                  label={language === 'en' ? 'Public profile' : language === 'ar' ? 'الملف الشخصي العام' : 'Profil public'}
                  enabled={true}
                />
                <SettingToggle
                  label={language === 'en' ? 'Show achievements' : language === 'ar' ? 'عرض الإنجازات' : 'Afficher les succès'}
                  enabled={true}
                />
                <SettingToggle
                  label={language === 'en' ? 'Show study statistics' : language === 'ar' ? 'عرض إحصائيات الدراسة' : 'Afficher les statistiques'}
                  enabled={false}
                />
              </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              className="p-6 rounded-xl"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-error)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-error)' }}>
                {language === 'en' ? 'Danger Zone' : language === 'ar' ? 'منطقة الخطر' : 'Zone de Danger'}
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 rounded-lg font-medium transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 cursor-pointer"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--color-error)',
                    border: '1px solid var(--color-error)',
                  }}
                >
                  <LogOut size={18} />
                  {language === 'en' ? 'Sign Out' : language === 'ar' ? 'تسجيل الخروج' : 'Se Déconnecter'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Progress Item Component
const ProgressItem: React.FC<{ label: string; current: number; total: number; color: string }> = ({
  label, current, total, color
}) => {
  const percentage = (current / total) * 100;
  
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>{label}</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          {current}/{total}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{ icon: React.ReactNode; value: string | number; label: string; color: string; trend: string }> = ({
  icon, value, label, color, trend
}) => {
  return (
    <motion.div
      className="p-4 rounded-xl"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div style={{ color }}>{icon}</div>
        <span className="text-sm font-semibold" style={{ color: 'var(--color-success)' }}>
          {trend}
        </span>
      </div>
      <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
        {value}
      </div>
      <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
        {label}
      </div>
    </motion.div>
  );
};

// Setting Toggle Component
const SettingToggle: React.FC<{ label: string; enabled: boolean }> = ({ label, enabled: initialEnabled }) => {
  const [enabled, setEnabled] = useState(initialEnabled);
  
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: 'var(--color-text)' }}>{label}</span>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`w-12 h-6 rounded-full transition-colors relative`}
        style={{
          backgroundColor: enabled ? 'var(--color-primary)' : 'var(--color-border)',
        }}
      >
        <div
          className={`absolute top-1 ${enabled ? 'left-7' : 'left-1'} w-4 h-4 bg-white rounded-full transition-all`}
        />
      </button>
    </div>
  );
};

export default ProfilePage;