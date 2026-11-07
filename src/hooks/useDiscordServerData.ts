import { useState, useEffect, useCallback, useRef } from 'react';
import { SITE_CONFIG } from '../data/siteData';

export interface DiscordServerData {
  onlineCount: number | null;
  memberCount: number | null;
  onlineFormatted: string;
  memberFormatted: string;
  onlineFull: string;
  memberFull: string;
  status: 'loading' | 'live' | 'cached' | 'error';
  lastUpdated: Date | null;
  lastUpdatedText: string;
  isApproximate: boolean;
  guildName: string | null;
  error: string | null;
}

// Module-level cache so counts persist across internal route changes without re-fetching or flickering
let cachedData: {
  onlineCount: number;
  memberCount: number | null;
  lastUpdated: Date;
  guildName: string;
} | null = null;

function formatCompact(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

export function useDiscordServerData(pollIntervalMs = 35000): DiscordServerData {
  const [data, setData] = useState<DiscordServerData>(() => {
    if (cachedData) {
      return {
        onlineCount: cachedData.onlineCount,
        memberCount: cachedData.memberCount,
        onlineFormatted: formatCompact(cachedData.onlineCount),
        memberFormatted: cachedData.memberCount ? formatCompact(cachedData.memberCount) : '',
        onlineFull: cachedData.onlineCount.toLocaleString(),
        memberFull: cachedData.memberCount ? cachedData.memberCount.toLocaleString() : '',
        status: 'live',
        lastUpdated: cachedData.lastUpdated,
        lastUpdatedText: 'Cached',
        isApproximate: true,
        guildName: cachedData.guildName,
        error: null,
      };
    }
    return {
      onlineCount: 2080,
      memberCount: 15460,
      onlineFormatted: '2.1k',
      memberFormatted: '15.4k',
      onlineFull: '2,080',
      memberFull: '15,460',
      status: 'loading',
      lastUpdated: null,
      lastUpdatedText: 'Connecting...',
      isApproximate: true,
      guildName: 'LovePixels',
      error: null,
    };
  });

  const isMounted = useRef(true);

  const fetchDiscordData = useCallback(async () => {
    let fetchedOnline: number | null = null;
    let fetchedMembers: number | null = null;
    let fetchedName: string | null = null;

    // Source 1: Backend Community Stats API (primary source with caching & SQLite 24h sync)
    try {
      const apiRes = await fetch('/api/discord/community-stats');
      if (apiRes.ok) {
        const stats = await apiRes.json();
        if (typeof stats.onlineCount === 'number') {
          fetchedOnline = stats.onlineCount;
          fetchedMembers = stats.totalMembers;
          fetchedName = stats.guildName;
        }
      }
    } catch {
      // Backend request failed; fall through to direct Discord APIs
    }

    // Source 2: Direct Discord Invite API (fallback)
    if (fetchedOnline === null) {
      try {
        const inviteRes = await fetch(
          'https://discord.com/api/v9/invites/kwHcdGg2f?with_counts=true',
          { cache: 'no-store' }
        );

        if (inviteRes.ok) {
          const inviteJson = await inviteRes.json();
          fetchedOnline = inviteJson.approximate_presence_count ?? null;
          fetchedMembers = inviteJson.approximate_member_count ?? null;
          fetchedName = inviteJson.guild?.name ?? 'LovePixels';
        }
      } catch {
        // Invite fetch failed
      }
    }

    // Source 3: Direct Discord Guild Widget endpoint (fallback)
    if (fetchedOnline === null) {
      try {
        const widgetRes = await fetch(
          `https://discord.com/api/guilds/${SITE_CONFIG.discordGuildId}/widget.json`,
          { cache: 'no-store' }
        );

        if (widgetRes.ok) {
          const widgetJson = await widgetRes.json();
          fetchedOnline = widgetJson.presence_count ?? null;
          fetchedName = widgetJson.name ?? fetchedName;
        }
      } catch {
        // Widget fetch failed
      }
    }

    if (!isMounted.current) return;

    if (fetchedOnline !== null) {
      const now = new Date();
      cachedData = {
        onlineCount: fetchedOnline,
        memberCount: fetchedMembers,
        lastUpdated: now,
        guildName: fetchedName || 'LovePixels',
      };

      setData({
        onlineCount: fetchedOnline,
        memberCount: fetchedMembers,
        onlineFormatted: formatCompact(fetchedOnline),
        memberFormatted: fetchedMembers ? formatCompact(fetchedMembers) : '',
        onlineFull: fetchedOnline.toLocaleString(),
        memberFull: fetchedMembers ? fetchedMembers.toLocaleString() : '',
        status: 'live',
        lastUpdated: now,
        lastUpdatedText: 'Live',
        isApproximate: true,
        guildName: fetchedName || 'LovePixels',
        error: null,
      });
    } else {
      setData((prev) => ({
        ...prev,
        status: prev.onlineCount ? 'cached' : 'error',
        lastUpdatedText: prev.onlineCount ? 'Cached' : 'Offline',
        error: prev.onlineCount ? null : 'Failed to reach Discord servers',
      }));
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    // Defer initial fetch to avoid synchronous cascading renders
    const initialTimer = setTimeout(() => {
      fetchDiscordData();
    }, 0);

    const interval = setInterval(() => {
      fetchDiscordData();
    }, pollIntervalMs);

    return () => {
      isMounted.current = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [fetchDiscordData, pollIntervalMs]);

  return data;
}
