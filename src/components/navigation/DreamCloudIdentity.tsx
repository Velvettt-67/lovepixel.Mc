import React from 'react';

interface DreamCloudIdentityProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'light';
}

export const DreamCloudIdentity: React.FC<DreamCloudIdentityProps> = ({
  size = 'md',
  className = '',
  variant = 'default',
}) => {
  // Dimension mapping
  const sizeMap = {
    sm: 'w-9 h-7 sm:w-10 sm:h-7.5',
    md: 'w-11 h-8 sm:w-12 sm:h-9',
    lg: 'w-14 h-10 sm:w-16 sm:h-12',
  };

  const isLight = variant === 'light';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none group/cloud transition-transform duration-500 ease-out ${sizeMap[size]} ${className}`}
      aria-hidden="true"
    >
      {/* 1. Ambient Breathing Ethereal Aura / Halo */}
      <div
        className={`absolute -inset-1 rounded-full blur-md pointer-events-none transition-all duration-700 ${
          isLight
            ? 'bg-gradient-to-r from-[#fca5a5]/30 via-[#f472b6]/40 to-[#fda4af]/30 animate-cloud-aura group-hover/cloud:opacity-100 group-hover/cloud:scale-125'
            : 'bg-gradient-to-r from-[#f472b6]/40 via-[#fb7185]/45 to-[#fda4af]/35 animate-cloud-aura group-hover/cloud:opacity-95 group-hover/cloud:scale-120'
        }`}
      />

      {/* 2. Floating Cloud Container with Smooth Physics */}
      <div className="relative w-full h-full flex items-center justify-center animate-cloud-float group-hover/cloud:-translate-y-1 transition-transform duration-500">
        <svg
          viewBox="0 0 68 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible drop-shadow-[0_4px_12px_rgba(219,74,116,0.22)]"
        >
          <defs>
            {/* Main Dreamy Cloud Gradient */}
            <linearGradient id="cloudMainGrad" x1="12" y1="6" x2="52" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fff6f8" />
              <stop offset="28%" stopColor="#ffd8e4" />
              <stop offset="62%" stopColor="#f48eb1" />
              <stop offset="100%" stopColor="#d94b76" />
            </linearGradient>

            {/* Base Depth Gradient */}
            <linearGradient id="cloudShadowGrad" x1="34" y1="20" x2="34" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#d94b76" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#96284a" stopOpacity="0.9" />
            </linearGradient>

            {/* 3D Puff Pillowy Highlights */}
            <linearGradient id="puffHighlightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#ffeef3" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffd8e4" stopOpacity="0" />
            </linearGradient>

            {/* Monogram Pearl Gradient */}
            <linearGradient id="monogramGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#fff2f6" />
              <stop offset="100%" stopColor="#ffd5e2" />
            </linearGradient>

            {/* Celestial Star Gradient */}
            <linearGradient id="starGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#ffe2ec" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>

            {/* Silky Sheen Sweep Gradient */}
            <linearGradient id="sheenGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Cloud Silhouette Clipping Path for Internal Sheen */}
            <clipPath id="cloudShapeClip">
              <path d="M 16 35 C 26 36.5 43 36.5 52 35 C 58 35 61 30.5 61 25.5 C 61 19.8 56.5 16 50.8 17 C 48.2 10.2 41.8 6.5 34.5 6.5 C 27.2 6.5 20.8 10.2 18.2 17 C 12.5 16 8 19.8 8 25.5 C 8 30.5 11 35 16 35 Z" />
            </clipPath>
          </defs>

          {/* 3. Deep Sunset Rose Under-Rim / Shadow */}
          <path
            d="M 16 36.5 C 26 38 43 38 52 36.5 C 58.5 36.5 62 31.5 62 26.5 C 62 20.5 57 16.5 51 17.5 C 48.5 10.5 42 7 34.5 7 C 27 7 21 11 18.5 17.5 C 12.5 17.5 7 21.5 7 27.5 C 7 32.5 11 36.5 16 36.5 Z"
            fill="url(#cloudShadowGrad)"
            opacity="0.32"
          />

          {/* 4. Primary Cloud Body with Silky Gradient */}
          <path
            d="M 16 35 C 26 36.5 43 36.5 52 35 C 58 35 61 30.5 61 25.5 C 61 19.8 56.5 16 50.8 17 C 48.2 10.2 41.8 6.5 34.5 6.5 C 27.2 6.5 20.8 10.2 18.2 17 C 12.5 16 8 19.8 8 25.5 C 8 30.5 11 35 16 35 Z"
            fill="url(#cloudMainGrad)"
          />

          {/* 5. 3D Puff Highlights (Creates Soft Velvet Cumulus Cushions) */}
          {/* Top Summit Puff Highlight */}
          <path
            d="M 24 16 C 26.5 10.5 30 8 34.5 8 C 39 8 42.5 10.5 45 16 C 40.5 12 28.5 12 24 16 Z"
            fill="url(#puffHighlightGrad)"
          />
          {/* Left Puff Highlight */}
          <path
            d="M 10 23.5 C 11.5 19 14.5 17.5 18 18 C 14.5 20 12 22 10 23.5 Z"
            fill="url(#puffHighlightGrad)"
          />
          {/* Right Puff Highlight */}
          <path
            d="M 51 18 C 54.5 17.5 57.5 19 59 23.5 C 57 22 54.5 20 51 18 Z"
            fill="url(#puffHighlightGrad)"
          />
          {/* Center Luminous Cushion Bloom */}
          <ellipse cx="34" cy="30" rx="13" ry="3.5" fill="#ffffff" opacity="0.22" />

          {/* 6. Clipped Gloss / Silky Sheen Sweep Across Cloud Surface */}
          <g clipPath="url(#cloudShapeClip)">
            <rect
              x="-30"
              y="0"
              width="24"
              height="48"
              fill="url(#sheenGrad)"
              className="animate-cloud-sheen pointer-events-none"
            />
          </g>

          {/* 7. Center Iconic Monogram ("L" with Pinyon Script & Micro-Heart Accent) */}
          <text
            x="34"
            y="28"
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-script select-none font-normal"
            fill="url(#monogramGrad)"
            style={{
              fontSize: '22px',
              filter: 'drop-shadow(0 1.5px 2.5px rgba(130, 24, 56, 0.45))',
            }}
          >
            L
          </text>

          {/* Ambient micro glint */}
          <path
            d="M 40.5 22.5 Q 40.5 24 39 24 Q 40.5 24 40.5 25.5 Q 40.5 24 42 24 Q 40.5 24 40.5 22.5 Z"
            fill="#ffffff"
            opacity="0.9"
            className="animate-star-twinkle-1"
          />
        </svg>
      </div>
    </div>
  );
};
