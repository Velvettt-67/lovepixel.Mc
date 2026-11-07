import React, { useEffect, useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Crown,
  Sparkles,
  MessageSquare,
  MoreHorizontal,
  Gamepad2,
  Flame,
  ChevronDown,
} from 'lucide-react';
import { type ManagementMember } from '../../data/managementData';
import { DiscordAvatar } from '../discord/DiscordAvatar';
import { SITE_CONFIG } from '../../data/siteData';

interface ExpandedProfileModalProps {
  member: ManagementMember | null;
  onClose: () => void;
}

export const ExpandedProfileModal: React.FC<ExpandedProfileModalProps> = ({ member, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [failedBannerUrl, setFailedBannerUrl] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(6741); // 1:52:21 base

  const bannerError = failedBannerUrl === member?.bannerUrl;

  // Live timer tick for game & Spotify activity
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll while modal is active
  useEffect(() => {
    if (member) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [member]);

  if (!member) return null;

  const isLight = member.themeMode === 'light';

  const copyUserId = () => {
    navigator.clipboard.writeText(member.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format seconds to H:MM:SS or MM:SS
  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Check if member has real activities
  const spotifyActivity = member.liveActivities?.find((a) => a.isSpotify);
  const gameActivity = member.liveActivities?.find(
    (a) => !a.isSpotify && (a.type === 'PLAYING' || a.name.toLowerCase().includes('code'))
  );
  const hasActivities = Boolean(spotifyActivity || gameActivity);

  const hasBannerImage = Boolean(member.bannerUrl && !bannerError);
  // Pure solid white for Arch & light mode users without banner
  const defaultBannerBg = isLight ? '#ffffff' : (member.bannerColor || member.accentColor || '#18071e');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-name"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${
          hasActivities ? 'max-w-[780px]' : 'max-w-[440px]'
        } rounded-[24px] overflow-hidden text-left max-h-[92vh] flex flex-col shadow-2xl transition-all duration-200 border ${
          isLight
            ? 'bg-[#f2f3f5] text-[#111214] border-[#e3e5e8]'
            : 'bg-[#18191c] text-[#f2f3f5] border-[#2b2d31]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* =========================================================================
            HEADER LAYER: BANNER + FLOATING CONTROLS (NON-CLIPPING CONTAINER)
            ========================================================================= */}
        <div className="relative shrink-0 select-none">
          <div
            className="relative h-40 sm:h-48 w-full overflow-hidden border-b"
            style={{
              backgroundColor: defaultBannerBg,
              borderColor: isLight ? '#e3e5e8' : '#2b2d31',
            }}
          >
            {hasBannerImage ? (
              <img
                src={member.bannerUrl!}
                alt={`${member.displayName} Banner`}
                onError={() => setFailedBannerUrl(member.bannerUrl || '')}
                className="w-full h-full object-cover"
                loading="eager"
              />
            ) : isLight ? (
              // Crisp, pure clean white background for Arch and light mode users without banner
              <div className="w-full h-full bg-white relative">
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)',
                    backgroundSize: '16px 16px',
                  }}
                />
              </div>
            ) : (
              // Deep subtle gradient for dark users
              <div
                className="w-full h-full relative"
                style={{
                  background: `radial-gradient(ellipse 120% 80% at 50% 20%, ${member.accentColor}33 0%, ${defaultBannerBg} 70%, #0d030f 100%)`,
                }}
              />
            )}

            {/* Close Action Button */}
            <button
              onClick={onClose}
              className={`absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md focus:outline-none ${
                isLight
                  ? 'bg-white/90 hover:bg-white text-[#313338] border border-black/10'
                  : 'bg-black/60 hover:bg-black/90 text-white border border-white/20'
              }`}
              aria-label="Close profile modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top Left: Server Role Pill Badge */}
            <div className="absolute top-3.5 left-3.5 z-20">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider shadow-md backdrop-blur-md border ${
                  isLight
                    ? 'bg-white/95 text-[#313338] border-black/10'
                    : 'bg-black/80 text-white border-white/15'
                }`}
              >
                {member.tier === 'owner' ? (
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                ) : member.tier === 'holds_power' ? (
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-sky-500" />
                )}
                <span>{member.roleTitle}</span>
              </span>
            </div>
          </div>

          {/* Avatar and Action Strip: Overlaps the banner WITHOUT clipping! */}
          <div className="px-5 sm:px-6 flex items-end justify-between -mt-14 sm:-mt-16 relative z-10 pointer-events-none">
            <div className="flex items-end gap-3 pointer-events-auto">
              <DiscordAvatar
                avatarUrl={member.avatarUrl}
                displayName={member.displayName}
                presence={member.livePresence}
                avatarDecorationUrl={member.avatarDecorationUrl}
                profileFrameUrl={member.profileFrameUrl}
                size="xl"
                accentColor={isLight ? '#e3e5e8' : member.accentColor}
                notchColor={isLight ? '#ffffff' : '#1e1f22'}
                className="shadow-xl"
              />

              {/* Floating Discord Speech Bubble Status */}
              {member.suppliedStatusText && (
                <div
                  className={`relative mb-2 px-3 py-1.5 rounded-2xl max-w-[210px] shadow-md border text-xs leading-snug flex items-center gap-1.5 animate-fade-in ${
                    isLight
                      ? 'bg-white text-[#313338] border-[#e3e5e8]'
                      : 'bg-[#2b2d31] text-[#f2f3f5] border-[#383a40]'
                  }`}
                  style={{ wordBreak: 'break-word' }}
                >
                  <span
                    className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 border-l border-b ${
                      isLight
                        ? 'bg-white border-[#e3e5e8]'
                        : 'bg-[#2b2d31] border-[#383a40]'
                    }`}
                  />
                  {member.statusEmoji && (
                    <span className="text-sm shrink-0">{member.statusEmoji}</span>
                  )}
                  <span className="font-medium relative z-10 truncate">{member.suppliedStatusText}</span>
                </div>
              )}
            </div>

            {/* Quick Actions (Copy ID) */}
            <div className="pointer-events-auto mb-2 flex items-center gap-1.5">
              <button
                onClick={copyUserId}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isLight
                    ? 'bg-[#e3e5e8] hover:bg-[#dbdee1] text-[#2e3338] border-[#d7d9dc]'
                    : 'bg-[#2b2d31] hover:bg-[#35373c] text-white border-[#383a40]'
                }`}
                title="Copy Discord User ID"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 opacity-70" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            PROFILE DETAILS & ACTIVITIES BODY
            ========================================================================= */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col md:flex-row">
          {/* -----------------------------------------------------------------------
              USER PROFILE CARD
              ----------------------------------------------------------------------- */}
          <div
            className={`w-full ${
              hasActivities ? 'md:w-[360px] md:border-r shrink-0' : 'w-full'
            } p-5 sm:p-6 space-y-4 ${
              isLight ? 'bg-white border-[#e3e5e8]' : 'bg-[#1e1f22] border-[#2b2d31]'
            }`}
          >
            {/* Display Name, Username, Badges */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="profile-modal-name"
                  className={`font-sans text-xl sm:text-2xl font-bold tracking-tight ${
                    isLight ? 'text-[#111214]' : 'text-white'
                  }`}
                >
                  {member.displayName}
                </h2>
              </div>

              {/* Username + Potato/Emoji + Clan Badge */}
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className={`font-mono ${isLight ? 'text-[#4e5058]' : 'text-[#b5bac1]'}`}>
                  {member.username}
                </span>
                <span className="text-xs">🥔</span>
                {member.clanTag && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                      isLight
                        ? 'bg-[#ebedef] text-[#313338] border-[#dbdee1]'
                        : 'bg-[#2b2d31] text-white border-[#383a40]'
                    }`}
                  >
                    <span>{member.clanTagEmoji || '💜'}</span>
                    <span>{member.clanTag}</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </span>
                )}
              </div>

              {/* Discord Authentic Badges Row */}
              {member.badges && member.badges.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                  {member.badges.map((b) => (
                    <span
                      key={b.id}
                      className={`inline-flex items-center justify-center h-6 px-1.5 rounded-md text-[11px] font-semibold border shadow-2xs ${
                        isLight
                          ? 'bg-[#f2f3f5] text-[#313338] border-[#e3e5e8]'
                          : 'bg-[#2b2d31] text-[#f2f3f5] border-[#383a40]'
                      }`}
                      title={b.name}
                    >
                      {b.iconType === 'dev' && <span className="text-sm">💻</span>}
                      {b.iconType === 'blender' && <span className="text-sm">🎨</span>}
                      {b.iconType === 'hypesquad' && <span className="text-sm">🔺</span>}
                      {b.iconType === 'booster' && <Flame className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />}
                      {b.iconType === 'nitro' && <Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                      {b.iconType === 'count' && <span className="text-[10px] font-bold px-0.5">{b.label}</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons (Message & More) */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={SITE_CONFIG.discordInviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  isLight
                    ? 'bg-[#e3e5e8] hover:bg-[#dbdee1] text-[#2e3338] border-[#d7d9dc]'
                    : 'bg-[#2b2d31] hover:bg-[#35373c] text-white border-[#383a40]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message</span>
              </a>

              <button
                className={`p-1.5 rounded-lg border transition-all ${
                  isLight
                    ? 'bg-[#e3e5e8] hover:bg-[#dbdee1] text-[#2e3338] border-[#d7d9dc]'
                    : 'bg-[#2b2d31] hover:bg-[#35373c] text-white border-[#383a40]'
                }`}
                title="More Options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className={`h-[1px] w-full ${isLight ? 'bg-[#e3e5e8]' : 'bg-[#2b2d31]'}`} />

            {/* Bio Section */}
            {member.suppliedBio && (
              <div className="space-y-1">
                <div
                  className={`text-[11px] uppercase font-bold tracking-wider ${
                    isLight ? 'text-[#4e5058]' : 'text-[#b5bac1]'
                  }`}
                >
                  Bio
                </div>
                <div
                  className={`text-xs leading-relaxed font-sans whitespace-pre-wrap ${
                    isLight ? 'text-[#313338]' : 'text-[#dbdee1]'
                  }`}
                >
                  {typeof member.suppliedBio === 'string' ? (
                    member.suppliedBio.split('\n').map((line, i) => (
                      <div key={i}>
                        {line.startsWith('http') ? (
                          <a
                            href={line}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 hover:underline break-all font-medium"
                          >
                            {line}
                          </a>
                        ) : (
                          line
                        )}
                      </div>
                    ))
                  ) : (
                    member.suppliedBio.map((item, i) => (
                      <div key={i}>
                        {item.startsWith('http') ? (
                          <a
                            href={item}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 hover:underline break-all font-medium"
                          >
                            {item}
                          </a>
                        ) : (
                          item
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Member Since Section */}
            {member.memberSince && (
              <div className="space-y-1">
                <div
                  className={`text-[11px] uppercase font-bold tracking-wider ${
                    isLight ? 'text-[#4e5058]' : 'text-[#b5bac1]'
                  }`}
                >
                  Member Since
                </div>
                <div className={`text-xs ${isLight ? 'text-[#313338]' : 'text-[#dbdee1]'}`}>
                  {member.memberSince}
                </div>
              </div>
            )}

            {/* Connected Accounts Section */}
            {member.connections && member.connections.length > 0 && (
              <div className="space-y-1.5">
                <div
                  className={`text-[11px] uppercase font-bold tracking-wider ${
                    isLight ? 'text-[#4e5058]' : 'text-[#b5bac1]'
                  }`}
                >
                  Connections
                </div>
                <div className="space-y-1.5">
                  {member.connections.map((conn, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium border ${
                        isLight
                          ? 'bg-[#f8f9fa] border-[#e3e5e8] text-[#313338]'
                          : 'bg-[#2b2d31] border-[#383a40] text-[#f2f3f5]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {conn.type === 'epic' && <span className="text-sm">🎮</span>}
                        {conn.type === 'github' && <span className="text-sm">🐙</span>}
                        {conn.type === 'roblox' && <span className="text-sm">🟥</span>}
                        {conn.type === 'spotify' && <span className="text-sm">🟢</span>}
                        <span className="font-semibold">{conn.name}</span>
                      </div>
                      {conn.url && (
                        <a
                          href={conn.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-500 hover:text-sky-600"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Roles Section */}
            {member.rolesList && member.rolesList.length > 0 && (
              <div className="space-y-1.5">
                <div
                  className={`text-[11px] uppercase font-bold tracking-wider ${
                    isLight ? 'text-[#4e5058]' : 'text-[#b5bac1]'
                  }`}
                >
                  LovePixels Roles
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {member.rolesList.map((role, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                        isLight
                          ? 'bg-[#f2f3f5] text-[#313338] border-[#e3e5e8]'
                          : 'bg-[#2b2d31] text-[#f2f3f5] border-[#383a40]'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: role.color }}
                      />
                      <span>{role.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Single Profile Card Footer (when no activities column) */}
            {!hasActivities && (
              <div
                className={`pt-3 border-t flex items-center justify-between text-xs ${
                  isLight ? 'border-[#e3e5e8] text-[#5c5e66]' : 'border-[#2b2d31] text-[#949ba4]'
                }`}
              >
                <span>{member.badge}</span>
                <a
                  href={SITE_CONFIG.discordInviteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-pink-600 hover:text-pink-700 font-semibold transition-colors"
                >
                  <span>Join LovePixels</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* -----------------------------------------------------------------------
              RIGHT COLUMN: REAL ACTIVITIES PANEL (Rendered only when active!)
              ----------------------------------------------------------------------- */}
          {hasActivities && (
            <div
              className={`flex-1 p-5 sm:p-6 flex flex-col justify-between space-y-4 ${
                isLight ? 'bg-[#f2f3f5]' : 'bg-[#18191c]'
              }`}
            >
              <div className="space-y-4">
                <div
                  className={`text-xs font-bold uppercase tracking-wider pb-1 border-b ${
                    isLight
                      ? 'text-[#4e5058] border-[#e3e5e8]'
                      : 'text-[#b5bac1] border-[#2b2d31]'
                  }`}
                >
                  Current activity
                </div>

                {/* 1. PLAYING / VS CODE ACTIVITY CARD (Exactly like Screenshot) */}
                {gameActivity && (
                  <div
                    className={`p-4 rounded-[16px] border shadow-2xs transition-all space-y-3 ${
                      isLight
                        ? 'bg-white border-[#e3e5e8]'
                        : 'bg-[#2b2d31] border-[#383a40]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={isLight ? 'text-[#4e5058]' : 'text-[#b5bac1]'}>
                        Playing
                      </span>
                      <button className="opacity-60 hover:opacity-100 focus:outline-none">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3.5">
                      {/* Keyboard icon tile with mini pinned VS Code logo on bottom right */}
                      <div className="relative w-16 h-16 rounded-[12px] bg-[#1e293b] flex items-center justify-center shrink-0 border border-white/10 shadow-xs">
                        <svg
                          className="w-9 h-9 text-cyan-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10" />
                        </svg>

                        {/* Pinned VS Code badge */}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1e1f22] p-0.5 border border-white/20 shadow-xs">
                          <img
                            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg"
                            alt="VS Code"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div
                          className={`font-bold text-base leading-tight truncate ${
                            isLight ? 'text-[#111214]' : 'text-white'
                          }`}
                        >
                          {gameActivity.name}
                        </div>
                        <div
                          className={`text-xs truncate ${
                            isLight ? 'text-[#4e5058]' : 'text-[#dbdee1]'
                          }`}
                        >
                          {gameActivity.state || 'Idling'}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#23a55a] font-semibold pt-0.5">
                          <Gamepad2 className="w-3.5 h-3.5" />
                          <span>{formatDuration(elapsedSeconds)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. LISTENING TO SPOTIFY CARD (Exactly like Screenshot) */}
                {spotifyActivity && (
                  <div
                    className={`p-4 rounded-[16px] border shadow-2xs transition-all space-y-3 ${
                      isLight
                        ? 'bg-white border-[#e3e5e8]'
                        : 'bg-[#2b2d31] border-[#383a40]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className={`flex items-center gap-1.5 ${isLight ? 'text-[#4e5058]' : 'text-[#b5bac1]'}`}>
                        <span>Listening to Spotify</span>
                        <svg className="w-3.5 h-3.5 fill-current opacity-80" viewBox="0 0 24 24">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                        </svg>
                      </div>
                      <button className="opacity-60 hover:opacity-100 focus:outline-none">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3.5">
                      {/* Album Art with fallback */}
                      <div className="relative w-16 h-16 rounded-[12px] overflow-hidden shrink-0 shadow-xs border border-black/10 bg-[#121212] flex items-center justify-center">
                        <img
                          src={spotifyActivity.spotifyData?.albumArtUrl || '/assets/events/mask-off.jpg'}
                          alt="Album Art"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/events/mask-off.jpg';
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="space-y-0.5">
                          <div
                            className={`font-bold text-base leading-tight truncate ${
                              isLight ? 'text-[#111214]' : 'text-white'
                            }`}
                          >
                            {spotifyActivity.spotifyData?.trackTitle || spotifyActivity.details}
                          </div>
                          <div
                            className={`text-xs truncate ${
                              isLight ? 'text-[#4e5058]' : 'text-[#dbdee1]'
                            }`}
                          >
                            {spotifyActivity.spotifyData?.artist || spotifyActivity.state}
                          </div>
                        </div>

                        {/* Spotify Time Scrubber Bar (Exact Discord proportion) */}
                        <div className="flex items-center gap-2 pt-0.5 text-[11px] font-mono text-[#5c5e66]">
                          <span>02:10</span>
                          <div
                            className={`relative flex-1 h-1 rounded-full overflow-hidden ${
                              isLight ? 'bg-[#e3e5e8]' : 'bg-[#1e1f22]'
                            }`}
                          >
                            <div
                              className="absolute top-0 bottom-0 left-0 bg-[#111214] rounded-full"
                              style={{ width: '64%' }}
                            />
                          </div>
                          <span>03:24</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Activity Column Footer */}
              <div
                className={`pt-3 border-t flex items-center justify-between text-xs ${
                  isLight ? 'border-[#e3e5e8] text-[#5c5e66]' : 'border-[#2b2d31] text-[#949ba4]'
                }`}
              >
                <span>{member.badge}</span>
                <a
                  href={SITE_CONFIG.discordInviteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-pink-600 hover:text-pink-700 font-semibold transition-colors"
                >
                  <span>Join LovePixels</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
