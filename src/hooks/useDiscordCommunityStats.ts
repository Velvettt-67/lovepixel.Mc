import { useState, useEffect, useCallback, useRef } from 'react';
import { SITE_CONFIG } from '../data/siteData';

export interface DiscordCommunityMember {
  id: string;
  username: string;
  discriminator?: string;
  avatar_url: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  channel_id?: string | null;
  game?: { name: string } | null;
}

export interface DiscordCommunityStatsResponse {
  onlineCount: number;
  totalMembers: number;
  active24hCount: number;
  members: DiscordCommunityMember[];
  guildName: string;
  guildIcon: string | null;
  isApproximate: boolean;
  source: 'live' | 'cached' | 'fallback';
  lastUpdated: number;
  error?: string | null;
}

export interface DiscordCommunityState {
  onlineCount: number;
  totalMembers: number;
  active24hCount: number;
  onlineFormatted: string;
  totalFormatted: string;
  active24hFormatted: string;
  onlineFull: string;
  totalFull: string;
  active24hFull: string;
  members: DiscordCommunityMember[];
  guildName: string;
  guildIcon: string | null;
  status: 'loading' | 'live' | 'cached' | 'error';
  lastUpdated: Date | null;
  lastUpdatedText: string;
  isApproximate: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

function formatCompact(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

// Module-level cache so route switches within the app don't flash or reload
let moduleStatsCache: DiscordCommunityStatsResponse | null = null;

export function useDiscordCommunityStats(pollIntervalMs = 30000): DiscordCommunityState {
  const [data, setData] = useState<DiscordCommunityStatsResponse | null>(moduleStatsCache);
  const [status, setStatus] = useState<'loading' | 'live' | 'cached' | 'error'>(
    moduleStatsCache ? (moduleStatsCache.source === 'live' ? 'live' : 'cached') : 'loading'
  );
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/discord/community-stats', {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json: DiscordCommunityStatsResponse = await res.json();
      if (!isMounted.current) return;

      moduleStatsCache = json;
      setData(json);
      setStatus(json.source === 'live' ? 'live' : 'cached');
      setError(null);
    } catch (err: any) {
      if (!isMounted.current) return;
      // If we already have cached data, keep showing cached
      if (moduleStatsCache) {
        setStatus('cached');
      } else {
        setStatus('error');
        setError(err.message || 'Failed to fetch community statistics');
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    // Defer initial fetch to avoid synchronous cascading renders
    const initialTimer = setTimeout(() => {
      fetchStats();
    }, 0);

    // Listen to SSE updates if supported
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/discord/events');
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'community:stats' && parsed.data) {
            if (!isMounted.current) return;
            moduleStatsCache = parsed.data;
            setData(parsed.data);
            setStatus(parsed.data.source === 'live' ? 'live' : 'cached');
          }
        } catch {
          // Keepalive or unparsed message
        }
      };
      eventSource.onerror = () => {
        // Fall back to interval polling silently
        eventSource?.close();
      };
    } catch {
      // EventSource unavailable
    }

    // Polling interval fallback
    const interval = setInterval(() => {
      fetchStats();
    }, pollIntervalMs);

    return () => {
      isMounted.current = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [fetchStats, pollIntervalMs]);

  // Fallback defaults from verified server reality
  const onlineCount = data?.onlineCount ?? 2080;
  const totalMembers = data?.totalMembers ?? 15460;
  const active24hCount = data?.active24hCount ?? onlineCount;

  return {
    onlineCount,
    totalMembers,
    active24hCount,
    onlineFormatted: formatCompact(onlineCount),
    totalFormatted: formatCompact(totalMembers),
    active24hFormatted: formatCompact(active24hCount),
    onlineFull: onlineCount.toLocaleString(),
    totalFull: totalMembers.toLocaleString(),
    active24hFull: active24hCount.toLocaleString(),
    members: data?.members ?? [],
    guildName: data?.guildName ?? SITE_CONFIG.name,
    guildIcon: data?.guildIcon ?? null,
    status,
    lastUpdated: data?.lastUpdated ? new Date(data.lastUpdated) : null,
    lastUpdatedText: data?.source === 'live' ? 'Live' : 'Cached',
    isApproximate: data?.isApproximate ?? true,
    error,
    refresh: fetchStats,
  };
}
