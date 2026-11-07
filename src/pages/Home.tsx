import React, { useRef, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowUpRight, Palette, Heart, Users, Calendar, Compass, Music, Flame } from 'lucide-react';
import { SITE_CONFIG } from '../data/siteData';
import { DAILY_RHYTHM } from '../data/communityData';
import { GALLERY_ITEMS } from '../data/galleryData';
import { EVENTS_DATA } from '../data/eventsData';
import { ServerShowcase } from '../components/community/ServerShowcase';
import { DiscordChannelPreview } from '../components/discord/DiscordChannelPreview';
import { BlueCloudCinematicScene } from '../components/cinematic/BlueCloudCinematicScene';
import { OnlineMembersStrip } from '../components/discord/OnlineMembersStrip';
import { MultiImageCarousel } from '../components/ui/MultiImageCarousel';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ShiningText } from '../components/ui/ShiningText';
import { MagneticButton } from '../components/ui/MagneticButton';
import { SoftShaderAtmosphere } from '../components/cinematic/SoftShaderAtmosphere';
import { NumberTicker } from '../components/ui/NumberTicker';
import { useGsapContext } from '../animations/useGsapContext';
import gsap from 'gsap';

export const Home: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const heroCardRef = useRef<HTMLDivElement | null>(null);
  const heroImageRef = useRef<HTMLImageElement | null>(null);
  const heroTextRef = useRef<HTMLDivElement | null>(null);
  const philosophyRef = useRef<HTMLDivElement | null>(null);

  // Subtle cursor glint coordinates for hero card
  const [heroPointer, setHeroPointer] = useState<{ x: number; y: number; opacity: number }>({
    x: 0,
    y: 0,
    opacity: 0,
  });

  // Subtle restrained pointer-based parallax / 3D tilt on desktop (no React state updates in tick loop)
  useEffect(() => {
    const isTouch =
      window.matchMedia('(pointer: coarse)').matches ||
      !window.matchMedia('(hover: hover)').matches;
    const prefersReducedMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) return;

    const card = heroCardRef.current;
    const section = heroSectionRef.current;
    if (!card || !section) return;

    const target = { rx: 0, ry: 0, tx: 0, ty: 0, bgX: 0, bgY: 0 };
    const current = { rx: 0, ry: 0, tx: 0, ty: 0, bgX: 0, bgY: 0 };
    let rafId: number;

    const lerp = (a: number, b: number, factor: number) => a + (b - a) * factor;

    const tick = () => {
      current.rx = lerp(current.rx, target.rx, 0.07);
      current.ry = lerp(current.ry, target.ry, 0.07);
      current.tx = lerp(current.tx, target.tx, 0.07);
      current.ty = lerp(current.ty, target.ty, 0.07);
      current.bgX = lerp(current.bgX, target.bgX, 0.07);
      current.bgY = lerp(current.bgY, target.bgY, 0.07);

      if (card) {
        card.style.transform = `perspective(1200px) rotateX(${current.rx}deg) rotateY(${current.ry}deg) translate3d(${current.tx}px, ${current.ty}px, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const onPointerMove = (e: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      // Normalized coordinates from center (-0.5 to 0.5)
      const nx = Math.max(-0.5, Math.min(0.5, (e.clientX - rect.left) / rect.width - 0.5));
      const ny = Math.max(-0.5, Math.min(0.5, (e.clientY - rect.top) / rect.height - 0.5));

      // Bounded values: subtle rotation ~0.6°–0.7°, micro-shift ~2–3px
      target.rx = -ny * 1.3;
      target.ry = nx * 1.5;
      target.tx = nx * 5;
      target.ty = ny * 3.5;
      target.bgX = nx * -8;
      target.bgY = ny * -6;

      setHeroPointer({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        opacity: 1,
      });
    };

    const onPointerLeave = () => {
      target.rx = 0;
      target.ry = 0;
      target.tx = 0;
      target.ty = 0;
      target.bgX = 0;
      target.bgY = 0;
      setHeroPointer((prev) => ({ ...prev, opacity: 0 }));
    };

    section.addEventListener('pointermove', onPointerMove, { passive: true });
    section.addEventListener('pointerleave', onPointerLeave);

    return () => {
      cancelAnimationFrame(rafId);
      section.removeEventListener('pointermove', onPointerMove);
      section.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  useGsapContext(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Cinematic hero zoom and soft parallax on scroll
    if (heroImageRef.current && heroTextRef.current) {
      gsap.to(heroImageRef.current, {
        scale: 1.15,
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: heroImageRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to(heroTextRef.current, {
        yPercent: -20,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: {
          trigger: heroTextRef.current,
          start: 'top 25%',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    // Container Scroll: Subtle scale and perspective adjustment as hero scrolls out
    if (heroCardRef.current) {
      gsap.to(heroCardRef.current, {
        scale: 0.98,
        opacity: 0.92,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: heroCardRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    // Philosophy reveal animation
    if (philosophyRef.current) {
      gsap.from(philosophyRef.current.children, {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: philosophyRef.current,
          start: 'top 80%',
        },
      });
    }
  }, containerRef);

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      {/* =========================================================================
          SCENE 01 & 02: CINEMATIC OPENING HERO VIEWPORT (CONTAINER SCROLL REVEAL)
          ========================================================================= */}
      <section
        ref={heroSectionRef}
        className="relative min-h-[90vh] sm:min-h-[92vh] pt-4 sm:pt-6 pb-16 flex items-center justify-center px-4 sm:px-6 lg:px-8"
      >
        <div
          ref={heroCardRef}
          className="relative w-full max-w-7xl mx-auto rounded-[32px] sm:rounded-[40px] overflow-hidden bg-[#240e18] shadow-2xl border border-[#e8a8b8]/30 min-h-[78vh] sm:min-h-[85vh] flex flex-col justify-between p-6 sm:p-12 lg:p-16 will-change-transform"
        >
          {/* Subtle cursor-tracking specular light reflection across hero card */}
          <div
            className="pointer-events-none absolute -inset-px z-20 transition-opacity duration-700 ease-out"
            style={{
              opacity: heroPointer.opacity,
              background: `radial-gradient(700px circle at ${heroPointer.x}px ${heroPointer.y}px, rgba(255, 255, 255, 0.08), transparent 70%)`,
            }}
            aria-hidden="true"
          />

          {/* Layered Background Imagery with Depth */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              ref={heroImageRef}
              src="/assets/hero/pink-twilight.jpg"
              alt="LovePixels ethereal twilight background"
              className="w-full h-full object-cover object-center scale-105 filter brightness-90"
              fetchPriority="high"
            />
            {/* Ambient Editorial Vignette Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#240e18] via-[#240e18]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#240e18]/70 via-transparent to-[#240e18]/70" />
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#240e18]/80 to-transparent" />

            {/* Complementary Celestial Aurora Sky Glow in Upper Heavens */}
            <div
              className="absolute top-0 right-0 w-2/3 h-96 pointer-events-none opacity-30 mix-blend-screen"
              style={{
                background:
                  'radial-gradient(ellipse at 80% 20%, rgba(186, 230, 253, 0.4) 0%, rgba(125, 211, 252, 0.15) 35%, transparent 70%)',
              }}
            />
          </div>

          {/* WebGL Soft Atmospheric Fluid Shader (Dual Rose & Celestial Sky Bridge) */}
          <SoftShaderAtmosphere
            variant="dual"
            opacity={0.28}
            className="z-[2] pointer-events-none"
          />

          {/* Top Editorial Badges: Upper-Right Discord Invite Preserved with Liquid Glass & Celestial Cyan Accent */}
          <div className="relative z-10 flex items-center justify-end text-xs tracking-widest uppercase text-[#f7cad5]">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-dark text-[#fceef2] font-medium tracking-[0.22em] text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
              <span>DISCORD.GG/KWHCDGG2F</span>
            </div>
          </div>

          {/* Center Stage Editorial Inscription */}
          <div ref={heroTextRef} className="relative z-10 my-auto text-center max-w-4xl mx-auto py-8">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full liquid-glass-dark text-xs text-[#fdf2f4] uppercase tracking-[0.25em] mb-6 shadow-sm">
              <span>Your Little Corner to Chill</span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-normal text-white font-normal leading-[0.95] mb-6">
              <ShiningText variant="pearl">LOVEPIXELS</ShiningText>
            </h1>

            <p className="font-script text-3xl sm:text-4xl lg:text-5xl text-[#f7cad5] mb-6 font-normal">
              Where strangers become memories.
            </p>

            <p className="font-editorial text-lg sm:text-2xl text-[#fcd9e2] max-w-2xl mx-auto leading-relaxed mb-8">
              A chill, welcoming Discord community where strangers become memories. Drop in, hang out, share moments, and find your people.
            </p>

            {/* CTAs with 21st.dev Magnetic Physics & Refractive Sheen */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagneticButton
                as="a"
                href={SITE_CONFIG.discordInviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                strength={0.22}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm font-bold tracking-wider uppercase text-white bg-gradient-to-r from-[#b54a67] via-[#d3738b] to-[#b54a67] shadow-xl hover:shadow-2xl hover:shadow-[#b54a67]/40 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                cursorText="JOIN"
              >
                <span>Join Discord Sanctuary</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </MagneticButton>

              <MagneticButton
                as={NavLink}
                to="/community"
                strength={0.22}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-sm font-semibold tracking-wider uppercase text-white liquid-glass-dark hover:scale-[1.03] active:scale-[0.98] transition-all"
                cursorText="EXPLORE"
              >
                <span>Explore Community</span>
              </MagneticButton>
            </div>
          </div>

          {/* Bottom Metagrid Inside Viewport */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/15 text-white/90">
            <div>
              <div className="text-xl sm:text-2xl font-bold font-editorial text-white">
                {SITE_CONFIG.stats.membersCount}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-[#f7cad5]">
                {SITE_CONFIG.stats.membersSubtext}
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-editorial text-white">
                {SITE_CONFIG.stats.onlineDailyAverage}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-[#f7cad5]">
                Online daily average
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-editorial text-white">
                {SITE_CONFIG.stats.eventsHosted}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-[#f7cad5]">
                {SITE_CONFIG.stats.eventsSubtext}
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-editorial text-white">
                <NumberTicker
                  value={SITE_CONFIG.stats.totalRewardsNumeric}
                  prefix="₹"
                  suffix="+"
                  formatIndian={true}
                  className="font-editorial text-white"
                />
              </div>
              <div className="text-[11px] uppercase tracking-wider text-[#f7cad5]">
                Verified Payouts
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SCENE 02: LIVE COMMUNITY PULSE & VERIFIED ONLINE MEMBERS STRIP
          ========================================================================= */}
      <section className="relative z-20 px-4 sm:px-6 lg:px-8 py-8 -mt-6 sm:-mt-10 mb-8 max-w-7xl mx-auto">
        <OnlineMembersStrip />
      </section>

      {/* =========================================================================
          SCENE 02.5: BLUE CLOUD CINEMATIC SCENE & ATMOSPHERIC BRIDGE
          ========================================================================= */}
      <BlueCloudCinematicScene />

      {/* =========================================================================
          SCENE 03: BRAND PHILOSOPHY (WITH 21ST.DEV SPOTLIGHT CARDS)
          ========================================================================= */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div ref={philosophyRef} className="space-y-16">
          <SectionHeader
            align="center"
            eyebrow="Why People Stay"
            icon={<Compass className="w-3.5 h-3.5 text-[#f472b6]" />}
            title="Built like a lounge, not a lobby."
            subtitle="Every room is designed, moderated and cared for. No noise, no clout, no chaos — just a beautiful place to spend an evening."
          />

          {/* 3 Core Philosophical Pillars with Spotlight Card Refraction */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SpotlightCard
              spotlightColor="rgba(244, 114, 182, 0.16)"
              borderColor="rgba(232, 168, 184, 0.3)"
              className="p-8 rounded-3xl bg-[#1a0a19]/80 border border-[#e8a8b8]/20 backdrop-blur-md shadow-lg hover:shadow-xl hover:border-[#f472b6]/40 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#2a1024] text-[#f472b6] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl text-[#fdf2f4] mb-3">Soft by design</h3>
              <p className="font-editorial text-base text-[#d8afbf] leading-relaxed">
                A calm, moderated space with warm rules and zero tolerance for noise. Come as you are, stay as long as you like.
              </p>
            </SpotlightCard>

            <SpotlightCard
              spotlightColor="rgba(56, 189, 248, 0.16)"
              borderColor="rgba(125, 211, 252, 0.3)"
              className="p-8 rounded-3xl bg-[#1a0a19]/80 border border-[#e8a8b8]/20 backdrop-blur-md shadow-lg hover:shadow-xl hover:border-sky-400/40 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#0f2235] text-sky-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl text-[#fdf2f4] mb-3">Creative circles</h3>
              <p className="font-editorial text-base text-[#d8afbf] leading-relaxed">
                Weekly salons for artists, photographers and writers — critique that feels like a compliment with directions.
              </p>
            </SpotlightCard>

            <SpotlightCard
              spotlightColor="rgba(244, 114, 182, 0.16)"
              borderColor="rgba(232, 168, 184, 0.3)"
              className="p-8 rounded-3xl bg-[#1a0a19]/80 border border-[#e8a8b8]/20 backdrop-blur-md shadow-lg hover:shadow-xl hover:border-[#f472b6]/40 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#2a1024] text-[#f472b6] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Music className="w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl text-[#fdf2f4] mb-3">Slow nights</h3>
              <p className="font-editorial text-base text-[#d8afbf] leading-relaxed">
                Listening rooms, film clubs and 2 AM conversations. The kind of company that makes a quiet evening feel curated.
              </p>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SCENE 04: THE 7-IMAGE SERVER SHOWCASE
          ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ServerShowcase />
      </section>

      {/* =========================================================================
          SCENE 05: INTERACTIVE DISCORD CLIENT PREVIEW
          ========================================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SectionHeader
          align="center"
          eyebrow="Interactive Room Tour"
          icon={<Users className="w-3.5 h-3.5 text-[#f472b6]" />}
          title="Server Preview"
          subtitle="Pick a channel on the left and watch the room change on the right — a live-feeling look at how LovePixels actually reads day to day."
        />

        <DiscordChannelPreview />
      </section>

      {/* =========================================================================
          SCENE 06: DAILY RHYTHM — A DAY HERE (SPOTLIGHT CARDS)
          ========================================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12">
          <div className="lg:max-w-md">
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#220a22]/90 border border-[#f472b6]/25 text-xs font-semibold uppercase tracking-widest text-[#f472b6] shadow-xs select-none">
                <Calendar className="w-3.5 h-3.5 text-[#f472b6]" />
                <span>Routine & Rituals</span>
              </div>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#fdf2f4] mb-4 leading-[1.2] tracking-normal font-normal">
              A day here.
            </h2>
            <p className="font-editorial text-base sm:text-lg text-[#d8afbf] leading-relaxed">
              Nothing demanding. Just familiar moments you can drop into whenever you like — from dawn intentions to 2 AM murmurs.
            </p>
            <div className="mt-8">
              <NavLink
                to="/community"
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#f472b6] hover:text-white transition-colors"
              >
                <span>Read more about our community</span>
                <ArrowUpRight className="w-4 h-4" />
              </NavLink>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {DAILY_RHYTHM.map((rhythm) => (
              <SpotlightCard
                key={rhythm.time}
                spotlightColor="rgba(244, 114, 182, 0.14)"
                borderColor="rgba(232, 168, 184, 0.3)"
                className="p-6 rounded-2xl bg-[#1a0a19]/80 border border-[#e8a8b8]/20 backdrop-blur-md shadow-lg hover:border-[#f472b6]/40 transition-all hover:-translate-y-1"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-editorial text-2xl font-bold text-[#f472b6]">
                    {rhythm.time}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#fceef2] bg-[#2a1024] px-2.5 py-0.5 rounded-full border border-white/10">
                    {rhythm.period}
                  </span>
                </div>
                <h3 className="font-display text-xl text-[#fdf2f4] mb-1">{rhythm.title}</h3>
                <p className="font-editorial text-sm text-[#d8afbf] leading-relaxed">
                  {rhythm.description}
                </p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SCENE 07: GALLERY PREVIEW — EDITORIAL FLOATING CARDS
          ========================================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="Seasonal Gallery"
          icon={<Palette className="w-3.5 h-3.5 text-[#f472b6]" />}
          title="Members make it beautiful."
          subtitle="Each season closes with a curated exhibition of member work — photography, illustration, writing and film stills."
          action={{
            label: "View Full Gallery",
            href: "/gallery",
            cursorText: "GALLERY",
          }}
        />

        {/* Auto-Rotating Gallery Preview Collection (1,000 ms Interval) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            [GALLERY_ITEMS[0], GALLERY_ITEMS[3], GALLERY_ITEMS[6]].filter(Boolean),
            [GALLERY_ITEMS[1], GALLERY_ITEMS[4], GALLERY_ITEMS[7]].filter(Boolean),
            [GALLERY_ITEMS[2], GALLERY_ITEMS[5], GALLERY_ITEMS[8]].filter(Boolean),
          ].map((group, groupIdx) => (
            <NavLink
              to="/gallery"
              key={groupIdx}
              className="group block rounded-3xl overflow-hidden bg-[#180817] border border-[#e8a8b8]/20 shadow-lg hover:border-[#f472b6]/40 hover:-translate-y-1.5 transition-all duration-500"
              data-cursor-text="VIEW"
            >
              <MultiImageCarousel
                images={group.map((item) => ({
                  src: item.image,
                  alt: item.title,
                  title: item.title,
                  artist: item.artist,
                  category: item.category,
                }))}
                intervalMs={1000}
                aspectRatio="aspect-[4/5]"
              />
            </NavLink>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SCENE 08: UPCOMING GATHERINGS & SALONS PREVIEW (PASTEL PINK & PEARL WHITE)
          ========================================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[36px] bg-gradient-to-b from-[#fdf6f7] via-[#faeaef] to-[#fcecee] p-6 sm:p-10 lg:p-14 border border-[#f5dbe3] shadow-[0_20px_50px_rgba(224,124,154,0.08)] overflow-hidden">
          {/* Subtle soft ambient rose/pearl orbs inside the section container */}
          <div
            className="absolute -top-24 -left-24 w-96 h-96 bg-[#ffd8e4]/40 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#ffeef2]/60 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10">
            <SectionHeader
              tone="light"
              eyebrow="Evenings to Clear"
              icon={<Flame className="w-3.5 h-3.5 text-[#b54a67]" />}
              title="Upcoming Salons & Gatherings"
              subtitle="Intimate listening rooms, film screenings and creative salons with reserved seats."
              action={{
                label: "Browse Full Calendar",
                href: "/events",
                cursorText: "CALENDAR",
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {EVENTS_DATA.map((event) => (
                <div
                  key={event.id}
                  className="group rounded-3xl bg-white border border-[#f5dbe3] shadow-[0_8px_30px_rgba(224,124,154,0.06)] hover:shadow-[0_16px_40px_rgba(224,124,154,0.14)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col sm:flex-row"
                >
                  {/* Artwork Container — soft pastel background, centered icon with pixel-art rendering */}
                  <div className="sm:w-2/5 aspect-[16/10] sm:aspect-auto min-h-[190px] bg-gradient-to-tr from-[#faeaef] via-[#fff5f8] to-[#f5e6ed] p-6 flex items-center justify-center relative shrink-0 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="max-h-[130px] w-auto max-w-[85%] object-contain pixel-art transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider text-[#b54a67] bg-white/95 border border-[#f5dbe3] shadow-xs select-none">
                      {event.category}
                    </span>
                  </div>

                  {/* Card Content — Dark plum headings, deep rose dates, high-contrast readable copy */}
                  <div className="p-6 sm:w-3/5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#b54a67] font-semibold mb-2">
                        <span>{event.date}</span>
                        <span className="text-[#d8afbf]">•</span>
                        <span className="text-sky-700 font-medium">{event.time}</span>
                      </div>
                      <h3 className="font-display text-xl sm:text-2xl text-[#240f17] mb-2 leading-snug group-hover:text-[#b54a67] transition-colors font-normal">
                        {event.title}
                      </h3>
                      <p className="font-editorial text-sm text-[#6b5860] line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#f5dbe3] flex items-center justify-between">
                      <span className="text-xs text-[#8a727c] flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-[#b54a67]" />
                        {event.attendees}
                      </span>
                      <a
                        href={SITE_CONFIG.discordInviteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#b54a67] to-[#d3738b] hover:from-[#a03e58] hover:to-[#be5c75] shadow-xs hover:shadow-md transition-all hover:scale-105 active:scale-95"
                        data-cursor-text="RSVP"
                      >
                        <span>RSVP</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SCENE 09: FINAL CINEMATIC CALL TO ACTION
          ========================================================================= */}
      <section className="py-24 sm:py-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[36px] overflow-hidden bg-gradient-to-br from-[#2a101d] via-[#1a081a] to-[#0d0410] p-8 sm:p-16 lg:p-20 text-center text-white border border-[#e8a8b8]/25 shadow-2xl">
          {/* Dual Celestial Sky & Rose Glow Halos */}
          <div
            className="absolute -top-32 left-1/4 -translate-x-1/2 w-[500px] h-[300px] bg-[#d3738b]/20 blur-3xl rounded-full pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -top-32 right-1/4 translate-x-1/2 w-[500px] h-[300px] bg-sky-500/18 blur-3xl rounded-full pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="font-script text-3xl sm:text-4xl text-[#f7cad5] inline-block mb-3">
              The door is open, quietly
            </span>

            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white font-normal mb-6">
              Join LovePixels
            </h2>

            <p className="font-editorial text-lg sm:text-xl text-[#fcd9e2] leading-relaxed mb-10">
              Invitations are reviewed by hand so the room stays the way it feels today. Step into quiet conversations and creative salons.
            </p>

            {/* Clearly Readable Button with 100% High Contrast Glowing Gradient */}
            <MagneticButton
              as="a"
              href={SITE_CONFIG.discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              strength={0.24}
              className="inline-flex items-center justify-center gap-2.5 px-10 sm:px-12 py-4.5 sm:py-5 rounded-full text-base sm:text-lg font-bold tracking-wider uppercase text-white bg-gradient-to-r from-[#b54a67] via-[#d3738b] to-[#b54a67] bg-[length:200%_auto] hover:bg-right shadow-2xl shadow-[#b54a67]/50 hover:shadow-[#b54a67]/70 transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20 ring-2 ring-[#f472b6]/30"
              cursorText="JOIN"
            >
              <span>Join LovePixels</span>
              <ArrowUpRight className="w-5 h-5" />
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  );
};
