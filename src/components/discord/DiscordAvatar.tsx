import React, { useState } from 'react';

export interface DiscordAvatarProps {
  avatarUrl: string;
  displayName: string;
  presence?: 'online' | 'idle' | 'dnd' | 'offline';
  avatarDecorationUrl?: string | null;
  profileFrameUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPresence?: boolean;
  accentColor?: string;
  notchColor?: string;
  className?: string;
}

export const DiscordAvatar: React.FC<DiscordAvatarProps> = ({
  avatarUrl,
  displayName,
  presence = 'offline',
  avatarDecorationUrl,
  profileFrameUrl,
  size = 'lg',
  showPresence = true,
  accentColor,
  notchColor = '#18081a',
  className = '',
}) => {
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const [failedDecUrl, setFailedDecUrl] = useState<string | null>(null);
  const [failedFrameUrl, setFailedFrameUrl] = useState<string | null>(null);

  // Derived state: automatically resets when URL changes without cascading effects
  const imgError = failedAvatarUrl === avatarUrl;
  const decError = failedDecUrl === avatarDecorationUrl;
  const frameError = failedFrameUrl === profileFrameUrl;

  // Geometry dimensions per size tier
  const sizeMap = {
    sm: {
      container: 'w-10 h-10',
      presence: 'w-3.5 h-3.5',
      borderWidth: 'border-[2px]',
      notchWidth: 'border-[2px]',
    },
    md: {
      container: 'w-14 h-14',
      presence: 'w-4.5 h-4.5',
      borderWidth: 'border-[2px]',
      notchWidth: 'border-[2.5px]',
    },
    lg: {
      container: 'w-20 h-20 sm:w-22 sm:h-22',
      presence: 'w-5.5 h-5.5 sm:w-6 sm:h-6',
      borderWidth: 'border-[2.5px]',
      notchWidth: 'border-[3px]',
    },
    xl: {
      container: 'w-24 h-24 sm:w-28 sm:h-28',
      presence: 'w-6.5 h-6.5 sm:w-7 sm:h-7',
      borderWidth: 'border-[3px]',
      notchWidth: 'border-[4px]',
    },
  };

  const currentSize = sizeMap[size];

  const getPresenceColor = (status: 'online' | 'idle' | 'dnd' | 'offline') => {
    switch (status) {
      case 'online':
        return 'bg-[#23a55a] shadow-[0_0_8px_rgba(35,165,90,0.6)]';
      case 'idle':
        return 'bg-[#f0b232] shadow-[0_0_8px_rgba(240,178,50,0.6)]';
      case 'dnd':
        return 'bg-[#f23f43] shadow-[0_0_8px_rgba(242,63,67,0.6)]';
      case 'offline':
      default:
        return 'bg-[#80848e]';
    }
  };

  // Fallback to Discord default avatar if image failed or empty
  const effectiveAvatarSrc =
    imgError || !avatarUrl
      ? 'https://cdn.discordapp.com/embed/avatars/0.png'
      : avatarUrl;

  return (
    <div className={`relative inline-block select-none shrink-0 ${className}`}>
      {/* 1. Base Avatar with Accent Border & Aspect Ratio Guarantee */}
      <div
        className={`relative rounded-full overflow-hidden shadow-xl bg-[#220a22] aspect-square ${currentSize.container} ${currentSize.borderWidth}`}
        style={{
          borderColor: accentColor || 'rgba(244, 114, 182, 0.4)',
        }}
      >
        <img
          src={effectiveAvatarSrc}
          alt={displayName}
          onError={() => setFailedAvatarUrl(avatarUrl)}
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
        />
      </div>

      {/* 2. Optional Profile Frame Layer */}
      {profileFrameUrl && !frameError && (
        <img
          src={profileFrameUrl}
          alt="Profile Frame"
          onError={() => setFailedFrameUrl(profileFrameUrl)}
          className="absolute -top-[10%] -left-[10%] w-[120%] h-[120%] max-w-none pointer-events-none z-10"
          loading="lazy"
        />
      )}

      {/* 3. Discord Avatar Decoration Overlay (Exact Discord 118% Proportion Notch) */}
      {avatarDecorationUrl && !decError && (
        <img
          src={avatarDecorationUrl}
          alt="Avatar Decoration"
          onError={() => setFailedDecUrl(avatarDecorationUrl)}
          className="absolute -top-[9%] -left-[9%] w-[118%] h-[118%] max-w-none pointer-events-none z-15"
          loading="lazy"
        />
      )}

      {/* 4. Presence Indicator Badge with Matching Container Notch Cutout */}
      {showPresence && (
        <div
          className={`absolute bottom-0 right-0 z-20 rounded-full flex items-center justify-center ${currentSize.presence} ${currentSize.notchWidth} ${getPresenceColor(
            presence
          )}`}
          style={{
            borderColor: notchColor,
          }}
          title={`Presence: ${presence.toUpperCase()}`}
          aria-label={`Status: ${presence}`}
        >
          {/* Subtle DND minus sign indicator */}
          {presence === 'dnd' && size !== 'sm' && (
            <span className="w-[50%] h-[2px] bg-white rounded-full" />
          )}
          {/* Authentic Discord Hollow Offline Circle */}
          {presence === 'offline' && size !== 'sm' && (
            <span
              className="w-[44%] h-[44%] rounded-full"
              style={{ backgroundColor: notchColor }}
            />
          )}
        </div>
      )}
    </div>
  );
};
