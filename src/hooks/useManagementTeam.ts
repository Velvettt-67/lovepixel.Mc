import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  type ManagementMember,
  BASELINE_MANAGEMENT_MEMBERS,
} from '../data/managementData';

export function useManagementTeam() {
  const [team, setTeam] = useState<ManagementMember[]>(() => [...BASELINE_MANAGEMENT_MEMBERS]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [source, setSource] = useState<'live' | 'cached' | 'fallback'>('cached');

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch('/api/discord/management');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.team) && data.team.length > 0) {
          setTeam(data.team);
          setSource(data.source || 'live');
          setLastUpdated(data.lastUpdated || Date.now());
          setError(null);
        }
      } else {
        // Non-breaking fallback keeps baseline team
        setSource('fallback');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch management team');
      setSource('fallback');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and 20s polling fallback
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/discord/management');
        if (res.ok && isMounted) {
          const data = await res.json();
          if (Array.isArray(data.team) && data.team.length > 0) {
            setTeam(data.team);
            setSource(data.source || 'live');
            setLastUpdated(data.lastUpdated || Date.now());
            setError(null);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to fetch management team');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void load();
    const interval = setInterval(() => {
      void fetchTeam();
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchTeam]);

  // Subscribe to SSE /api/discord/events for instant push updates
  useEffect(() => {
    if (typeof window === 'undefined' || !('EventSource' in window)) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/discord/events');

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'management:team' && Array.isArray(parsed.data)) {
            setTeam(parsed.data);
            setLastUpdated(Date.now());
            setSource('live');
          } else if (parsed.type === 'management:update' && parsed.member) {
            setTeam((prev) =>
              prev.map((m) => (m.id === parsed.member.id ? parsed.member : m))
            );
            setLastUpdated(Date.now());
            setSource('live');
          }
        } catch {
          // Ignore malformed SSE frames
        }
      };

      eventSource.onerror = () => {
        // SSE will reconnect automatically or fallback to polling
      };
    } catch {
      // EventSource instantiation fallback
    }

    return () => {
      eventSource?.close();
    };
  }, []);

  // Strict tier separation preserving owner-defined ordering
  const owners = useMemo(() => team.filter((m) => m.tier === 'owner'), [team]);
  const holdsPower = useMemo(() => team.filter((m) => m.tier === 'holds_power'), [team]);
  const management = useMemo(() => team.filter((m) => m.tier === 'management'), [team]);

  const activeLeadersCount = useMemo(() => {
    return team.filter((m) => m.livePresence !== 'offline').length;
  }, [team]);

  return {
    team,
    owners,
    holdsPower,
    management,
    loading,
    error,
    lastUpdated,
    source,
    activeLeadersCount,
    refresh: fetchTeam,
  };
}
