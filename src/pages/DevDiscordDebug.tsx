import React, { useState, useEffect } from 'react';
import { RefreshCw, Server, AlertCircle, Music, Gamepad2 } from 'lucide-react';
import { DiscordAvatar } from '../components/discord/DiscordAvatar';

interface DiagnosticMember {
  id: string;
  displayName: string;
  username: string;
  nickname: string | null;
  tier: string;
  roleTitle: string;
  avatarUrl: string;
  bannerUrl: string | null;
  avatarDecorationUrl: string | null;
  profileEffectUrl: string | null;
  profileFrameUrl: string | null;
  livePresence: 'online' | 'idle' | 'dnd' | 'offline';
  activityCount: number;
  activities: any[];
  primaryActivity: any;
  diagnostics: {
    avatarState: string;
    bannerState: string;
    decorationState: string;
    effectState: string;
    frameState: string;
    presenceState: string;
    source: string;
    lastGatewayUpdate?: number | null;
    lastCacheUpdate: number;
  };
  lastUpdated: number;
}

interface DiagnosticResponse {
  gateway: {
    state: string;
    botUser: { id: string; username: string } | null;
    connectedSince: number | null;
    lastHeartbeatAck: number | null;
    error: string | null;
    intentsConfigured: boolean;
  };
  guildId: string;
  membersCount: number;
  lastUpdated: number;
  source: string;
  members: DiagnosticMember[];
}

export const DevDiscordDebug: React.FC = () => {
  const [data, setData] = useState<DiagnosticResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDiagnostics = async () => {
    try {
      const res = await fetch('/api/discord/diagnostics');
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch diagnostics`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch diagnostic state');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/discord/diagnostics');
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch diagnostics`);
        const json = await res.json();
        if (isMounted) {
          setData(json);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to fetch diagnostic state');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void load();
    if (!autoRefresh) {
      return () => {
        isMounted = false;
      };
    }

    const interval = setInterval(() => {
      void load();
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [autoRefresh]);

  return (
    <div className="w-full pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left font-mono text-xs">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#f472b6]/20 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#35102a] text-[#f472b6] text-[11px] font-semibold uppercase tracking-wider mb-2">
            <Server className="w-3.5 h-3.5" />
            <span>Developer Diagnostic Hub (/dev/discord-debug)</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white font-normal">
            Discord Profile Sync & Real-Time Presence Diagnostics
          </h1>
          <p className="text-[#a08592] text-xs mt-1 font-sans">
            Target Guild ID: <span className="text-[#f472b6]">{data?.guildId || '1498650220215664781'}</span> · Zero secrets exposed
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-white/80">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-[#f472b6]"
            />
            <span>Auto-refresh (5s)</span>
          </label>
          <button
            onClick={() => void fetchDiagnostics()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#200a20] hover:bg-[#2e0e2e] text-[#f472b6] border border-[#f472b6]/30 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Gateway Engine Status Card */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-[#160718] border border-white/10">
            <div className="text-[10px] uppercase tracking-wider text-[#a08592] mb-1">Gateway State</div>
            <div className="text-sm font-semibold flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  data.gateway.state === 'connected'
                    ? 'bg-emerald-400'
                    : data.gateway.state === 'connecting'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-zinc-500'
                }`}
              />
              <span className="uppercase text-white">{data.gateway.state}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#160718] border border-white/10">
            <div className="text-[10px] uppercase tracking-wider text-[#a08592] mb-1">Bot User</div>
            <div className="text-sm font-semibold text-[#f472b6] truncate">
              {data.gateway.botUser ? `@${data.gateway.botUser.username}` : 'Unauthenticated (Widget Mode)'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#160718] border border-white/10">
            <div className="text-[10px] uppercase tracking-wider text-[#a08592] mb-1">Configured Leaders</div>
            <div className="text-sm font-semibold text-white">
              {data.membersCount} Verified Identities
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#160718] border border-white/10">
            <div className="text-[10px] uppercase tracking-wider text-[#a08592] mb-1">Data Source</div>
            <div className="text-sm font-semibold text-sky-400 uppercase">
              {data.source}
            </div>
          </div>
        </div>
      )}

      {/* 9 Members Detailed Diagnostic Table */}
      {data && (
        <div className="rounded-3xl bg-[#140616] border border-[#f472b6]/20 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#1c081e] text-[11px] uppercase tracking-wider text-[#f472b6]">
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Discord ID</th>
                  <th className="p-3.5">Presence</th>
                  <th className="p-3.5">Avatar State</th>
                  <th className="p-3.5">Banner State</th>
                  <th className="p-3.5">Decoration</th>
                  <th className="p-3.5">Activities ({data.members.reduce((acc, m) => acc + m.activityCount, 0)})</th>
                  <th className="p-3.5">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11px]">
                {data.members.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* User Column */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <DiscordAvatar
                          avatarUrl={m.avatarUrl}
                          displayName={m.displayName}
                          presence={m.livePresence}
                          avatarDecorationUrl={m.avatarDecorationUrl}
                          profileFrameUrl={m.profileFrameUrl}
                          size="sm"
                        />
                        <div>
                          <div className="font-semibold text-white">{m.displayName}</div>
                          <div className="text-[10px] text-[#f472b6]">@{m.username}</div>
                          {m.nickname && (
                            <div className="text-[9px] text-white/50">nick: {m.nickname}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Discord ID */}
                    <td className="p-3.5 font-mono text-white/70 select-all">{m.id}</td>

                    {/* Live Presence */}
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          m.livePresence === 'online'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : m.livePresence === 'idle'
                            ? 'bg-amber-500/15 text-amber-300'
                            : m.livePresence === 'dnd'
                            ? 'bg-rose-500/15 text-rose-300'
                            : 'bg-zinc-500/15 text-zinc-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            m.livePresence === 'online'
                              ? 'bg-emerald-400'
                              : m.livePresence === 'idle'
                              ? 'bg-amber-400'
                              : m.livePresence === 'dnd'
                              ? 'bg-rose-400'
                              : 'bg-zinc-400'
                          }`}
                        />
                        {m.livePresence}
                      </span>
                    </td>

                    {/* Avatar State */}
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          m.diagnostics.avatarState === 'available'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {m.diagnostics.avatarState}
                      </span>
                    </td>

                    {/* Banner State */}
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          m.diagnostics.bannerState === 'available'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : m.diagnostics.bannerState === 'not_provided'
                            ? 'bg-zinc-500/20 text-zinc-400'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {m.diagnostics.bannerState}
                      </span>
                    </td>

                    {/* Decoration State */}
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          m.diagnostics.decorationState === 'available'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-zinc-500/20 text-zinc-400'
                        }`}
                      >
                        {m.diagnostics.decorationState}
                      </span>
                    </td>

                    {/* Activities */}
                    <td className="p-3.5 max-w-xs">
                      {m.activities.length > 0 ? (
                        <div className="space-y-1">
                          {m.activities.map((a, i) => (
                            <div
                              key={i}
                              className="p-1.5 rounded-lg bg-[#220a22] border border-[#f472b6]/20 text-[10px] text-white"
                            >
                              <div className="font-semibold text-[#f472b6] flex items-center gap-1">
                                {a.isSpotify ? (
                                  <Music className="w-3 h-3 text-[#1db954]" />
                                ) : (
                                  <Gamepad2 className="w-3 h-3 text-sky-400" />
                                )}
                                <span>{a.name}</span>
                              </div>
                              {a.details && <div className="text-white/70 truncate">{a.details}</div>}
                              {a.state && <div className="text-white/50 truncate">{a.state}</div>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic">None</span>
                      )}
                    </td>

                    {/* Source */}
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-white/5 text-white/80">
                        {m.diagnostics.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
