import React, { useState, useEffect } from 'react';
import { Gamepad2, Radio, Tv, Trophy, ExternalLink, Music, Clock } from 'lucide-react';
import { type NormalizedDiscordActivity } from '../../data/managementData';

interface DiscordActivityCardProps {
  activity: NormalizedDiscordActivity | null | undefined;
  compact?: boolean;
  className?: string;
}

function formatDuration(ms: number): string {
  if (ms < 0) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const DiscordActivityCard: React.FC<DiscordActivityCardProps> = ({
  activity,
  compact = false,
  className = '',
}) => {
  const [failedAlbumArt, setFailedAlbumArt] = useState<string | null>(null);
  const [failedGameArt, setFailedGameArt] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Derived state automatically clears when activity changes
  const albumArtUrl = activity?.isSpotify ? activity.spotifyData?.albumArtUrl : null;
  const gameArtUrl = activity?.type === 'PLAYING' ? activity.assets?.largeImageUrl : null;

  const albumArtError = Boolean(albumArtUrl && failedAlbumArt === albumArtUrl);
  const gameArtError = Boolean(gameArtUrl && failedGameArt === gameArtUrl);

  // Live timer tick for Spotify and Game playback progress
  useEffect(() => {
    if (!activity) return;
    const hasActiveTimestamp =
      Boolean(activity.isSpotify && activity.timestamps?.end) ||
      Boolean(activity.timestamps?.start);

    if (!hasActiveTimestamp) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [activity]);

  // If no activity, omit section completely (Section 20 requirement)
  if (!activity) {
    return null;
  }

  // =========================================================================
  // 1. SPOTIFY ACTIVITY CARD
  // =========================================================================
  if (activity.isSpotify && activity.spotifyData) {
    const { trackTitle, artist, album, albumArtUrl, trackUrl, start, end } =
      activity.spotifyData;

    let progressPercent = 0;
    let elapsedFormatted = '0:00';
    let durationFormatted = '0:00';

    if (start && end && end > start) {
      const duration = end - start;
      const elapsed = Math.max(0, Math.min(currentTime - start, duration));
      progressPercent = Math.min(100, Math.max(0, (elapsed / duration) * 100));
      elapsedFormatted = formatDuration(elapsed);
      durationFormatted = formatDuration(duration);
    }

    if (compact) {
      return (
        <div
          className={`flex items-center gap-2.5 p-2 rounded-xl bg-[#0f2415]/70 border border-[#1db954]/25 text-xs text-[#e0f5e5] truncate ${className}`}
        >
          {albumArtUrl && !albumArtError ? (
            <img
              src={albumArtUrl}
              alt={album}
              onError={() => setFailedAlbumArt(albumArtUrl)}
              className="w-7 h-7 rounded-md object-cover shrink-0 shadow-xs aspect-square"
            />
          ) : (
            <div className="w-7 h-7 rounded-md bg-[#1db954]/20 flex items-center justify-center shrink-0">
              <Music className="w-3.5 h-3.5 text-[#1db954]" />
            </div>
          )}
          <div className="truncate flex-1">
            <div className="text-[11px] font-semibold text-white truncate flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1db954] animate-pulse shrink-0" />
              <span className="truncate">{trackTitle}</span>
            </div>
            <div className="text-[10px] text-[#a7d9b2] truncate">{artist}</div>
          </div>
        </div>
      );
    }

    // Detailed Spotify Card for Expanded Modal & Large Cards
    return (
      <div
        className={`p-4 rounded-2xl bg-[#0c1c11]/85 border border-[#1db954]/30 shadow-lg text-left select-none overflow-hidden max-w-full ${className}`}
      >
        {/* Header Eyebrow */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Spotify Official Green Emblem */}
            <svg
              className="w-4 h-4 text-[#1db954] shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1db954]">
              Listening to Spotify
            </span>
          </div>

          {/* Animated Equalizer Waves */}
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-1 bg-[#1db954] rounded-full animate-pulse h-2" />
            <span className="w-1 bg-[#1db954] rounded-full animate-pulse h-3" />
            <span className="w-1 bg-[#1db954] rounded-full animate-pulse h-1.5" />
          </div>
        </div>

        {/* Content Row: Album Art + Song & Artist */}
        <div className="flex items-center gap-3.5 mb-3">
          {albumArtUrl && !albumArtError ? (
            <img
              src={albumArtUrl}
              alt={album}
              onError={() => setFailedAlbumArt(albumArtUrl)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shadow-md shrink-0 border border-white/10 aspect-square"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#1db954]/20 border border-[#1db954]/30 flex items-center justify-center shrink-0 aspect-square">
              <Music className="w-6 h-6 text-[#1db954]" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {trackUrl ? (
              <a
                href={trackUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-display text-base sm:text-lg text-white font-medium hover:text-[#1db954] transition-colors leading-snug truncate block group"
              >
                <span className="truncate">{trackTitle}</span>
                <ExternalLink className="inline-block w-3 h-3 ml-1.5 opacity-60 group-hover:opacity-100 shrink-0" />
              </a>
            ) : (
              <div className="font-display text-base sm:text-lg text-white font-medium truncate leading-snug">
                {trackTitle}
              </div>
            )}
            <div className="text-xs text-[#b8e8c5] truncate mt-0.5">by {artist}</div>
            {album && <div className="text-[11px] text-[#71a37e] truncate mt-0.5">on {album}</div>}
          </div>
        </div>

        {/* Live Playback Progress Bar */}
        {end && end > (start || 0) && (
          <div className="pt-1">
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-1">
              <div
                className="h-full bg-gradient-to-r from-[#1db954] to-emerald-300 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#a7d9b2] font-mono">
              <span>{elapsedFormatted}</span>
              <span>{durationFormatted}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. GAME / APPLICATION ACTIVITY CARD (Type 0)
  // =========================================================================
  if (activity.type === 'PLAYING') {
    const largeImage = activity.assets?.largeImageUrl;
    const startTime = activity.timestamps?.start;
    const elapsedText = startTime
      ? `${formatDuration(currentTime - startTime)} elapsed`
      : null;

    if (compact) {
      return (
        <div
          className={`flex items-center gap-2 p-2 rounded-xl bg-[#1b1730]/70 border border-sky-400/25 text-xs text-white/90 truncate ${className}`}
        >
          {largeImage && !gameArtError ? (
            <img
              src={largeImage}
              alt={activity.name}
              onError={() => setFailedGameArt(largeImage)}
              className="w-6 h-6 rounded-md object-cover shrink-0 aspect-square"
            />
          ) : (
            <Gamepad2 className="w-4 h-4 text-sky-400 shrink-0" />
          )}
          <span className="truncate text-[11px]">
            Playing <span className="font-semibold text-sky-300">{activity.name}</span>
          </span>
        </div>
      );
    }

    return (
      <div
        className={`p-4 rounded-2xl bg-[#131326]/85 border border-sky-400/25 shadow-lg text-left select-none overflow-hidden max-w-full ${className}`}
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-sky-400">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Playing a Game</span>
          </div>
          {elapsedText && (
            <div className="flex items-center gap-1 text-[10px] text-sky-300/80 font-mono">
              <Clock className="w-3 h-3" />
              <span>{elapsedText}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {largeImage && !gameArtError && (
            <img
              src={largeImage}
              alt={activity.name}
              onError={() => setFailedGameArt(largeImage)}
              className="w-12 h-12 rounded-xl object-cover shadow-md shrink-0 border border-white/10 aspect-square"
            />
          )}

          <div className="flex-1 min-w-0">
            <h4 className="font-display text-base text-white font-medium leading-snug truncate">
              {activity.name}
            </h4>
            {activity.details && (
              <div className="text-xs text-sky-200 truncate mt-0.5">{activity.details}</div>
            )}
            {activity.state && (
              <div className="text-[11px] text-[#9bb3d3] truncate mt-0.5">{activity.state}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. STREAMING / WATCHING / COMPETING / CUSTOM
  // =========================================================================
  return (
    <div
      className={`p-3 rounded-xl bg-[#200c22]/70 border border-white/10 text-xs text-white/90 text-left select-none overflow-hidden max-w-full ${className}`}
    >
      <div className="flex items-center gap-2 text-[10px] uppercase font-semibold text-[#f472b6] mb-1">
        {activity.type === 'STREAMING' && <Radio className="w-3 h-3" />}
        {activity.type === 'WATCHING' && <Tv className="w-3 h-3" />}
        {activity.type === 'COMPETING' && <Trophy className="w-3 h-3" />}
        <span>{activity.type}</span>
      </div>
      <div className="font-medium text-white truncate">{activity.name}</div>
      {activity.details && <div className="text-[11px] text-[#d8afbf] truncate">{activity.details}</div>}
      {activity.state && <div className="text-[11px] text-[#a08592] truncate">{activity.state}</div>}
    </div>
  );
};
