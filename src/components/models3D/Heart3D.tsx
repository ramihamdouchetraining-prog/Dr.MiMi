import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Torus, Cone } from '@react-three/drei';
import * as THREE from 'three';

interface Heart3DProps {
  rotation?: boolean;
  cutView?: boolean;
  animation?: boolean;
  scale?: number;
}

export const Heart3D: React.FC<Heart3DProps> = ({ 
  rotation = true, 
  cutView = false, 
  animation = true,
  scale = 1 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [beatScale, setBeatScale] = useState(1);
  
  // Animation du battement du cœur
  useFrame((state) => {
    if (groupRef.current) {
      if (rotation) {
        groupRef.current.rotation.y += 0.005;
      }
      
      if (animation) {
        const beat = Math.sin(state.clock.elapsedTime * 3) * 0.05 + 1;
        setBeatScale(beat);
        groupRef.current.scale.setScalar(scale * beat);
      }
    }
  });

  // Matériaux réalistes
  const heartMaterial = (
    <meshStandardMaterial
      color="#E74C3C"
      roughness={0.3}
      metalness={0.1}
      side={cutView ? THREE.DoubleSide : THREE.FrontSide}
    />
  );

  const veinMaterial = (
    <meshStandardMaterial
      color="#3498DB"
      roughness={0.4}
      metalness={0.1}
    />
  );

  const arteryMaterial = (
    <meshStandardMaterial
      color="#C0392B"
      roughness={0.4}
      metalness={0.1}
    />
  );

  return (
    <group ref={groupRef} scale={scale}>
      {/* Ventricule gauche */}
      <Sphere args={[1.2, 32, 32]} position={[-0.3, 0, 0]}>
        {heartMaterial}
      </Sphere>
      
      {/* Ventricule droit */}
      <Sphere args={[1, 32, 32]} position={[0.3, 0, 0]}>
        {heartMaterial}
      </Sphere>
      
      {/* Oreillette gauche */}
      <Sphere args={[0.8, 32, 32]} position={[-0.4, 1.2, 0]}>
        {heartMaterial}
      </Sphere>
      
      {/* Oreillette droite */}
      <Sphere args={[0.7, 32, 32]} position={[0.4, 1.2, 0]}>
        {heartMaterial}
      </Sphere>
      
      {/* Aorte */}
      <Torus args={[0.4, 0.15, 16, 32]} position={[0, 1.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        {arteryMaterial}
      </Torus>
      
      {/* Artère pulmonaire */}
      <Cone args={[0.2, 1, 16]} position={[-0.8, 1.5, 0]} rotation={[0, 0, -Math.PI / 6]}>
        {arteryMaterial}
      </Cone>
      
      {/* Veine cave supérieure */}
      <Box args={[0.2, 1, 0.2]} position={[0.8, 1.5, 0]}>
        {veinMaterial}
      </Box>
      
      {/* Veine cave inférieure */}
      <Box args={[0.2, 1, 0.2]} position={[0.8, -0.5, 0]}>
        {veinMaterial}
      </Box>
      
      {/* Vue en coupe - plan de coupe */}
      {cutView && (
        <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[4, 4]} />
          <meshBasicMaterial 
            color="#ffffff" 
            opacity={0.1} 
            transparent={true} 
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Détails internes visibles en vue coupe */}
      {cutView && (
        <group>
          {/* Septum */}
          <Box args={[0.1, 2, 1]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#D98880" roughness={0.5} />
          </Box>
          
          {/* Valves */}
          <Sphere args={[0.15, 16, 16]} position={[-0.3, 0.5, 0]}>
            <meshStandardMaterial color="#F8B8B8" />
          </Sphere>
          <Sphere args={[0.15, 16, 16]} position={[0.3, 0.5, 0]}>
            <meshStandardMaterial color="#F8B8B8" />
          </Sphere>
        </group>
      )}
    </group>
  );
};