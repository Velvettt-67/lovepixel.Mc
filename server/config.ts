import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

// Load .env from process.cwd() or directory of this file
const primaryEnvPath = path.resolve(process.cwd(), '.env');
const fallbackEnvPath = path.resolve(process.cwd(), 'server', '.env');
const envPath = fs.existsSync(primaryEnvPath) ? primaryEnvPath : fallbackEnvPath;

dotenv.config({ path: envPath });

export const SERVER_CONFIG = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  botToken: process.env.DISCORD_BOT_TOKEN?.trim() || '',
  clientId: process.env.DISCORD_CLIENT_ID?.trim() || '',
  clientSecret: process.env.DISCORD_CLIENT_SECRET?.trim() || '',
  redirectUri: process.env.DISCORD_REDIRECT_URI?.trim() || 'http://localhost:5173/api/auth/discord/callback',
  guildId: process.env.DISCORD_GUILD_ID?.trim() || '1498650220215664781',
  adminDiscordIds: (process.env.ADMIN_DISCORD_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  sessionSecret: process.env.SESSION_SECRET?.trim() || 'lovepixel-default-secret-salt-2026',
};

export const CHANNELS = {
  general: {
    id: '1498652475517960293',
    name: 'general',
    invite: 'https://discord.gg/Y7kMsWRxD',
    publicRead: true,
    memberOnlyWebsiteWrite: true,
    type: 'text' as const,
  },
  media: {
    id: '1498652364633280562',
    name: 'media',
    invite: 'https://discord.gg/hnQJ5Y3vV',
    publicRead: true,
    memberOnlyWebsiteWrite: false,
    type: 'text' as const,
  },
  eventsPromotions: {
    id: '1532311063515893770',
    name: 'events-promotions',
    invite: 'https://discord.gg/jcqtdRQ9Y',
    publicRead: true,
    memberOnlyWebsiteWrite: false,
    type: 'announcements' as const,
  },
  gamingChat: {
    id: '1499056713377120279',
    name: 'gaming-chat',
    invite: 'https://discord.gg/BAGjXecN9',
    publicRead: true,
    memberOnlyWebsiteWrite: false,
    type: 'text' as const,
  },
} as const;

export type SupportedChannelId = typeof CHANNELS[keyof typeof CHANNELS]['id'];
export const SUPPORTED_CHANNEL_IDS: string[] = Object.values(CHANNELS).map((c) => c.id);
