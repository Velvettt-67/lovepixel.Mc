import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { CircularLogo } from '../navigation/CircularLogo';
import { FallingPetalsCanvas } from './FallingPetalsCanvas';
import { MagneticButton } from '../ui/MagneticButton';

interface HeavenlyBlossomEntranceProps {
  onEnter: () => void;
}

export const HeavenlyBlossomEntrance: React.FC<HeavenlyBlossomEntranceProps> = ({ onEnter }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);

  // References for zero-rerender GPU transform parallax
  const cameraRef = useRef<HTMLDivElement | null>(null);
  const prefersReduced = useRef(false);
  const targetMouse = useRef({ x: 0, y: 0 });
  const currentMouse = useRef({ x: 0, y: 0 });
  const isEnteringRef = useRef(false);

  useEffect(() => {
    prefersReduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Graceful opening sequence: Scene fades into view with soft light
    const revealTimer = setTimeout(() => {
      setIsRevealed(true);
    }, 400);

    // RAF loop for 60fps buttery smooth mouse parallax without any React re-renders
    let rafId: number;
    const animateParallax = () => {
      if (!isEnteringRef.current && cameraRef.current && !prefersReduced.current) {
        currentMouse.current.x += (targetMouse.current.x - currentMouse.current.x) * 0.06;
        currentMouse.current.y += (targetMouse.current.y - currentMouse.current.y) * 0.06;

        cameraRef.current.style.transform = `scale(1.03) translate3d(${currentMouse.current.x * -0.35}px, ${currentMouse.current.y * -0.22}px, 0)`;
      }
      rafId = requestAnimationFrame(animateParallax);
    };

    if (!prefersReduced.current) {
      rafId = requestAnimationFrame(animateParallax);
    }

    const handlePointerMove = (e: MouseEvent) => {
      if (prefersReduced.current) return;
      const { innerWidth, innerHeight } = window;
      targetMouse.current = {
        x: (e.clientX / innerWidth - 0.5) * 14,
        y: (e.clientY / innerHeight - 0.5) * 8,
      };
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    return () => {
      clearTimeout(revealTimer);
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handlePointerMove);
    };
  }, []);

  // 1-2 second magical portal transition into the website
  const handleEnter = () => {
    if (isEntering) return;
    setIsEntering(true);
    isEnteringRef.current = true;

    if (prefersReduced.current) {
      onEnter();
      return;
    }

    // Apply smooth cinematic forward dolly zoom into the glowing doorway
    if (cameraRef.current) {
      cameraRef.current.style.transition = 'transform 1650ms cubic-bezier(0.25, 1, 0.35, 1)';
      cameraRef.current.style.transform = 'scale(2.8) translateY(4%)';
    }

    // Phase 1: Archway expands, petals gust (1.25s)
    setTimeout(() => {
      setIsTransitioningOut(true);
    }, 1250);

    // Phase 2: Gateway fills view with soft champagne light and seamlessly reveals homepage (1.65s)
    setTimeout(() => {
      onEnter();
    }, 1650);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-[#240e18] select-none flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to LovePixels — Heavenly Blossom Entrance"
    >
      {/* =========================================================================
          STAGE 1: CINEMATIC CAMERA VIEWPORT (WITH DOLLY ZOOM INTO THE GATEWAY)
          High-performance direct GPU transform without React re-renders
          ========================================================================= */}
      <div
        ref={cameraRef}
        className="absolute inset-0 w-full h-full pointer-events-none will-change-transform"
        style={{
          transformOrigin: '50% 36%', // Anchored precisely at the glowing open archway
          transform: 'scale(1.03)',
        }}
      >
        {/* Authentic Background Matte: Grand Staircase, Luminous Archway, Clouds & Natural Trees */}
        <img
          src="/assets/hero/heavenly-blossom-entrance.jpg"
          alt="LovePixels Heavenly Blossom Entrance"
          className="w-full h-full object-cover object-center filter contrast-[1.02]"
          fetchPriority="high"
        />

        {/* Dynamic Portal Radiance (Gently blooms as visitor approaches the doorway) */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-out"
          style={{
            background:
              'radial-gradient(circle at 50% 36%, rgba(255, 248, 238, 0.9) 0%, rgba(253, 230, 238, 0.5) 28%, rgba(244, 180, 202, 0.18) 55%, transparent 75%)',
            opacity: isEntering ? 1 : isRevealed ? 0.7 : 0.3,
          }}
        />

        {/* Soft Champagne Sunlight Diffusion */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen transition-opacity duration-700"
          style={{
            background:
              'radial-gradient(ellipse at 50% 32%, rgba(255, 250, 240, 0.7) 0%, rgba(255, 235, 245, 0.25) 45%, transparent 70%)',
          }}
        />

        {/* Soft Bubbly Sky-Blue Dawn & Cloud Light Diffusion */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-out"
          style={{
            background:
              'radial-gradient(ellipse at 50% 22%, rgba(186, 230, 253, 0.28) 0%, rgba(224, 242, 254, 0.12) 38%, transparent 65%)',
            opacity: isRevealed ? (isEntering ? 0.85 : 0.6) : 0.2,
          }}
        />
      </div>

      {/* =========================================================================
          STAGE 2: FALLING SAKURA PETALS CANVAS (WITH GUST ON ENTRY)
          ========================================================================= */}
      <FallingPetalsCanvas isEntering={isEntering} />

      {/* =========================================================================
          STAGE 3: REFINED, SOFT CANDY-LIKE ATMOSPHERIC VIGNETTE
          Clean negative space in center & top, soft breathing room
          ========================================================================= */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background:
            'radial-gradient(ellipse at 50% 42%, transparent 40%, rgba(44, 14, 24, 0.22) 80%, rgba(36, 12, 20, 0.42) 100%)',
          opacity: isEntering ? 0.1 : 0.7,
        }}
      />

      {/* Very gentle lower gradient for text and button legibility */}
      <div
        className="absolute inset-x-0 bottom-0 h-64 pointer-events-none transition-opacity duration-700"
        style={{
          background:
            'linear-gradient(to top, rgba(36, 12, 20, 0.42) 0%, rgba(36, 12, 20, 0.12) 60%, transparent 100%)',
          opacity: isEntering ? 0 : 0.85,
        }}
      />

      {/* Top Floating Glass Pill: Chill Community Tag with Liquid Glass Dark */}
      <header className="absolute top-6 sm:top-8 z-30 pointer-events-auto">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-dark text-[11px] sm:text-xs text-[#fceef2] tracking-[0.22em] uppercase font-medium select-none shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
          <span>A Chill Corner To Hang Out · discord.gg/kwHcdGg2f</span>
        </div>
      </header>

      {/* =========================================================================
          STAGE 4: CENTRAL LOVEPIXELS BRANDING, TAGLINE & TEXT-BASED ENTRANCE ACTION
          (Clean typography, no UI boxes/pills, elegant cursive brand identity)
          ========================================================================= */}
      <main
        className={`relative z-30 flex flex-col items-center justify-center text-center max-w-2xl px-6 transition-all duration-700 ease-out ${
          isEntering
            ? 'opacity-0 scale-95 pointer-events-none -translate-y-5'
            : isRevealed
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Circular LovePixel Server Icon Emblem with Liquid Glass Lens Halo */}
        <div className="relative mb-2 sm:mb-3 transition-transform duration-500 hover:scale-105">
          <div
            className="absolute -inset-2 rounded-full liquid-glass-sky opacity-40 pointer-events-none blur-[1px]"
            aria-hidden="true"
          />
          <CircularLogo size="lg" showGlow={true} />
        </div>

        {/* Elegant Cursive Script Wordmark (LovePixels) */}
        <h1
          className="font-script text-6xl sm:text-7xl md:text-8xl text-white font-normal tracking-wide mb-2 sm:mb-3 select-none"
          style={{
            textShadow:
              '0 2px 16px rgba(44, 14, 24, 0.8), 0 0 35px rgba(254, 226, 236, 0.5), 0 4px 28px rgba(0, 0, 0, 0.45)',
          }}
        >
          LovePixels
        </h1>

        {/* Chill Community Tagline — Pure, Elegant Text Directly Over The Scene (No Pill / Box) */}
        <p
          className="font-editorial italic text-lg sm:text-xl md:text-2xl text-[#fde4ec] font-normal tracking-wide mb-7 sm:mb-8 max-w-md mx-auto"
          style={{
            textShadow:
              '0 2px 12px rgba(44, 14, 24, 0.85), 0 1px 3px rgba(0, 0, 0, 0.6)',
          }}
        >
          Your Little Corner to Chill.
        </p>

        {/* Clean, Text-Based Interactive Entrance Action with 21st.dev Magnetic Physics */}
        <MagneticButton
          type="button"
          onClick={handleEnter}
          autoFocus
          strength={0.28}
          cursorText="ENTER"
          className="group relative inline-flex items-center gap-3 py-2.5 px-5 text-xs sm:text-[13px] font-semibold tracking-[0.28em] uppercase text-[#fdf2f4] hover:text-white transition-all duration-300 ease-out active:scale-[0.97] active:opacity-85 focus:outline-none"
          style={{
            textShadow: '0 2px 10px rgba(44, 14, 24, 0.75)',
          }}
          data-cursor-interactive="true"
          aria-label="Enter LovePixels"
        >
          {/* Subtle liquid glass specular light refraction on hover (No solid button container) */}
          <span
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none bg-gradient-to-r from-transparent via-white/12 to-transparent backdrop-blur-[3px] border border-white/20 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35)]"
            aria-hidden="true"
          />

          <span className="relative pb-1">
            ENTER LOVEPIXELS
            {/* Delicate hover underline shimmer with sky-blue and blossom-pink caustics */}
            <span
              className="absolute left-0 bottom-0 w-0 h-[1.5px] bg-gradient-to-r from-[#38bdf8]/40 via-[#f8b4c8] to-transparent transition-all duration-300 ease-out group-hover:w-full opacity-0 group-hover:opacity-100"
              aria-hidden="true"
            />
          </span>
          <ArrowRight
            className="w-4 h-4 text-[#f8b4c8] transition-all duration-300 ease-out group-hover:translate-x-1.5 group-hover:text-white"
            style={{ filter: 'drop-shadow(0 1px 4px rgba(44, 14, 24, 0.6))' }}
          />
        </MagneticButton>
      </main>

      {/* =========================================================================
          STAGE 5: SEAMLESS PORTAL CROSS-FADE VEIL
          ========================================================================= */}
      <div
        className="fixed inset-0 z-40 pointer-events-none transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(244, 114, 182, 0.35) 0%, rgba(36, 12, 28, 0.75) 50%, #0e050f 100%)',
          opacity: isTransitioningOut ? 1 : 0,
        }}
        aria-hidden="true"
      />
    </div>
  );
};
