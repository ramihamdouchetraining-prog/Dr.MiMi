import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Torus } from '@react-three/drei';
import * as THREE from 'three';

interface Brain3DProps {
  rotation?: boolean;
  cutView?: boolean;
  animation?: boolean;
  scale?: number;
}

export const Brain3D: React.FC<Brain3DProps> = ({ 
  rotation = true, 
  cutView = false, 
  animation = true,
  scale = 1 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const neuronsRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      if (rotation) {
        groupRef.current.rotation.y += 0.003;
      }
      
      if (animation && neuronsRef.current) {
        neuronsRef.current.rotation.x += 0.001;
        neuronsRef.current.rotation.y += 0.002;
      }
    }
  });

  // Création des particules pour simuler les neurones
  const particleCount = 500;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 3;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
  }

  const brainMaterial = (
    <meshStandardMaterial
      color="#FFB6C1"
      roughness={0.5}
      metalness={0.1}
      side={cutView ? THREE.DoubleSide : THREE.FrontSide}
    />
  );

  const cerebellumMaterial = (
    <meshStandardMaterial
      color="#FFD1DC"
      roughness={0.6}
      metalness={0.1}
    />
  );

  return (
    <group ref={groupRef} scale={scale}>
      {/* Hémisphère gauche */}
      <group position={[-0.4, 0, 0]}>
        <Sphere args={[1, 32, 32]} scale={[1, 0.9, 1.1]}>
          {brainMaterial}
        </Sphere>
        
        {/* Circonvolutions */}
        {[...Array(8)].map((_, i) => (
          <Torus
            key={`left-${i}`}
            args={[0.15, 0.05, 8, 16]}
            position={[
              Math.sin((i * Math.PI) / 4) * 0.8,
              Math.cos((i * Math.PI) / 4) * 0.8,
              0
            ]}
            rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
          >
            {brainMaterial}
          </Torus>
        ))}
      </group>
      
      {/* Hémisphère droit */}
      <group position={[0.4, 0, 0]}>
        <Sphere args={[1, 32, 32]} scale={[1, 0.9, 1.1]}>
          {brainMaterial}
        </Sphere>
        
        {/* Circonvolutions */}
        {[...Array(8)].map((_, i) => (
          <Torus
            key={`right-${i}`}
            args={[0.15, 0.05, 8, 16]}
            position={[
              Math.sin((i * Math.PI) / 4) * 0.8,
              Math.cos((i * Math.PI) / 4) * 0.8,
              0
            ]}
            rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
          >
            {brainMaterial}
          </Torus>
        ))}
      </group>
      
      {/* Corps calleux */}
      <Box args={[0.3, 0.2, 1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#FFF0F5" roughness={0.7} />
      </Box>
      
      {/* Cervelet */}
      <Sphere args={[0.5, 24, 24]} position={[0, -1, -0.5]} scale={[1.2, 0.8, 0.6]}>
        {cerebellumMaterial}
      </Sphere>
      
      {/* Tronc cérébral */}
      <Box args={[0.3, 0.8, 0.3]} position={[0, -1.5, 0]}>
        <meshStandardMaterial color="#F5DEB3" roughness={0.6} />
      </Box>
      
      {/* Activité neuronale - points lumineux */}
      {animation && (
        <points ref={neuronsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={positions.length / 3}
              array={positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.02}
            color="#00FFFF"
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
      
      {/* Vue en coupe */}
      {cutView && (
        <>
          {/* Plan de coupe */}
          <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[4, 4]} />
            <meshBasicMaterial 
              color="#ffffff" 
              opacity={0.1} 
              transparent={true} 
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Structures internes */}
          <group>
            {/* Ventricules */}
            <Box args={[0.3, 0.4, 0.2]} position={[0, 0.2, 0]}>
              <meshStandardMaterial color="#87CEEB" opacity={0.7} transparent />
            </Box>
            
            {/* Hippocampe */}
            <Torus args={[0.2, 0.05, 8, 16]} position={[-0.3, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color="#DDA0DD" />
            </Torus>
            
            {/* Amygdale */}
            <Sphere args={[0.15, 16, 16]} position={[0.3, -0.3, 0]}>
              <meshStandardMaterial color="#DA70D6" />
            </Sphere>
            
            {/* Thalamus */}
            <Sphere args={[0.2, 16, 16]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#D8BFD8" />
            </Sphere>
          </group>
        </>
      )}
    </group>
  );
};