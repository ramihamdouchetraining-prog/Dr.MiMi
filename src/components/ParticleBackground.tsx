import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  type: 'cell' | 'dna' | 'molecule' | 'heart' | 'star' | 'sparkle';
}

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles with Premium XXL Palette
    const colors = [
      '#0EA5E9', // Primary
      '#6366F1', // Secondary
      '#F59E0B', // Accent
      '#FF69B4', // Pink
      '#A78BFA', // Purple
      '#34D399', // Green
    ];
    const types: Particle['type'][] = ['cell', 'dna', 'molecule', 'heart', 'star', 'sparkle'];

    for (let i = 0; i < 60; i++) { // Increased particle count
      particlesRef.current.push({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8, // Slightly faster
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: types[Math.floor(Math.random() * types.length)]
      });
    }

    const drawParticle = (particle: Particle) => {
      ctx.save();
      ctx.globalAlpha = 0.6;

      switch (particle.type) {
        case 'cell':
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = 1;
          ctx.stroke();
          break;

        case 'dna':
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let i = 0; i < 20; i++) {
            const x = particle.x + i * 2;
            const y = particle.y + Math.sin(i * 0.5) * 10;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          break;

        case 'molecule':
          // Draw simple molecule structure
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(particle.x + 10, particle.y + 5, particle.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = particle.color;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x + 10, particle.y + 5);
          ctx.stroke();
          break;

        case 'heart': {
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          const x = particle.x;
          const y = particle.y;
          ctx.moveTo(x, y + 3);
          ctx.bezierCurveTo(x, y, x - 5, y, x - 5, y + 3);
          ctx.bezierCurveTo(x - 5, y + 6, x, y + 10, x, y + 10);
          ctx.bezierCurveTo(x, y + 10, x + 5, y + 6, x + 5, y + 3);
          ctx.bezierCurveTo(x + 5, y, x, y, x, y + 3);
          ctx.fill();
          break;
        }

        case 'star':
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const xPos = particle.x + Math.cos(angle) * particle.size;
            const yPos = particle.y + Math.sin(angle) * particle.size;
            if (i === 0) ctx.moveTo(xPos, yPos);
            else ctx.lineTo(xPos, yPos);
          }
          ctx.closePath();
          ctx.fill();
          break;
      }

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off walls
        if (particle.x <= 0 || particle.x >= canvas.width) particle.vx *= -1;
        if (particle.y <= 0 || particle.y >= canvas.height) particle.vy *= -1;

        drawParticle(particle);
      });

      // Draw connections between nearby particles
      ctx.strokeStyle = 'rgba(255, 182, 193, 0.1)';
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const dx = particlesRef.current[i].x - particlesRef.current[j].x;
          const dy = particlesRef.current[i].y - particlesRef.current[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
            ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.3 }}
    />
  );
};

// Floating medical icons
export const FloatingMedicalIcons: React.FC = () => {
  const icons = ['🧬', '💊', '🩺', '🧪', '🫀', '🧠', '🦷', '💉', '🔬', '🩹'];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {icons.map((icon, index) => (
        <motion.div
          key={index}
          className="absolute text-4xl"
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 100
          }}
          animate={{
            y: -100,
            x: Math.random() * window.innerWidth
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear"
          }}
          style={{
            left: `${Math.random() * 100}%`,
            opacity: 0.2
          }}
        >
          {icon}
        </motion.div>
      ))}
    </div>
  );
};