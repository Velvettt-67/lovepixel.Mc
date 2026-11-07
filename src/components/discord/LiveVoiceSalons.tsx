import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, Users, MicOff, Headphones, Radio, RefreshCw, ArrowUpRight } from 'lucide-react';
import { SITE_CONFIG } from '../../data/siteData';
import { SpotlightCard } from '../ui/SpotlightCard';

interface DiscordMember {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  status: string;
  avatar_url: string;
  channel_id?: string;
  mute?: boolean;
  deaf?: boolean;
  self_mute?: boolean;
  self_deaf?: boolean;
}

interface DiscordChannel {
  id: string;
  name: string;
  position: number;
}

interface DiscordWidgetData {
  id: string;
  name: string;
  instant_invite: string | null;
  channels: DiscordChannel[];
  members: DiscordMember[];
  presence_count: number;
}

type SyncState = 'loading' | 'live' | 'empty' | 'error' | 'offline';

export const LiveVoiceSalons: React.FC = () => {
  const [syncState, setSyncState] = useState<SyncState>('loading');
  const [data, setData] = useState<DiscordWidgetData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchLiveState = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(
        `https://discord.com/api/guilds/${SITE_CONFIG.discordGuildId}/widget.json`,
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }

      const json: DiscordWidgetData = await response.json();
      setData(json);

      // Check if any members are currently in voice channels
      const membersInVoice = json.members.filter((m) => !!m.channel_id);
      if (membersInVoice.length > 0) {
        setSyncState('live');
      } else {
        setSyncState('empty');
      }

      const now = new Date();
      setLastUpdated(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch {
      setSyncState('error');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (active) {
        await fetchLiveState();
      }
    };
    run();

    // Sensible polling interval: every 35 seconds
    const interval = setInterval(() => {
      if (active) {
        fetchLiveState();
      }
    }, 35000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [fetchLiveState]);

  // Group members by channel
  const activeChannelsMap = new Map<
    string,
    { channel: DiscordChannel; members: DiscordMember[] }
  >();

  if (data) {
    const channelLookup = new Map<string, DiscordChannel>();
    data.channels.forEach((c) => channelLookup.set(c.id, c));

    data.members.forEach((member) => {
      if (member.channel_id) {
        const chan = channelLookup.get(member.channel_id) || {
          id: member.channel_id,
          name: 'Voice Lounge',
          position: 0,
        };

        if (!activeChannelsMap.has(member.channel_id)) {
          activeChannelsMap.set(member.channel_id, {
            channel: chan,
            members: [],
          });
        }
        activeChannelsMap.get(member.channel_id)!.members.push(member);
      }
    });
  }

  const activeChannels = Array.from(activeChannelsMap.values());

  return (
    <div className="w-full rounded-3xl bg-[#160718]/85 border border-[#e8a8b8]/20 backdrop-blur-md shadow-2xl p-6 sm:p-8 lg:p-10 relative overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#f472b6]/15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e8a8b8]/20">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#16a34a]"></span>
            </span>
            <span className="text-xs font-semibold tracking-widest uppercase text-[#f472b6]">
              LIVE NOW • REALTIME VOICE SALONS
            </span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl text-[#fdf2f4] font-normal">
            Active Community Presence
          </h3>
        </div>

        {/* Sync Status Badge & Refresh with Liquid Glass */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-[#2a1024]/80 border border-[#e8a8b8]/20 text-xs text-[#f472b6] flex items-center gap-2 shadow-xs">
            <Radio className="w-3.5 h-3.5 text-[#f472b6] animate-pulse" />
            <span>
              {data ? `${data.presence_count.toLocaleString()} Online` : 'Syncing presence'}
            </span>
            {lastUpdated && (
              <span className="text-[#d8afbf] hidden sm:inline">• {lastUpdated}</span>
            )}
          </div>

          <button
            onClick={() => fetchLiveState()}
            disabled={isRefreshing}
            className="p-2 rounded-full bg-[#2a1024]/80 border border-[#e8a8b8]/20 text-[#fdf2f4] hover:text-white transition-all shadow-xs hover:scale-105 active:scale-95"
            title="Refresh Discord state"
            aria-label="Refresh Discord state"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#f472b6]' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Dynamic Content States */}
      <div className="py-8">
        {syncState === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 rounded-full border-2 border-[#d3738b] border-t-transparent animate-spin mb-4" />
            <p className="font-editorial text-lg text-[#d8afbf]">
              Connecting with LovePixels gateway presence...
            </p>
          </div>
        )}

        {syncState === 'live' && activeChannels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeChannels.map(({ channel, members }) => (
              <SpotlightCard
                key={channel.id}
                spotlightColor="rgba(244, 114, 182, 0.16)"
                borderColor="rgba(232, 168, 184, 0.45)"
                className="group rounded-2xl bg-[#1f0a1d]/90 border border-[#e8a8b8]/25 p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9a3b54] to-[#f472b6] flex items-center justify-center text-white shadow-xs">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-sans-clean font-semibold text-base text-[#fdf2f4]">
                        {channel.name}
                      </h4>
                      <p className="text-xs text-[#d8afbf] flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-[#f472b6]" />
                        <span>
                          {members.length} {members.length === 1 ? 'member' : 'members'} inside
                        </span>
                      </p>
                    </div>
                  </div>

                  <a
                    href={SITE_CONFIG.discordInviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-medium text-white bg-gradient-to-r from-[#b54a67] to-[#d3738b] hover:shadow-md transition-all shadow-xs"
                    data-cursor-text="CONNECT"
                  >
                    <span>Connect</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>

                {/* Member Avatars and Info */}
                <div className="space-y-2.5 pt-2 border-t border-[#e8a8b8]/20">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#2a1024]/80 hover:bg-[#34142d]/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {/* Ambient presence speaking ring pulse */}
                          <span className="absolute -inset-1 rounded-full bg-emerald-400/30 animate-pulse pointer-events-none" />
                          <img
                            src={member.avatar_url}
                            alt={member.username}
                            className="relative w-8 h-8 rounded-full object-cover ring-2 ring-[#e8a8b8]/40"
                            loading="lazy"
                            onError={(e) => {
                              // Fallback default avatar
                              (e.target as HTMLImageElement).src =
                                'https://cdn.discordapp.com/embed/avatars/0.png';
                            }}
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#160718] ${
                              member.status === 'dnd'
                                ? 'bg-rose-500'
                                : member.status === 'idle'
                                ? 'bg-amber-400'
                                : 'bg-emerald-500'
                            }`}
                          />
                        </div>
                        <span className="text-sm font-medium text-[#fdf2f4] truncate max-w-[150px] sm:max-w-[200px]">
                          {member.username}
                        </span>
                      </div>

                      {/* Mic / Headphone status */}
                      <div className="flex items-center gap-1.5 text-[#f472b6]">
                        {(member.mute || member.self_mute) && (
                          <span title="Muted">
                            <MicOff className="w-3.5 h-3.5 text-rose-400" />
                          </span>
                        )}
                        {(member.deaf || member.self_deaf) && (
                          <span title="Deafened">
                            <Headphones className="w-3.5 h-3.5 text-rose-500" />
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}

        {syncState === 'empty' && (
          <div className="text-center py-10 px-4 max-w-xl mx-auto bg-[#1c0a1a]/90 rounded-2xl border border-[#e8a8b8]/20 shadow-md">
            <div className="w-12 h-12 rounded-full bg-[#2f122c] text-[#f472b6] flex items-center justify-center mx-auto mb-4 border border-[#e8a8b8]/20">
              <Volume2 className="w-6 h-6 opacity-80" />
            </div>
            <h4 className="font-display text-xl text-[#fdf2f4] mb-2 font-medium">
              The voice lounges are currently quiet
            </h4>
            <p className="font-editorial text-base text-[#d8afbf] leading-relaxed mb-4">
              {data?.presence_count
                ? `${data.presence_count.toLocaleString()} members are currently active in our text sanctuaries and salons.`
                : 'Our late-night music and salon hours typically bloom in the evenings.'}{' '}
              Step in first and put on some soft ambient vinyls.
            </p>
            {data?.members && data.members.length > 0 && (
              <div className="flex items-center justify-center -space-x-2 mb-6">
                {data.members.slice(0, 8).map((m, idx) => (
                  <img
                    key={idx}
                    src={m.avatar_url}
                    alt={m.username}
                    title={m.username}
                    className="w-8 h-8 rounded-full ring-2 ring-[#1c0a1a] object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://cdn.discordapp.com/embed/avatars/${idx % 5}.png`;
                    }}
                  />
                ))}
                {data.presence_count > 8 && (
                  <span className="inline-flex items-center justify-center h-8 px-2.5 rounded-full bg-white/10 text-[10px] font-bold text-white border border-white/20">
                    +{data.presence_count - 8}
                  </span>
                )}
              </div>
            )}
            <a
              href={SITE_CONFIG.discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#b54a67] to-[#d3738b] hover:shadow-md transition-all"
            >
              <span>Step into Voice Lounge</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {syncState === 'error' && (
          <div className="text-center py-8 px-4 max-w-md mx-auto bg-[#1c0a1a]/90 rounded-2xl border border-[#e8a8b8]/20 shadow-md">
            <p className="font-editorial text-base text-[#d8afbf] mb-4">
              Live server activity is momentarily resting. The community rooms remain active on Discord.
            </p>
            <a
              href={SITE_CONFIG.discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#b54a67] to-[#d3738b] hover:shadow-md transition-all"
            >
              <span>Join Voice on Discord</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Footer Banner */}
      <div className="pt-6 border-t border-[#e8a8b8]/20 flex flex-col sm:flex-row items-center justify-between text-xs text-[#d8afbf] gap-3">
        <p>
          Rooms are softly moderated. No mic required — listening members are always welcome.
        </p>
        <a
          href={SITE_CONFIG.discordInviteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#f472b6] hover:underline underline-offset-4 flex items-center gap-1"
        >
          <span>Open Full Discord Client</span>
          <ArrowUpRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
