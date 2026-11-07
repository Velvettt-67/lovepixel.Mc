import React from 'react';
import { Volume2, ArrowUpRight, Music2, Coffee, Gamepad2 } from 'lucide-react';
import { SITE_CONFIG } from '../../data/siteData';
import { lovePixelsDiscordConfig } from '../../config/discordConfig';
import { SpotlightCard } from '../ui/SpotlightCard';
import { MultiImageCarousel } from '../ui/MultiImageCarousel';

interface VoiceChannelCardData {
  id: string;
  title: string;
  channelLabel: string;
  category: string;
  icon: React.ReactNode;
  inviteUrl: string;
  description: string;
  tags: string[];
  images: Array<{
    src: string;
    alt: string;
  }>;
}

const VOICE_CHANNEL_CARDS: VoiceChannelCardData[] = [
  {
    id: 'vc-music',
    title: 'Midsummer Night',
    channelLabel: 'Music VC',
    category: 'Music VC',
    icon: <Music2 className="w-4 h-4 text-[#f472b6]" />,
    inviteUrl: SITE_CONFIG.discordInviteUrl,
    description:
      'An intimate listening circle of slow tape loops, Japanese ambient vinyls, curated playlists, and relaxed late-night music sessions.',
    tags: ['Tape Loops', 'Ambient Vinyl', '2 AM Sessions'],
    images: [
      {
        src: '/assets/events/music-player.png',
        alt: 'Midsummer Night pink music player graphic with sound wave visualizer',
      },
      {
        src: '/assets/events/vinyl-turntable-playing.jpg',
        alt: 'Authentic vinyl record turntable spinning under soft magenta lighting',
      },
      {
        src: '/assets/events/listening-vinyl.jpg',
        alt: 'Moody vinyl listening room and headphones setup',
      },
    ],
  },
  {
    id: 'vc-lounge',
    title: 'The Sanctuary Lounge',
    channelLabel: 'Chill & Lounge VC',
    category: 'Chill & Lounge VC',
    icon: <Coffee className="w-4 h-4 text-[#7dd3fc]" />,
    inviteUrl: lovePixelsDiscordConfig.channels.loungeVoice.invite,
    description:
      'A welcoming lounge and cozy late-night hangout. Soft ambient lighting, comfortable velvet seating, and unhurried conversations in plum and rose tones.',
    tags: ['Cozy Hangout', 'Soft Lighting', 'Quiet Banter'],
    images: [
      {
        src: '/assets/events/chill-lounge.jpg',
        alt: 'Welcoming cozy lounge with comfortable seating and warm ambient glow',
      },
      {
        src: '/assets/community/music-lounge.jpg',
        alt: 'Plum and rose atmospheric velvet seating lounge',
      },
      {
        src: '/assets/community/cozy-interior.jpg',
        alt: 'Warm intimate late-night sanctuary interior',
      },
    ],
  },
  {
    id: 'vc-gaming',
    title: 'Cozy Realm Sessions',
    channelLabel: 'Gaming VC',
    category: 'Gaming VC',
    icon: <Gamepad2 className="w-4 h-4 text-[#a78bfa]" />,
    inviteUrl: SITE_CONFIG.discordInviteUrl,
    description:
      'Casual multiplayer gaming sessions, collaborative Minecraft realms, screen sharing, controllers, and comfortable seating under ambient lighting.',
    tags: ['Cozy Multiplayer', 'Controllers', 'Screenshare'],
    images: [
      {
        src: '/assets/events/game-salon.jpg',
        alt: 'Casual gaming setup with game controllers, screens, and cozy soft lighting',
      },
      {
        src: '/assets/events/gaming-setup.jpg',
        alt: 'Comfortable gaming setup with soft atmospheric ambient backlighting',
      },
    ],
  },
];

export const VoiceChannelShowcase: React.FC = () => {
  return (
    <div className="w-full">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full liquid-glass-rose text-xs font-semibold uppercase tracking-widest text-[#f472b6] mb-3">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Voice Sanctuaries</span>
          </div>
          <h3 className="font-display text-3xl sm:text-4xl text-[#fdf2f4]">
            Voice Channels & Salons
          </h3>
          <p className="font-editorial text-lg text-[#d8afbf] mt-1 max-w-xl">
            Drop into our rooms whenever you need company. Built like an intimate lounge, not a noisy lobby.
          </p>
        </div>

        <a
          href={SITE_CONFIG.discordInviteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase text-white bg-gradient-to-r from-[#b54a67] to-[#d3738b] hover:shadow-lg transition-all"
        >
          <span>Open Discord Voice</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 3 Voice Channel Cards with 1,000 ms Multi-Image Rotation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {VOICE_CHANNEL_CARDS.map((card) => {
          const isLounge = card.id === 'vc-lounge';
          const isGaming = card.id === 'vc-gaming';

          return (
            <SpotlightCard
              key={card.id}
              spotlightColor={
                isLounge
                  ? 'rgba(56, 189, 248, 0.16)'
                  : isGaming
                  ? 'rgba(168, 85, 247, 0.16)'
                  : 'rgba(244, 114, 182, 0.16)'
              }
              borderColor={
                isLounge
                  ? 'rgba(125, 211, 252, 0.45)'
                  : isGaming
                  ? 'rgba(192, 132, 252, 0.45)'
                  : 'rgba(232, 168, 184, 0.45)'
              }
              className="group rounded-3xl overflow-hidden bg-[#180817]/95 border border-[#e8a8b8]/25 shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Multi-Image Carousel Header (1,000 ms rotation) */}
              <div className="relative">
                <MultiImageCarousel
                  images={card.images}
                  intervalMs={1000}
                  aspectRatio="aspect-[16/10]"
                  className="w-full"
                >
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-30">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider liquid-glass-dark ${
                        isLounge
                          ? 'text-[#7dd3fc]'
                          : isGaming
                          ? 'text-[#c084fc]'
                          : 'text-[#f472b6]'
                      }`}
                    >
                      {card.icon}
                      <span>{card.channelLabel}</span>
                    </span>
                  </div>
                </MultiImageCarousel>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-[#2a1024]/80 text-[#d8afbf] border border-[#e8a8b8]/15"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h4 className="font-display text-2xl text-[#fdf2f4] mb-2 font-normal">
                    {card.title}
                  </h4>

                  <p className="font-editorial text-sm text-[#d8afbf] leading-relaxed mb-6">
                    {card.description}
                  </p>
                </div>

                {/* Footer Join Button */}
                <div className="pt-4 border-t border-[#e8a8b8]/20 flex items-center justify-between">
                  <span className="text-xs text-[#fcd9e2]/70 font-medium">
                    24/7 Room Access
                  </span>

                  <a
                    href={card.inviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#b54a67] to-[#d3738b] hover:shadow-md transition-all hover:scale-105 active:scale-95"
                    data-cursor-text="JOIN"
                  >
                    <span>Connect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
};
