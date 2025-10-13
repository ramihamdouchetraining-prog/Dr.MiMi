import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Grid, 
  Environment,
  Text,
  Box,
  Sphere,
  Cylinder,
  Torus,
  Html,
  useGLTF,
  Stage
} from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Info,
  Layers,
  Eye,
  EyeOff,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

// Anatomical model types
type ModelType = 'heart' | 'brain' | 'skeleton' | 'lungs' | 'liver' | 'kidney' | 'dna';

interface AnatomicalLayer {
  id: string;
  name: string;
  visible: boolean;
  color: string;
  opacity: number;
}

interface ModelInfo {
  name: string;
  description: string;
  systems: string[];
  pathology?: string[];
}

// Model information database
const modelDatabase: Record<ModelType, ModelInfo> = {
  heart: {
    name: "Cœur Humain",
    description: "Modèle anatomique détaillé du cœur avec les 4 cavités, valves et vaisseaux principaux",
    systems: ["Cardiovasculaire"],
    pathology: ["Infarctus", "Insuffisance cardiaque", "Arythmie"]
  },
  brain: {
    name: "Cerveau Humain",
    description: "Modèle du système nerveux central avec lobes, circonvolutions et structures profondes",
    systems: ["Nerveux"],
    pathology: ["AVC", "Épilepsie", "Alzheimer", "Parkinson"]
  },
  skeleton: {
    name: "Squelette Complet",
    description: "Système squelettique complet avec 206 os",
    systems: ["Musculo-squelettique"],
    pathology: ["Fractures", "Ostéoporose", "Arthrite"]
  },
  lungs: {
    name: "Poumons",
    description: "Système respiratoire avec bronches, alvéoles et vascularisation",
    systems: ["Respiratoire"],
    pathology: ["Pneumonie", "Asthme", "BPCO", "Cancer"]
  },
  liver: {
    name: "Foie",
    description: "Organe hépatique avec lobes et vascularisation",
    systems: ["Digestif"],
    pathology: ["Cirrhose", "Hépatite", "Stéatose"]
  },
  kidney: {
    name: "Reins",
    description: "Système rénal bilatéral avec néphrons",
    systems: ["Urinaire"],
    pathology: ["Insuffisance rénale", "Calculs", "Néphrite"]
  },
  dna: {
    name: "ADN Double Hélice",
    description: "Structure moléculaire de l'ADN avec paires de bases",
    systems: ["Génétique"],
    pathology: ["Mutations", "Anomalies chromosomiques"]
  }
};

// Procedural Heart Model Component
const HeartModel: React.FC<{ layers: AnatomicalLayer[] }> = ({ layers }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Simulate heartbeat
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const getLayerProps = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    return {
      visible: layer?.visible ?? true,
      opacity: layer?.opacity ?? 1,
      color: layer?.color ?? '#ff0000'
    };
  };

  return (
    <group ref={meshRef}>
      {/* Ventricles */}
      <mesh position={[0, -0.5, 0]} {...getLayerProps('ventricles')}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshPhysicalMaterial 
          color="#cc0000" 
          roughness={0.3}
          metalness={0.1}
          transparent
        />
      </mesh>
      
      {/* Atria */}
      <mesh position={[0, 0.8, 0]} {...getLayerProps('atria')}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshPhysicalMaterial 
          color="#ff4444"
          roughness={0.3}
          metalness={0.1}
          transparent
        />
      </mesh>
      
      {/* Aorta */}
      <mesh position={[0.5, 1.2, 0]} rotation={[0, 0, Math.PI / 4]} {...getLayerProps('aorta')}>
        <cylinderGeometry args={[0.2, 0.25, 2, 16]} />
        <meshPhysicalMaterial 
          color="#ff6666"
          roughness={0.4}
          metalness={0.1}
          transparent
        />
      </mesh>
      
      {/* Pulmonary Artery */}
      <mesh position={[-0.5, 1.2, 0]} rotation={[0, 0, -Math.PI / 4]} {...getLayerProps('pulmonary')}>
        <cylinderGeometry args={[0.18, 0.22, 1.8, 16]} />
        <meshPhysicalMaterial 
          color="#6666ff"
          roughness={0.4}
          metalness={0.1}
          transparent
        />
      </mesh>
    </group>
  );
};

// Procedural Brain Model Component
const BrainModel: React.FC<{ layers: AnatomicalLayer[] }> = ({ layers }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const getLayerProps = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    return {
      visible: layer?.visible ?? true,
      opacity: layer?.opacity ?? 1,
      color: layer?.color ?? '#ffaaaa'
    };
  };

  return (
    <group ref={meshRef}>
      {/* Cerebrum */}
      <mesh {...getLayerProps('cerebrum')}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshPhysicalMaterial 
          color="#ffaaaa"
          roughness={0.8}
          metalness={0}
          bumpScale={0.05}
          transparent
        />
      </mesh>
      
      {/* Cerebellum */}
      <mesh position={[0, -0.8, -0.8]} {...getLayerProps('cerebellum')}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshPhysicalMaterial 
          color="#ff8888"
          roughness={0.7}
          metalness={0}
          transparent
        />
      </mesh>
      
      {/* Brain Stem */}
      <mesh position={[0, -1.2, -0.3]} {...getLayerProps('brainstem')}>
        <cylinderGeometry args={[0.3, 0.4, 1, 16]} />
        <meshPhysicalMaterial 
          color="#cc7777"
          roughness={0.6}
          metalness={0}
          transparent
        />
      </mesh>
    </group>
  );
};

// DNA Model Component
const DNAModel: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const helixPoints: THREE.Vector3[] = [];
  for (let i = 0; i < 100; i++) {
    const angle = i * 0.2;
    helixPoints.push(new THREE.Vector3(
      Math.cos(angle) * 0.5,
      i * 0.05 - 2.5,
      Math.sin(angle) * 0.5
    ));
  }

  return (
    <group ref={groupRef}>
      {/* First Helix Strand */}
      {helixPoints.map((point, i) => (
        <Sphere key={`strand1-${i}`} position={point} args={[0.08, 8, 8]}>
          <meshPhysicalMaterial color="#0066ff" metalness={0.5} roughness={0.2} />
        </Sphere>
      ))}
      
      {/* Second Helix Strand */}
      {helixPoints.map((point, i) => (
        <Sphere 
          key={`strand2-${i}`} 
          position={[point.x * -1, point.y, point.z * -1]} 
          args={[0.08, 8, 8]}
        >
          <meshPhysicalMaterial color="#ff6600" metalness={0.5} roughness={0.2} />
        </Sphere>
      ))}
      
      {/* Base Pairs */}
      {helixPoints.filter((_, i) => i % 5 === 0).map((point, i) => (
        <Cylinder
          key={`base-${i}`}
          position={[0, point.y, 0]}
          rotation={[0, i * 0.5, Math.PI / 2]}
          args={[0.03, 0.03, 1, 8]}
        >
          <meshPhysicalMaterial color="#00ff00" metalness={0.3} roughness={0.4} />
        </Cylinder>
      ))}
    </group>
  );
};

// Main Medical 3D Viewer Component
export const Medical3DViewer: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<ModelType>('heart');
  const [isRotating, setIsRotating] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [layers, setLayers] = useState<AnatomicalLayer[]>([
    { id: 'ventricles', name: 'Ventricules', visible: true, color: '#cc0000', opacity: 1 },
    { id: 'atria', name: 'Oreillettes', visible: true, color: '#ff4444', opacity: 1 },
    { id: 'aorta', name: 'Aorte', visible: true, color: '#ff6666', opacity: 1 },
    { id: 'pulmonary', name: 'Artère Pulmonaire', visible: true, color: '#6666ff', opacity: 1 },
    { id: 'cerebrum', name: 'Cerveau', visible: true, color: '#ffaaaa', opacity: 1 },
    { id: 'cerebellum', name: 'Cervelet', visible: true, color: '#ff8888', opacity: 1 },
    { id: 'brainstem', name: 'Tronc Cérébral', visible: true, color: '#cc7777', opacity: 1 }
  ]);

  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const renderModel = () => {
    switch (selectedModel) {
      case 'heart':
        return <HeartModel layers={layers} />;
      case 'brain':
        return <BrainModel layers={layers} />;
      case 'dna':
        return <DNAModel />;
      default:
        // Placeholder for other models
        return (
          <Box args={[2, 2, 2]}>
            <meshPhysicalMaterial color="#888888" roughness={0.5} metalness={0.3} />
          </Box>
        );
    }
  };

  const currentModelInfo = modelDatabase[selectedModel];

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Sidebar - Model Selection */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
        <h3 className="text-white font-bold text-lg mb-4">Modèles Anatomiques</h3>
        
        <div className="space-y-2">
          {Object.entries(modelDatabase).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setSelectedModel(key as ModelType)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedModel === key 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="font-medium">{info.name}</div>
              <div className="text-xs opacity-75">{info.systems.join(', ')}</div>
            </button>
          ))}
        </div>

        {/* Layer Controls */}
        <div className="mt-6">
          <h4 className="text-white font-medium mb-3 flex items-center">
            <Layers size={16} className="mr-2" />
            Couches Anatomiques
          </h4>
          
          <div className="space-y-1">
            {layers
              .filter(layer => 
                (selectedModel === 'heart' && ['ventricles', 'atria', 'aorta', 'pulmonary'].includes(layer.id)) ||
                (selectedModel === 'brain' && ['cerebrum', 'cerebellum', 'brainstem'].includes(layer.id))
              )
              .map(layer => (
                <div key={layer.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                  <span className="text-gray-300 text-sm">{layer.name}</span>
                  <button
                    onClick={() => toggleLayer(layer.id)}
                    className="p-1 hover:bg-gray-600 rounded"
                  >
                    {layer.visible ? (
                      <Eye size={16} className="text-green-400" />
                    ) : (
                      <EyeOff size={16} className="text-gray-400" />
                    )}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Main 3D Viewer */}
      <div className="flex-1 relative">
        <Canvas>
          <PerspectiveCamera makeDefault position={[5, 5, 5]} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={isRotating}
            autoRotateSpeed={1}
          />
          
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          
          {showGrid && <Grid args={[20, 20]} cellColor="#444444" sectionColor="#666666" />}
          
          <Suspense fallback={
            <Html center>
              <div className="text-white">Chargement du modèle...</div>
            </Html>
          }>
            {renderModel()}
          </Suspense>
          
          <Environment preset="studio" />
        </Canvas>

        {/* Controls Overlay */}
        <div className="absolute top-4 right-4 space-y-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-700"
            title={isRotating ? "Arrêter rotation" : "Démarrer rotation"}
          >
            {isRotating ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <button
            onClick={() => setShowGrid(!showGrid)}
            className="bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-700"
            title="Afficher/Masquer grille"
          >
            <Grid size={20} />
          </button>
          
          <button
            onClick={() => setShowLabels(!showLabels)}
            className="bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-700"
            title="Afficher/Masquer labels"
          >
            <Info size={20} />
          </button>
        </div>

        {/* Model Information Panel */}
        <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-90 rounded-lg p-4 max-w-md">
          <h3 className="text-white font-bold text-lg mb-2">{currentModelInfo.name}</h3>
          <p className="text-gray-300 text-sm mb-3">{currentModelInfo.description}</p>
          
          {currentModelInfo.pathology && (
            <div>
              <h4 className="text-gray-400 text-xs font-medium mb-1">Pathologies associées:</h4>
              <div className="flex flex-wrap gap-1">
                {currentModelInfo.pathology.map(path => (
                  <span key={path} className="bg-red-600 bg-opacity-20 text-red-400 text-xs px-2 py-1 rounded">
                    {path}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="absolute top-1/2 -translate-y-1/2 left-4">
          <button
            onClick={() => {
              const models = Object.keys(modelDatabase) as ModelType[];
              const currentIndex = models.indexOf(selectedModel);
              const prevIndex = currentIndex === 0 ? models.length - 1 : currentIndex - 1;
              setSelectedModel(models[prevIndex]);
            }}
            className="bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-700"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
        
        <div className="absolute top-1/2 -translate-y-1/2 right-4">
          <button
            onClick={() => {
              const models = Object.keys(modelDatabase) as ModelType[];
              const currentIndex = models.indexOf(selectedModel);
              const nextIndex = (currentIndex + 1) % models.length;
              setSelectedModel(models[nextIndex]);
            }}
            className="bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-700"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};