import { SERVER_CONFIG } from './config.js';

export type ManagementTier = 'owner' | 'holds_power' | 'management';

export type DiscordActivityType =
  | 'PLAYING'
  | 'STREAMING'
  | 'LISTENING'
  | 'WATCHING'
  | 'CUSTOM'
  | 'COMPETING';

export type FieldState =
  | 'available'
  | 'unavailable'
  | 'not_supported'
  | 'not_provided'
  | 'error';

export interface SpotifyActivityData {
  trackTitle: string;
  artist: string;
  album: string;
  albumArtUrl: string | null;
  trackId: string | null;
  trackUrl: string | null;
  start: number | null;
  end: number | null;
}

export interface NormalizedDiscordActivity {
  id: string;
  name: string;
  type: DiscordActivityType;
  typeNumber: number;
  details?: string | null;
  state?: string | null;
  timestamps?: {
    start?: number | null;
    end?: number | null;
  } | null;
  assets?: {
    largeImage?: string | null;
    largeImageUrl?: string | null;
    largeText?: string | null;
    smallImage?: string | null;
    smallImageUrl?: string | null;
    smallText?: string | null;
  } | null;
  applicationId?: string | null;
  syncId?: string | null;
  party?: {
    id?: string | null;
    size?: [number, number] | null;
  } | null;
  isSpotify: boolean;
  spotifyData?: SpotifyActivityData | null;
  url?: string | null;
}

export interface ManagementExternalLink {
  label: string;
  url: string;
  type?: 'portfolio' | 'guns' | 'discord' | 'website' | 'github' | 'spotify';
}

export interface ProfileDiagnostics {
  avatarState: 'available' | 'fallback' | 'error';
  bannerState: FieldState;
  decorationState: FieldState;
  effectState: FieldState;
  frameState: FieldState;
  presenceState: 'live' | 'cached' | 'offline_default';
  source: 'live_gateway' | 'live_widget' | 'rest_api' | 'cached' | 'baseline';
  lastGatewayUpdate?: number | null;
  lastCacheUpdate: number;
  apiNotes?: string;
}

export interface DiscordRoleItem {
  name: string;
  color: string;
}

export interface DiscordConnectedAccount {
  type: 'github' | 'spotify' | 'roblox' | 'epic' | 'steam' | 'custom';
  name: string;
  url?: string;
}

export interface DiscordBadgeItem {
  id: string;
  name: string;
  iconType: 'dev' | 'nitro' | 'booster' | 'hypesquad' | 'blender' | 'verified' | 'count';
  label?: string;
  color?: string;
}

export interface ManagementMember {
  id: string; // Permanent Discord User ID (stable key)
  displayName: string;
  username: string;
  nickname?: string | null;
  tier: ManagementTier;
  roleTitle: string;
  badge: string;
  badgeSymbol: string;
  suppliedStatusText?: string;
  statusEmoji?: string;
  themeMode?: 'light' | 'dark';
  clanTagEmoji?: string;
  memberSince?: string;
  connections?: DiscordConnectedAccount[];
  badges?: DiscordBadgeItem[];
  suppliedBio?: string | string[];
  externalLinks?: ManagementExternalLink[];
  rolesList?: DiscordRoleItem[];
  clanTag?: string;
  avatarUrl: string;
  bannerUrl?: string | null;
  bannerColor?: string;
  accentColor: string;
  avatarDecorationUrl?: string | null;
  profileEffectUrl?: string | null;
  profileFrameUrl?: string | null;
  livePresence: 'online' | 'idle' | 'dnd' | 'offline';
  liveActivities: NormalizedDiscordActivity[];
  primaryActivity?: NormalizedDiscordActivity | null;
  source: 'live_discord' | 'cached_discord' | 'baseline';
  lastUpdated: number;
  matchingTokens: string[];
  order: number;
  diagnostics: ProfileDiagnostics;
}

// Compute default Discord avatar using Snowflake ID bitshift formula
export function getDiscordDefaultAvatar(userId: string): string {
  try {
    const defaultIndex = Number((BigInt(userId) >> 22n) % 6n);
    return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
  } catch {
    return `https://cdn.discordapp.com/embed/avatars/0.png`;
  }
}

/**
 * Generic Activity Normalizer
 * Accurately parses Spotify, Games, Streaming, Custom Status and Media
 */
export function normalizeDiscordActivity(raw: any, idx = 0): NormalizedDiscordActivity {
  const typeNumber = typeof raw.type === 'number' ? raw.type : 0;
  const rawName = (raw.name || 'Activity').trim();
  const isSpotify =
    rawName.toLowerCase() === 'spotify' ||
    typeNumber === 2 ||
    Boolean(raw.sync_id) ||
    Boolean(raw.party?.id?.startsWith('spotify:'));

  let activityType: DiscordActivityType = 'PLAYING';
  if (isSpotify || typeNumber === 2) {
    activityType = 'LISTENING';
  } else if (typeNumber === 1) {
    activityType = 'STREAMING';
  } else if (typeNumber === 3) {
    activityType = 'WATCHING';
  } else if (typeNumber === 4) {
    activityType = 'CUSTOM';
  } else if (typeNumber === 5) {
    activityType = 'COMPETING';
  }

  // Resolve Spotify CDN or Discord Application Asset CDN
  let largeImageUrl: string | null = null;
  let smallImageUrl: string | null = null;

  if (isSpotify) {
    if (raw.assets?.large_image) {
      const imgKey: string = raw.assets.large_image;
      if (imgKey.startsWith('spotify:')) {
        largeImageUrl = `https://i.scdn.co/image/${imgKey.slice('spotify:'.length)}`;
      } else {
        largeImageUrl = `https://i.scdn.co/image/${imgKey}`;
      }
    } else {
      largeImageUrl = 'https://cdn.simpleicons.org/spotify/1DB954';
    }
  } else if (raw.application_id && raw.assets?.large_image) {
    const imgKey: string = raw.assets.large_image;
    if (imgKey.startsWith('mp:external/')) {
      largeImageUrl = `https://media.discordapp.net/external/${imgKey.slice('mp:external/'.length)}`;
    } else {
      largeImageUrl = `https://cdn.discordapp.com/app-assets/${raw.application_id}/${imgKey}.png`;
    }
  } else if (rawName.toLowerCase().includes('roblox')) {
    largeImageUrl = 'https://cdn.simpleicons.org/roblox/white';
  } else if (rawName.toLowerCase().includes('minecraft')) {
    largeImageUrl = 'https://cdn.simpleicons.org/minecraft/white';
  } else if (rawName.toLowerCase().includes('visual studio code') || rawName.toLowerCase().includes('code')) {
    largeImageUrl = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg';
  }

  if (raw.application_id && raw.assets?.small_image) {
    const smKey: string = raw.assets.small_image;
    if (smKey.startsWith('mp:external/')) {
      smallImageUrl = `https://media.discordapp.net/external/${smKey.slice('mp:external/'.length)}`;
    } else {
      smallImageUrl = `https://cdn.discordapp.com/app-assets/${raw.application_id}/${smKey}.png`;
    }
  }

  let spotifyData: SpotifyActivityData | null = null;
  if (isSpotify) {
    const trackId = raw.sync_id || null;
    spotifyData = {
      trackTitle: raw.details || 'Unknown Track',
      artist: raw.state || 'Unknown Artist',
      album: raw.assets?.large_text || 'Album',
      albumArtUrl: largeImageUrl,
      trackId,
      trackUrl: trackId ? `https://open.spotify.com/track/${trackId}` : 'https://open.spotify.com',
      start: raw.timestamps?.start || null,
      end: raw.timestamps?.end || null,
    };
  }

  return {
    id: raw.id || `act-${idx}-${rawName}`,
    name: isSpotify ? 'Spotify' : rawName,
    type: activityType,
    typeNumber,
    details: raw.details || null,
    state: raw.state || null,
    timestamps: raw.timestamps
      ? {
          start: raw.timestamps.start || null,
          end: raw.timestamps.end || null,
        }
      : null,
    assets: raw.assets
      ? {
          largeImage: raw.assets.large_image || null,
          largeImageUrl,
          largeText: raw.assets.large_text || null,
          smallImage: raw.assets.small_image || null,
          smallImageUrl,
          smallText: raw.assets.small_text || null,
        }
      : largeImageUrl
        ? {
            largeImage: null,
            largeImageUrl,
            largeText: rawName,
            smallImage: null,
            smallImageUrl: null,
            smallText: null,
          }
        : null,
    applicationId: raw.application_id || null,
    syncId: raw.sync_id || null,
    party: raw.party
      ? {
          id: raw.party.id || null,
          size: raw.party.size || null,
        }
      : null,
    isSpotify,
    spotifyData,
    url: raw.url || null,
  };
}

function getActivityPriority(act: NormalizedDiscordActivity): number {
  if (act.isSpotify) return 1;
  if (act.type === 'PLAYING') return 2;
  if (act.type === 'STREAMING') return 3;
  if (act.type === 'WATCHING') return 4;
  if (act.type === 'COMPETING') return 5;
  if (act.type === 'CUSTOM') return 6;
  return 7;
}

export function normalizeDiscordActivities(rawActivities: any[]): NormalizedDiscordActivity[] {
  if (!Array.isArray(rawActivities) || rawActivities.length === 0) return [];
  const normalized = rawActivities.map((act, i) => normalizeDiscordActivity(act, i));
  return normalized.sort((a, b) => getActivityPriority(a) - getActivityPriority(b));
}

export function pickPrimaryActivity(
  activities: NormalizedDiscordActivity[]
): NormalizedDiscordActivity | null {
  if (!activities || activities.length === 0) return null;
  const spotify = activities.find((a) => a.isSpotify);
  if (spotify) return spotify;
  const game = activities.find((a) => a.type === 'PLAYING' || a.type === 'STREAMING');
  if (game) return game;
  const media = activities.find((a) => a.type === 'WATCHING' || a.type === 'COMPETING');
  if (media) return media;
  return activities[0];
}

// Exactly 9 verified team members configured with permanent Discord User IDs
export const BASELINE_MANAGEMENT_MEMBERS: ManagementMember[] = [
  // =========================================================================
  // TIER 1 — OWNERS
  // =========================================================================
  {
    id: '855386052726620170',
    displayName: '! A r c h',
    username: 'w.arch',
    tier: 'owner',
    roleTitle: 'Server Owner',
    badge: 'Founding Owner',
    badgeSymbol: '👑',
    themeMode: 'light',
    statusEmoji: '👑',
    suppliedStatusText: 'I Carry Legacies!',
    suppliedBio: 'LovePixels Founder & Sovereign Leader.',
    matchingTokens: ['arch', 'a r c h', 'w.arch', '! a r c h'],
    avatarUrl: 'https://cdn.discordapp.com/avatars/855386052726620170/f36704affbd5211a38ccce7a18e58642.png?size=512',
    avatarDecorationUrl: 'https://cdn.discordapp.com/avatar-decoration-presets/a_c48b135704ecb5c88f2f71f6c8bcce2f.png?size=240&passthrough=true',
    bannerUrl: null,
    bannerColor: '#ffffff',
    accentColor: '#111214',
    clanTag: 'LP',
    memberSince: 'Dec 14, 2021',
    badges: [
      { id: 'b1', name: 'Server Owner', iconType: 'nitro', color: '#f472b6' },
      { id: 'b2', name: 'Active Developer', iconType: 'dev', color: '#5865f2' },
      { id: 'b3', name: 'Early Supporter', iconType: 'booster', color: '#f59e0b' },
    ],
    rolesList: [
      { name: 'Server Owner', color: '#f472b6' },
      { name: 'Founding Father', color: '#e879f9' },
      { name: 'LovePixels Host', color: '#fb7185' },
    ],
    livePresence: 'dnd',
    liveActivities: [],
    primaryActivity: null,
    order: 1,
    source: 'baseline',
    lastUpdated: Date.now(),
    diagnostics: {
      avatarState: 'available',
      bannerState: 'unavailable',
      decorationState: 'available',
      effectState: 'not_supported',
      frameState: 'not_provided',
      presenceState: 'live',
      source: 'baseline',
      lastCacheUpdate: Date.now(),
    },
  },
  {
    id: '1507719749981831168',
    displayName: 'KARMAN',
    username: 'og.brar',
    tier: 'owner',
    roleTitle: 'Server Owner',
    badge: 'Founding Owner',
    badgeSymbol: '👑',
    suppliedStatusText: 'Fuck them all',
    matchingTokens: ['karman', 'og.brar', 'og brar'],
    avatarUrl: 'https://cdn.discordapp.com/avatars/1154017832254836849/8f5c8958d8c94c591bec9020e42412de.png?size=512',
    bannerUrl: 'https://cdn.discordapp.com/banners/1154017832254836849/1bb954df01926714cf63d26ae4b6a590.png?size=1024',
    bannerColor: '#220d2d',
    accentColor: '#e879f9',
    clanTag: 'LP',
    rolesList: [
      { name: 'Server Owner', color: '#e879f9' },
      { name: 'Executive Council', color: '#a855f7' },
      { name: 'Nitro Booster', color: '#f472b6' },
    ],
    livePresence: 'offline',
    liveActivities: [],
    primaryActivity: null,
    order: 2,
    source: 'baseline',
    lastUpdated: Date.now(),
    diagnostics: {
      avatarState: 'available',
      bannerState: 'available',
      decorationState: 'unavailable',
      effectState: 'not_supported',
      frameState: 'not_provided',
      presenceState: 'live',
      source: 'baseline',
      lastCacheUpdate: Date.now(),
    },
  },
  {
    id: '950258100743581716',
    displayName: 'w.kryze',
    username: 'w.kryze',
    tier: 'owner',
    roleTitle: 'Server Owner',
    badge: 'Founding Owner',
    badgeSymbol: '👑',
    suppliedStatusText: ':ownz: Ownz',
    suppliedBio: 'gg/lovepixel',
    externalLinks: [
      {
        label: 'gg/lovepixel',
        url: 'https://discord.gg/kwHcdGg2f',
        type: 'discord',
      },
    ],
    matchingTokens: ['w.kryze', 'kryze', 'cries', 'ownz'],
    avatarUrl: 'https://cdn.discordapp.com/avatars/950258100743581716/ff7aebad34eaa3874844a4fc408393c5.png?size=512',
    avatarDecorationUrl: 'https://cdn.discordapp.com/avatar-decoration-presets/a_c86b11a49bb8057ce9c974a6f7ad658a.png?size=240&passthrough=true',
    bannerUrl: null,
    bannerColor: '#111113',
    accentColor: '#38bdf8',
    clanTag: 'LP',
    rolesList: [
      { name: 'Server Owner', color: '#38bdf8' },
      { name: 'Room Architect', color: '#818cf8' },
    ],
    livePresence: 'offline',
    liveActivities: [],
    primaryActivity: null,
    order: 3,
    source: 'baseline',
    lastUpdated: Date.now(),
    diagnostics: {
      avatarState: 'available',
      bannerState: 'unavailable',
      decorationState: 'available',
      effectState: 'not_supported',
      frameState: 'not_provided',
      presenceState: 'live',
      source: 'baseline',
      lastCacheUpdate: Date.now(),
    },
  },

  // =========================================================================
  // TIER 2 — HOLDS POWER
  // =========================================================================
  {
    id: '1197195317318258768',
    displayName: 'Varunxtic',
    username: 'varun4u_',
    tier: 'holds_power',
    roleTitle: 'Holds Power',
    badge: 'Executive Council',
    badgeSymbol: '✨',
    suppliedStatusText: "!? Querencia's!",
    suppliedBio: ['01/09 !?', 'Ownz', 'gg/lovepixel', 'https://guns.lol/varun4u_'],
    externalLinks: [
      {
        label: 'guns.lol/varun4u_',
        url: 'https://guns.lol/varun4u_',
        type: 'guns',
      },
      {
        label: 'gg/lovepixel',
        url: 'https://discord.gg/kwHcdGg2f',
        type: 'discord',
      },
    ],
    matchingTokens: ['varunxtic', 'varun4u_', 'varun4u'],
    avatarUrl: 'https://cdn.discordapp.com/avatars/1197195317318258768/84d92d796a76dc6e6d168f1445fb193b.png?size=512',
    bannerUrl: 'https://cdn.discordapp.com/banners/1197195317318258768/b15f8023f90023d0471b378b2a572b59.png?size=1024',
    avatarDecorationUrl: 'https://cdn.discordapp.com/avatar-decoration-presets/a_b98e8b204d59882fb7f9f7c86922c0bf.png?size=240&passthrough=true',
    bannerColor: '#2d0e25',
    accentColor: '#fb7185',
    clanTag: 'LP',
    rolesList: [
      { name: 'Holds Power', color: '#fb7185' },
      { name: 'Executive Council', color: '#f43f5e' },
      { name: 'Server Booster', color: '#f472b6' },
    ],
    livePresence: 'offline',
    liveActivities: [],
    primaryActivity: null,
    order: 4,
    source: 'baseline',
    lastUpdated: Date.now(),
    diagnostics: {
      avatarState: 'available',
      bannerState: 'available',
      decorationState: 'available',
      effectState: 'not_supported',
      frameState: 'not_provided',
      presenceState: 'live',
      source: 'baseline',
      lastCacheUpdate: Date.now(),
    },
  },
  {
    id: '1415695449670815928',
    displayName: '⚡ V e l v e t ⇣',
    username: 'nyx_velvet',
    tier: 'holds_power',
    roleTitle: 'Holds Power',
    badge: 'Executive Council',
    badgeSymbol: '✨',
    themeMode: 'light',
    statusEmoji: '🌎',
    suppliedStatusText: "When someone ask what's make you happy?...",
    clanTag: 'MEEK',
    clanTagEmoji: '💜',
    memberSince: 'Sep 11, 2025',
    suppliedBio:
      '今夜 I stayed quiet because explaining never changed anything </>\nhttps://velvet-portfolio.vercel.app/\n! ✌️ Ownz\n   .gg/lovepixel\n   .gg/shiddat',
    connections: [
      {
        type: 'epic',
        name: 'nyx_Velvet',
      },
      {
        type: 'github',
        name: 'Velvettt-67',
        url: 'https://github.com/Velvettt-67',
      },
      {
        type: 'roblox',
        name: 'sincsheleft',
        url: 'https://www.roblox.com/search/users?keyword=sincsheleft',
      },
      {
        type: 'spotify',
        name: 'obitooo !!',
        url: 'https://open.spotify.com',
      },
    ],
    badges: [
      { id: 'b1', name: 'Active Developer', iconType: 'dev', color: '#5865f2' },
      { id: 'b2', name: 'Blender 3D', iconType: 'blender', color: '#ea7600' },
      { id: 'b3', name: 'HypeSquad Bravery', iconType: 'hypesquad', color: '#9b59b6' },
      { id: 'b4', name: 'Nitro Booster', iconType: 'booster', color: '#f472b6' },
      { id: 'b5', name: 'Discord Nitro', iconType: 'nitro', color: '#5865f2' },
      { id: 'b6', name: 'More Badges', iconType: 'count', label: '+2' },
    ],
    externalLinks: [
      {
        label: 'https://velvet-portfolio.vercel.app/',
        url: 'https://velvet-portfolio.vercel.app/',
        type: 'portfolio',
      },
      {
        label: '.gg/lovepixel',
        url: 'https://discord.gg/kwHcdGg2f',
        type: 'discord',
      },
      {
        label: '.gg/shiddat',
        url: 'https://discord.gg/shiddat',
        type: 'discord',
      },
    ],
    matchingTokens: ['velvettt', 'velvet', 'nyx_velvet', 'nyx velvet', '⚡ v e l v e t ⇣'],
    avatarUrl: 'https://cdn.discordapp.com/avatars/1415695449670815928/039002ca5dbc7692ee86398368d97c6c.png?size=512',
    bannerUrl: 'https://cdn.discordapp.com/banners/1415695449670815928/afb02b02448cd11d269b5befff47f182.png?size=1024',
    avatarDecorationUrl: 'https://cdn.discordapp.com/avatar-decoration-presets/a_c48b135704ecb5c88f2f71f6c8bcce2f.png?size=240&passthrough=true',
    bannerColor: '#f2f3f5',
    accentColor: '#111214',
    rolesList: [
      { name: 'Holds Power', color: '#f472b6' },
      { name: 'Lead Architect', color: '#c084fc' },
      { name: 'Design Stewardship', color: '#e879f9' },
    ],
    livePresence: 'offline',
    liveActivities: [
      {
        id: 'act-velvet-code',
        name: 'Visual Studio Code',
        type: 'PLAYING',
        typeNumber: 0,
        details: 'Visual Studio Code',
        state: 'Idling',
        isSpotify: false,
        timestamps: {
          start: Date.now() - (1 * 3600 + 52 * 60 + 21) * 1000,
        },
        assets: {
          largeImage: 'vscode',
          largeImageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
          largeText: 'Visual Studio Code',
        },
      },
      {
        id: 'act-velvet-spotify',
        name: 'Spotify',
        type: 'LISTENING',
        typeNumber: 2,
        details: 'Mask Off',
        state: 'Future',
        isSpotify: true,
        spotifyData: {
          trackTitle: 'Mask Off',
          artist: 'Future',
          album: 'FUTURE',
          albumArtUrl: '/assets/events/mask-off.jpg',
          trackId: '0P6Aiq80F9gK079xTfZAA7',
          trackUrl: 'https://open.spotify.com/track/0P6Aiq80F9gK079xTfZAA7',
          start: Date.now() - 130000,
          end: Date.now() + 74000,
        },
        timestamps: {
          start: Date.now() - 130000,
          end: Date.now() + 74000,
        },
      },
    ],
    primaryActivity: null,
    order: 5,
    source: 'baseline',
    lastUpdated: Date.now(),
    diagnostics: {
      avatarState: 'available',
      bannerState: 'available',
      decorationState: 'available',
      effectState: 'not_supported',
      frameState: 'not_provided',
      presenceState: 'live',
      source: 'baseline',
      lastCacheUpdate: Date.now(),
    },
  },

  // =========================================================================
  // TIER 3 — MANAGEMENT
  // =========================================================================
  {
    id: '1521366563222196366',
    displayName: '! Veg. Frankie',
    username: 'daksh.1304',
    tier: 'management',
    roleTitle: 'Management',
    badge: 'Community Operations',
    badgeSymbol: '⚡',
    suppliedBio: '𝙑𝙞𝙫𝙞𝙚𝙣𝙙𝙤 𝙖 𝙢𝙞 𝙢𝙖𝙣𝙚𝙧𝙖, 𝙨𝙞𝙣 𝙚𝙭𝙥𝙡𝙞𝙘𝙖𝙘𝙞𝙤𝙣𝙚𝙨.',
    matchingTokens: ['veg. frankie', 'frankie', 'daksh.1304', 'veg frankie'],
    avatarUrl: 'https://cdn.discordapp.com/avatars/1521366563222196366/c499e0a351773434a427acfc96a36db7.png?size=512',
    bannerUrl: 'https://cdn.discordapp.com/banners/1521366563222196366/20cbe81061a313eab18eb5a059aba214.png?size=1024',
    avatarDecorationUrl: 'https://cdn.discordapp.com/avatar-decoration-presets/a_a7e2ab61c12d84c8b538573f28d58ae0.png?size=240&passthrough=true',
    bannerColor: '#260e22',
    accentColor: '#f472b6',
    clanTag: 'LP',
    rolesList: [
      { name: 'Management', color: '#f472b6' },
      { name: 'Community Caretaker', color: '#fb7185' },
    ],
    livePresence: 'offline',
    liveActivities: [],
    primaryActivity: null,
    order: 6,
    source: 'baseline',
    lastUpdated: Date.now(),
    diagnostics: {
      avatarState: 'available',
      bannerState: 'available',
      decorationState: 'available',
      effectState: 'not_supported',
      frameState: 'not_provided',
      presenceState: 'live',
      source: 'baseline',
      lastCacheUpdate: Date.now(),
    },
  },
  {
    id: '1222076762939199531',
    displayName: 'SUNNY JAAT',
    username: 'sunnylive06',
    tier: 'management',
    roleTitle: 'Management',
    badge: 'Community Operations',
    badgeSymbol: '⚡',
    suppliedBio: ['.gg/weeds', '.gg/lovepixal'],
    externalLinks: [
      {
        label: '.gg/weeds',
        url: 'https://discord.gg/weeds',
        type: 'discord',
      },
      {
        label: '.gg/lovepixal',
        url: 'https://discord.gg/lovepixal',
        type: 'discord',
      },
    ],
    matchingTokens: ['sunny jaat', 'sunny', 'sunnylive06', 'sunnylive'],
    avatarUrl: 'https://cdn.discordapp.com/avatars/1222076762939199531/aef27d3db04310591f5814b7eb0fc993.png?size=512',
    bannerUrl: null,
    bannerColor: '#1d102e',
    accentColor: '#a855f7',
    clanTag: 'LP',
    rolesList: [
      { name: 'Management', color: '#a855f7' },
      { name: 'Voice Salon Host', color: '#c084fc' },
    ],
    livePresence: 'offline',
    liveActivities: [],
    primaryActivity: null,
    order: 7,
    source: 'baseline',
    lastUpdated: Date.now(),
    diagnostics: {
      avatarState: 'available',
      bannerState: 'unavailable',
      decorationState: 'unavailable',
      effectState: 'not_supported',
      frameState: 'not_provided',
      presenceState: 'live',
      source: 'baseline',
      lastCacheUpdate: Date.now(),
    },
  },
  {
    id: '1169401087082647683',
    displayName: 'Тｉｔａｎ',
    username: 'gotbetray_manytimes',
    tier: 'management',
    roleTitle: 'Management',
    badge: 'Community Operations',
    badgeSymbol: '⚡',
    suppliedStatusText: 'n3verdies',
    suppliedBio: 'Háblame si te aburres',
    matchingTokens: ['titan', 'gotbetray_manytimes', 'gotbetray'],
    avatarUrl: 'https://cdn.discordapp.com/avatars/1169401087082647683/52b5ca1fb62de8800ebb9d60bf281990.png?size=512',
    avatarDecorationUrl: 'https://cdn.discordapp.com/avatar-decoration-presets/a_3c97a2d37f433a7913a1c7b7a735d000.png?size=240&passthrough=true',
    bannerUrl: null,
    bannerColor: '#625e5e',
    accentColor: '#818cf8',
    clanTag: 'LP',
    rolesList: [
      { name: 'Management', color: '#818cf8' },
      { name: 'Operations Specialist', color: '#38bdf8' },
    ],
    livePresence: 'offline',
    liveActivities: [],
    primaryActivity: null,
    order: 8,
    source: 'baseline',
    lastUpdated: Date.now(),
    diagnostics: {
      avatarState: 'available',
      bannerState: 'unavailable',
      decorationState: 'available',
      effectState: 'not_supported',
      frameState: 'not_provided',
      presenceState: 'live',
      source: 'baseline',
      lastCacheUpdate: Date.now(),
    },
  },
  {
    id: '1514910667889446985',
    displayName: 'SKY',
    username: 'w.light01',
    tier: 'management',
    roleTitle: 'Management',
    badge: 'Community Operations',
    badgeSymbol: '⚡',
    suppliedBio: ['𝐲𝐨𝐮 𝐟𝐨𝐮𝐧𝐝 𝐦𝐞. 𝐍𝐨𝐰 𝐰𝐡𝐚𝐭 ?', '.gg/lovepixal'],
    externalLinks: [
      {
        label: '.gg/lovepixal',
        url: 'https://discord.gg/lovepixal',
        type: 'discord',
      },
    ],
    matchingTokens: ['sky', 'w.light01', 'w.light', 'moonlight'],
    avatarUrl: 'https://cdn.discordapp.com/avatars/1514910667889446985/3cc778f67519b24b7e71adcbc8953c8e.png?size=512',
    bannerUrl: 'https://cdn.discordapp.com/banners/1514910667889446985/e7e81ddcdfe738986db2e10fdf2cc2bf.png?size=1024',
    bannerColor: '#0e2033',
    accentColor: '#38bdf8',
    clanTag: 'LP',
    rolesList: [
      { name: 'Management', color: '#38bdf8' },
      { name: 'Community Caretaker', color: '#818cf8' },
    ],
    livePresence: 'offline',
    liveActivities: [],
    primaryActivity: null,
    order: 9,
    source: 'baseline',
    lastUpdated: Date.now(),
    diagnostics: {
      avatarState: 'available',
      bannerState: 'available',
      decorationState: 'unavailable',
      effectState: 'not_supported',
      frameState: 'not_provided',
      presenceState: 'live',
      source: 'baseline',
      lastCacheUpdate: Date.now(),
    },
  },
];

let cachedManagementTeam: ManagementMember[] = BASELINE_MANAGEMENT_MEMBERS.map((m) => ({
  ...m,
  diagnostics: { ...m.diagnostics },
}));
let lastFetchTimestamp = 0;
const MANAGEMENT_CACHE_TTL_MS = 4000;

export function robustNormalize(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\u0442/g, 't')
    .replace(/\u0430/g, 'a')
    .replace(/\u043e/g, 'o')
    .replace(/\u0435/g, 'e')
    .replace(/\u0440/g, 'p')
    .replace(/\u0441/g, 'c')
    .replace(/[^a-z0-9]/g, '');
}

export function wordsNormalize(str: string): string[] {
  if (!str) return [];
  return str
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\u0442/g, 't')
    .replace(/\u0430/g, 'a')
    .replace(/\u043e/g, 'o')
    .replace(/\u0435/g, 'e')
    .replace(/\u0440/g, 'p')
    .replace(/\u0441/g, 'c')
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export function matchesMember(rawUsername: string, tokens: string[]): boolean {
  const cleanUser = robustNormalize(rawUsername);
  if (!cleanUser) return false;
  const userWords = wordsNormalize(rawUsername);

  for (const t of tokens) {
    const cleanT = robustNormalize(t);
    if (!cleanT || cleanT.length < 3) continue;

    // 1. Exact full cleaned match (e.g. '⚡ V e l v e t ⇣' -> 'velvet' === 'velvet')
    if (cleanUser === cleanT) return true;

    // 2. Word token match (e.g. '! Veg. Frankie' has word 'frankie', matching token 'frankie')
    const tokenWords = wordsNormalize(t);
    for (const tw of tokenWords) {
      if (tw.length >= 3 && userWords.includes(tw)) return true;
    }

    // 3. Exact handle substring for usernames like 'nyx_velvet' matching 'velvet'
    if (cleanUser.includes(cleanT) && cleanT.length >= 6) return true;
  }
  return false;
}

/**
 * Resolves live presence & avatars for the 9 management members:
 * 1. Queries official bot REST API if token available
 * 2. Ingests Discord widget for presence & online member avatars without cross-contaminating
 * 3. Preserves cached live data and never replaces a valid avatar with a blank default
 */
export async function fetchLiveManagementTeam(forceRefresh = false): Promise<{
  team: ManagementMember[];
  source: 'live' | 'cached' | 'fallback';
  lastUpdated: number;
}> {
  const now = Date.now();
  if (!forceRefresh && cachedManagementTeam && now - lastFetchTimestamp < MANAGEMENT_CACHE_TTL_MS) {
    return {
      team: cachedManagementTeam,
      source: 'cached',
      lastUpdated: lastFetchTimestamp,
    };
  }

  const updatedTeam = cachedManagementTeam.map((m) => ({
    ...m,
    diagnostics: { ...m.diagnostics },
  }));
  let hasLiveSignal = false;

  // 1. OFFICIAL BOT REST API (If token configured)
  if (SERVER_CONFIG.botToken) {
    try {
      await Promise.all(
        updatedTeam.map(async (member) => {
          try {
            const guildMemberRes = await fetch(
              `https://discord.com/api/v10/guilds/${SERVER_CONFIG.guildId}/members/${member.id}`,
              {
                headers: {
                  Authorization: `Bot ${SERVER_CONFIG.botToken}`,
                  'User-Agent': 'LovePixelsManagement/1.0',
                },
                signal: AbortSignal.timeout(3000),
              }
            );

            let hasGuildAvatar = false;
            let hasGuildBanner = false;

            if (guildMemberRes.ok) {
              const gm: any = await guildMemberRes.json();
              if (gm.nick) member.nickname = gm.nick;
              if (gm.avatar) {
                const ext = gm.avatar.startsWith('a_') ? 'gif' : 'png';
                member.avatarUrl = `https://cdn.discordapp.com/guilds/${SERVER_CONFIG.guildId}/users/${member.id}/avatars/${gm.avatar}.${ext}?size=512`;
                member.diagnostics.avatarState = 'available';
                hasGuildAvatar = true;
              }
              if (gm.banner) {
                const ext = gm.banner.startsWith('a_') ? 'gif' : 'png';
                member.bannerUrl = `https://cdn.discordapp.com/guilds/${SERVER_CONFIG.guildId}/users/${member.id}/banners/${gm.banner}.${ext}?size=1024`;
                member.diagnostics.bannerState = 'available';
                hasGuildBanner = true;
              }
              if (gm.avatar_decoration_data?.asset) {
                member.avatarDecorationUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${gm.avatar_decoration_data.asset}.png?size=240&passthrough=true`;
                member.diagnostics.decorationState = 'available';
              }
            }

            const userRes = await fetch(`https://discord.com/api/v10/users/${member.id}`, {
              headers: {
                Authorization: `Bot ${SERVER_CONFIG.botToken}`,
                'User-Agent': 'LovePixelsManagement/1.0',
              },
              signal: AbortSignal.timeout(3000),
            });

            if (userRes.ok) {
              const userJson: any = await userRes.json();
              hasLiveSignal = true;

              if (!hasGuildAvatar && userJson.avatar) {
                const ext = userJson.avatar.startsWith('a_') ? 'gif' : 'png';
                member.avatarUrl = `https://cdn.discordapp.com/avatars/${member.id}/${userJson.avatar}.${ext}?size=512`;
                member.diagnostics.avatarState = 'available';
              }
              if (!hasGuildBanner && userJson.banner) {
                const ext = userJson.banner.startsWith('a_') ? 'gif' : 'png';
                member.bannerUrl = `https://cdn.discordapp.com/banners/${member.id}/${userJson.banner}.${ext}?size=1024`;
                member.diagnostics.bannerState = 'available';
              }
              if (!member.avatarDecorationUrl && userJson.avatar_decoration_data?.asset) {
                member.avatarDecorationUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${userJson.avatar_decoration_data.asset}.png?size=240&passthrough=true`;
                member.diagnostics.decorationState = 'available';
              }
              if (userJson.banner_color) member.bannerColor = userJson.banner_color;
              if (userJson.accent_color) member.accentColor = `#${userJson.accent_color.toString(16).padStart(6, '0')}`;
              member.diagnostics.source = 'rest_api';
              member.source = 'live_discord';
            }
          } catch {
            // Non-blocking
          }
        })
      );
    } catch {
      // Ignore
    }
  }

  // 2. DISCORD PUBLIC WIDGET INGESTION (Presence & Active In-Server State)
  try {
    const widgetRes = await fetch(
      `https://discord.com/api/guilds/${SERVER_CONFIG.guildId}/widget.json`,
      {
        headers: {
          'User-Agent': 'LovePixelsManagement/1.0 (https://discord.gg/kwHcdGg2f)',
        },
        signal: AbortSignal.timeout(4000),
      }
    );

    if (widgetRes.ok) {
      const widgetJson: any = await widgetRes.json();
      const widgetMembers: any[] = Array.isArray(widgetJson.members) ? widgetJson.members : [];

      for (const member of updatedTeam) {
        const matched = widgetMembers.find((wm) => {
          const rawName = wm.username || '';
          return matchesMember(rawName, member.matchingTokens);
        });

        if (matched) {
          hasLiveSignal = true;
          member.livePresence = (matched.status as 'online' | 'idle' | 'dnd' | 'offline') || 'online';
          member.diagnostics.presenceState = 'live';

          // If member has a game in widget, add or update activity
          if (matched.game && matched.game.name) {
            const widgetAct = normalizeDiscordActivity(matched.game);
            member.liveActivities = [widgetAct];
            member.primaryActivity = widgetAct;
          } else {
            // Member is online but has no active game
            member.liveActivities = [];
            member.primaryActivity = null;
          }

          if (matched.avatar_url) {
            member.avatarUrl = matched.avatar_url;
            member.diagnostics.avatarState = 'available';
          }

          member.source = 'live_discord';
          member.lastUpdated = now;
        } else {
          // Member is NOT active in the Discord guild widget (e.g. Invisible or Offline)
          member.livePresence = 'offline';
          member.liveActivities = [];
          member.primaryActivity = null;
        }
      }
    }
  } catch {
    // Ignore widget errors
  }

  for (const m of updatedTeam) {
    m.diagnostics.lastCacheUpdate = now;
  }
  cachedManagementTeam = updatedTeam;
  lastFetchTimestamp = now;

  return {
    team: updatedTeam,
    source: hasLiveSignal ? 'live' : 'cached',
    lastUpdated: now,
  };
}

export function updateMemberPresenceFromGateway(
  userId: string,
  presencePayload: {
    status: 'online' | 'idle' | 'dnd' | 'offline';
    activities?: any[];
    user?: {
      id?: string;
      username?: string;
      avatar?: string | null;
      avatar_decoration_data?: { asset: string; sku_id?: string } | null;
      global_name?: string | null;
    };
  }
): ManagementMember | null {
  const member = cachedManagementTeam.find((m) => m.id === userId);
  if (!member) return null;

  member.livePresence = presencePayload.status || 'offline';
  const normalizedActs = normalizeDiscordActivities(presencePayload.activities || []);
  member.liveActivities = normalizedActs;
  member.primaryActivity = pickPrimaryActivity(normalizedActs);

  if (presencePayload.user) {
    if (presencePayload.user.avatar) {
      const ext = presencePayload.user.avatar.startsWith('a_') ? 'gif' : 'png';
      member.avatarUrl = `https://cdn.discordapp.com/avatars/${member.id}/${presencePayload.user.avatar}.${ext}?size=512`;
      member.diagnostics.avatarState = 'available';
    }
    if (presencePayload.user.avatar_decoration_data?.asset) {
      member.avatarDecorationUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${presencePayload.user.avatar_decoration_data.asset}.png?size=240&passthrough=true`;
      member.diagnostics.decorationState = 'available';
    }
  }

  member.diagnostics.presenceState = 'live';
  member.diagnostics.source = 'live_gateway';
  member.diagnostics.lastGatewayUpdate = Date.now();
  member.diagnostics.lastCacheUpdate = Date.now();
  member.source = 'live_discord';
  member.lastUpdated = Date.now();

  return { ...member };
}

export function updateMemberProfileFromGateway(
  userId: string,
  memberPayload: {
    nick?: string | null;
    avatar?: string | null;
    isGuildAvatar?: boolean;
    guildId?: string;
    banner?: string | null;
    isGuildBanner?: boolean;
    avatar_decoration_data?: { asset: string } | null;
    banner_color?: string | null;
    accent_color?: number | null;
    user?: {
      id: string;
      username: string;
      global_name?: string | null;
      avatar?: string | null;
      banner?: string | null;
      avatar_decoration_data?: { asset: string } | null;
      banner_color?: string | null;
      accent_color?: number | null;
    };
  }
): ManagementMember | null {
  const member = cachedManagementTeam.find((m) => m.id === userId);
  if (!member) return null;

  if (memberPayload.nick) member.nickname = memberPayload.nick;
  if (memberPayload.avatar) {
    const ext = memberPayload.avatar.startsWith('a_') ? 'gif' : 'png';
    member.avatarUrl = `https://cdn.discordapp.com/guilds/${SERVER_CONFIG.guildId}/users/${userId}/avatars/${memberPayload.avatar}.${ext}?size=512`;
    member.diagnostics.avatarState = 'available';
  } else if (memberPayload.user?.avatar) {
    const ext = memberPayload.user.avatar.startsWith('a_') ? 'gif' : 'png';
    member.avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${memberPayload.user.avatar}.${ext}?size=512`;
    member.diagnostics.avatarState = 'available';
  }

  if (memberPayload.banner) {
    const ext = memberPayload.banner.startsWith('a_') ? 'gif' : 'png';
    member.bannerUrl = `https://cdn.discordapp.com/guilds/${SERVER_CONFIG.guildId}/users/${userId}/banners/${memberPayload.banner}.${ext}?size=1024`;
    member.diagnostics.bannerState = 'available';
  } else if (memberPayload.user?.banner) {
    const ext = memberPayload.user.banner.startsWith('a_') ? 'gif' : 'png';
    member.bannerUrl = `https://cdn.discordapp.com/banners/${userId}/${memberPayload.user.banner}.${ext}?size=1024`;
    member.diagnostics.bannerState = 'available';
  }

  const decAsset =
    memberPayload.avatar_decoration_data?.asset ||
    memberPayload.user?.avatar_decoration_data?.asset;
  if (decAsset) {
    member.avatarDecorationUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${decAsset}.png?size=240&passthrough=true`;
    member.diagnostics.decorationState = 'available';
  }

  if (memberPayload.user?.banner_color) member.bannerColor = memberPayload.user.banner_color;
  if (memberPayload.user?.accent_color) {
    member.accentColor = `#${memberPayload.user.accent_color.toString(16).padStart(6, '0')}`;
  }

  member.diagnostics.lastCacheUpdate = Date.now();
  member.lastUpdated = Date.now();

  return { ...member };
}

export function getMemberByDiscordId(discordId: string): ManagementMember | null {
  return cachedManagementTeam.find((m) => m.id === discordId) || null;
}
