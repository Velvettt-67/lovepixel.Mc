import type { Response } from 'express';
import { SERVER_CONFIG, SUPPORTED_CHANNEL_IDS } from './config.js';
import {
  normalizeDiscordMessage,
  upsertCachedMessage,
  removeCachedMessage,
  fetchDiscordCommunityStats,
} from './discordRest.js';
import {
  fetchLiveManagementTeam,
  updateMemberPresenceFromGateway,
  updateMemberProfileFromGateway,
} from './managementService.js';
import { recordMemberActivity } from './db.js';

export type GatewayConnectionState = 'unconfigured' | 'disconnected' | 'connecting' | 'connected' | 'error';

interface GatewayStatus {
  state: GatewayConnectionState;
  botUser: { id: string; username: string } | null;
  lastHeartbeatAck: number | null;
  connectedSince: number | null;
  error: string | null;
}

const status: GatewayStatus = {
  state: SERVER_CONFIG.botToken ? 'disconnected' : 'unconfigured',
  botUser: null,
  lastHeartbeatAck: null,
  connectedSince: null,
  error: null,
};

export function getGatewayStatus(): GatewayStatus {
  return { ...status };
}

// Full intents for live presence, member profile events, voice & messages
// GUILDS (1) | GUILD_MEMBERS (2) | GUILD_VOICE_STATES (128) | GUILD_PRESENCES (256) | GUILD_MESSAGES (512) | MESSAGE_CONTENT (32768)
const FULL_GATEWAY_INTENTS = (1 << 0) | (1 << 1) | (1 << 7) | (1 << 8) | (1 << 9) | (1 << 15);
const STANDARD_GATEWAY_INTENTS = (1 << 0) | (1 << 7) | (1 << 9);
let useStandardIntentsOnly = false;

// Set of connected Server-Sent Events (SSE) clients
const sseClients = new Set<Response>();

export function addSseClient(res: Response): void {
  sseClients.add(res);
  // Send initial connection handshake
  res.write(`data: ${JSON.stringify({ type: 'status', data: status })}\n\n`);

  // Deliver current community stats immediately upon SSE connection
  fetchDiscordCommunityStats()
    .then((stats) => {
      try {
        res.write(`data: ${JSON.stringify({ type: 'community:stats', data: stats })}\n\n`);
      } catch {
        // Client might have disconnected
      }
    })
    .catch(() => {});

  // Deliver current management team data immediately upon SSE connection
  fetchLiveManagementTeam()
    .then((data) => {
      try {
        res.write(`data: ${JSON.stringify({ type: 'management:team', data: data.team })}\n\n`);
      } catch {
        // Client might have disconnected
      }
    })
    .catch(() => {});

  res.on('close', () => {
    sseClients.delete(res);
  });
}

export function broadcastSse(event: { type: string; channelId?: string; [key: string]: any }): void {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Push live community stats & management updates every 4 seconds to all connected SSE clients
setInterval(async () => {
  if (sseClients.size === 0) return;
  try {
    const stats = await fetchDiscordCommunityStats();
    broadcastSse({ type: 'community:stats', data: stats });
  } catch {
    // Ignore periodic stats error
  }

  try {
    const data = await fetchLiveManagementTeam();
    broadcastSse({ type: 'management:team', data: data.team });
  } catch {
    // Ignore periodic management error
  }
}, 4000);

// SSE Keep-Alive Heartbeat every 20 seconds
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': keepalive\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 20000);

let ws: WebSocket | null = null;
let heartbeatTimer: NodeJS.Timeout | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
let lastSequence: number | null = null;
let sessionId: string | null = null;
let resumeGatewayUrl: string | null = null;
let isExpectedClose = false;

function clearTimers() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function sendJson(payload: any) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function scheduleReconnect(delay = 5000) {
  clearTimers();
  if (status.state !== 'unconfigured') {
    status.state = 'disconnected';
    broadcastSse({ type: 'status', data: status });
  }

  reconnectTimer = setTimeout(() => {
    startDiscordGateway();
  }, delay);
}

export function startDiscordGateway(): void {
  if (!SERVER_CONFIG.botToken) {
    status.state = 'unconfigured';
    status.error = 'DISCORD_BOT_TOKEN is not configured in .env';
    return;
  }

  clearTimers();
  if (ws) {
    try {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      ws.close();
    } catch {
      // Ignore cleanup error
    }
    ws = null;
  }

  status.state = 'connecting';
  status.error = null;
  broadcastSse({ type: 'status', data: status });

  const gatewayEndpoint = resumeGatewayUrl || 'wss://gateway.discord.gg/?v=10&encoding=json';

  try {
    ws = new WebSocket(gatewayEndpoint);
  } catch (err: any) {
    status.state = 'error';
    status.error = err.message || 'Failed to instantiate WebSocket';
    broadcastSse({ type: 'status', data: status });
    scheduleReconnect(8000);
    return;
  }

  ws.onopen = () => {
    // Gateway connection opened, waiting for Opcode 10 (HELLO)
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data.toString());
      const { op, d, s, t } = msg;

      if (s !== null && s !== undefined) {
        lastSequence = s;
      }

      switch (op) {
        case 10: {
          // Opcode 10: HELLO -> Setup heartbeats & identify
          const heartbeatInterval = d.heartbeat_interval;

          // Start heartbeat loop
          heartbeatTimer = setInterval(() => {
            sendJson({ op: 1, d: lastSequence });
          }, heartbeatInterval);

          // Identify or Resume
          if (sessionId && lastSequence !== null) {
            // Resume
            sendJson({
              op: 6,
              d: {
                token: SERVER_CONFIG.botToken,
                session_id: sessionId,
                seq: lastSequence,
              },
            });
          } else {
            // Identify: Include GUILD_PRESENCES (256) & GUILD_MEMBERS (2) for live Spotify & member updates
            const intents = useStandardIntentsOnly ? STANDARD_GATEWAY_INTENTS : FULL_GATEWAY_INTENTS;
            sendJson({
              op: 2,
              d: {
                token: SERVER_CONFIG.botToken,
                intents,
                properties: {
                  os: process.platform,
                  browser: 'lovepixels-sanctuary',
                  device: 'lovepixels-sanctuary',
                },
              },
            });
          }
          break;
        }

        case 11: {
          // Opcode 11: Heartbeat ACK
          status.lastHeartbeatAck = Date.now();
          break;
        }

        case 9: {
          // Opcode 9: Invalid Session -> Re-identify
          sessionId = null;
          lastSequence = null;
          setTimeout(() => {
            const intents = useStandardIntentsOnly ? STANDARD_GATEWAY_INTENTS : FULL_GATEWAY_INTENTS;
            sendJson({
              op: 2,
              d: {
                token: SERVER_CONFIG.botToken,
                intents,
                properties: {
                  os: process.platform,
                  browser: 'lovepixels-sanctuary',
                  device: 'lovepixels-sanctuary',
                },
              },
            });
          }, 2000);
          break;
        }

        case 7: {
          // Opcode 7: Reconnect request from Discord
          ws?.close(4000, 'Reconnecting');
          break;
        }

        case 0: {
          // Opcode 0: Dispatch event
          handleDispatchEvent(t, d);
          break;
        }
      }
    } catch {
      // Ignore parse errors on malformed payloads
    }
  };

  ws.onclose = (event) => {
    clearTimers();
    if (!isExpectedClose) {
      // If unauthorized (4004)
      if (event.code === 4004) {
        status.state = 'error';
        status.error = 'Discord rejected Bot token (4004 Authentication Failed). Check DISCORD_BOT_TOKEN.';
        broadcastSse({ type: 'status', data: status });
        return; // Don't infinite loop reconnect with bad token
      }
      // If disallowed intents (4014) - Privileged intents not enabled in Developer Portal
      if (event.code === 4014) {
        console.warn(
          '[DiscordGateway] Privileged intents (GuildPresences/GuildMembers) not enabled in Discord Developer Portal. Falling back to standard intents.'
        );
        status.error =
          'Privileged intents (GuildPresences) not enabled in Discord Developer Portal. Enable them at discord.com/developers/applications.';
        useStandardIntentsOnly = true;
        scheduleReconnect(5000);
        return;
      }
      scheduleReconnect(5000);
    }
  };

  ws.onerror = (err: any) => {
    status.state = 'error';
    status.error = err.message || 'WebSocket connection error';
    broadcastSse({ type: 'status', data: status });
  };
}

function handleDispatchEvent(eventType: string, data: any) {
  switch (eventType) {
    case 'READY': {
      sessionId = data.session_id;
      resumeGatewayUrl = data.resume_gateway_url || null;
      status.state = 'connected';
      status.botUser = {
        id: data.user.id,
        username: data.user.username,
      };
      status.connectedSince = Date.now();
      status.error = null;
      broadcastSse({ type: 'status', data: status });

      // Trigger initial management profile & presence refresh
      fetchLiveManagementTeam(true)
        .then((m) => broadcastSse({ type: 'management:team', data: m.team }))
        .catch(() => {});
      break;
    }

    case 'GUILD_CREATE': {
      // Ingest live presences dispatched on initial guild connection
      if (Array.isArray(data.presences)) {
        for (const p of data.presences) {
          if (p.user?.id) {
            const updated = updateMemberPresenceFromGateway(p.user.id, p);
            if (updated) {
              broadcastSse({ type: 'management:update', member: updated });
            }
          }
        }
      }
      break;
    }

    case 'RESUMED': {
      status.state = 'connected';
      broadcastSse({ type: 'status', data: status });
      break;
    }

    case 'MESSAGE_CREATE': {
      // Record 24h activity for active human chatters (no message content stored)
      if (data.author && !data.author.bot) {
        recordMemberActivity(
          data.author.id,
          data.author.global_name || data.author.username,
          data.author.avatar
            ? `https://cdn.discordapp.com/avatars/${data.author.id}/${data.author.avatar}.png`
            : null,
          'message',
          false
        );
      }

      const channelId = data.channel_id;
      if (SUPPORTED_CHANNEL_IDS.includes(channelId)) {
        const normalized = normalizeDiscordMessage(data);
        upsertCachedMessage(channelId, normalized);
        broadcastSse({
          type: 'message:create',
          channelId,
          message: normalized,
        });
      }
      break;
    }

    case 'VOICE_STATE_UPDATE': {
      // Record 24h activity for voice salon participants
      if (data.user_id && data.member?.user && !data.member.user.bot) {
        recordMemberActivity(
          data.user_id,
          data.member.user.global_name || data.member.user.username,
          data.member.user.avatar
            ? `https://cdn.discordapp.com/avatars/${data.user_id}/${data.member.user.avatar}.png`
            : null,
          'voice',
          false
        );
      }
      break;
    }

    case 'PRESENCE_UPDATE': {
      if (data.user?.id) {
        const updated = updateMemberPresenceFromGateway(data.user.id, data);
        if (updated) {
          broadcastSse({
            type: 'management:update',
            member: updated,
          });
        }
      }
      break;
    }

    case 'GUILD_MEMBER_UPDATE': {
      if (data.user?.id) {
        const updated = updateMemberProfileFromGateway(data.user.id, {
          avatar: data.avatar || data.user.avatar,
          isGuildAvatar: Boolean(data.avatar),
          guildId: data.guild_id || SERVER_CONFIG.guildId,
          banner: data.banner || data.user.banner,
          isGuildBanner: Boolean(data.banner),
          avatar_decoration_data: data.avatar_decoration_data || data.user.avatar_decoration_data,
        });
        if (updated) {
          broadcastSse({
            type: 'management:update',
            member: updated,
          });
        }
      }
      break;
    }

    case 'USER_UPDATE': {
      if (data.id) {
        const updated = updateMemberProfileFromGateway(data.id, {
          avatar: data.avatar,
          banner: data.banner,
          avatar_decoration_data: data.avatar_decoration_data,
          banner_color: data.banner_color,
          accent_color: data.accent_color,
        });
        if (updated) {
          broadcastSse({
            type: 'management:update',
            member: updated,
          });
        }
      }
      break;
    }

    case 'MESSAGE_UPDATE': {
      const channelId = data.channel_id;
      if (SUPPORTED_CHANNEL_IDS.includes(channelId)) {
        const normalized = normalizeDiscordMessage(data);
        upsertCachedMessage(channelId, normalized);
        broadcastSse({
          type: 'message:update',
          channelId,
          message: normalized,
        });
      }
      break;
    }

    case 'MESSAGE_DELETE': {
      const channelId = data.channel_id;
      if (SUPPORTED_CHANNEL_IDS.includes(channelId)) {
        removeCachedMessage(channelId, data.id);
        broadcastSse({
          type: 'message:delete',
          channelId,
          messageId: data.id,
        });
      }
      break;
    }
  }
}
