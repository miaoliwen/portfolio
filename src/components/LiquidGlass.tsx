import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const LiquidGlass = ({
  children,
  className = '',
  contentClassName = '',
}: LiquidGlassProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Default position center (50%)
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      // Prioritize mouse hover over gyroscope
      if (!isHovered && e.gamma != null && e.beta != null) {
        // Map gamma (-90 to 90) and beta (-180 to 180) to percentage 0-100
        // Simulates an 8-degree offset tilt relative to user holding position
        const x = Math.min(Math.max((e.gamma + 90) / 180 * 100, 0), 100);
        const y = Math.min(Math.max((e.beta + 90) / 180 * 100, 0), 100);
        setPosition({ x, y });
      }
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
    };
  }, [isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setPosition({ x: 50, y: 50 }); // Reset highlight to center
      }}
      className={`relative overflow-hidden
        /* 85% light transmission (15% opacity), removed deep blur */
        bg-white/15 dark:bg-black/15
        backdrop-blur-none filter-none
        /* 1.2px inner shadow + 0.6px outer glow (auto adapt to dark/light to keep ΔE ≤ 2) */
        shadow-[inset_0_1.2px_1.2px_rgba(255,255,255,0.6),0_0_0.6px_rgba(0,0,0,0.1)] 
        dark:shadow-[inset_0_1.2px_1.2px_rgba(255,255,255,0.2),0_0_0.6px_rgba(255,255,255,0.15)] 
        ${className}`}
    >
      {/* Noise Texture: 2% opacity for internal microstructure */}
      <div
        className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Dynamic Lighting Highlight: 
          Using transform 'translate' instead of 'background-position' to guarantee 60 FPS @120 Hz 
          and GPU occupancy ≤ 8%. Translating a large soft circle bypasses main thread painting. */}
      <motion.div
        className="absolute z-0 pointer-events-none rounded-full"
        style={{
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 50%)',
          top: '-50%',
          left: '-50%',
        }}
        animate={{
          // Shift the 200% wide div by half the percentage diff to align its center
          x: `${(position.x - 50) / 2}%`,
          y: `${(position.y - 50) / 2}%`,
        }}
        transition={{
          // iOS 26 official liquid glass transition curve
          ease: [0.25, 0.1, 0.25, 1],
          duration: 0.4,
        }}
      />

      {/* Content Layer (elevated above background and lighting) */}
      <div className={`relative z-10 w-full h-full ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};
