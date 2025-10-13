import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { 
  Brain, 
  Users, 
  ShoppingCart, 
  Trophy, 
  BarChart3, 
  FlaskConical,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const FeaturesXXLPage: React.FC = () => {
  const features = [
    {
      title: "Dashboard Admin XXL",
      description: "Analytics temps réel avec graphiques interactifs et métriques avancées",
      icon: BarChart3,
      color: "from-purple-500 to-indigo-500",
      link: "/admin/dashboard-xxl",
      status: "nouveau"
    },
    {
      title: "Laboratoire Virtuel 3D",
      description: "Visualisation anatomique 3D interactive avec modèles animés",
      icon: FlaskConical,
      color: "from-green-500 to-teal-500",
      link: "/lab-3d",
      status: "nouveau"
    },
    {
      title: "Plateforme Collaborative",
      description: "Salles virtuelles pour étudier ensemble avec chat intégré",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      link: "/collaboration",
      status: "nouveau"
    },
    {
      title: "Marketplace Éducatif",
      description: "Vendre et acheter du contenu avec revenue sharing 70/30",
      icon: ShoppingCart,
      color: "from-orange-500 to-red-500",
      link: "/marketplace",
      status: "nouveau"
    },
    {
      title: "Gamification Avancée",
      description: "Leagues, tournaments et système de progression avec skill tree",
      icon: Trophy,
      color: "from-yellow-500 to-amber-500",
      link: "/gamification",
      status: "nouveau"
    },
    {
      title: "AI Tutor Intelligent",
      description: "Tuteur médical IA avec 5 modes d'enseignement adaptatifs",
      icon: Brain,
      color: "from-pink-500 to-rose-500",
      link: "/ai-tutor",
      status: "actif"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h1 
            className="text-5xl sm:text-6xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Fonctionnalités XXL
          </motion.h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Découvrez les nouvelles fonctionnalités avancées de Dr.MiMi pour une expérience d'apprentissage révolutionnaire
          </p>
          
          {/* Animated sparkles */}
          <motion.div
            className="flex justify-center mt-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={feature.link}
                className="block group relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Status Badge */}
                {feature.status === "nouveau" && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse">
                      NOUVEAU
                    </span>
                  </div>
                )}

                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative p-8">
                  {/* Icon */}
                  <motion.div
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {feature.description}
                  </p>

                  {/* Action Button */}
                  <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold">
                    <span className="mr-2">Découvrir</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
            Prochainement
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                📱 Application Mobile Native
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                React Native + Expo avec mode offline, flashcards IA, widgets et Apple Watch
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                🇩🇿 Spécialisation Algérie
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Partenariats CHU, préparation résidanat, paiement CCP et terminologie Darija
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturesXXLPage;