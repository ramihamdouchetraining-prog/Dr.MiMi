import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls, PerspectiveCamera, Environment, ContactShadows,
  Html, Text, useGLTF, Loader, Stats, Grid, GizmoHelper, 
  GizmoViewport, PivotControls, TransformControls, useAnimations,
  Edges, MeshReflectorMaterial, Float, Sparkles, Cloud,
  Backdrop, Stage, Lightformer, AccumulativeShadows, RandomizedLight
} from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { 
  Heart, Brain, Dna, Activity, Eye, Bone, Wind, Droplet,
  Zap, Shield, AlertTriangle, Info, ChevronLeft, ChevronRight,
  RotateCw, ZoomIn, ZoomOut, Maximize, Download, Share2,
  Layers, Settings, Play, Pause, SkipForward, Volume2
} from 'lucide-react';

// Types
interface OrganSystem {
  id: string;
  name: string;
  nameFr: string;
  category: 'cardiovascular' | 'nervous' | 'respiratory' | 'digestive' | 'skeletal' | 'muscular' | 'endocrine';
  description: string;
  color: string;
  icon: any;
  modelPath?: string;
  layers: Layer[];
  annotations: Annotation[];
  animations?: string[];
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  color: string;
  parts: string[];
}

interface Annotation {
  id: string;
  position: [number, number, number];
  title: string;
  description: string;
  category: 'anatomy' | 'pathology' | 'function';
  severity?: 'normal' | 'warning' | 'critical';
}

// Systèmes d'organes professionnels
const organSystems: OrganSystem[] = [
  {
    id: 'heart',
    name: 'Cardiovascular System',
    nameFr: 'Système Cardiovasculaire',
    category: 'cardiovascular',
    description: 'Cœur anatomique détaillé avec flux sanguin en temps réel',
    color: '#FF4444',
    icon: Heart,
    layers: [
      { id: 'epicardium', name: 'Épicarde', visible: true, opacity: 0.8, color: '#FF6B6B', parts: ['outer_layer'] },
      { id: 'myocardium', name: 'Myocarde', visible: true, opacity: 1, color: '#CC0000', parts: ['muscle_layer'] },
      { id: 'endocardium', name: 'Endocarde', visible: true, opacity: 0.6, color: '#FFB6B6', parts: ['inner_layer'] },
      { id: 'valves', name: 'Valves', visible: true, opacity: 1, color: '#FFFFFF', parts: ['mitral', 'tricuspid', 'aortic', 'pulmonary'] },
      { id: 'arteries', name: 'Artères', visible: true, opacity: 0.9, color: '#FF0000', parts: ['aorta', 'pulmonary_artery'] },
      { id: 'veins', name: 'Veines', visible: true, opacity: 0.9, color: '#0000FF', parts: ['vena_cava', 'pulmonary_veins'] }
    ],
    annotations: [
      { id: '1', position: [2, 3, 0], title: 'Aorte', description: 'Artère principale transportant le sang oxygéné', category: 'anatomy' },
      { id: '2', position: [-2, 2, 0], title: 'Artère Pulmonaire', description: 'Transporte le sang désoxygéné vers les poumons', category: 'anatomy' },
      { id: '3', position: [0, 0, 2], title: 'Ventricule Gauche', description: 'Pompe le sang vers tout le corps', category: 'function' },
      { id: '4', position: [1, 1, -1], title: 'Valve Mitrale', description: 'Empêche le reflux sanguin', category: 'anatomy' }
    ],
    animations: ['heartbeat', 'bloodflow', 'valve_motion']
  },
  {
    id: 'brain',
    name: 'Nervous System',
    nameFr: 'Système Nerveux',
    category: 'nervous',
    description: 'Cerveau humain avec régions fonctionnelles et connectivité neuronale',
    color: '#9B59B6',
    icon: Brain,
    layers: [
      { id: 'cortex', name: 'Cortex Cérébral', visible: true, opacity: 0.9, color: '#FFB6C1', parts: ['frontal', 'parietal', 'temporal', 'occipital'] },
      { id: 'white_matter', name: 'Substance Blanche', visible: false, opacity: 0.7, color: '#FFFFFF', parts: ['corpus_callosum', 'internal_capsule'] },
      { id: 'basal_ganglia', name: 'Ganglions de Base', visible: false, opacity: 0.8, color: '#8A2BE2', parts: ['caudate', 'putamen', 'globus_pallidus'] },
      { id: 'limbic', name: 'Système Limbique', visible: false, opacity: 0.7, color: '#FFD700', parts: ['hippocampus', 'amygdala', 'thalamus'] },
      { id: 'brainstem', name: 'Tronc Cérébral', visible: true, opacity: 1, color: '#CD853F', parts: ['midbrain', 'pons', 'medulla'] },
      { id: 'cerebellum', name: 'Cervelet', visible: true, opacity: 1, color: '#DDA0DD', parts: ['vermis', 'hemispheres'] }
    ],
    annotations: [
      { id: '1', position: [0, 4, 3], title: 'Lobe Frontal', description: 'Planification, mouvement, personnalité', category: 'function' },
      { id: '2', position: [-3, 2, 0], title: 'Aire de Broca', description: 'Production du langage', category: 'function', severity: 'normal' },
      { id: '3', position: [3, 2, 0], title: 'Aire de Wernicke', description: 'Compréhension du langage', category: 'function' },
      { id: '4', position: [0, -2, -2], title: 'Hippocampe', description: 'Mémoire et apprentissage', category: 'function' }
    ],
    animations: ['neural_activity', 'blood_flow', 'csf_circulation']
  },
  {
    id: 'lungs',
    name: 'Respiratory System',
    nameFr: 'Système Respiratoire',
    category: 'respiratory',
    description: 'Poumons avec bronches, alvéoles et échanges gazeux',
    color: '#3498DB',
    icon: Wind,
    layers: [
      { id: 'trachea', name: 'Trachée', visible: true, opacity: 0.9, color: '#87CEEB', parts: ['trachea'] },
      { id: 'bronchi', name: 'Bronches', visible: true, opacity: 0.8, color: '#4682B4', parts: ['main_bronchi', 'lobar_bronchi'] },
      { id: 'bronchioles', name: 'Bronchioles', visible: true, opacity: 0.6, color: '#6495ED', parts: ['terminal_bronchioles'] },
      { id: 'alveoli', name: 'Alvéoles', visible: true, opacity: 0.5, color: '#FFB6C1', parts: ['alveolar_sacs'] },
      { id: 'pleura', name: 'Plèvre', visible: false, opacity: 0.3, color: '#F0E68C', parts: ['visceral', 'parietal'] },
      { id: 'diaphragm', name: 'Diaphragme', visible: true, opacity: 0.7, color: '#CD5C5C', parts: ['diaphragm'] }
    ],
    annotations: [
      { id: '1', position: [0, 5, 0], title: 'Trachée', description: 'Conduit principal de l\'air', category: 'anatomy' },
      { id: '2', position: [-3, 2, 0], title: 'Poumon Gauche', description: '2 lobes', category: 'anatomy' },
      { id: '3', position: [3, 2, 0], title: 'Poumon Droit', description: '3 lobes', category: 'anatomy' },
      { id: '4', position: [0, -3, 0], title: 'Diaphragme', description: 'Muscle principal de la respiration', category: 'function' }
    ],
    animations: ['breathing', 'gas_exchange', 'blood_oxygenation']
  }
];

// Composant de modèle 3D anatomique professionnel
const AnatomicalModel = ({ system, settings }: { system: OrganSystem; settings: any }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const { camera } = useThree();

  // Animation du modèle
  useFrame((state) => {
    if (meshRef.current && settings.autoRotate) {
      meshRef.current.rotation.y += 0.005;
    }

    // Animation de battement de cœur
    if (system.id === 'heart' && meshRef.current && settings.animate) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.setScalar(scale);
    }

    // Animation de respiration
    if (system.id === 'lungs' && meshRef.current && settings.animate) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
      meshRef.current.scale.y = scale;
    }
  });

  // Rendu basé sur le système
  const renderOrgan = () => {
    switch (system.id) {
      case 'heart':
        return (
          <group ref={meshRef}>
            {/* Ventricules */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[2, 32, 32]} />
              <meshPhysicalMaterial 
                color="#CC0000"
                roughness={0.3}
                metalness={0.1}
                clearcoat={0.5}
                clearcoatRoughness={0.3}
                transparent
                opacity={settings.layers.myocardium ? 1 : 0}
              />
              {settings.showWireframe && <Edges color="black" />}
            </mesh>

            {/* Oreillettes */}
            <mesh position={[0, 2, 0]}>
              <sphereGeometry args={[1.5, 32, 32]} />
              <meshPhysicalMaterial 
                color="#FF6B6B"
                roughness={0.3}
                metalness={0.1}
                transparent
                opacity={settings.layers.epicardium ? 0.8 : 0}
              />
            </mesh>

            {/* Aorte */}
            {settings.layers.arteries && (
              <mesh position={[1, 3, 0]} rotation={[0, 0, Math.PI / 6]}>
                <cylinderGeometry args={[0.4, 0.3, 3, 16]} />
                <meshPhysicalMaterial color="#FF0000" roughness={0.4} />
              </mesh>
            )}

            {/* Artère pulmonaire */}
            {settings.layers.arteries && (
              <mesh position={[-1, 3, 0]} rotation={[0, 0, -Math.PI / 6]}>
                <cylinderGeometry args={[0.35, 0.25, 2.5, 16]} />
                <meshPhysicalMaterial color="#4169E1" roughness={0.4} />
              </mesh>
            )}

            {/* Valves */}
            {settings.layers.valves && (
              <>
                <mesh position={[0.5, 1, 0]}>
                  <torusGeometry args={[0.3, 0.1, 8, 16]} />
                  <meshPhysicalMaterial color="#FFFFFF" roughness={0.2} />
                </mesh>
                <mesh position={[-0.5, 1, 0]}>
                  <torusGeometry args={[0.3, 0.1, 8, 16]} />
                  <meshPhysicalMaterial color="#FFFFFF" roughness={0.2} />
                </mesh>
              </>
            )}

            {/* Annotations */}
            {settings.showAnnotations && system.annotations.map((annotation) => (
              <Html
                key={annotation.id}
                position={annotation.position}
                center
                distanceFactor={10}
                style={{ pointerEvents: 'none' }}
              >
                <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg p-2 min-w-[150px]">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    {annotation.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {annotation.description}
                  </p>
                </div>
              </Html>
            ))}
          </group>
        );

      case 'brain':
        return (
          <group ref={meshRef}>
            {/* Hémisphères cérébraux */}
            <mesh position={[0, 1, 0]}>
              <sphereGeometry args={[2.5, 64, 64]} />
              <meshPhysicalMaterial 
                color="#FFB6C1"
                roughness={0.7}
                metalness={0}
                bumpScale={0.005}
                transparent
                opacity={settings.layers.cortex ? 0.9 : 0}
              />
              {settings.showWireframe && <Edges color="purple" />}
            </mesh>

            {/* Cervelet */}
            {settings.layers.cerebellum && (
              <mesh position={[0, -1, -1.5]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshPhysicalMaterial color="#DDA0DD" roughness={0.6} />
              </mesh>
            )}

            {/* Tronc cérébral */}
            {settings.layers.brainstem && (
              <mesh position={[0, -1.5, 0]}>
                <cylinderGeometry args={[0.5, 0.7, 2, 16]} />
                <meshPhysicalMaterial color="#CD853F" roughness={0.5} />
              </mesh>
            )}

            {/* Système limbique (si visible) */}
            {settings.layers.limbic && (
              <mesh position={[0, 0, 0]}>
                <torusGeometry args={[1, 0.3, 16, 32]} />
                <meshPhysicalMaterial 
                  color="#FFD700" 
                  roughness={0.3}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            )}

            {/* Annotations */}
            {settings.showAnnotations && system.annotations.map((annotation) => (
              <Html
                key={annotation.id}
                position={annotation.position}
                center
                distanceFactor={10}
              >
                <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg p-2 min-w-[150px]">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    {annotation.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {annotation.description}
                  </p>
                </div>
              </Html>
            ))}
          </group>
        );

      case 'lungs':
        return (
          <group ref={meshRef}>
            {/* Poumon droit */}
            <mesh position={[1.5, 0, 0]}>
              <sphereGeometry args={[1.8, 32, 32]} />
              <meshPhysicalMaterial 
                color="#FFB6C1"
                roughness={0.5}
                metalness={0}
                transparent
                opacity={settings.layers.alveoli ? 0.8 : 0}
              />
            </mesh>

            {/* Poumon gauche */}
            <mesh position={[-1.5, 0, 0]}>
              <sphereGeometry args={[1.6, 32, 32]} />
              <meshPhysicalMaterial 
                color="#FFB6C1"
                roughness={0.5}
                metalness={0}
                transparent
                opacity={settings.layers.alveoli ? 0.8 : 0}
              />
            </mesh>

            {/* Trachée */}
            {settings.layers.trachea && (
              <mesh position={[0, 3, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 3, 16]} />
                <meshPhysicalMaterial color="#87CEEB" roughness={0.4} />
              </mesh>
            )}

            {/* Bronches principales */}
            {settings.layers.bronchi && (
              <>
                <mesh position={[1, 1.5, 0]} rotation={[0, 0, -Math.PI / 6]}>
                  <cylinderGeometry args={[0.3, 0.2, 2, 12]} />
                  <meshPhysicalMaterial color="#4682B4" roughness={0.4} />
                </mesh>
                <mesh position={[-1, 1.5, 0]} rotation={[0, 0, Math.PI / 6]}>
                  <cylinderGeometry args={[0.3, 0.2, 2, 12]} />
                  <meshPhysicalMaterial color="#4682B4" roughness={0.4} />
                </mesh>
              </>
            )}

            {/* Diaphragme */}
            {settings.layers.diaphragm && (
              <mesh position={[0, -3, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[3, 3, 0.3, 32]} />
                <meshPhysicalMaterial 
                  color="#CD5C5C" 
                  roughness={0.6}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </group>
        );

      default:
        return null;
    }
  };

  return renderOrgan();
};

// Panneau de contrôle latéral
const ControlPanel = ({ system, settings, onSettingsChange }: any) => {
  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-xl shadow-2xl p-4 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <system.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {system.nameFr}
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {system.description}
        </p>
      </div>

      {/* Layers Control */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Couches Anatomiques
        </h4>
        <div className="space-y-2">
          {system.layers.map((layer) => (
            <div key={layer.id} className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.layers[layer.id]}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    layers: { ...settings.layers, [layer.id]: e.target.checked }
                  })}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {layer.name}
                </span>
              </label>
              <div className="flex items-center space-x-1">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: layer.color }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={layer.opacity * 100}
                  onChange={(e) => {
                    const newLayers = [...system.layers];
                    const index = newLayers.findIndex(l => l.id === layer.id);
                    newLayers[index].opacity = parseInt(e.target.value) / 100;
                    onSettingsChange({ ...settings });
                  }}
                  className="w-16 h-1"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Display Options */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Options d'Affichage
        </h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.showAnnotations}
              onChange={(e) => onSettingsChange({ ...settings, showAnnotations: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Afficher les annotations
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.showWireframe}
              onChange={(e) => onSettingsChange({ ...settings, showWireframe: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Mode filaire
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.autoRotate}
              onChange={(e) => onSettingsChange({ ...settings, autoRotate: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Rotation automatique
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.animate}
              onChange={(e) => onSettingsChange({ ...settings, animate: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Animations physiologiques
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.showGrid}
              onChange={(e) => onSettingsChange({ ...settings, showGrid: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Afficher la grille
            </span>
          </label>
        </div>
      </div>

      {/* Animations */}
      {system.animations && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Animations
          </h4>
          <div className="space-y-2">
            {system.animations.map((animation) => (
              <button
                key={animation}
                className="w-full px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              >
                <Play className="w-4 h-4 inline mr-2" />
                {animation.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="space-y-2">
        <button className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <Download className="w-4 h-4 inline mr-2" />
          Exporter le modèle
        </button>
        <button className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <Share2 className="w-4 h-4 inline mr-2" />
          Partager
        </button>
      </div>
    </div>
  );
};

// Composant principal
export function ProfessionalMedical3D() {
  const [selectedSystem, setSelectedSystem] = useState(organSystems[0]);
  const [settings, setSettings] = useState({
    layers: Object.fromEntries(selectedSystem.layers.map(l => [l.id, true])),
    showAnnotations: true,
    showWireframe: false,
    autoRotate: false,
    animate: true,
    showGrid: true,
    cameraPosition: [0, 0, 10],
    lightIntensity: 1
  });

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
      {/* Top Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-full shadow-xl px-6 py-3">
          <div className="flex items-center space-x-4">
            {organSystems.map((system) => (
              <button
                key={system.id}
                onClick={() => {
                  setSelectedSystem(system);
                  setSettings({
                    ...settings,
                    layers: Object.fromEntries(system.layers.map(l => [l.id, true]))
                  });
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                  selectedSystem.id === system.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <system.icon className="w-5 h-5" />
                <span className="font-medium">{system.nameFr}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: settings.cameraPosition as [number, number, number], fov: 50 }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.3}
          penumbra={1}
          intensity={settings.lightIntensity}
          castShadow
        />
        <directionalLight position={[-10, -10, -10]} intensity={0.4} />

        {/* Environment */}
        <Environment preset="studio" />
        
        {/* Grid */}
        {settings.showGrid && (
          <Grid
            infiniteGrid
            fadeDistance={50}
            fadeStrength={5}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#6B7280"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#9B59B6"
          />
        )}

        {/* Model */}
        <AnatomicalModel system={selectedSystem} settings={settings} />

        {/* Controls */}
        <OrbitControls 
          enablePan
          enableZoom
          enableRotate
          maxDistance={20}
          minDistance={2}
        />

        {/* Gizmo */}
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="white" />
        </GizmoHelper>
      </Canvas>

      {/* Control Panel */}
      <ControlPanel 
        system={selectedSystem}
        settings={settings}
        onSettingsChange={setSettings}
      />

      {/* Info Panel */}
      <div className="absolute bottom-4 right-4 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-xl shadow-2xl p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Info className="w-5 h-5 text-blue-500" />
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Informations Médicales
          </h4>
        </div>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>Système:</strong> {selectedSystem.nameFr}
          </p>
          <p>
            <strong>Catégorie:</strong> {selectedSystem.category}
          </p>
          <p className="text-xs">
            💡 <strong>Astuce:</strong> Utilisez la souris pour tourner, zoomer et déplacer le modèle. 
            Activez les différentes couches pour explorer l'anatomie en détail.
          </p>
        </div>
      </div>

      {/* Stats (Development) */}
      {process.env.NODE_ENV === 'development' && <Stats />}
    </div>
  );
}

export default ProfessionalMedical3D;