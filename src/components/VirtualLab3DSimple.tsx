import React from 'react';
import { motion } from 'framer-motion';
import { 
  FlaskConical, 
  Brain, 
  Heart, 
  Dna, 
  Microscope,
  Activity,
  Zap,
  Eye,
  RotateCw
} from 'lucide-react';

export const VirtualLab3D: React.FC = () => {
  const [selectedModel, setSelectedModel] = React.useState('heart');

  const models = [
    { id: 'heart', name: 'Cœur', icon: Heart, color: 'from-red-500 to-pink-500' },
    { id: 'brain', name: 'Cerveau', icon: Brain, color: 'from-purple-500 to-indigo-500' },
    { id: 'dna', name: 'ADN', icon: Dna, color: 'from-blue-500 to-cyan-500' },
    { id: 'cell', name: 'Cellule', icon: Microscope, color: 'from-green-500 to-teal-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-teal-900/20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-teal-600">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Laboratoire Virtuel 3D
              </h1>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Model Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {models.map((model) => (
            <motion.button
              key={model.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedModel(model.id)}
              className={`relative p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg transition-all ${
                selectedModel === model.id 
                  ? 'ring-4 ring-teal-400 dark:ring-teal-600' 
                  : 'hover:shadow-xl'
              }`}
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${model.color} mb-3`}>
                <model.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">{model.name}</h3>
            </motion.button>
          ))}
        </div>

        {/* 3D Viewer Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 overflow-hidden"
        >
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
                className="mb-6"
              >
                <div className={`inline-flex p-8 rounded-full bg-gradient-to-br ${
                  models.find(m => m.id === selectedModel)?.color || 'from-teal-500 to-blue-500'
                }`}>
                  {React.createElement(
                    models.find(m => m.id === selectedModel)?.icon || Heart, 
                    { className: "w-24 h-24 text-white" }
                  )}
                </div>
              </motion.div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Modèle 3D: {models.find(m => m.id === selectedModel)?.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Visualisation anatomique interactive
              </p>

              {/* Controls */}
              <div className="flex justify-center gap-4 mt-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <RotateCw className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Eye className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Activity className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Zap className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6">
              <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Anatomie</h3>
              <p className="text-gray-700 dark:text-gray-400 text-sm">
                Explorez la structure détaillée et les composants anatomiques
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-6">
              <h3 className="font-bold text-green-900 dark:text-green-300 mb-2">Fonction</h3>
              <p className="text-gray-700 dark:text-gray-400 text-sm">
                Comprenez le rôle et le fonctionnement dans l'organisme
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6">
              <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-2">Pathologies</h3>
              <p className="text-gray-700 dark:text-gray-400 text-sm">
                Découvrez les maladies et troubles associés
              </p>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Fonctionnalités du Laboratoire
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 mb-4">
                <RotateCw className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Rotation 360°</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Visualisez les modèles sous tous les angles
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 mb-4">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Vue en coupe</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Explorez l'intérieur des structures anatomiques
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-green-400 to-teal-500 mb-4">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Animation</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Observez les mouvements et processus physiologiques
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};