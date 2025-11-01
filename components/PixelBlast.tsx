import React, { useEffect, useState, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  velocityX: number;
  velocityY: number;
  opacity: number;
  pulseOffset: number;
}

const PixelBlast: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationFrameRef = useRef<number>();

  // Initialize particles on mount
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Create initial particles
  useEffect(() => {
    if (dimensions.width === 0) return;

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    const particleCount = 50; // Total number of particles
    
    const initialParticles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      initialParticles.push({
        id: Math.random(),
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocityX: (Math.random() - 0.5) * 0.3,
        velocityY: (Math.random() - 0.5) * 0.3,
        opacity: 0.3 + Math.random() * 0.4,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }
    
    setParticles(initialParticles);
  }, [dimensions.width, dimensions.height]);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;

    let time = 0;
    const animate = () => {
      time += 0.02;
      
      setParticles((prev) =>
        prev.map((particle) => {
          let newX = particle.x + particle.velocityX;
          let newY = particle.y + particle.velocityY;

          // Wrap around edges
          if (newX < 0) newX = dimensions.width;
          if (newX > dimensions.width) newX = 0;
          if (newY < 0) newY = dimensions.height;
          if (newY > dimensions.height) newY = 0;

          return {
            ...particle,
            x: newX,
            y: newY,
          };
        })
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particles.length, dimensions.width, dimensions.height]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle-glow"
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: '50%',
            opacity: particle.opacity,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 ${particle.size * 3}px ${particle.color}, 0 0 ${particle.size * 6}px ${particle.color}`,
            animation: `particlePulse 3s ease-in-out infinite`,
            animationDelay: `${particle.pulseOffset}s`,
          }}
        />
      ))}
    </div>
  );
};

export default PixelBlast;

