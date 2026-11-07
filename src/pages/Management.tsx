import React, { useState, useMemo } from 'react';
import { Crown, Sparkles, Shield, ArrowUpRight, MessageSquare } from 'lucide-react';
import { useManagementTeam } from '../hooks/useManagementTeam';
import { ManagementHero } from '../components/management/ManagementHero';
import { ProfileCard } from '../components/management/ProfileCard';
import { ExpandedProfileModal } from '../components/management/ExpandedProfileModal';
import { SectionHeader } from '../components/ui/SectionHeader';
import { SITE_CONFIG } from '../data/siteData';

export const Management: React.FC = () => {
  const { team, owners, holdsPower, management, activeLeadersCount, lastUpdated } =
    useManagementTeam();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Live selected member guarantees real-time updates inside open modal
  const selectedMember = useMemo(() => {
    if (!selectedMemberId) return null;
    return team.find((m) => m.id === selectedMemberId) || null;
  }, [team, selectedMemberId]);

  return (
    <div className="w-full pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Management Hero Scene */}
      <ManagementHero
        totalLeaders={team.length}
        activeLeadersCount={activeLeadersCount}
        lastUpdated={lastUpdated}
      />

      {/* =========================================================================
          TIER 1: OWNERS SHOWCASE
          ========================================================================= */}
      <section className="mb-24 sm:mb-32">
        <SectionHeader
          align="left"
          eyebrow="Tier 01 · Server Founders"
          icon={<Crown className="w-3.5 h-3.5 text-amber-300" />}
          title="The Owners"
          subtitle="Founders carrying legacies, vision, and the sovereign leadership of LovePixels."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {owners.map((owner) => (
            <ProfileCard
              key={owner.id}
              member={owner}
              onSelect={(m) => setSelectedMemberId(m.id)}
              featured={true}
            />
          ))}
        </div>
      </section>

      {/* =========================================================================
          TIER 2: HOLDS POWER SHOWCASE
          ========================================================================= */}
      <section className="mb-24 sm:mb-32">
        <SectionHeader
          align="left"
          eyebrow="Tier 02 · Executive Council"
          icon={<Sparkles className="w-3.5 h-3.5 text-rose-300" />}
          title="Holds Power"
          subtitle="Key guardians holding administrative authority, stewardship, and room architecture."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl">
          {holdsPower.map((member) => (
            <ProfileCard
              key={member.id}
              member={member}
              onSelect={(m) => setSelectedMemberId(m.id)}
              featured={false}
            />
          ))}
        </div>
      </section>

      {/* =========================================================================
          TIER 3: MANAGEMENT SHOWCASE
          ========================================================================= */}
      <section className="mb-24 sm:mb-32">
        <SectionHeader
          align="left"
          eyebrow="Tier 03 · Operational Leadership"
          icon={<Shield className="w-3.5 h-3.5 text-sky-300" />}
          title="Management Team"
          subtitle="Active coordinators overseeing daily community rhythms, listening salons, and room warmth."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {management.map((member) => (
            <ProfileCard
              key={member.id}
              member={member}
              onSelect={(m) => setSelectedMemberId(m.id)}
              featured={false}
            />
          ))}
        </div>
      </section>

      {/* =========================================================================
          DISCORD COMMUNITY BANNER CTA
          ========================================================================= */}
      <section className="relative rounded-[36px] overflow-hidden bg-gradient-to-br from-[#2a101f] via-[#1a081a] to-[#0e0412] p-8 sm:p-14 border border-[#e8a8b8]/25 shadow-2xl text-center">
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#f472b6]/15 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1e0a20] border border-[#f472b6]/30 text-xs font-semibold uppercase tracking-wider text-[#f472b6] mb-4">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Direct Community Access</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white font-normal mb-4">
            Our doors and DMs are always open.
          </h2>

          <p className="font-editorial text-base sm:text-lg text-[#d8afbf] leading-relaxed mb-8">
            Whether you want to curate a listening room, apply for caretaker intake, or just say hello, our leadership team hangs out daily in our Discord voice salons and #general chat.
          </p>

          <a
            href={SITE_CONFIG.discordInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#b54a67] via-[#d3738b] to-[#b54a67] shadow-lg hover:shadow-[#b54a67]/30 transition-all hover:scale-105 active:scale-95"
            data-cursor-text="JOIN"
          >
            <span>Say Hello on Discord</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Expanded Rich Discord Profile Modal */}
      <ExpandedProfileModal
        member={selectedMember}
        onClose={() => setSelectedMemberId(null)}
      />
    </div>
  );
};
