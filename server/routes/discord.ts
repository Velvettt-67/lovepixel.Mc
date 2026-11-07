import { Router, type Request, type Response } from 'express';
import { CHANNELS, SUPPORTED_CHANNEL_IDS, SERVER_CONFIG } from '../config.js';
import { db } from '../db.js';
import {
  fetchChannelMessages,
  postBridgeMessage,
  verifyGuildMembership,
  fetchDiscordCommunityStats,
} from '../discordRest.js';
import { getGatewayStatus, addSseClient } from '../discordGateway.js';
import { fetchLiveManagementTeam, getMemberByDiscordId } from '../managementService.js';
import { getSessionFromReq } from './auth.js';

export const discordRouter = Router();

// Helper to resolve channel key or channel ID to concrete channel ID
function resolveChannelId(param: string | undefined): string | null {
  if (!param) return null;
  if (SUPPORTED_CHANNEL_IDS.includes(param)) {
    return param;
  }
  const byKey = (CHANNELS as Record<string, { id: string }>)[param];
  if (byKey) {
    return byKey.id;
  }
  return null;
}

/**
 * GET /api/discord/status
 * Returns live Gateway connection status and configuration state
 */
discordRouter.get('/status', (_req: Request, res: Response) => {
  const gateway = getGatewayStatus();
  res.json({
    status: gateway.state,
    botUser: gateway.botUser,
    connectedSince: gateway.connectedSince,
    lastHeartbeatAck: gateway.lastHeartbeatAck,
    error: gateway.error,
  });
});

/**
 * GET /api/discord/community-stats
 * Real-time Discord Community Statistics:
 * - Live online member count
 * - Actual online member avatars with genuine Discord CDN URLs
 * - Verified total server member count (~15,460)
 * - 24-hour active participants tracked in SQLite
 * Cached for 30s to respect Discord rate limits.
 */
discordRouter.get('/community-stats', async (_req: Request, res: Response) => {
  try {
    const stats = await fetchDiscordCommunityStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({
      error: err.message || 'Failed to retrieve Discord community statistics.',
      onlineCount: 2080,
      totalMembers: 15460,
      active24hCount: 2080,
      members: [],
      guildName: 'LovePixels',
      guildIcon: null,
      isApproximate: true,
      source: 'fallback',
      lastUpdated: Date.now(),
    });
  }
});

/**
 * GET /api/discord/management
 * Real-time Discord presence, avatars, and verified profile data for the 9 LovePixels leaders:
 * - Tier 1: Owners (w.arch, og.brar, w.kryze)
 * - Tier 2: Holds Power (Varunxtic, Velvettt!)
 * - Tier 3: Management (Veg. Frankie, SUNNY JAAT, Titan, SKY)
 */
discordRouter.get('/management', async (_req: Request, res: Response) => {
  try {
    const managementData = await fetchLiveManagementTeam();
    res.json(managementData);
  } catch (err: any) {
    res.status(500).json({
      error: err.message || 'Failed to retrieve management team data.',
      team: [],
      source: 'fallback',
      lastUpdated: Date.now(),
    });
  }
});

/**
 * GET /api/discord/profile/:discordId
 * Retrieve verified Discord profile, cosmetics, and presence by Discord ID
 */
discordRouter.get('/profile/:discordId', async (req: Request, res: Response) => {
  const rawId = req.params.discordId;
  const discordId = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!discordId) {
    res.status(400).json({ error: 'Missing discordId parameter.' });
    return;
  }
  const member = getMemberByDiscordId(discordId);
  if (!member) {
    res.status(404).json({
      error: `Discord profile not found for user ID: ${discordId}`,
      discordId,
    });
    return;
  }
  res.json(member);
});

/**
 * GET /api/discord/stats
 * Canonical alias for /community-stats
 */
discordRouter.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await fetchDiscordCommunityStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({
      error: err.message || 'Failed to retrieve Discord community statistics.',
      onlineCount: 2080,
      totalMembers: 15460,
      active24hCount: 2080,
      members: [],
      guildName: 'LovePixels',
      guildIcon: null,
      isApproximate: true,
      source: 'fallback',
      lastUpdated: Date.now(),
    });
  }
});

/**
 * GET /api/discord/presence
 * Lightweight presence and activity map keyed by permanent Discord User ID
 */
discordRouter.get('/presence', async (_req: Request, res: Response) => {
  try {
    const data = await fetchLiveManagementTeam();
    const presenceMap: Record<
      string,
      {
        presence: string;
        activities: any[];
        primaryActivity: any;
        lastUpdated: number;
      }
    > = {};

    for (const member of data.team) {
      presenceMap[member.id] = {
        presence: member.livePresence,
        activities: member.liveActivities,
        primaryActivity: member.primaryActivity,
        lastUpdated: member.lastUpdated,
      };
    }
    res.json({ presence: presenceMap, lastUpdated: data.lastUpdated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve presence state.' });
  }
});

/**
 * GET /api/discord/diagnostics
 * Safe Developer Diagnostic payload for all 9 members
 * Strictly exposes NO secrets, NO bot tokens, NO authorization headers
 */
discordRouter.get('/diagnostics', async (_req: Request, res: Response) => {
  try {
    const data = await fetchLiveManagementTeam();
    const gateway = getGatewayStatus();

    res.json({
      gateway: {
        state: gateway.state,
        botUser: gateway.botUser,
        connectedSince: gateway.connectedSince,
        lastHeartbeatAck: gateway.lastHeartbeatAck,
        error: gateway.error,
        intentsConfigured: Boolean(SERVER_CONFIG.botToken),
      },
      guildId: SERVER_CONFIG.guildId,
      membersCount: data.team.length,
      lastUpdated: data.lastUpdated,
      source: data.source,
      members: data.team.map((m) => ({
        id: m.id,
        displayName: m.displayName,
        username: m.username,
        nickname: m.nickname || null,
        tier: m.tier,
        roleTitle: m.roleTitle,
        avatarUrl: m.avatarUrl,
        bannerUrl: m.bannerUrl || null,
        avatarDecorationUrl: m.avatarDecorationUrl || null,
        profileEffectUrl: m.profileEffectUrl || null,
        profileFrameUrl: m.profileFrameUrl || null,
        livePresence: m.livePresence,
        activityCount: m.liveActivities.length,
        activities: m.liveActivities,
        primaryActivity: m.primaryActivity,
        diagnostics: m.diagnostics,
        lastUpdated: m.lastUpdated,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to compute diagnostics.' });
  }
});

/**
 * GET /api/discord/channels
 * Returns owner-approved public channel metadata
 */
discordRouter.get('/channels', (_req: Request, res: Response) => {
  res.json({
    channels: Object.entries(CHANNELS).map(([key, val]) => ({
      key,
      ...val,
    })),
  });
});

/**
 * GET /api/discord/channels/:channelId/messages
 * Public viewing of real Discord channel messages — NO LOGIN REQUIRED!
 */
discordRouter.get('/channels/:channelId/messages', async (req: Request, res: Response) => {
  const rawParam = req.params.channelId;
  const channelId = resolveChannelId(Array.isArray(rawParam) ? rawParam[0] : rawParam);
  if (!channelId) {
    res.status(404).json({
      error: 'Channel not found or is not an owner-approved public channel.',
      messages: [],
    });
    return;
  }

  const limit = Math.min(parseInt((req.query.limit as string) || '50', 10), 100);
  const result = await fetchChannelMessages(channelId, limit);

  res.json({
    channelId,
    messages: result.messages,
    source: result.source,
    error: result.error || null,
  });
});

/**
 * POST /api/discord/channels/:channelId/messages
 * Member-Only Website-to-General Messaging with Transparent Bridge Attribution
 */
discordRouter.post('/channels/:channelId/messages', async (req: Request, res: Response) => {
  const rawParam = req.params.channelId;
  const channelId = resolveChannelId(Array.isArray(rawParam) ? rawParam[0] : rawParam);
  if (!channelId) {
    res.status(404).json({ error: 'Channel not found.' });
    return;
  }

  if (channelId !== CHANNELS.general.id) {
    res.status(403).json({
      error: 'Website messaging is exclusively allowed in the #general channel.',
    });
    return;
  }

  // 1. Authenticated check
  const session = getSessionFromReq(req);
  if (!session) {
    res.status(401).json({
      error: 'Please log in with Discord to participate in the conversation.',
      code: 'UNAUTHENTICATED',
    });
    return;
  }

  // 2. Server-side membership check
  let isMember = Boolean(session.is_member);
  // Recheck on each write if previously unverified
  if (!isMember) {
    const memCheck = await verifyGuildMembership(session.user_id);
    if (memCheck.isMember) {
      isMember = true;
      db.prepare('UPDATE sessions SET is_member = 1 WHERE session_token = ?').run(session.session_token);
    }
  }

  if (!isMember) {
    res.status(403).json({
      error: 'Join the LovePixels Discord server (discord.gg/kwHcdGg2f) to participate in the conversation.',
      code: 'NON_MEMBER',
      inviteUrl: 'https://discord.gg/kwHcdGg2f',
    });
    return;
  }

  // 3. Per-user rate limiting (5 seconds cooldown)
  const now = Date.now();
  const rateLimitKey = `msg:${session.user_id}`;
  const rateRecord = db.prepare('SELECT * FROM rate_limits WHERE key = ?').get(rateLimitKey) as
    | { key: string; timestamp: number; count: number }
    | undefined;

  if (rateRecord && now - rateRecord.timestamp < 5000) {
    const remainingSec = Math.ceil((5000 - (now - rateRecord.timestamp)) / 1000);
    res.status(429).json({
      error: `Please wait ${remainingSec}s before sending another message.`,
      code: 'RATE_LIMITED',
    });
    return;
  }

  // 4. Input validation
  const { content } = req.body;
  if (!content || typeof content !== 'string' || !content.trim()) {
    res.status(400).json({ error: 'Message content cannot be empty.' });
    return;
  }
  if (content.trim().length > 1000) {
    res.status(400).json({ error: 'Message exceeds maximum length of 1,000 characters.' });
    return;
  }

  // 5. Post through transparent bridge
  const postResult = await postBridgeMessage(
    channelId,
    {
      id: session.user_id,
      username: session.username,
      global_name: session.global_name,
      avatar: session.avatar,
    },
    content
  );

  if (!postResult.success) {
    res.status(500).json({
      error: postResult.error || 'Failed to deliver message to Discord.',
    });
    return;
  }

  // Record rate limit timestamp
  db.prepare(`
    INSERT INTO rate_limits (key, timestamp, count)
    VALUES (?, ?, 1)
    ON CONFLICT(key) DO UPDATE SET timestamp = excluded.timestamp, count = count + 1
  `).run(rateLimitKey, now);

  res.json({
    success: true,
    message: postResult.message,
  });
});

/**
 * GET /api/discord/events
 * Server-Sent Events (SSE) stream for realtime message and status updates
 */
discordRouter.get('/events', (_req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  addSseClient(res);
});
