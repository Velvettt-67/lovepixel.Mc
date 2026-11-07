import React, { useRef } from 'react';
import { ArrowUpRight, Heart, Coffee, Compass } from 'lucide-react';
import { SITE_CONFIG } from '../data/siteData';
import { COMMUNITY_PILLARS, DAILY_RHYTHM } from '../data/communityData';
import { ServerShowcase } from '../components/community/ServerShowcase';
import { LiveVoiceSalons } from '../components/discord/LiveVoiceSalons';
import { VoiceChannelShowcase } from '../components/discord/VoiceChannelShowcase';
import { OnlineMembersStrip } from '../components/discord/OnlineMembersStrip';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ShiningText } from '../components/ui/ShiningText';
import { MagneticButton } from '../components/ui/MagneticButton';
import { useGsapContext } from '../animations/useGsapContext';
import gsap from 'gsap';

export const Community: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useGsapContext(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Animate pillar cards
    gsap.from('.pillar-card', {
      y: 35,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.pillars-grid',
        start: 'top 80%',
      },
    });
  }, containerRef);

  return (
    <div ref={containerRef} className="w-full pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* =========================================================================
          SECTION A: COMMUNITY OPENING HERO
          ========================================================================= */}
      <section className="text-center max-w-4xl mx-auto mb-20 sm:mb-28">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full liquid-glass-rose text-xs font-semibold uppercase tracking-widest text-[#f472b6] mb-4">
          <span>The Sanctuary Circle</span>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-[#fdf2f4] font-normal tracking-normal mb-6">
          <ShiningText variant="rose">The Community</ShiningText>
        </h1>

        <p className="font-editorial text-xl sm:text-2xl text-[#d8afbf] leading-relaxed mb-10">
          LovePixels is small on purpose. Everything from the channel list to the welcome note is designed to make arriving feel effortless.
        </p>

        {/* Live Community Vitality Strip with Real Discord Avatars & Live Metrics */}
        <OnlineMembersStrip />
      </section>

      {/* =========================================================================
          SECTION B: THE 6 COMMUNITY PILLARS (WITH 21ST.DEV SPOTLIGHT INTERACTION)
          ========================================================================= */}
      <section className="mb-24 sm:mb-32">
        <SectionHeader
          align="center"
          eyebrow="Guiding Principles"
          icon={<Compass className="w-3.5 h-3.5 text-[#f472b6]" />}
          title="Our Pillars"
          subtitle="These are the standards our staff hold every single day — the reason the atmosphere stays soft even as the room grows."
        />

        <div className="pillars-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COMMUNITY_PILLARS.map((pillar, idx) => {
            const isSky = idx === 1 || idx === 4;
            return (
              <SpotlightCard
                key={pillar.id}
                spotlightColor={isSky ? 'rgba(56, 189, 248, 0.16)' : 'rgba(244, 114, 182, 0.16)'}
                borderColor={isSky ? 'rgba(125, 211, 252, 0.5)' : 'rgba(232, 168, 184, 0.45)'}
                className={`pillar-card p-8 rounded-3xl bg-[#180817]/90 border border-[#e8a8b8]/25 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${
                  isSky ? 'hover:border-sky-300/50' : 'hover:border-[#f472b6]/45'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`font-editorial text-2xl font-bold ${isSky ? 'text-sky-400' : 'text-[#f472b6]'}`}>
                      {pillar.number}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1 rounded-full ${
                        isSky
                          ? 'text-sky-300 bg-sky-950/80 border border-sky-400/25'
                          : 'text-[#f472b6] bg-[#2f122c] border border-[#e8a8b8]/20'
                      }`}
                    >
                      {pillar.accent}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl text-[#fdf2f4] mb-3">{pillar.title}</h3>
                  <p className="font-editorial text-base text-[#d8afbf] leading-relaxed mb-4">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#e8a8b8]/20 text-xs text-[#fcd9e2]/80 italic">
                  {pillar.detail}
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION C: SERVER SHOWCASE — THE 7 IMMERSIVE VISUALS
          ========================================================================= */}
      <section className="mb-24 sm:mb-32">
        <ServerShowcase />
      </section>

      {/* =========================================================================
          SECTION D: REALTIME DISCORD LIVE VOICE SALONS (CRITICAL FEATURE)
          ========================================================================= */}
      <section className="mb-24 sm:mb-32">
        <LiveVoiceSalons />
      </section>

      {/* =========================================================================
          SECTION D.5: VOICE CHANNELS & SALONS (MULTI-IMAGE AUTO-ROTATING SHOWCASE)
          ========================================================================= */}
      <section className="mb-24 sm:mb-32">
        <VoiceChannelShowcase />
      </section>

      {/* =========================================================================
          SECTION E: DAILY RHYTHM — 24 HOURS IN LOVEPIXELS (WITH SPOTLIGHT TREATMENT)
          ========================================================================= */}
      <section className="mb-24 sm:mb-32">
        <div className="p-8 sm:p-12 lg:p-16 rounded-[32px] bg-[#160718]/80 border border-[#e8a8b8]/20 backdrop-blur-md shadow-xl">
          <SectionHeader
            align="center"
            eyebrow="Quiet Continuity"
            icon={<Coffee className="w-3.5 h-3.5 text-[#f472b6]" />}
            title="A Day Here"
            subtitle="Nothing demanding. Just familiar moments you can drop into whenever you like."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DAILY_RHYTHM.map((item, idx) => (
              <SpotlightCard
                key={item.time}
                spotlightColor="rgba(244, 114, 182, 0.12)"
                borderColor="rgba(232, 168, 184, 0.4)"
                className="p-6 rounded-2xl bg-[#220d20]/80 border border-[#e8a8b8]/20 hover:border-[#f472b6]/40 shadow-md transition-all hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-editorial text-2xl font-bold text-[#f472b6]">
                    {item.time}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#f472b6] bg-[#2f122c] px-2 py-0.5 rounded-full border border-[#e8a8b8]/20">
                    Phase 0{idx + 1}
                  </span>
                </div>
                <h3 className="font-display text-lg text-[#fdf2f4] mb-1">{item.title}</h3>
                <p className="font-editorial text-sm text-[#d8afbf] leading-relaxed">
                  {item.description}
                </p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION G: COMMUNITY JOIN CALL TO ACTION
          ========================================================================= */}
      <section className="text-center max-w-3xl mx-auto py-12">
        <SectionHeader
          align="center"
          eyebrow="Warm Welcome"
          icon={<Heart className="w-3.5 h-3.5 text-[#f472b6]" />}
          title="Find your quiet seat in the room."
          subtitle="No application fee, no artificial hierarchy. Just arrive softly and let the atmosphere welcome you."
        />
        <MagneticButton
          as="a"
          href={SITE_CONFIG.discordInviteUrl}
          target="_blank"
          rel="noopener noreferrer"
          strength={0.22}
          className="inline-flex items-center gap-2 px-9 py-4 rounded-full text-sm font-semibold tracking-wider uppercase text-white bg-gradient-to-r from-[#b54a67] via-[#d3738b] to-[#b54a67] shadow-lg shadow-[#b54a67]/25 hover:shadow-xl hover:shadow-[#b54a67]/40 transition-all hover:scale-105 active:scale-95"
          cursorText="JOIN"
        >
          <span>Enter LovePixels Discord</span>
          <ArrowUpRight className="w-4 h-4" />
        </MagneticButton>
      </section>
    </div>
  );
};
