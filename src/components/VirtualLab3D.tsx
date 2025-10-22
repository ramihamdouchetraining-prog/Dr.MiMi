import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  Grid,
  Text,
  Box,
  Sphere,
  Cylinder,
  Torus,
  Float,
  MeshReflectorMaterial,
  Stars,
  Cloud,
  Html,
  useGLTF
} from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { motion } from 'framer-motion';
import { 
  Heart, Brain, Dna, Zap, Activity, Eye, 
  RotateCcw, ZoomIn, ZoomOut, Play, Pause,
  Info, BookOpen, Settings, Layers,
  ChevronLeft, ChevronRight, Download, Share2
} from 'lucide-react';
import * as THREE from 'three';

interface OrganModel {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  color: string;
  position: [number, number, number];
  scale: number;
  icon: React.ElementType;
}

// Modèle 3D d'un cœur animé
const AnimatedHeart: React.FC<{ selected: boolean }> = ({ selected }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Animation de battement
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(selected ? scale * 1.2 : scale);
      
      // Rotation légère
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Forme simplifiée du cœur */}
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={hovered ? '#ff4444' : '#cc0000'} 
          emissive={selected ? '#ff0000' : '#000000'}
          emissiveIntensity={selected ? 0.3 : 0}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      
      {/* Vaisseaux sanguins */}
      <Cylinder
        args={[0.1, 0.15, 1.5, 8]}
        position={[0.5, 0.8, 0]}
        rotation={[0, 0, -0.3]}
      >
        <meshStandardMaterial color="#8b0000" />
      </Cylinder>
      
      <Cylinder
        args={[0.1, 0.15, 1.5, 8]}
        position={[-0.5, 0.8, 0]}
        rotation={[0, 0, 0.3]}
      >
        <meshStandardMaterial color="#0000ff" />
      </Cylinder>

      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-lg">
            <p className="text-sm font-semibold">Cœur</p>
            <p className="text-xs text-gray-600">Muscle cardiaque</p>
          </div>
        </Html>
      )}
    </group>
  );
};

// Modèle 3D d'un cerveau
const BrainModel: React.FC<{ selected: boolean }> = ({ selected }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      if (selected) {
        meshRef.current.scale.setScalar(1.3);
      }
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial 
          color={hovered ? '#ffb3ba' : '#ff8080'}
          roughness={0.8}
          bumpScale={0.05}
        />
      </mesh>

      {/* Hémisphères */}
      <Box args={[0.05, 1.5, 1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#cc6666" />
      </Box>

      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-lg">
            <p className="text-sm font-semibold">Cerveau</p>
            <p className="text-xs text-gray-600">Système nerveux central</p>
          </div>
        </Html>
      )}
    </group>
  );
};

// Modèle 3D d'ADN
const DNAHelix: React.FC<{ selected: boolean }> = ({ selected }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const helixPoints = [];
  for (let i = 0; i < 20; i++) {
    const angle = (i / 5) * Math.PI;
    helixPoints.push({
      x1: Math.cos(angle) * 0.5,
      z1: Math.sin(angle) * 0.5,
      x2: Math.cos(angle + Math.PI) * 0.5,
      z2: Math.sin(angle + Math.PI) * 0.5,
      y: i * 0.2 - 2
    });
  }

  return (
    <group ref={groupRef} scale={selected ? 1.5 : 1}>
      {helixPoints.map((point, i) => (
        <React.Fragment key={i}>
          {/* Brins d'ADN */}
          <Sphere args={[0.08]} position={[point.x1, point.y, point.z1]}>
            <meshStandardMaterial color="#4169e1" emissive="#0000ff" emissiveIntensity={0.2} />
          </Sphere>
          <Sphere args={[0.08]} position={[point.x2, point.y, point.z2]}>
            <meshStandardMaterial color="#ff69b4" emissive="#ff00ff" emissiveIntensity={0.2} />
          </Sphere>
          
          {/* Liaisons */}
          <Cylinder
            args={[0.02, 0.02, 1]}
            position={[0, point.y, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <meshStandardMaterial color="#90ee90" />
          </Cylinder>
        </React.Fragment>
      ))}
    </group>
  );
};

// Composant principal du laboratoire 3D
export const VirtualLab3D: React.FC = () => {
  const [selectedOrgan, setSelectedOrgan] = useState<string>('heart');
  const [isAnimating, setIsAnimating] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [viewMode, setViewMode] = useState<'organs' | 'cells' | 'molecules'>('organs');

  const organs: OrganModel[] = [
    {
      id: 'heart',
      name: 'Cœur',
      nameEn: 'Heart',
      description: 'Pompe le sang dans tout le corps',
      color: '#ff0000',
      position: [-3, 0, 0],
      scale: 1,
      icon: Heart
    },
    {
      id: 'brain',
      name: 'Cerveau',
      nameEn: 'Brain',
      description: 'Centre de contrôle du système nerveux',
      color: '#ff8080',
      position: [0, 2, 0],
      scale: 1,
      icon: Brain
    },
    {
      id: 'dna',
      name: 'ADN',
      nameEn: 'DNA',
      description: 'Matériel génétique',
      color: '#4169e1',
      position: [3, 0, 0],
      scale: 1,
      icon: Dna
    }
  ];

  const selectedOrganData = organs.find(o => o.id === selectedOrgan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex">
      {/* Sidebar Controls */}
      <div className="w-80 bg-black/30 backdrop-blur-lg p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Laboratoire Virtuel 3D 🧬
          </h2>
          <p className="text-gray-300 text-sm">
            Explorez l'anatomie humaine en 3D interactif
          </p>
        </div>

        {/* View Mode Selector */}
        <div className="mb-6">
          <label className="text-white text-sm font-medium mb-2 block">
            Mode de visualisation
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'organs', label: 'Organes', icon: Heart },
              { id: 'cells', label: 'Cellules', icon: Activity },
              { id: 'molecules', label: 'Molécules', icon: Dna }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`p-2 rounded-lg flex flex-col items-center transition ${
                  viewMode === mode.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <mode.icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Organ List */}
        <div className="mb-6">
          <h3 className="text-white text-sm font-medium mb-3">
            Sélectionner un élément
          </h3>
          <div className="space-y-2">
            {organs.map(organ => {
              const Icon = organ.icon;
              return (
                <button
                  key={organ.id}
                  onClick={() => setSelectedOrgan(organ.id)}
                  className={`w-full p-3 rounded-lg flex items-center space-x-3 transition ${
                    selectedOrgan === organ.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">{organ.name}</p>
                    <p className="text-xs opacity-80">{organ.nameEn}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-3">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="w-full p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center space-x-2 transition"
          >
            {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isAnimating ? 'Pause' : 'Play'} Animation</span>
          </button>

          <button
            onClick={() => setShowLabels(!showLabels)}
            className="w-full p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center space-x-2 transition"
          >
            <Layers className="w-4 h-4" />
            <span>{showLabels ? 'Cacher' : 'Afficher'} Labels</span>
          </button>

          <button className="w-full p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center space-x-2 transition">
            <RotateCcw className="w-4 h-4" />
            <span>Réinitialiser Vue</span>
          </button>
        </div>

        {/* Information Panel */}
        {selectedOrganData && (
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <selectedOrganData.icon className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-medium">{selectedOrganData.name}</h3>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              {selectedOrganData.description}
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Type:</span>
                <span className="text-white">Organe vital</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Système:</span>
                <span className="text-white">Cardiovasculaire</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Complexité:</span>
                <span className="text-white">Élevée</span>
              </div>
            </div>

            <button className="w-full mt-4 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
              <BookOpen className="w-4 h-4 inline mr-2" />
              Voir le cours complet
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm flex items-center justify-center transition">
            <Download className="w-4 h-4 mr-1" />
            Export
          </button>
          <button className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm flex items-center justify-center transition">
            <Share2 className="w-4 h-4 mr-1" />
            Partager
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [0, 0, 8], fov: 60 }}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
          <spotLight
            position={[0, 10, 0]}
            angle={0.3}
            penumbra={1}
            intensity={1}
            castShadow
          />

          {/* Environment - Utiliser un preset simple pour éviter les erreurs HDR */}
          <Environment preset="city" background={false} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
          
          {/* Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <MeshReflectorMaterial
              blur={[300, 100]}
              resolution={2048}
              mixBlur={1}
              mixStrength={50}
              roughness={1}
              depthScale={1.2}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#0a0a0a"
              metalness={0.5}
            />
          </mesh>

          {/* Grid Helper */}
          <Grid
            position={[0, -2.99, 0]}
            args={[50, 50]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#6f6f6f"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#00ff00"
            fadeDistance={30}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid
          />

          {/* 3D Models */}
          <Suspense fallback={
            <Html center>
              <div className="text-white">Chargement...</div>
            </Html>
          }>
            {viewMode === 'organs' && (
              <>
                <Float
                  speed={isAnimating ? 2 : 0}
                  rotationIntensity={0.5}
                  floatIntensity={0.5}
                  floatingRange={[-0.1, 0.1]}
                >
                  <group position={organs[0].position}>
                    <AnimatedHeart selected={selectedOrgan === 'heart'} />
                  </group>
                </Float>

                <Float
                  speed={isAnimating ? 1.5 : 0}
                  rotationIntensity={0.3}
                  floatIntensity={0.3}
                >
                  <group position={organs[1].position}>
                    <BrainModel selected={selectedOrgan === 'brain'} />
                  </group>
                </Float>

                <Float
                  speed={isAnimating ? 2.5 : 0}
                  rotationIntensity={0.8}
                  floatIntensity={0.8}
                >
                  <group position={organs[2].position}>
                    <DNAHelix selected={selectedOrgan === 'dna'} />
                  </group>
                </Float>
              </>
            )}
          </Suspense>

          {/* Camera Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={isAnimating}
            autoRotateSpeed={0.5}
          />

          {/* Post-processing Effects */}
          <EffectComposer>
            <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={300} />
            <ChromaticAberration offset={[0.001, 0.001]} />
          </EffectComposer>
        </Canvas>

        {/* Overlay UI */}
        <div className="absolute top-4 right-4 space-y-2">
          <button className="p-2 bg-black/50 backdrop-blur text-white rounded-lg hover:bg-black/60 transition">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button className="p-2 bg-black/50 backdrop-blur text-white rounded-lg hover:bg-black/60 transition">
            <ZoomOut className="w-5 h-5" />
          </button>
          <button className="p-2 bg-black/50 backdrop-blur text-white rounded-lg hover:bg-black/60 transition">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Info Tooltip */}
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur rounded-lg p-3 max-w-sm">
          <div className="flex items-center space-x-2 text-white">
            <Info className="w-4 h-4 text-blue-400" />
            <p className="text-sm">
              Utilisez la souris pour tourner, zoomer et explorer les modèles 3D
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};