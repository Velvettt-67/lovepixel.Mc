export interface DiscordChannelConfig {
  id?: string;
  name: string;
  invite: string;
  publicRead: boolean;
  memberOnlyWebsiteWrite: boolean;
  type: 'text' | 'voice' | 'announcements';
  topic: string;
  description: string;
  isAvailable?: boolean;
}

export const lovePixelsDiscordConfig = {
  guildId: "1498650220215664781",
  serverInvite: "https://discord.gg/kwHcdGg2f",

  channels: {
    general: {
      id: "1498652475517960293",
      name: "general",
      invite: "https://discord.gg/Y7kMsWRxD",
      publicRead: true,
      memberOnlyWebsiteWrite: true,
      type: "text",
      topic: "Quiet banter, cozy thoughts, and gentle evening updates.",
      description: "Real community messages, publicly visible on the website, with website-to-Discord messaging available to verified members.",
      isAvailable: true,
    },

    media: {
      id: "1498652364633280562",
      name: "media",
      invite: "https://discord.gg/hnQJ5Y3vV",
      publicRead: true,
      memberOnlyWebsiteWrite: false,
      type: "text",
      topic: "Visual inspirations, film stills, original artwork, and photography.",
      description: "Show actual media posts, supported attachments, captions and message metadata from the configured Discord channel.",
      isAvailable: true,
    },

    eventsPromotions: {
      id: "1532311063515893770",
      name: "events-promotions",
      invite: "https://discord.gg/jcqtdRQ9Y",
      publicRead: true,
      memberOnlyWebsiteWrite: false,
      type: "announcements",
      topic: "Seasonal announcements, community events, and member giveaways.",
      description: "Source real promotional announcements, smaller community events and giveaway posts.",
      isAvailable: true,
    },

    gamingChat: {
      id: "1499056713377120279",
      name: "gaming-chat",
      invite: "https://discord.gg/BAGjXecN9",
      publicRead: true,
      memberOnlyWebsiteWrite: false,
      type: "text",
      topic: "Cozy gaming chatter, lobbies, and game recommendations.",
      description: "Show actual gaming-related chat content and provide a working Open in Discord action.",
      isAvailable: true,
    },

    musicVoice: {
      id: "vc-music",
      name: "vc-music",
      invite: "https://discord.gg/kwHcdGg2f",
      publicRead: false,
      memberOnlyWebsiteWrite: false,
      type: "voice",
      topic: "Midsummer Night ambient listening sessions & vinyl loops.",
      description: "An intimate listening circle of slow tape loops, Japanese ambient vinyls, playlists and relaxed late-night music sessions.",
      isAvailable: true,
    },

    loungeVoice: {
      id: "vc-lounge",
      name: "vc-lounge",
      invite: "https://discord.gg/tSK5DnDgh",
      publicRead: false,
      memberOnlyWebsiteWrite: false,
      type: "voice",
      topic: "Voice salons and ambient listening rooms.",
      description: "Open the Lounge voice invitation when a visitor selects vc-lounge or its Join Room action.",
      isAvailable: true,
    },

    gamingVoice: {
      id: "vc-gaming",
      name: "vc-gaming",
      invite: "", // Gaming Voice Channel invite has not been supplied yet
      publicRead: false,
      memberOnlyWebsiteWrite: false,
      type: "voice",
      topic: "Gaming voice sessions (Configuration pending).",
      description: "Gaming Voice Channel invite has not been supplied yet. Displays an unconfigured/unavailable state.",
      isAvailable: false,
    },
  },
} as const;

export type ChannelKey = keyof typeof lovePixelsDiscordConfig.channels;
