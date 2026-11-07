import React from 'react';
import { Sparkles, Users, Radio, Activity } from 'lucide-react';
import { useDiscordCommunityStats } from '../../hooks/useDiscordCommunityStats';
import { SITE_CONFIG } from '../../data/siteData';

interface OnlineMembersStripProps {
  maxAvatars?: number;
  showStatsCards?: boolean;
  className?: string;
}

export const OnlineMembersStrip: React.FC<OnlineMembersStripProps> = ({
  maxAvatars = 14,
  showStatsCards = true,
  className = '',
}) => {
  const {
    onlineCount,
    onlineFull,
    totalFormatted,
    active24hFormatted,
    members,
    lastUpdatedText,
  } = useDiscordCommunityStats();

  // Take the genuine members returned by Discord widget API
  const displayedMembers = members.slice(0, maxAvatars);
  const remainingOnline = Math.max(0, onlineCount - displayedMembers.length);

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Outer Card with Liquid Glass Treatment */}
      <div className="relative rounded-3xl p-5 sm:p-7 liquid-glass-dark border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-r from-[#f472b6]/20 via-[#38bdf8]/20 to-[#f472b6]/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Section Header: Live Community Pulse */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#16a34a]" />
            </span>
            <span className="text-xs uppercase font-semibold tracking-widest text-[#fceef2]">
              Live Discord Sanctuary Pulse
            </span>
            <span className="text-[10px] text-[#f472b6] font-medium px-2 py-0.5 rounded-full bg-[#f472b6]/15 border border-[#f472b6]/30">
              {lastUpdatedText}
            </span>
          </div>

          <div className="text-[11px] text-[#d8afbf] flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#f472b6]" />
            <span>Verified Discord Guild: {SITE_CONFIG.discordGuildId}</span>
          </div>
        </div>

        {/* Member Avatar Stack & Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Horizontal Overlapping Avatar Stack */}
            <div className="flex items-center -space-x-2.5 sm:-space-x-3 hover:space-x-1 transition-all duration-300 py-1 pl-1">
              {displayedMembers.map((member, idx) => {
                const statusColor =
                  member.status === 'online'
                    ? 'bg-[#22c55e]'
                    : member.status === 'idle'
                    ? 'bg-[#f59e0b]'
                    : 'bg-[#f43f5e]';

                const statusLabel =
                  member.status === 'online'
                    ? 'Online'
                    : member.status === 'idle'
                    ? 'Away'
                    : 'Do Not Disturb';

                return (
                  <div
                    key={`${member.id}-${idx}`}
                    className="relative group focus-within:z-30"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-[#180817] group-hover:ring-[#f472b6] transition-all duration-200 transform group-hover:scale-115 shadow-md bg-[#250d24]">
                      <img
                        src={member.avatar_url}
                        alt={member.username}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to official Discord default avatar
                          const target = e.currentTarget;
                          target.src = `https://cdn.discordapp.com/embed/avatars/${idx % 5}.png`;
                        }}
                      />
                    </div>

                    {/* Subtle status pip */}
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#180817] ${statusColor}`}
                      title={statusLabel}
                    />

                    {/* Accessible hover tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
                      <div className="px-2.5 py-1 rounded-lg bg-[#0e050f] text-[11px] text-[#fdf2f4] font-medium shadow-xl border border-white/20">
                        <span className="font-semibold text-white">{member.username}</span>
                        <span className="text-[#d8afbf] ml-1.5 text-[10px]">· {statusLabel}</span>
                        {member.channel_id && (
                          <div className="text-[9px] text-[#38bdf8] flex items-center gap-1 mt-0.5">
                            <Radio className="w-2.5 h-2.5" />
                            <span>In Voice Salon</span>
                          </div>
                        )}
                      </div>
                      <div className="w-2 h-2 bg-[#0e050f] rotate-45 -mt-1 border-r border-b border-white/20" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Truthful +N Online Indicator */}
            {remainingOnline > 0 && (
              <a
                href={SITE_CONFIG.discordInviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-[#fceef2] font-semibold transition-all hover:scale-105"
                title={`Join ${onlineFull} online members in LovePixels`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                <span>+{remainingOnline.toLocaleString()} online</span>
              </a>
            )}
          </div>

          {/* Quick Discord Enter Action */}
          <div className="shrink-0">
            <a
              href={SITE_CONFIG.discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#b54a67] via-[#d3738b] to-[#b54a67] hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#b54a67]/25"
            >
              <span>Say Hello in Discord</span>
              <span className="text-white/80">→</span>
            </a>
          </div>
        </div>

        {/* 3 Real Metrics: Online Now, Active in 24h, Total Sanctuary Members */}
        {showStatsCards && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10">
            {/* Metric 1: Online Now */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="text-lg font-bold text-white font-editorial tracking-tight flex items-center gap-1.5">
                  <span>{onlineFull}</span>
                  <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider bg-emerald-950/60 px-1.5 py-0.5 rounded">
                    Live
                  </span>
                </div>
                <div className="text-[11px] text-[#d8afbf] font-medium truncate">
                  Online Right Now
                </div>
              </div>
            </div>

            {/* Metric 2: Active in Last 24 Hours */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-[#f472b6] shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-lg font-bold text-white font-editorial tracking-tight flex items-center gap-1.5">
                  <span>{active24hFormatted}</span>
                  <span className="text-[10px] uppercase font-semibold text-[#f472b6] tracking-wider bg-[#2f122c] px-1.5 py-0.5 rounded border border-[#f472b6]/20">
                    24H
                  </span>
                </div>
                <div className="text-[11px] text-[#d8afbf] font-medium truncate">
                  Active in Last 24 Hours
                </div>
              </div>
            </div>

            {/* Metric 3: Total Sanctuary Members */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-lg font-bold text-white font-editorial tracking-tight flex items-center gap-1.5">
                  <span>{totalFormatted}</span>
                  <span className="text-[10px] uppercase font-semibold text-sky-300 tracking-wider bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-500/30">
                    Total
                  </span>
                </div>
                <div className="text-[11px] text-[#d8afbf] font-medium truncate">
                  Registered Members
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
