import React, { useRef, useState, useCallback, useEffect } from 'react';

export type MagneticButtonProps<T extends React.ElementType = 'button'> = {
  as?: T;
  children: React.ReactNode;
  className?: string;
  strength?: number; // Clamped strength (default ~0.22)
  cursorText?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

export const MagneticButton = <T extends React.ElementType = 'button'>({
  as,
  children,
  className = '',
  strength = 0.22,
  cursorText,
  style,
  ...props
}: MagneticButtonProps<T>) => {
  const Component = as || 'button';
  const elementRef = useRef<HTMLElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const prefersReduced = useRef(false);

  useEffect(() => {
    prefersReduced.current =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(pointer: coarse)').matches;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (prefersReduced.current || !elementRef.current) return;
      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Restrained clamp (max 8px displacement for comfortable clicking)
      const rawX = (e.clientX - centerX) * strength;
      const rawY = (e.clientY - centerY) * strength;
      const maxDist = 8;
      const clampedX = Math.max(-maxDist, Math.min(maxDist, rawX));
      const clampedY = Math.max(-maxDist, Math.min(maxDist, rawY));

      setOffset({ x: clampedX, y: clampedY });
    },
    [strength]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setOffset({ x: 0, y: 0 });
  }, []);

  const combinedStyle: React.CSSProperties = {
    ...(style as React.CSSProperties),
    transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
    transition: isHovered
      ? 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)'
      : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  return (
    // @ts-expect-error dynamic component polymorphic ref and props
    <Component
      ref={elementRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={combinedStyle}
      className={`relative inline-flex items-center justify-center will-change-transform ${className}`}
      data-cursor-text={cursorText}
      {...props}
    >
      {/* Inner layer shifts with subtle parallax relative to container */}
      <span
        className="inline-flex items-center justify-center w-full h-full pointer-events-none transition-transform duration-200 ease-out"
        style={{
          transform: `translate3d(${offset.x * 0.4}px, ${offset.y * 0.4}px, 0)`,
        }}
      >
        {children}
      </span>
    </Component>
  );
};

