import React, { useState, useRef, useEffect } from 'react';
import {
  Hash,
  Volume2,
  Shield,
  Send,
  ArrowUpRight,
  ExternalLink,
  HelpCircle,
  Radio,
  Gift,
  Calendar,
  Gamepad2,
  Image as ImageIcon,
  LogIn,
  CheckCircle2,
} from 'lucide-react';
import { lovePixelsDiscordConfig, type ChannelKey } from '../../config/discordConfig';
import { useDiscordAuth } from '../../hooks/useDiscordAuth';
import { useDiscordChannel } from '../../hooks/useDiscordChannel';
import { useSupportModal } from '../../hooks/useSupportModal';
import { MultiImageCarousel } from '../ui/MultiImageCarousel';

export const DiscordChannelPreview: React.FC = () => {
  const [activeChannelKey, setActiveChannelKey] = useState<ChannelKey>('general');
  const [composerText, setComposerText] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  const { user, isAuthenticated, isMember, login, refresh: refreshAuth } = useDiscordAuth();
  const { openSupport } = useSupportModal();

  const activeChannelConfig = lovePixelsDiscordConfig.channels[activeChannelKey];
  const channelId = activeChannelConfig.id || '';

  const {
    messages,
    isLoading,
    status,
    statusDetail,
    error: _error,
    isSending,
    cooldownSeconds,
    sendMessage,
  } = useDiscordChannel(channelId);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of messages on update
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError(null);
    setSendSuccess(false);

    if (!composerText.trim()) return;

    const result = await sendMessage(composerText.trim());
    if (result.success) {
      setComposerText('');
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
    } else {
      setSendError(result.error || 'Failed to deliver message');
    }
  };

  const channelKeys: ChannelKey[] = [
    'general',
    'media',
    'eventsPromotions',
    'gamingChat',
    'musicVoice',
    'loungeVoice',
    'gamingVoice',
  ];

  return (
    <div className="w-full rounded-[28px] overflow-hidden bg-[#240f17] border border-[#e8a8b8]/25 shadow-2xl text-[#fdf2f4]">
      {/* Window Title Bar with Live Connection State and Private Support Shortcut */}
      <div className="bg-[#1c0b12] px-6 py-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs tracking-wider text-[#d39ba9] font-medium ml-2 uppercase">
            LovePixels Discord Community Client
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          {/* Real Live Connection State */}
          <div className="flex items-center gap-2" title={statusDetail || undefined}>
            {status === 'connected' ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-emerald-300 font-medium">Gateway Connected</span>
              </>
            ) : status === 'unconfigured' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-amber-300">Public Mirror (Live Gateway Pending)</span>
              </>
            ) : status === 'connecting' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-sky-300">Syncing Gateway...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-rose-300">Gateway Offline</span>
              </>
            )}
          </div>

          {/* Private Support Shortcut */}
          <button
            onClick={openSupport}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#f7cad5]/80 hover:text-white transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#f472b6]" />
            <span>Questions?</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Sidebar: Channels list */}
        <div className="md:col-span-4 lg:col-span-3 bg-[#1d0a13] p-4 border-r border-white/5 flex flex-col justify-between">
          <div>
            {/* Server Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#9a3b54] to-[#f7cad5] flex items-center justify-center font-script text-white text-base">
                  L
                </div>
                <div>
                  <h4 className="text-sm font-semibold tracking-wide text-white">LovePixels</h4>
                  <span className="text-[10px] text-[#e8a8b8] tracking-wider uppercase">
                    Sanctuary Lounge
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[10px] uppercase tracking-widest text-[#a4687a] font-semibold px-2 mb-2">
              Verified Channels
            </div>

            <div className="space-y-1">
              {channelKeys.map((key) => {
                const conf = lovePixelsDiscordConfig.channels[key];
                const isActive = key === activeChannelKey;
                const isVoice = conf.type === 'voice';

                return (
                  <button
                    key={key}
                    onClick={() => setActiveChannelKey(key)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 text-left ${
                      isActive
                        ? 'bg-[#b54a67]/40 text-white border border-[#e8a8b8]/30 font-semibold'
                        : 'text-[#d39ba9] hover:bg-white/5 hover:text-white'
                    }`}
                    data-cursor-text="CHANNEL"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isVoice ? (
                        <Volume2 className="w-3.5 h-3.5 text-[#f5b8c7]" />
                      ) : key === 'eventsPromotions' ? (
                        <Calendar className="w-3.5 h-3.5 text-[#f5b8c7]" />
                      ) : key === 'media' ? (
                        <ImageIcon className="w-3.5 h-3.5 text-[#f5b8c7]" />
                      ) : key === 'gamingChat' ? (
                        <Gamepad2 className="w-3.5 h-3.5 text-[#f5b8c7]" />
                      ) : (
                        <Hash className="w-3.5 h-3.5 text-[#e8a8b8]" />
                      )}
                      <span className="truncate">{conf.name}</span>
                    </div>

                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f7cad5] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer Action */}
          <div className="pt-4 mt-6 border-t border-white/10 space-y-2">
            <a
              href={activeChannelConfig.invite || lovePixelsDiscordConfig.serverInvite}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-white bg-[#b54a67] hover:bg-[#9a3b54] transition-colors"
            >
              <span>Open in Discord</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={openSupport}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl text-[11px] font-medium text-[#f7cad5]/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              <HelpCircle className="w-3 h-3 text-[#f472b6]" />
              <span>Private Website Support</span>
            </button>
          </div>
        </div>

        {/* Right Pane: Active Channel Display & Composer */}
        <div className="md:col-span-8 lg:col-span-9 bg-[#240f17] flex flex-col justify-between p-5 sm:p-6">
          <div>
            {/* Channel Header Bar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5 min-w-0">
                {activeChannelConfig.type === 'voice' ? (
                  <Volume2 className="w-5 h-5 text-[#f5b8c7] shrink-0" />
                ) : (
                  <Hash className="w-5 h-5 text-[#f5b8c7] shrink-0" />
                )}
                <h3 className="font-semibold text-lg text-white truncate">
                  {activeChannelConfig.name}
                </h3>
                <span className="text-xs text-[#d39ba9] hidden lg:inline ml-2 border-l border-white/10 pl-3 truncate">
                  {activeChannelConfig.topic}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-[#e8a8b8] px-3 py-1 rounded-full liquid-glass-dark">
                  <Shield className="w-3 h-3 text-[#f7cad5]" />
                  <span>Soft Moderation</span>
                </div>
              </div>
            </div>

            {/* CHANNEL CONTENT WITH FLUID CLIENT TRANSITION */}
            <div key={activeChannelKey} className="animate-channel-switch will-change-transform">
              {activeChannelKey === 'musicVoice' ? (
                /* 0. MUSIC VOICE CHANNEL VIEW (MIDSUMMER NIGHT) */
                <div className="py-6 px-4 text-center max-w-lg mx-auto">
                  <div className="rounded-2xl overflow-hidden border border-[#e8a8b8]/20 shadow-xl mb-6">
                    <MultiImageCarousel
                      images={[
                        { src: '/assets/events/music-player.png', alt: 'Midsummer Night pink music player graphic' },
                        { src: '/assets/events/vinyl-turntable-playing.jpg', alt: 'Vinyl turntable playing' },
                        { src: '/assets/events/listening-vinyl.jpg', alt: 'Moody listening room' },
                      ]}
                      intervalMs={1000}
                      aspectRatio="aspect-[16/9]"
                    />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#f472b6]">
                    Music VC • Midsummer Night
                  </span>
                  <h4 className="font-display text-2xl text-white mt-1 mb-2">
                    {activeChannelConfig.name}
                  </h4>
                  <p className="font-editorial text-sm text-[#fcd9e2]/80 leading-relaxed mb-6">
                    {activeChannelConfig.description}
                  </p>
                  <a
                    href={activeChannelConfig.invite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#b54a67] to-[#d3738b] hover:shadow-lg transition-all"
                  >
                    <span>Join Music VC in Discord</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : activeChannelKey === 'loungeVoice' ? (
              /* 1. LOUNGE VOICE CHANNEL VIEW */
              <div className="py-6 px-4 text-center max-w-lg mx-auto">
                <div className="rounded-2xl overflow-hidden border border-[#e8a8b8]/20 shadow-xl mb-6">
                  <MultiImageCarousel
                    images={[
                      { src: '/assets/events/chill-lounge.jpg', alt: 'Welcoming cozy lounge' },
                      { src: '/assets/community/music-lounge.jpg', alt: 'Plum and rose atmospheric velvet lounge' },
                      { src: '/assets/community/cozy-interior.jpg', alt: 'Warm intimate late-night sanctuary' },
                    ]}
                    intervalMs={1000}
                    aspectRatio="aspect-[16/9]"
                  />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#7dd3fc]">
                  Voice Lounge & Chill Sanctuary
                </span>
                <h4 className="font-display text-2xl text-white mt-1 mb-2">
                  {activeChannelConfig.name}
                </h4>
                <p className="font-editorial text-sm text-[#fcd9e2]/80 leading-relaxed mb-6">
                  {activeChannelConfig.description}
                </p>
                <a
                  href={activeChannelConfig.invite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-sky-600 to-[#b54a67] hover:shadow-lg transition-all"
                >
                  <span>Join Lounge in Discord</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : activeChannelKey === 'gamingVoice' ? (
              /* 2. GAMING VOICE (UNCONFIGURED STATE) */
              <div className="py-12 px-4 text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-white/5 text-[#d39ba9] flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <Radio className="w-8 h-8 opacity-60" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#d39ba9]">
                  Configuration Pending
                </span>
                <h4 className="font-display text-2xl text-white mt-1 mb-2">
                  Gaming Voice Channel
                </h4>
                <p className="font-editorial text-sm text-[#fcd9e2]/70 leading-relaxed mb-6">
                  The Gaming Voice Channel invitation has not been supplied yet. We do not substitute other channels or invent broken links.
                </p>
                <div className="inline-block px-5 py-2 rounded-full liquid-glass-dark text-xs text-[#fcd9e2]">
                  Check back once configured by server caretakers
                </div>
              </div>
            ) : activeChannelKey === 'media' ? (
              /* 3. MEDIA CHANNEL VIEW */
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                <div className="p-3 rounded-2xl liquid-glass-dark text-xs text-[#fcd9e2] flex items-center justify-between mb-2">
                  <span>Showing authentic posts from configured Discord Media channel</span>
                  <a
                    href={activeChannelConfig.invite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#f8b4c8] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Open in Discord</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>

                {isLoading ? (
                  <div className="py-16 text-center text-xs text-[#d39ba9]">Loading media posts...</div>
                ) : messages.length === 0 ? (
                  <div className="py-16 text-center">
                    <ImageIcon className="w-8 h-8 text-[#b54a67] mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-editorial text-white">No media posts retrieved yet</p>
                    <p className="text-xs text-[#d39ba9] mt-1">
                      {status === 'unconfigured'
                        ? 'Discord Bot token not yet configured in server .env.'
                        : 'Be the first to share photography or artwork in ・🍁┆media!'}
                    </p>
                    <a
                      href={activeChannelConfig.invite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-[#b54a67] text-white hover:bg-[#9a3b54] transition-all"
                    >
                      <span>Share in Discord Media</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className="rounded-2xl overflow-hidden bg-[#1d0a13] border border-white/10 p-3 flex flex-col justify-between hover:border-[#f472b6]/40 transition-all"
                      >
                        {msg.attachments.length > 0 && (
                          <div className="rounded-xl overflow-hidden mb-2 aspect-[4/3] bg-black/40">
                            <img
                              src={msg.attachments[0].url}
                              alt={msg.attachments[0].filename}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <img src={msg.author.avatar} alt="" className="w-4 h-4 rounded-full" />
                            <span className="text-xs font-semibold text-white truncate">
                              {msg.author.globalName || msg.author.username}
                            </span>
                            <span className="text-[10px] text-[#a4687a] ml-auto">
                              {msg.timeFormatted}
                            </span>
                          </div>
                          {msg.content && (
                            <p className="text-xs text-[#fcd9e2]/90 line-clamp-2 leading-relaxed">
                              {msg.content}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeChannelKey === 'eventsPromotions' ? (
              /* 4. EVENTS & PROMOTIONS VIEW */
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                <div className="p-3 rounded-2xl liquid-glass-dark text-xs text-[#fcd9e2] flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#f472b6]" />
                    <span>Official Announcements, Community Events & Giveaways</span>
                  </div>
                  <a
                    href={activeChannelConfig.invite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#f8b4c8] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Open in Discord</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>

                {isLoading ? (
                  <div className="py-16 text-center text-xs text-[#d39ba9]">Loading announcements...</div>
                ) : messages.length === 0 ? (
                  <div className="py-16 text-center">
                    <Calendar className="w-8 h-8 text-[#b54a67] mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-editorial text-white">No promotional posts currently listed</p>
                    <p className="text-xs text-[#d39ba9] mt-1">
                      {status === 'unconfigured'
                        ? 'Discord Bot token not yet configured in server .env.'
                        : 'Seasonal announcements and giveaways will appear here once posted.'}
                    </p>
                    <a
                      href={activeChannelConfig.invite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-[#b54a67] text-white hover:bg-[#9a3b54] transition-all"
                    >
                      <span>Check Events in Discord</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-4 rounded-2xl bg-[#1d0a13] border border-white/10 hover:border-[#f472b6]/30 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <img src={msg.author.avatar} alt="" className="w-5 h-5 rounded-full" />
                            <span className="text-xs font-semibold text-white">
                              {msg.author.globalName || msg.author.username}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#a4687a]">{msg.timeFormatted}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#fcd9e2] leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                        {msg.attachments.length > 0 && (
                          <div className="mt-3 rounded-xl overflow-hidden max-w-sm">
                            <img
                              src={msg.attachments[0].url}
                              alt=""
                              className="w-full h-auto rounded-xl"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* 5. TEXT CHAT MESSAGES (GENERAL & GAMING CHAT) */
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                {isLoading ? (
                  <div className="py-20 text-center text-xs text-[#d39ba9]">
                    Loading real message history...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="text-sm font-editorial text-white">No messages loaded</p>
                    <p className="text-xs text-[#d39ba9] mt-1 max-w-md mx-auto">
                      {status === 'unconfigured'
                        ? 'Discord Bot token not configured in .env. Real Discord messages will mirror here once configured.'
                        : 'Waiting for messages in this channel.'}
                    </p>
                    <a
                      href={activeChannelConfig.invite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-[#b54a67] text-white hover:bg-[#9a3b54] transition-all"
                    >
                      <span>Open #{activeChannelConfig.name} in Discord</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="flex items-start gap-3.5 group hover:bg-white/[0.02] p-2 rounded-xl transition-colors"
                    >
                      <img
                        src={msg.author.avatar}
                        alt={msg.author.username}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-[#e8a8b8]/30 mt-0.5 shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span
                            className="font-medium text-sm tracking-wide"
                            style={{ color: msg.author.roleColor || '#d3738b' }}
                          >
                            {msg.author.globalName || msg.author.username}
                          </span>

                          {/* Transparent Website Bridge Attribution Pill */}
                          {msg.isWebsiteBridge && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider bg-sky-950 text-sky-300 border border-sky-400/30">
                              Website Bridge
                            </span>
                          )}

                          <span className="text-[10px] text-[#a4687a]">{msg.timeFormatted}</span>
                        </div>

                        <p className="text-sm text-[#f5ced7] mt-0.5 leading-relaxed font-sans-clean break-words whitespace-pre-wrap">
                          {msg.content}
                        </p>

                        {/* Attachments */}
                        {msg.attachments.length > 0 && (
                          <div className="mt-2.5 max-w-sm rounded-xl overflow-hidden border border-[#e8a8b8]/20 shadow-md">
                            <img
                              src={msg.attachments[0].url}
                              alt="Attachment"
                              className="w-full h-auto max-h-60 object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
            </div>
          </div>

          {/* MESSAGE COMPOSER SECTION (STRICT MEMBER-ONLY WRITE) */}
          {activeChannelKey === 'general' ? (
            <div className="mt-4 pt-3 border-t border-white/10">
              {sendError && (
                <div className="mb-2 p-2 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-200 text-xs">
                  {sendError}
                </div>
              )}
              {sendSuccess && (
                <div className="mb-2 p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Delivered via LovePixels Website Bridge to Discord #general!</span>
                </div>
              )}

              {!isAuthenticated ? (
                /* STATE 1: PUBLIC VISITOR (UNAUTHENTICATED) */
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#1d0a13] border border-white/10">
                  <div className="text-xs text-[#d39ba9]">
                    Public read-only preview. Sign in and join the server to participate in the conversation.
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={login}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition-all"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign in with Discord</span>
                    </button>
                    <a
                      href={lovePixelsDiscordConfig.serverInvite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#b54a67] to-[#d3738b] hover:shadow-md transition-all"
                    >
                      <span>Join LovePixels to Chat</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : !isMember ? (
                /* STATE 2: AUTHENTICATED BUT NON-MEMBER */
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30">
                  <div className="text-xs text-amber-200">
                    Logged in as <strong>{user?.global_name || user?.username}</strong>. Join the LovePixels Discord server to participate in the conversation.
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={refreshAuth}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold text-amber-200 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      Check Membership
                    </button>
                    <a
                      href={lovePixelsDiscordConfig.serverInvite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-amber-600 to-[#b54a67] hover:shadow-md transition-all"
                    >
                      <span>Join Server</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                /* STATE 3: VERIFIED MEMBER COMPOSER (WEBSITE BRIDGE) */
                <form onSubmit={handleSendMessage} className="space-y-1.5">
                  <div className="flex items-center gap-2 bg-[#1d0a13] px-4 py-2.5 rounded-2xl border border-white/10 text-sm">
                    <input
                      type="text"
                      value={composerText}
                      onChange={(e) => setComposerText(e.target.value)}
                      placeholder="Message #general via LovePixels Website Bridge..."
                      maxLength={1000}
                      disabled={isSending || cooldownSeconds > 0}
                      className="bg-transparent flex-1 focus:outline-none text-xs text-white placeholder-[#a4687a]"
                    />
                    <div className="text-[10px] text-[#a4687a] mr-2">
                      {composerText.length}/1000
                    </div>
                    <button
                      type="submit"
                      disabled={isSending || !composerText.trim() || cooldownSeconds > 0}
                      className="p-2 rounded-xl bg-gradient-to-r from-[#b54a67] to-[#d3738b] text-white hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center shrink-0"
                      title={cooldownSeconds > 0 ? `Cooldown (${cooldownSeconds}s)` : 'Send message via bridge'}
                    >
                      {cooldownSeconds > 0 ? (
                        <span className="text-[10px] font-bold px-1">{cooldownSeconds}s</span>
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between px-2 text-[10px] text-[#f7cad5]/60">
                    <span>
                      Relayed via LovePixels Website Bridge as <strong>{user?.global_name || user?.username}</strong>
                    </span>
                    <span>Verified Server Member 🌸</span>
                  </div>
                </form>
              )}
            </div>
          ) : activeChannelConfig.type === 'text' ? (
            /* NON-GENERAL TEXT CHANNEL: READ ONLY PROMPT */
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#d39ba9]">
              <span>Website write is exclusive to #general. To post in #{activeChannelConfig.name}, use Discord.</span>
              <a
                href={activeChannelConfig.invite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#f8b4c8] hover:underline font-semibold"
              >
                <span>Open in Discord</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
