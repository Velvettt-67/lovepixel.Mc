import React from 'react';

interface CinematicViewportProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  borderAccent?: boolean;
}

export const CinematicViewport: React.FC<CinematicViewportProps> = ({
  children,
  className = '',
  glow = true,
  borderAccent = true,
}) => {
  return (
    <div className={`relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 sm:my-16 ${className}`}>
      {/* Outer ambient glow halo */}
      {glow && (
        <div
          className="absolute -inset-1 sm:-inset-2 rounded-[32px] sm:rounded-[36px] bg-gradient-to-r from-[#e8a8b8]/20 via-[#f8e5eb]/30 to-[#d3738b]/20 blur-xl opacity-70 pointer-events-none -z-10"
          aria-hidden="true"
        />
      )}

      {/* Main cinematic frame container */}
      <div
        className={`relative overflow-hidden rounded-[24px] sm:rounded-[32px] bg-[#1a0a12] shadow-2xl transition-all duration-700 ${
          borderAccent
            ? 'border border-[#e8a8b8]/25 ring-1 ring-white/10'
            : 'border border-black/10'
        }`}
      >
        {/* Subtle camera view subtle corner indicators */}
        <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-white/20 pointer-events-none z-20" />
        <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-white/20 pointer-events-none z-20" />
        <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-white/20 pointer-events-none z-20" />
        <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-white/20 pointer-events-none z-20" />

        {children}
      </div>
    </div>
  );
};
