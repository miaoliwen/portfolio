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
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (!isHovered && e.gamma != null && e.beta != null) {
        const x = Math.min(Math.max(((e.gamma + 90) / 180) * 100, 0), 100);
        const y = Math.min(Math.max(((e.beta + 90) / 180) * 100, 0), 100);
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
        setPosition({ x: 50, y: 50 });
      }}
      className={`glass-panel relative overflow-hidden ${className}`}
    >
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.025] mix-blend-multiply dark:opacity-[0.04] dark:mix-blend-screen"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        className="absolute z-0 pointer-events-none rounded-full"
        aria-hidden="true"
        style={{
          width: '180%',
          height: '180%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, rgba(251,146,60,0.06) 32%, transparent 62%)',
          top: '-40%',
          left: '-40%',
        }}
        animate={{
          x: `${(position.x - 50) / 2}%`,
          y: `${(position.y - 50) / 2}%`,
        }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
      />

      <div className={`relative z-10 w-full h-full ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};
