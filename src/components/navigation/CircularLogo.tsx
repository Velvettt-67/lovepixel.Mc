import React from 'react';

interface CircularLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showGlow?: boolean;
}

export const CircularLogo: React.FC<CircularLogoProps> = ({
  size = 'md',
  className = '',
  showGlow = true,
}) => {
  // Sizing mappings: slightly larger than the old 32px logo for clear text legibility
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-13 h-13 sm:w-14 sm:h-14',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${sizeClasses[size]} ${className}`}
      aria-label="LovePixel Server Logo"
    >
      {/* 1. Soft Ambient Pink Glow (Complements luxury aesthetic without harsh glare) */}
      {showGlow && (
        <div
          className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#38bdf8]/22 via-[#f472b6]/30 to-[#fb7185]/25 blur-md pointer-events-none opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-out"
          aria-hidden="true"
        />
      )}

      {/* 2. Liquid Glass Circular Lens Container with Specular Rim & Enamel Reflection */}
      <div className="relative w-full h-full rounded-full overflow-hidden aspect-square border border-white/70 ring-1 ring-white/80 shadow-[inset_0_1.5px_2.5px_rgba(255,255,255,0.9),_0_6px_20px_rgba(211,115,139,0.25)] group-hover:shadow-[inset_0_2px_3.5px_rgba(255,255,255,0.95),_0_10px_28px_rgba(211,115,139,0.38)] group-hover:border-white/90 transition-all duration-300 ease-out bg-[#fce7ee] flex items-center justify-center">
        {/* 3. Authentic Animated LovePixel Server Icon Artwork */}
        <picture className="w-full h-full block">
          {/* Respect prefers-reduced-motion by serving the crisp static high-res frame */}
          <source
            media="(prefers-reduced-motion: reduce)"
            srcSet="/assets/icons/lovepixel-icon-512.png"
            type="image/png"
          />
          {/* Animated original dreamy pink cloud with shadowed white handwritten lettering */}
          <img
            src="/assets/icons/lovepixel-icon.gif"
            alt="LovePixel"
            className="w-full h-full object-cover object-center select-none transition-transform duration-500 ease-out group-hover:scale-105"
            loading="eager"
            decoding="async"
            draggable={false}
          />
        </picture>

        {/* 4. Upper Specular Liquid Glass Lens Arc */}
        <div
          className="absolute inset-x-0 top-0 h-3/5 rounded-t-full pointer-events-none bg-gradient-to-b from-white/40 via-white/12 to-transparent border-t border-white/75 transition-opacity duration-300 group-hover:opacity-95"
          aria-hidden="true"
        />

        {/* 5. Lower Ambient Caustic Glass Reflection */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/3 rounded-b-full pointer-events-none bg-gradient-to-t from-white/15 to-transparent transition-opacity duration-300"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
