import React, { useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowUpRight, Compass, Moon, Waves } from 'lucide-react';
import { SITE_CONFIG } from '../../data/siteData';
import { CelestialAuroraSkyCanvas } from './CelestialAuroraSkyCanvas';
import { SoftShaderAtmosphere } from './SoftShaderAtmosphere';
import { MagneticButton } from '../ui/MagneticButton';

export const BlueCloudCinematicScene: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Restrained 3D Pointer Parallax & Tilt (Desktop Only, Butter-Smooth Lerp Physics)
  useEffect(() => {
    const isTouch =
      window.matchMedia('(pointer: coarse)').matches ||
      !window.matchMedia('(hover: hover)').matches;
    const prefersReducedMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) return;

    const card = cardRef.current;
    const section = sectionRef.current;
    const image = imageRef.current;
    if (!card || !section) return;

    const target = { rx: 0, ry: 0, tx: 0, ty: 0, bgX: 0, bgY: 0 };
    const current = { rx: 0, ry: 0, tx: 0, ty: 0, bgX: 0, bgY: 0 };
    let rafId: number;

    const lerp = (a: number, b: number, factor: number) => a + (b - a) * factor;

    const tick = () => {
      current.rx = lerp(current.rx, target.rx, 0.06);
      current.ry = lerp(current.ry, target.ry, 0.06);
      current.tx = lerp(current.tx, target.tx, 0.06);
      current.ty = lerp(current.ty, target.ty, 0.06);
      current.bgX = lerp(current.bgX, target.bgX, 0.06);
      current.bgY = lerp(current.bgY, target.bgY, 0.06);

      if (card) {
        card.style.transform = `perspective(1400px) rotateX(${current.rx}deg) rotateY(${current.ry}deg) translate3d(${current.tx}px, ${current.ty}px, 0)`;
      }

      if (image) {
        image.style.transform = `scale(1.06) translate3d(${current.bgX}px, ${current.bgY}px, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const onPointerMove = (e: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      const nx = Math.max(-0.5, Math.min(0.5, (e.clientX - rect.left) / rect.width - 0.5));
      const ny = Math.max(-0.5, Math.min(0.5, (e.clientY - rect.top) / rect.height - 0.5));

      // Calm, restrained tilt ~0.9° and subtle shift ~4px
      target.rx = -ny * 1.3;
      target.ry = nx * 1.5;
      target.tx = nx * 4;
      target.ty = ny * 3;
      target.bgX = nx * -9;
      target.bgY = ny * -7;
    };

    const onPointerLeave = () => {
      target.rx = 0;
      target.ry = 0;
      target.tx = 0;
      target.ty = 0;
      target.bgX = 0;
      target.bgY = 0;
    };

    section.addEventListener('pointermove', onPointerMove, { passive: true });
    section.addEventListener('pointerleave', onPointerLeave);

    return () => {
      cancelAnimationFrame(rafId);
      section.removeEventListener('pointermove', onPointerMove);
      section.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      {/* =========================================================================
          ATMOSPHERIC CHROMATIC BRIDGE 01: BLUSH-PINK TO CELESTIAL SKY BLUE
          Continuous visual blending from blossom rose into celestial starlight
          ========================================================================= */}
      <div
        className="w-full h-24 sm:h-36 pointer-events-none -mb-1"
        style={{
          background:
            'linear-gradient(180deg, #faf6f2 0%, #f7e6ec 25%, #e8daf0 50%, #d4e5f7 75%, #0b1824 100%)',
        }}
        aria-hidden="true"
      />

      {/* =========================================================================
          THE CELESTIAL BLUE SKY WORLD (SKY ONLY — NO MOUNTAINS, LAND, OR TERRAIN)
          ========================================================================= */}
      <section
        ref={sectionRef}
        className="relative bg-[#0b1824] pt-4 sm:pt-8 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
      >
        {/* Soft Ambient Radial Sky & Aurora Glow Behind Viewport */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-gradient-to-r from-sky-500/12 via-cyan-400/14 to-rose-300/10 blur-[130px] rounded-full pointer-events-none"
          aria-hidden="true"
        />

        <div
          ref={cardRef}
          className="relative w-full max-w-7xl mx-auto rounded-[32px] sm:rounded-[44px] overflow-hidden bg-[#0c1a25] border border-sky-200/25 min-h-[82vh] sm:min-h-[88vh] flex flex-col justify-between p-6 sm:p-12 lg:p-16 will-change-transform shadow-[0_25px_80px_-15px_rgba(4,14,23,0.7)]"
          style={{
            boxShadow:
              'inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.4), 0 30px 90px -20px rgba(5, 17, 27, 0.8)',
          }}
        >
          {/* Deep Teal Blue Sky Background Artwork (SKY ONLY — Clipped strictly to upper heavens) */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Base Celestial Sky Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#06111a] via-[#0c1b28] to-[#12283a]" />

            <img
              ref={imageRef}
              src="/assets/hero/dreamy-clouds.jpg"
              alt="LovePixels celestial aurora sky and starry clouds"
              className="w-full h-[185%] object-cover object-top -translate-y-3 filter brightness-95 contrast-[1.05] will-change-transform transition-transform duration-700 ease-out"
              loading="lazy"
            />

            {/* Ambient Editorial Sky Vignettes & Horizon Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1824] via-[#0a1824]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1824]/75 via-transparent to-[#0a1824]/75" />
            <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-[#0a1824]/85 to-transparent" />

            {/* Horizon Peach & Twilight Warmth Glow Accent (Binds celestial sky to blush identity) */}
            <div
              className="absolute inset-0 opacity-45 mix-blend-screen pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 68%, rgba(253, 213, 200, 0.3) 0%, rgba(147, 197, 253, 0.16) 45%, transparent 75%)',
              }}
            />
          </div>

          {/* WebGL Soft Atmospheric Fluid Shader (Celestial Variant) */}
          <SoftShaderAtmosphere
            variant="celestial"
            opacity={0.35}
            className="z-[8] pointer-events-none"
          />

          {/* Celestial Aurora Sky Canvas: Aurora Ribbons, Distant Stars, Occasional Shooting Stars */}
          <CelestialAuroraSkyCanvas className="z-10" />

          {/* Top Editorial Badges: Liquid Glass Dark with Soft Sky Blue & Blush Luminescence */}
          <div className="relative z-20 flex items-center justify-between text-xs tracking-widest uppercase">
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full liquid-glass-dark text-[#e0f2fe] font-medium tracking-[0.2em] text-[11px] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
              <span>THE CELESTIAL HORIZON • 02:00 AM</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-dark text-[#bae6fd] font-medium tracking-[0.2em] text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f472b6]" />
              <span>DISCORD.GG/KWHCDGG2F</span>
            </div>
          </div>

          {/* Center Stage Inscription: Oversized Editorial Typography Integrated into Sky */}
          <div className="relative z-20 my-auto text-center max-w-4xl mx-auto py-10 sm:py-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-dark text-xs text-[#e0f2fe] uppercase tracking-[0.28em] mb-6 shadow-sm">
              <Moon className="w-3.5 h-3.5 text-[#7dd3fc]" />
              <span>A Nocturnal Sanctuary Suspended In Aurora Light</span>
            </div>

            <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-normal text-white font-normal leading-[0.96] mb-6 drop-shadow-[0_4px_24px_rgba(2,10,18,0.7)]">
              Where strangers
              <span className="font-script text-5xl sm:text-7xl lg:text-8xl text-[#d0e8f7] block sm:inline sm:ml-4 font-normal">
                become memories.
              </span>
            </h2>

            <p className="font-editorial text-lg sm:text-2xl text-[#d4e4f0] max-w-2xl mx-auto leading-relaxed mb-10 drop-shadow-[0_2px_12px_rgba(2,10,18,0.6)]">
              Quiet nights, creative circles and rewarded presence under an aurora sky. Built like a lounge, not a lobby.
            </p>

            {/* Translucent Apple-Inspired Liquid Glass Actions (Harmonizing Sky Blue & Rose with 21st.dev Magnetic Physics) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagneticButton
                as="a"
                href={SITE_CONFIG.discordInviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                strength={0.22}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#081824] bg-gradient-to-r from-[#e0f2fe] via-white to-[#bae6fd] hover:from-white hover:to-[#e0f2fe] shadow-2xl hover:shadow-cyan-900/40 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                cursorText="ENTER"
              >
                <span>Enter Celestial Sanctuary</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </MagneticButton>

              <MagneticButton
                as={NavLink}
                to="/community"
                strength={0.22}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase text-white liquid-glass-dark hover:scale-[1.03] active:scale-[0.98] transition-all"
                cursorText="EXPLORE"
              >
                <span>Explore Community</span>
              </MagneticButton>
            </div>
          </div>

          {/* Bottom Atmosphere Features: Refined Translucent Strip */}
          <div className="relative z-20 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-sky-100/15 text-[#e0f2fe]/90">
            <div className="p-4 rounded-2xl liquid-glass-dark text-center sm:text-left flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-300/20 text-[#7dd3fc] flex items-center justify-center shrink-0">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-editorial text-lg font-bold text-white leading-tight">
                  Nocturne Salons
                </div>
                <div className="text-[11px] uppercase tracking-wider text-[#93c5fd]">
                  2 AM listening rooms & film clubs
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl liquid-glass-dark text-center sm:text-left flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-300/20 text-[#7dd3fc] flex items-center justify-center shrink-0">
                <Waves className="w-5 h-5" />
              </div>
              <div>
                <div className="font-editorial text-lg font-bold text-white leading-tight">
                  Calm Waves
                </div>
                <div className="text-[11px] uppercase tracking-wider text-[#93c5fd]">
                  Zero clout, warm moderation
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl liquid-glass-dark text-center sm:text-left flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-300/20 text-[#7dd3fc] flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="font-editorial text-lg font-bold text-white leading-tight">
                  Creator Horizons
                </div>
                <div className="text-[11px] uppercase tracking-wider text-[#93c5fd]">
                  Grants & member exhibitions
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ATMOSPHERIC CHROMATIC BRIDGE 02: CELESTIAL BLUE TO WARM CREAM LOUNGE
          ========================================================================= */}
      <div
        className="w-full h-24 sm:h-36 pointer-events-none -mt-1"
        style={{
          background:
            'linear-gradient(180deg, #0b1824 0%, #15293a 30%, #e0eaf4 70%, #faf6f2 100%)',
        }}
        aria-hidden="true"
      />
    </div>
  );
};
