import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Torus, Box } from '@react-three/drei';
import * as THREE from 'three';

interface Cell3DProps {
  rotation?: boolean;
  cutView?: boolean;
  animation?: boolean;
  scale?: number;
}

export const Cell3D: React.FC<Cell3DProps> = ({ 
  rotation = true, 
  cutView = false, 
  animation = true,
  scale = 1 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const nucleusRef = useRef<THREE.Mesh>(null);
  const mitochondriaRefs = useRef<THREE.Group[]>([]);
  
  useFrame((state) => {
    if (groupRef.current) {
      if (rotation) {
        groupRef.current.rotation.y += 0.004;
        groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      }
      
      if (animation) {
        // Animation du noyau
        if (nucleusRef.current) {
          nucleusRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
        }
        
        // Animation des mitochondries
        mitochondriaRefs.current.forEach((ref, i) => {
          if (ref) {
            ref.position.x = Math.sin(state.clock.elapsedTime + i) * 0.1;
            ref.position.y = Math.cos(state.clock.elapsedTime + i) * 0.1;
          }
        });
      }
    }
  });

  // Créer les positions des organites
  const organellePositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 0.6 + Math.random() * 0.3;
      positions.push({
        x: Math.cos(angle) * radius,
        y: (Math.random() - 0.5) * 0.5,
        z: Math.sin(angle) * radius
      });
    }
    return positions;
  }, []);

  return (
    <group ref={groupRef} scale={scale}>
      {/* Membrane cellulaire */}
      <Sphere args={[1.5, 32, 32]}>
        <meshStandardMaterial
          color="#87CEEB"
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={cutView ? 0.3 : 0.7}
          side={cutView ? THREE.DoubleSide : THREE.FrontSide}
        />
      </Sphere>
      
      {/* Double membrane phospholipidique */}
      <Sphere args={[1.48, 32, 32]}>
        <meshStandardMaterial
          color="#4682B4"
          roughness={0.4}
          transparent
          opacity={0.3}
        />
      </Sphere>
      
      {/* Cytoplasme */}
      <Sphere args={[1.45, 32, 32]}>
        <meshStandardMaterial
          color="#E0FFFF"
          roughness={0.5}
          transparent
          opacity={0.2}
        />
      </Sphere>
      
      {/* Noyau */}
      <Sphere ref={nucleusRef} args={[0.5, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#8B4513"
          roughness={0.3}
          metalness={0.2}
          emissive="#8B4513"
          emissiveIntensity={0.1}
        />
      </Sphere>
      
      {/* Nucléole */}
      <Sphere args={[0.2, 16, 16]} position={[0.1, 0, 0]}>
        <meshStandardMaterial
          color="#654321"
          roughness={0.4}
        />
      </Sphere>
      
      {/* Mitochondries */}
      {organellePositions.slice(0, 5).map((pos, i) => (
        <group 
          key={`mito-${i}`} 
          position={[pos.x, pos.y, pos.z]}
          ref={(el) => { if (el) mitochondriaRefs.current[i] = el; }}
        >
          <Sphere args={[0.15, 16, 16]} scale={[2, 1, 1]}>
            <meshStandardMaterial
              color="#FF6347"
              roughness={0.4}
              metalness={0.1}
            />
          </Sphere>
          {/* Crêtes mitochondriales */}
          {[...Array(3)].map((_, j) => (
            <Torus
              key={j}
              args={[0.08, 0.02, 8, 16]}
              position={[(j - 1) * 0.08, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
            >
              <meshStandardMaterial color="#DC143C" />
            </Torus>
          ))}
        </group>
      ))}
      
      {/* Réticulum endoplasmique */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 0.7;
        return (
          <Torus
            key={`er-${i}`}
            args={[0.3, 0.03, 8, 32]}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle) * 0.3,
              Math.sin(angle) * radius
            ]}
            rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
          >
            <meshStandardMaterial
              color="#9370DB"
              roughness={0.5}
              metalness={0.1}
            />
          </Torus>
        );
      })}
      
      {/* Ribosomes (points sur le RE) */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={50}
            array={new Float32Array(
              Array.from({ length: 150 }, () => (Math.random() - 0.5) * 2.5)
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#8B008B"
        />
      </points>
      
      {/* Appareil de Golgi */}
      <group position={[0.5, 0.3, 0.5]}>
        {[...Array(4)].map((_, i) => (
          <Box
            key={`golgi-${i}`}
            args={[0.3 - i * 0.05, 0.02, 0.2 - i * 0.03]}
            position={[0, i * 0.05, 0]}
          >
            <meshStandardMaterial
              color="#FFD700"
              roughness={0.3}
              metalness={0.2}
            />
          </Box>
        ))}
      </group>
      
      {/* Lysosomes */}
      {organellePositions.slice(5, 8).map((pos, i) => (
        <Sphere
          key={`lyso-${i}`}
          args={[0.1, 16, 16]}
          position={[pos.x * 0.8, pos.y, pos.z * 0.8]}
        >
          <meshStandardMaterial
            color="#32CD32"
            roughness={0.4}
            emissive="#32CD32"
            emissiveIntensity={0.2}
          />
        </Sphere>
      ))}
      
      {/* Peroxysomes */}
      {[...Array(3)].map((_, i) => (
        <Sphere
          key={`pero-${i}`}
          args={[0.08, 12, 12]}
          position={[
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
          ]}
        >
          <meshStandardMaterial
            color="#00CED1"
            roughness={0.5}
          />
        </Sphere>
      ))}
      
      {/* Cytosquelette (microtubules) */}
      {[...Array(8)].map((_, i) => {
        const startAngle = (i / 8) * Math.PI * 2;
        return (
          <Cylinder
            key={`cyto-${i}`}
            args={[0.01, 0.01, 2, 4]}
            position={[
              Math.cos(startAngle) * 0.5,
              0,
              Math.sin(startAngle) * 0.5
            ]}
            rotation={[
              Math.random() * Math.PI,
              Math.random() * Math.PI,
              0
            ]}
          >
            <meshStandardMaterial
              color="#F0E68C"
              opacity={0.5}
              transparent
            />
          </Cylinder>
        );
      })}
      
      {/* Vue en coupe - plan de section */}
      {cutView && (
        <>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[4, 4]} />
            <meshBasicMaterial 
              color="#ffffff" 
              opacity={0.1} 
              transparent={true} 
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Détails internes supplémentaires visibles en coupe */}
          <group>
            {/* Pores nucléaires */}
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              return (
                <Torus
                  key={`pore-${i}`}
                  args={[0.03, 0.01, 4, 8]}
                  position={[
                    Math.cos(angle) * 0.5,
                    Math.sin(angle) * 0.5,
                    0
                  ]}
                >
                  <meshStandardMaterial color="#8B4513" />
                </Torus>
              );
            })}
            
            {/* Chromatine dans le noyau */}
            <points position={[0, 0, 0]}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={30}
                  array={new Float32Array(
                    Array.from({ length: 90 }, () => (Math.random() - 0.5) * 0.8)
                  )}
                  itemSize={3}
                />
              </bufferGeometry>
              <pointsMaterial
                size={0.02}
                color="#4B0082"
              />
            </points>
          </group>
        </>
      )}
    </group>
  );
};

// Import manquant pour Cylinder
import { Cylinder } from '@react-three/drei';