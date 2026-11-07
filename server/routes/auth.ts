import { Router, type Request, type Response } from 'express';
import crypto from 'node:crypto';
import { SERVER_CONFIG } from '../config.js';
import { db, type SessionRecord } from '../db.js';
import { verifyGuildMembership, getDiscordAvatarUrl } from '../discordRest.js';

export const authRouter = Router();

const SESSION_COOKIE_NAME = 'lp_session';
const STATE_COOKIE_NAME = 'lp_oauth_state';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Helper to get session from request cookie
export function getSessionFromReq(req: Request): SessionRecord | null {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (!token) return null;

  const stmt = db.prepare('SELECT * FROM sessions WHERE session_token = ? AND expires_at > ?');
  const session = stmt.get(token, Date.now()) as SessionRecord | undefined;
  return session || null;
}

export function isUserAdmin(userId: string): boolean {
  if (!userId) return false;
  return SERVER_CONFIG.adminDiscordIds.includes(userId);
}

/**
 * GET /api/auth/config-status
 * Checks if Discord OAuth is configured without exposing secrets
 */
authRouter.get('/config-status', (_req: Request, res: Response) => {
  const missing: string[] = [];
  if (!SERVER_CONFIG.clientId) missing.push('DISCORD_CLIENT_ID');
  if (!SERVER_CONFIG.clientSecret) missing.push('DISCORD_CLIENT_SECRET');

  res.json({
    configured: missing.length === 0,
    missing,
    redirectUri: SERVER_CONFIG.redirectUri,
    environment: SERVER_CONFIG.nodeEnv,
  });
});

/**
 * GET /api/auth/discord/login
 * Starts real Discord OAuth2 authorization-code flow
 */
authRouter.get('/discord/login', (req: Request, res: Response) => {
  if (!SERVER_CONFIG.clientId || !SERVER_CONFIG.clientSecret) {
    const missing = [
      !SERVER_CONFIG.clientId ? 'DISCORD_CLIENT_ID' : null,
      !SERVER_CONFIG.clientSecret ? 'DISCORD_CLIENT_SECRET' : null,
    ]
      .filter(Boolean)
      .join(',');

    // If client requested JSON via XHR or fetch
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      res.status(503).json({
        configured: false,
        error: 'Discord OAuth2 is not configured. Please set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET in .env.',
        missing: missing.split(','),
        redirectUri: SERVER_CONFIG.redirectUri,
      });
      return;
    }

    // Direct browser navigation: NEVER strand the user on a raw JSON page!
    // Redirect cleanly back to LovePixels with unconfigured notice
    res.redirect(`/?auth=unconfigured&missing=${encodeURIComponent(missing)}`);
    return;
  }

  const state = crypto.randomBytes(24).toString('hex');
  res.cookie(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: SERVER_CONFIG.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000, // 10 minutes
  });

  const redirectUri = encodeURIComponent(SERVER_CONFIG.redirectUri);
  const scopes = encodeURIComponent('identify guilds.members.read');
  const url = `https://discord.com/oauth2/authorize?client_id=${SERVER_CONFIG.clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}&state=${state}`;

  res.redirect(url);
});

/**
 * GET /api/auth/discord/callback
 * Exchanges code for access token, validates membership, creates session
 */
authRouter.get('/discord/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;
  const state = req.query.state as string | undefined;
  const errorParam = req.query.error as string | undefined;
  const errorDesc = req.query.error_description as string | undefined;
  const storedState = req.cookies?.[STATE_COOKIE_NAME];

  res.clearCookie(STATE_COOKIE_NAME);

  // User cancelled authorization on Discord consent screen
  if (errorParam === 'access_denied') {
    res.redirect('/?auth=cancelled&reason=access_denied');
    return;
  }

  if (errorParam) {
    res.redirect(`/?auth=error&reason=${encodeURIComponent(errorParam)}&detail=${encodeURIComponent(errorDesc || '')}`);
    return;
  }

  if (!code || !state || state !== storedState) {
    res.redirect('/?auth=error&reason=invalid_state');
    return;
  }

  try {
    // 1. Token Exchange
    const tokenParams = new URLSearchParams({
      client_id: SERVER_CONFIG.clientId,
      client_secret: SERVER_CONFIG.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: SERVER_CONFIG.redirectUri,
    });

    const tokenRes = await fetch('https://discord.com/api/v10/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      res.redirect(`/?auth=error&reason=token_exchange_failed&detail=${encodeURIComponent(err)}`);
      return;
    }

    const tokenData: any = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch User Profile
    const userRes = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      res.redirect('/?auth=error&reason=profile_fetch_failed');
      return;
    }

    const userData: any = await userRes.json();
    const userId = userData.id;
    const username = userData.username;
    const globalName = userData.global_name || null;
    const avatar = getDiscordAvatarUrl(userId, userData.avatar);

    // 3. Verify Server Membership in LovePixels Guild (1498650220215664781)
    let isMember = false;
    let roles: string[] = [];

    // Attempt A: Direct user guild member endpoint
    try {
      const memberRes = await fetch(
        `https://discord.com/api/v10/users/@me/guilds/${SERVER_CONFIG.guildId}/member`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (memberRes.ok) {
        const memJson: any = await memberRes.json();
        isMember = true;
        roles = memJson.roles || [];
      }
    } catch {
      // Fall through to Attempt B
    }

    // Attempt B: Bot guild member check
    if (!isMember && SERVER_CONFIG.botToken) {
      const botCheck = await verifyGuildMembership(userId);
      if (botCheck.isMember) {
        isMember = true;
        roles = botCheck.roles || [];
      }
    }

    // 4. Create Persistent Session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + SESSION_DURATION_MS;

    const insertStmt = db.prepare(`
      INSERT INTO sessions (session_token, user_id, username, global_name, avatar, is_member, roles, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      sessionToken,
      userId,
      username,
      globalName,
      avatar,
      isMember ? 1 : 0,
      JSON.stringify(roles),
      expiresAt
    );

    res.cookie(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: SERVER_CONFIG.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_MS,
    });

    const statusParam = isMember ? 'member' : 'non_member';
    res.redirect(`/?auth=success&status=${statusParam}`);
  } catch (err: any) {
    res.redirect(`/?auth=error&reason=${encodeURIComponent(err.message || 'unknown')}`);
  }
});

/**
 * GET /api/auth/me
 * Returns current authenticated user and verified LovePixels membership status
 */
authRouter.get('/me', async (req: Request, res: Response) => {
  const session = getSessionFromReq(req);
  if (!session) {
    res.json({ authenticated: false, user: null });
    return;
  }

  // Periodic membership re-check if user was previously not marked as member
  let isMember = Boolean(session.is_member);
  if (!isMember && SERVER_CONFIG.botToken) {
    const check = await verifyGuildMembership(session.user_id);
    if (check.isMember) {
      isMember = true;
      db.prepare('UPDATE sessions SET is_member = 1 WHERE session_token = ?').run(session.session_token);
    }
  }

  const isAdmin = isUserAdmin(session.user_id);

  res.json({
    authenticated: true,
    user: {
      id: session.user_id,
      username: session.username,
      global_name: session.global_name,
      avatar: session.avatar,
      isMember,
      isAdmin,
    },
  });
});

/**
 * POST /api/auth/logout
 * Destroys session
 */
authRouter.post('/logout', (req: Request, res: Response) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (token) {
    db.prepare('DELETE FROM sessions WHERE session_token = ?').run(token);
  }
  res.clearCookie(SESSION_COOKIE_NAME);
  res.json({ success: true });
});
