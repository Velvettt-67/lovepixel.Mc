import React, { useRef, useState, useCallback } from 'react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
  size?: number;
  enableTilt?: boolean;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(244, 114, 182, 0.14)',
  borderColor = 'rgba(232, 168, 184, 0.35)',
  size = 400,
  enableTilt = true,
  ...props
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const [opacity, setOpacity] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(pointer: coarse)').matches
    );
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!divRef.current) return;
      const rect = divRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setPosition({ x, y });

      if (enableTilt && !isReducedMotion) {
        // Subtle 3D tilt clamped to max ~2.5 degrees
        const nx = x / rect.width - 0.5;
        const ny = y / rect.height - 0.5;
        setTilt({
          rx: -ny * 3.5,
          ry: nx * 3.5,
        });
      }
    },
    [enableTilt, isReducedMotion]
  );

  const handleMouseEnter = useCallback(() => {
    setOpacity(1);
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOpacity(0);
    setIsHovered(false);
    setTilt({ rx: 0, ry: 0 });
  }, []);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform:
          enableTilt && !isReducedMotion
            ? `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translate3d(0, ${isHovered ? -3 : 0}px, 0)`
            : undefined,
        transition: isHovered
          ? 'transform 0.12s ease-out, box-shadow 0.3s ease-out'
          : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease-out',
      }}
      className={`relative overflow-hidden rounded-3xl will-change-transform ${className}`}
      {...props}
    >
      {/* 1. Dynamic Cursor-Tracking Radial Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-500 ease-out z-10"
        style={{
          opacity,
          background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* 2. Cursor-Tracking Border Glint Highlight */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500 ease-out z-10"
        style={{
          opacity,
          padding: '1px',
          background: `radial-gradient(${size * 0.75}px circle at ${position.x}px ${position.y}px, ${borderColor}, transparent 65%)`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
        }}
        aria-hidden="true"
      />

      {/* 3. Card Inner Content */}
      <div className="relative z-0 h-full">{children}</div>
    </div>
  );
};
