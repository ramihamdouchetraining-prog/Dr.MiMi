import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface DNA3DProps {
  rotation?: boolean;
  cutView?: boolean;
  animation?: boolean;
  scale?: number;
}

export const DNA3D: React.FC<DNA3DProps> = ({ 
  rotation = true, 
  cutView = false, 
  animation = true,
  scale = 1 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      if (rotation) {
        groupRef.current.rotation.y += 0.01;
      }
      
      if (animation) {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      }
    }
  });

  // Générer les positions de l'hélice
  const helixPoints = useMemo(() => {
    const points = [];
    const segments = 30;
    const height = 4;
    const radius = 0.8;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 4; // 2 tours complets
      const y = (t - 0.5) * height;
      
      // Première hélice
      points.push({
        x1: Math.cos(angle) * radius,
        z1: Math.sin(angle) * radius,
        // Deuxième hélice (déphasée de 180°)
        x2: Math.cos(angle + Math.PI) * radius,
        z2: Math.sin(angle + Math.PI) * radius,
        y: y,
        angle: angle
      });
    }
    return points;
  }, []);

  // Couleurs des bases azotées
  const baseColors = {
    adenine: '#FF6B6B',    // Rouge
    thymine: '#4ECDC4',    // Cyan
    guanine: '#45B7D1',    // Bleu
    cytosine: '#F7DC6F'    // Jaune
  };

  return (
    <group ref={groupRef} scale={scale}>
      {/* Structure de l'ADN */}
      {helixPoints.map((point, index) => {
        const baseColor = index % 4 === 0 ? baseColors.adenine :
                         index % 4 === 1 ? baseColors.thymine :
                         index % 4 === 2 ? baseColors.guanine :
                         baseColors.cytosine;
        
        return (
          <group key={index}>
            {/* Backbone phosphate-sucre (première hélice) */}
            <Sphere 
              args={[0.12, 8, 8]} 
              position={[point.x1, point.y, point.z1]}
            >
              <meshStandardMaterial 
                color="#808080" 
                roughness={0.3} 
                metalness={0.6}
              />
            </Sphere>
            
            {/* Backbone phosphate-sucre (deuxième hélice) */}
            <Sphere 
              args={[0.12, 8, 8]} 
              position={[point.x2, point.y, point.z2]}
            >
              <meshStandardMaterial 
                color="#808080" 
                roughness={0.3} 
                metalness={0.6}
              />
            </Sphere>
            
            {/* Liaisons entre les backbones */}
            {index < helixPoints.length - 1 && (
              <>
                <Cylinder
                  args={[0.05, 0.05, 
                    Math.sqrt(
                      Math.pow(helixPoints[index + 1].x1 - point.x1, 2) +
                      Math.pow(helixPoints[index + 1].y - point.y, 2) +
                      Math.pow(helixPoints[index + 1].z1 - point.z1, 2)
                    ), 8]}
                  position={[
                    (point.x1 + helixPoints[index + 1].x1) / 2,
                    (point.y + helixPoints[index + 1].y) / 2,
                    (point.z1 + helixPoints[index + 1].z1) / 2
                  ]}
                  rotation={[
                    Math.atan2(helixPoints[index + 1].z1 - point.z1, helixPoints[index + 1].y - point.y),
                    0,
                    Math.atan2(helixPoints[index + 1].x1 - point.x1, helixPoints[index + 1].y - point.y)
                  ]}
                >
                  <meshStandardMaterial color="#A0A0A0" />
                </Cylinder>
                
                <Cylinder
                  args={[0.05, 0.05, 
                    Math.sqrt(
                      Math.pow(helixPoints[index + 1].x2 - point.x2, 2) +
                      Math.pow(helixPoints[index + 1].y - point.y, 2) +
                      Math.pow(helixPoints[index + 1].z2 - point.z2, 2)
                    ), 8]}
                  position={[
                    (point.x2 + helixPoints[index + 1].x2) / 2,
                    (point.y + helixPoints[index + 1].y) / 2,
                    (point.z2 + helixPoints[index + 1].z2) / 2
                  ]}
                  rotation={[
                    Math.atan2(helixPoints[index + 1].z2 - point.z2, helixPoints[index + 1].y - point.y),
                    0,
                    Math.atan2(helixPoints[index + 1].x2 - point.x2, helixPoints[index + 1].y - point.y)
                  ]}
                >
                  <meshStandardMaterial color="#A0A0A0" />
                </Cylinder>
              </>
            )}
            
            {/* Paires de bases (liaisons hydrogène) */}
            {index % 2 === 0 && (
              <>
                {/* Base sur la première hélice */}
                <Sphere 
                  args={[0.15, 8, 8]} 
                  position={[(point.x1 * 0.6), point.y, (point.z1 * 0.6)]}
                >
                  <meshStandardMaterial 
                    color={baseColor} 
                    roughness={0.4}
                    emissive={baseColor}
                    emissiveIntensity={0.2}
                  />
                </Sphere>
                
                {/* Base sur la deuxième hélice */}
                <Sphere 
                  args={[0.15, 8, 8]} 
                  position={[(point.x2 * 0.6), point.y, (point.z2 * 0.6)]}
                >
                  <meshStandardMaterial 
                    color={index % 4 === 0 ? baseColors.thymine :
                           index % 4 === 1 ? baseColors.adenine :
                           index % 4 === 2 ? baseColors.cytosine :
                           baseColors.guanine} 
                    roughness={0.4}
                    emissive={index % 4 === 0 ? baseColors.thymine :
                             index % 4 === 1 ? baseColors.adenine :
                             index % 4 === 2 ? baseColors.cytosine :
                             baseColors.guanine}
                    emissiveIntensity={0.2}
                  />
                </Sphere>
                
                {/* Liaisons hydrogène entre les bases */}
                <Cylinder
                  args={[0.02, 0.02, Math.abs(point.x2 - point.x1) * 0.6, 4]}
                  position={[0, point.y, 0]}
                  rotation={[0, 0, Math.PI / 2]}
                >
                  <meshStandardMaterial 
                    color="#FFFFFF" 
                    opacity={0.5} 
                    transparent
                  />
                </Cylinder>
              </>
            )}
          </group>
        );
      })}
      
      {/* Vue en coupe - afficher les détails moléculaires */}
      {cutView && (
        <group>
          {/* Plan de coupe */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[3, 5]} />
            <meshBasicMaterial 
              color="#00FFFF" 
              opacity={0.1} 
              transparent={true} 
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Annotations des bases */}
          <group position={[1.5, 1, 0]}>
            <Sphere args={[0.2, 8, 8]}>
              <meshStandardMaterial color={baseColors.adenine} />
            </Sphere>
          </group>
          
          <group position={[1.5, 0.5, 0]}>
            <Sphere args={[0.2, 8, 8]}>
              <meshStandardMaterial color={baseColors.thymine} />
            </Sphere>
          </group>
          
          <group position={[1.5, 0, 0]}>
            <Sphere args={[0.2, 8, 8]}>
              <meshStandardMaterial color={baseColors.guanine} />
            </Sphere>
          </group>
          
          <group position={[1.5, -0.5, 0]}>
            <Sphere args={[0.2, 8, 8]}>
              <meshStandardMaterial color={baseColors.cytosine} />
            </Sphere>
          </group>
        </group>
      )}
    </group>
  );
};