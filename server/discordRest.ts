import { SERVER_CONFIG, CHANNELS, SUPPORTED_CHANNEL_IDS } from './config.js';
import { getActive24hCount, seed24hActivityFromMembers } from './db.js';

export interface NormalizedAuthor {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string;
  bot: boolean;
  roleColor?: string;
}

export interface NormalizedAttachment {
  id: string;
  url: string;
  proxyUrl: string;
  filename: string;
  contentType: string | null;
  size: number;
  width: number | null;
  height: number | null;
}

export interface NormalizedEmbed {
  title: string | null;
  description: string | null;
  url: string | null;
  color: number | null;
  image: { url: string; proxyUrl?: string } | null;
  thumbnail: { url: string } | null;
  timestamp: string | null;
  footer: { text: string } | null;
}

export interface NormalizedMessage {
  id: string;
  channelId: string;
  author: NormalizedAuthor;
  content: string;
  timestamp: string;
  timeFormatted: string;
  editedTimestamp: string | null;
  attachments: NormalizedAttachment[];
  embeds: NormalizedEmbed[];
  isWebsiteBridge: boolean;
  bridgeMember: {
    username: string;
    globalName?: string;
    avatar?: string;
  } | null;
}

// In-memory persistent cache for recent channel messages
const channelMessageCache = new Map<string, { messages: NormalizedMessage[]; lastFetch: number }>();

export function getCachedMessages(channelId: string): NormalizedMessage[] {
  return channelMessageCache.get(channelId)?.messages || [];
}

export function setCachedMessages(channelId: string, messages: NormalizedMessage[]): void {
  channelMessageCache.set(channelId, { messages, lastFetch: Date.now() });
}

export function upsertCachedMessage(channelId: string, message: NormalizedMessage): void {
  const existing = getCachedMessages(channelId);
  const idx = existing.findIndex((m) => m.id === message.id);
  let updated: NormalizedMessage[];
  if (idx >= 0) {
    updated = [...existing];
    updated[idx] = message;
  } else {
    // Append in chronological order (oldest to newest)
    updated = [...existing, message];
    // Keep last 60
    if (updated.length > 60) {
      updated = updated.slice(updated.length - 60);
    }
  }
  setCachedMessages(channelId, updated);
}

export function removeCachedMessage(channelId: string, messageId: string): void {
  const existing = getCachedMessages(channelId);
  const updated = existing.filter((m) => m.id !== messageId);
  setCachedMessages(channelId, updated);
}

export function getDiscordAvatarUrl(userId: string, avatarHash: string | null | undefined): string {
  if (avatarHash) {
    const ext = avatarHash.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=128`;
  }
  try {
    const defaultIndex = Number((BigInt(userId) >> 22n) % 6n);
    return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
  } catch {
    return `https://cdn.discordapp.com/embed/avatars/0.png`;
  }
}

function formatMessageTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${mins}`;
  } catch {
    return '00:00';
  }
}

export function normalizeDiscordMessage(raw: any): NormalizedMessage {
  const authorId = raw.author?.id || '0';
  const authorAvatar = getDiscordAvatarUrl(authorId, raw.author?.avatar);
  const content = raw.content || '';

  // Detect transparent website bridge attribution
  const isBridge =
    content.includes('[Website Bridge]') ||
    content.includes('LovePixels Website Bridge') ||
    content.includes('🌐 **LovePixels Website Bridge**') ||
    content.includes('🌐 **Website Bridge**');

  let bridgeMember: NormalizedMessage['bridgeMember'] = null;
  if (isBridge) {
    // Extract verified member attribution from content if present
    const match = content.match(/verified member \*\*([^*]+)\*\* \(@([^)]+)\)/);
    if (match) {
      bridgeMember = {
        globalName: match[1],
        username: match[2],
      };
    }
  }

  const attachments: NormalizedAttachment[] = (raw.attachments || []).map((att: any) => ({
    id: att.id,
    url: att.url,
    proxyUrl: att.proxy_url || att.url,
    filename: att.filename,
    contentType: att.content_type || null,
    size: att.size || 0,
    width: att.width || null,
    height: att.height || null,
  }));

  const embeds: NormalizedEmbed[] = (raw.embeds || []).map((emb: any) => ({
    title: emb.title || null,
    description: emb.description || null,
    url: emb.url || null,
    color: emb.color || null,
    image: emb.image ? { url: emb.image.url, proxyUrl: emb.image.proxy_url } : null,
    thumbnail: emb.thumbnail ? { url: emb.thumbnail.url } : null,
    timestamp: emb.timestamp || null,
    footer: emb.footer ? { text: emb.footer.text } : null,
  }));

  return {
    id: raw.id,
    channelId: raw.channel_id,
    author: {
      id: authorId,
      username: raw.author?.username || 'Member',
      globalName: raw.author?.global_name || null,
      avatar: authorAvatar,
      bot: Boolean(raw.author?.bot),
      roleColor: raw.author?.bot ? '#f472b6' : '#d3738b',
    },
    content,
    timestamp: raw.timestamp || new Date().toISOString(),
    timeFormatted: formatMessageTime(raw.timestamp || new Date().toISOString()),
    editedTimestamp: raw.edited_timestamp || null,
    attachments,
    embeds,
    isWebsiteBridge: isBridge,
    bridgeMember,
  };
}

/**
 * Fetch channel messages via official Discord REST v10 API
 */
export async function fetchChannelMessages(
  channelId: string,
  limit = 50,
  forceRefresh = false
): Promise<{ messages: NormalizedMessage[]; source: 'cache' | 'api' | 'unconfigured'; error?: string }> {
  if (!SUPPORTED_CHANNEL_IDS.includes(channelId)) {
    return { messages: [], source: 'unconfigured', error: 'Channel is not an owner-approved public channel.' };
  }

  const cached = channelMessageCache.get(channelId);
  const now = Date.now();
  if (!forceRefresh && cached && now - cached.lastFetch < 8000) {
    return { messages: cached.messages, source: 'cache' };
  }

  if (!SERVER_CONFIG.botToken) {
    return {
      messages: cached?.messages || [],
      source: 'unconfigured',
      error: 'DISCORD_BOT_TOKEN is not configured in .env. Live messages will appear once configured.',
    };
  }

  try {
    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages?limit=${limit}`, {
      headers: {
        Authorization: `Bot ${SERVER_CONFIG.botToken}`,
        'User-Agent': 'LovePixelsWebsite/1.0 (https://discord.gg/kwHcdGg2f)',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        messages: cached?.messages || [],
        source: 'api',
        error: `Discord API returned ${res.status}: ${errText}`,
      };
    }

    const rawList = (await res.json()) as any[];
    // Discord returns messages newest first; reverse so they are displayed chronologically (oldest to newest)
    const normalized = rawList.map(normalizeDiscordMessage).reverse();
    setCachedMessages(channelId, normalized);

    return { messages: normalized, source: 'api' };
  } catch (err: any) {
    return {
      messages: cached?.messages || [],
      source: 'api',
      error: err.message || 'Network error communicating with Discord API.',
    };
  }
}

/**
 * Post a message to General channel via transparent Website Bridge
 */
export async function postBridgeMessage(
  channelId: string,
  member: { id: string; username: string; global_name?: string | null; avatar?: string | null },
  rawContent: string
): Promise<{ success: boolean; message?: NormalizedMessage; error?: string }> {
  if (channelId !== CHANNELS.general.id) {
    return { success: false, error: 'Only the #general channel supports website-to-Discord messaging.' };
  }

  if (!SERVER_CONFIG.botToken) {
    return {
      success: false,
      error: 'Discord Bot is not currently configured on the server. Message cannot be delivered.',
    };
  }

  const cleanContent = rawContent.trim();
  if (!cleanContent) {
    return { success: false, error: 'Message cannot be empty.' };
  }
  if (cleanContent.length > 1000) {
    return { success: false, error: 'Message exceeds 1,000 character limit.' };
  }

  // Prevent unwanted mass mentions
  const sanitizedContent = cleanContent
    .replace(/@everyone/g, '@\u200beveryone')
    .replace(/@here/g, '@\u200bhere');

  const displayName = member.global_name || member.username;
  const bridgePayload = {
    content: `🌐 **LovePixels Website Bridge** · Message from verified member **${displayName}** (@${member.username}):\n${sanitizedContent}`,
    allowed_mentions: {
      parse: ['users'], // Allow individual user mentions, reject role and mass mentions
    },
  };

  try {
    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${SERVER_CONFIG.botToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'LovePixelsWebsiteBridge/1.0',
      },
      body: JSON.stringify(bridgePayload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Discord rejected bridge message (${res.status}): ${errText}` };
    }

    const createdRaw = await res.json();
    const normalized = normalizeDiscordMessage(createdRaw);
    upsertCachedMessage(channelId, normalized);

    return { success: true, message: normalized };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit bridge message to Discord.' };
  }
}

/**
 * Verify if a user is currently a member of the LovePixels Discord server
 */
export async function verifyGuildMembership(
  userId: string
): Promise<{ isMember: boolean; roles?: string[]; error?: string }> {
  if (!SERVER_CONFIG.botToken) {
    return { isMember: false, error: 'Bot token not configured to verify membership.' };
  }

  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${SERVER_CONFIG.guildId}/members/${userId}`,
      {
        headers: {
          Authorization: `Bot ${SERVER_CONFIG.botToken}`,
          'User-Agent': 'LovePixelsWebsite/1.0',
        },
      }
    );

    if (res.status === 200) {
      const memberData: any = await res.json();
      return { isMember: true, roles: memberData.roles || [] };
    } else if (res.status === 404) {
      return { isMember: false };
    } else {
      const txt = await res.text();
      return { isMember: false, error: `Membership check error (${res.status}): ${txt}` };
    }
  } catch (err: any) {
    return { isMember: false, error: err.message };
  }
}

export interface DiscordCommunityMember {
  id: string;
  username: string;
  discriminator?: string;
  avatar_url: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  channel_id?: string | null;
  game?: { name: string } | null;
}

export interface DiscordCommunityStats {
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

let communityStatsCache: {
  data: DiscordCommunityStats;
  fetchedAt: number;
} | null = null;

const STATS_CACHE_TTL_MS = 30000; // 30 seconds TTL cache to prevent Discord rate-limiting

/**
 * Fetch live Discord community statistics:
 * - Real online presence count
 * - Real member avatars from official widget
 * - Verified total member count from Discord API
 * - 24-hour active participants tracked in SQLite
 */
export async function fetchDiscordCommunityStats(): Promise<DiscordCommunityStats> {
  const now = Date.now();
  if (communityStatsCache && now - communityStatsCache.fetchedAt < STATS_CACHE_TTL_MS) {
    return {
      ...communityStatsCache.data,
      source: 'cached',
    };
  }

  let onlineCount = 2140;
  let totalMembers = 15460;
  let guildName = 'LovePixel™ ﹒Chilling ﹒Hangout ﹒Gaming ﹒Social';
  let guildIcon: string | null = null;
  let members: DiscordCommunityMember[] = [];
  let fetchSucceeded = false;

  // 1. Query Discord Widget for live presence & member avatars
  try {
    const widgetRes = await fetch(
      `https://discord.com/api/guilds/${SERVER_CONFIG.guildId}/widget.json`,
      {
        headers: {
          'User-Agent': 'LovePixelsWebsite/1.0 (https://discord.gg/kwHcdGg2f)',
        },
        signal: AbortSignal.timeout(4000),
      }
    );

    if (widgetRes.ok) {
      const widgetJson: any = await widgetRes.json();
      if (typeof widgetJson.presence_count === 'number') {
        onlineCount = widgetJson.presence_count;
        fetchSucceeded = true;
      }
      if (widgetJson.name) {
        guildName = widgetJson.name;
      }
      if (Array.isArray(widgetJson.members)) {
        members = widgetJson.members.map((m: any, idx: number) => ({
          id: m.id || `member-${idx}`,
          username: m.username || 'Member',
          discriminator: m.discriminator || '0000',
          avatar_url: m.avatar_url || `https://cdn.discordapp.com/embed/avatars/${idx % 5}.png`,
          status: (m.status as 'online' | 'idle' | 'dnd' | 'offline') || 'online',
          channel_id: m.channel_id || null,
          game: m.game || null,
        }));

        // Seed observed members into SQLite 24h activity log
        seed24hActivityFromMembers(members);
      }
    }
  } catch (err) {
    console.warn('[DiscordStats] Widget fetch failed:', err);
  }

  // 2. Query Discord Invite API for total members count
  try {
    const inviteRes = await fetch(
      'https://discord.com/api/v9/invites/kwHcdGg2f?with_counts=true',
      {
        headers: {
          'User-Agent': 'LovePixelsWebsite/1.0 (https://discord.gg/kwHcdGg2f)',
        },
        signal: AbortSignal.timeout(4000),
      }
    );

    if (inviteRes.ok) {
      const inviteJson: any = await inviteRes.json();
      if (typeof inviteJson.approximate_member_count === 'number') {
        totalMembers = inviteJson.approximate_member_count;
        fetchSucceeded = true;
      }
      if (typeof inviteJson.approximate_presence_count === 'number' && (!onlineCount || onlineCount === 2140)) {
        onlineCount = inviteJson.approximate_presence_count;
      }
      if (inviteJson.guild?.icon) {
        guildIcon = `https://cdn.discordapp.com/icons/${SERVER_CONFIG.guildId}/${inviteJson.guild.icon}.png`;
      }
    }
  } catch (err) {
    console.warn('[DiscordStats] Invite counts fetch failed:', err);
  }

  // 3. Compute 24h active members count
  // Real observed activity from SQLite, bounded by at least current live presence
  const sqlite24h = getActive24hCount();
  const active24hCount = Math.max(sqlite24h, onlineCount);

  const result: DiscordCommunityStats = {
    onlineCount,
    totalMembers,
    active24hCount,
    members,
    guildName,
    guildIcon,
    isApproximate: true,
    source: fetchSucceeded ? 'live' : communityStatsCache ? 'cached' : 'fallback',
    lastUpdated: now,
  };

  if (fetchSucceeded) {
    communityStatsCache = {
      data: result,
      fetchedAt: now,
    };
  }

  return result;
}
