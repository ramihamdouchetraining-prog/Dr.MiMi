import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Heart3D } from './models3D/Heart3D';
import { Brain3D } from './models3D/Brain3D';
import { DNA3D } from './models3D/DNA3D';
import { Cell3D } from './models3D/Cell3D';
import { 
  FlaskConical, 
  Brain, 
  Heart, 
  Dna, 
  Microscope,
  Activity,
  Zap,
  Eye,
  RotateCw,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Slice
} from 'lucide-react';

export const VirtualLab3D: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('heart');
  const [rotation, setRotation] = useState(true);
  const [cutView, setCutView] = useState(false);
  const [animation, setAnimation] = useState(true);
  const [zoom, setZoom] = useState(5);

  const models = [
    { 
      id: 'heart', 
      name: 'Cœur', 
      icon: Heart, 
      color: 'from-red-500 to-pink-500',
      component: Heart3D,
      description: 'Système cardiovasculaire avec ventricules et vaisseaux'
    },
    { 
      id: 'brain', 
      name: 'Cerveau', 
      icon: Brain, 
      color: 'from-purple-500 to-indigo-500',
      component: Brain3D,
      description: 'Structure cérébrale avec activité neuronale'
    },
    { 
      id: 'dna', 
      name: 'ADN', 
      icon: Dna, 
      color: 'from-blue-500 to-cyan-500',
      component: DNA3D,
      description: 'Double hélice avec paires de bases'
    },
    { 
      id: 'cell', 
      name: 'Cellule', 
      icon: Microscope, 
      color: 'from-green-500 to-teal-500',
      component: Cell3D,
      description: 'Cellule eucaryote avec organites'
    }
  ];

  const currentModel = models.find(m => m.id === selectedModel);
  const ModelComponent = currentModel?.component || Heart3D;

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
            
            {/* Quick Controls in Header */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setRotation(!rotation)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  rotation 
                    ? 'bg-teal-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <RotateCw className="w-4 h-4 inline mr-1" />
                Rotation
              </button>
              
              <button
                onClick={() => setCutView(!cutView)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  cutView 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Slice className="w-4 h-4 inline mr-1" />
                Vue coupe
              </button>
              
              <button
                onClick={() => setAnimation(!animation)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  animation 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {animation ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
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
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {model.description}
              </p>
            </motion.button>
          ))}
        </div>

        {/* 3D Viewer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Controls Bar */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className={`text-xl font-bold bg-gradient-to-r ${currentModel?.color} bg-clip-text text-transparent`}>
                  {currentModel?.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentModel?.description}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(Math.max(2, zoom - 1))}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  title="Zoom arrière"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium px-2">{zoom}x</span>
                <button
                  onClick={() => setZoom(Math.min(10, zoom + 1))}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  title="Zoom avant"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
                
                <button
                  onClick={() => {
                    setRotation(true);
                    setCutView(false);
                    setAnimation(true);
                    setZoom(5);
                  }}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  title="Réinitialiser"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Mobile Controls */}
            <div className="flex md:hidden items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setRotation(!rotation)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  rotation 
                    ? 'bg-teal-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <RotateCw className="w-4 h-4 inline mr-1" />
                Rotation
              </button>
              
              <button
                onClick={() => setCutView(!cutView)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  cutView 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Slice className="w-4 h-4 inline mr-1" />
                Coupe
              </button>
              
              <button
                onClick={() => setAnimation(!animation)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  animation 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {animation ? <Pause className="w-4 h-4 inline mr-1" /> : <Play className="w-4 h-4 inline mr-1" />}
                Anim
              </button>
            </div>
          </div>
          
          {/* 3D Canvas */}
          <div className="relative h-[500px] bg-gradient-to-br from-gray-900 to-gray-800">
            <Canvas shadows camera={{ position: [0, 0, zoom] }}>
              <PerspectiveCamera makeDefault position={[0, 0, zoom]} />
              <OrbitControls 
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                autoRotate={false}
                minDistance={2}
                maxDistance={10}
              />
              
              {/* Lighting */}
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
              <directionalLight position={[-5, 5, -5]} intensity={0.5} />
              <pointLight position={[0, 10, 0]} intensity={0.5} />
              
              {/* Environment */}
              <Environment preset="studio" />
              
              {/* Grid */}
              <Grid 
                args={[10, 10]} 
                cellSize={0.5} 
                cellThickness={1} 
                cellColor="#6e6e6e" 
                sectionSize={2} 
                sectionThickness={1.5} 
                sectionColor="#9d9d9d" 
                fadeDistance={30} 
                fadeStrength={1} 
                followCamera={false} 
                infiniteGrid={true}
              />
              
              {/* 3D Model */}
              <Suspense fallback={<LoadingModel />}>
                <ModelComponent
                  rotation={rotation}
                  cutView={cutView}
                  animation={animation}
                  scale={1}
                />
              </Suspense>
            </Canvas>
            
            {/* Overlay Info */}
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
              Modèle 3D Interactif
            </div>
            
            {/* Instructions */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white p-3 rounded-lg text-sm max-w-xs">
              <p className="font-semibold mb-1">Contrôles :</p>
              <ul className="text-xs space-y-0.5">
                <li>🖱️ Clic gauche + glisser : Rotation</li>
                <li>🖱️ Clic droit + glisser : Déplacement</li>
                <li>🖱️ Molette : Zoom</li>
              </ul>
            </div>
          </div>

          {/* Info Panel */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
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
                Visualisez les modèles sous tous les angles avec rotation automatique ou manuelle
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
                Explorez l'intérieur des structures anatomiques avec sections transversales
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
                Observez les mouvements et processus physiologiques en temps réel
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading component
const LoadingModel: React.FC = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#888" wireframe />
  </mesh>
);