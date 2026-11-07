import React from 'react';
import { ShieldCheck, Radio, Users } from 'lucide-react';
import { ShiningText } from '../ui/ShiningText';

interface ManagementHeroProps {
  totalLeaders: number;
  activeLeadersCount: number;
  lastUpdated: number;
}

export const ManagementHero: React.FC<ManagementHeroProps> = ({
  totalLeaders,
  activeLeadersCount,
}) => {
  return (
    <section className="relative text-center max-w-4xl mx-auto mb-16 sm:mb-24 pt-8">
      {/* Carefully Balanced Pink & Aurora Blue Atmospheric Halo Orbs */}
      <div
        className="absolute -top-16 left-1/3 -translate-x-1/2 w-96 h-96 bg-[#f472b6]/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -top-16 right-1/3 translate-x-1/2 w-96 h-96 bg-sky-500/12 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Eyebrow Badge — Real Live Discord Presence Beacon */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#200a22]/90 border border-[#f472b6]/30 text-xs font-semibold uppercase tracking-widest text-[#f472b6] mb-6 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-[#f472b6]" />
          <span>Verified Discord Leadership</span>
        </div>

        {/* Section Heading — Cormorant Garamond Editorial Typography */}
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl text-[#fdf2f4] font-normal tracking-normal mb-5 leading-[1.08]">
          <ShiningText variant="rose">Meet the People Behind LovePixels</ShiningText>
        </h1>

        {/* Welcoming Description */}
        <p className="font-editorial text-lg sm:text-2xl text-[#d8afbf] leading-relaxed max-w-2xl mx-auto mb-8">
          The creators, caretakers, and coordinators who shape our sanctuary. Connected directly to live Discord identities and genuine presence.
        </p>

        {/* Live Presence Summary Pill */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 px-5 py-2 rounded-full bg-[#1c081e]/80 border border-[#e8a8b8]/20 backdrop-blur-md shadow-md text-xs text-[#e8c6d4]">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#22c55e] animate-pulse" />
            <span className="font-semibold text-white">
              {activeLeadersCount} of {totalLeaders}
            </span>
            <span>Leaders Active Now</span>
          </div>
          <span className="text-white/30 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 text-sky-300">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Official Discord Hierarchy</span>
          </div>
        </div>
      </div>
    </section>
  );
};
