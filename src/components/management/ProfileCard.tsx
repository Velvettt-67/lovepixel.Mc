import React, { useState, useRef, memo } from 'react';
import {
  Crown,
  Sparkles,
  Shield,
  Copy,
  Check,
  ExternalLink,
  Maximize2,
} from 'lucide-react';
import { type ManagementMember } from '../../data/managementData';
import { DiscordAvatar } from '../discord/DiscordAvatar';
import { DiscordActivityCard } from '../discord/DiscordActivityCard';

interface ProfileCardProps {
  member: ManagementMember;
  onSelect: (member: ManagementMember) => void;
  featured?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = memo(({
  member,
  onSelect,
  featured = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [failedBannerUrl, setFailedBannerUrl] = useState<string | null>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Automatically derived without useEffect
  const bannerError = failedBannerUrl === member.bannerUrl;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle 3D tilt
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setRotate({ x: rotateX, y: rotateY });
    setMousePos({ x, y });
  };

  const copyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(member.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setRotate({ x: 0, y: 0 });
      }}
      onClick={() => onSelect(member)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(member);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View full profile for ${member.displayName}`}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateY(-4px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)',
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`group relative rounded-[28px] overflow-hidden bg-[#18081a]/90 border border-[#e8a8b8]/20 backdrop-blur-md shadow-xl hover:border-[#f472b6]/50 hover:shadow-2xl hover:shadow-[#f472b6]/10 transition-all duration-300 flex flex-col cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#f472b6] ${
        featured ? 'ring-1 ring-[#f472b6]/30' : ''
      }`}
    >
      {/* Pointer Spotlight Illumination */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(244, 114, 182, 0.14), transparent 70%)`,
          }}
        />
      )}

      {/* Profile Banner with Stable Aspect Ratio */}
      <div
        className={`relative w-full overflow-hidden shrink-0 ${
          member.tier === 'owner' ? 'h-32 sm:h-36' : 'h-24 sm:h-28'
        }`}
        style={{
          background: member.bannerColor || 'linear-gradient(135deg, #2b0b24 0%, #150518 100%)',
        }}
      >
        {member.bannerUrl && !bannerError && (
          <img
            src={member.bannerUrl}
            alt={`${member.displayName} banner`}
            onError={() => setFailedBannerUrl(member.bannerUrl || '')}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Top Badges: Role and Expanded View Hint */}
        <div className="absolute top-3 inset-x-3.5 flex items-center justify-between z-10">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider text-white shadow-md border"
            style={{
              backgroundColor: 'rgba(20, 8, 22, 0.88)',
              borderColor: `${member.accentColor}66`,
            }}
          >
            {member.tier === 'owner' ? (
              <Crown className="w-3 h-3 text-amber-300" />
            ) : member.tier === 'holds_power' ? (
              <Sparkles className="w-3 h-3 text-rose-300" />
            ) : (
              <Shield className="w-3 h-3 text-sky-300" />
            )}
            <span>{member.roleTitle}</span>
          </span>

          <span className="w-7 h-7 rounded-full bg-black/60 text-white/70 group-hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/15">
            <Maximize2 className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Card Body with Overlapping Reusable DiscordAvatar */}
      <div className="relative z-10 p-5 sm:p-6 flex-1 flex flex-col justify-between pt-0">
        <div>
          {/* Avatar and Presence Header */}
          <div className="flex items-end justify-between -mt-10 sm:-mt-11 mb-3.5">
            <DiscordAvatar
              avatarUrl={member.avatarUrl}
              displayName={member.displayName}
              presence={member.livePresence}
              avatarDecorationUrl={member.avatarDecorationUrl}
              profileFrameUrl={member.profileFrameUrl}
              size={member.tier === 'owner' ? 'lg' : 'md'}
              accentColor={member.accentColor}
              notchColor="#18081a"
            />

            {/* Quick Copy Discord User ID Button */}
            <button
              onClick={copyId}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#2a1024]/80 hover:bg-[#3a1433] text-[#fcecee] border border-[#f472b6]/25 transition-all shadow-xs"
              title="Copy Discord ID"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#f472b6]" />
                  <span>ID</span>
                </>
              )}
            </button>
          </div>

          {/* User Names & Identifiers */}
          <div className="mb-3">
            <h3 className="font-display text-xl sm:text-2xl text-[#fdf2f4] group-hover:text-white transition-colors font-normal leading-snug">
              {member.displayName}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-[#d8afbf] mt-0.5">
              <span className="font-mono text-[#f472b6]">@{member.username}</span>
              {member.nickname && member.nickname !== member.displayName && (
                <span className="text-[11px] text-white/50">({member.nickname})</span>
              )}
            </div>
          </div>

          {/* Real Live Presence & Activity State (Rendered ONLY when active) */}
          {member.primaryActivity && (
            <div className="mb-3">
              <DiscordActivityCard
                activity={member.primaryActivity}
                compact={true}
              />
            </div>
          )}

          {/* Owner Provided Status Note or Bio snippet */}
          {member.suppliedStatusText && (
            <div className="mb-3 p-2.5 rounded-xl bg-[#260e28]/70 border border-[#f472b6]/15 text-xs text-[#fceef2] font-editorial leading-relaxed italic line-clamp-2">
              "{member.suppliedStatusText}"
            </div>
          )}

          {member.suppliedBio && !member.suppliedStatusText && (
            <div className="mb-3 text-xs text-[#d8afbf] font-editorial leading-relaxed line-clamp-2">
              {Array.isArray(member.suppliedBio)
                ? member.suppliedBio.join(' · ')
                : member.suppliedBio}
            </div>
          )}
        </div>

        {/* External Links Strip / Footer Action */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {member.externalLinks && member.externalLinks.length > 0 ? (
              member.externalLinks.slice(0, 2).map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-[11px] text-[#f472b6] hover:text-white transition-colors"
                >
                  <span className="truncate max-w-[120px]">{link.label}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ))
            ) : (
              <span className="text-[11px] text-[#a08592] uppercase tracking-wider font-semibold">
                {member.badge}
              </span>
            )}
          </div>

          <span className="text-[11px] text-[#f472b6] font-semibold uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
            Profile →
          </span>
        </div>
      </div>
    </div>
  );
});

ProfileCard.displayName = 'ProfileCard';
