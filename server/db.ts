import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dataDir = path.resolve(process.cwd(), 'server', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'lovepixels.sqlite');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode for high performance concurrent reading and writing
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_tag TEXT,
    user_avatar TEXT,
    guest_name TEXT,
    guest_email TEXT,
    guest_token TEXT,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS support_messages (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    sender_type TEXT NOT NULL,
    sender_id TEXT,
    sender_name TEXT NOT NULL,
    sender_avatar TEXT,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS sessions (
    session_token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    global_name TEXT,
    avatar TEXT,
    is_member INTEGER NOT NULL DEFAULT 0,
    roles TEXT,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY,
    timestamp INTEGER NOT NULL,
    count INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS member_activity_24h (
    user_id TEXT PRIMARY KEY,
    username TEXT,
    avatar TEXT,
    last_active_at INTEGER NOT NULL,
    activity_type TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_member_activity_last_active ON member_activity_24h(last_active_at);
`);

/**
 * Record real observed member activity in SQLite.
 * Prunes events older than 24 hours to maintain an accurate rolling 24h window.
 * Excludes bots and webhooks. Does not store message content.
 */
export function recordMemberActivity(
  userId: string,
  username: string,
  avatar: string | null,
  activityType: 'presence' | 'message' | 'voice',
  isBot = false
): void {
  if (!userId || isBot) return;

  const now = Date.now();
  const cutoff24h = now - 24 * 60 * 60 * 1000;

  try {
    // Upsert the member's activity timestamp
    db.prepare(`
      INSERT INTO member_activity_24h (user_id, username, avatar, last_active_at, activity_type)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        username = excluded.username,
        avatar = COALESCE(excluded.avatar, member_activity_24h.avatar),
        last_active_at = excluded.last_active_at,
        activity_type = excluded.activity_type
    `).run(userId, username || 'Anonymous Member', avatar, now, activityType);

    // Auto-prune records older than 24h
    db.prepare(`DELETE FROM member_activity_24h WHERE last_active_at < ?`).run(cutoff24h);
  } catch (err) {
    console.error('[DB] Failed to record member activity:', err);
  }
}

/**
 * Returns the count of distinct human members active within the rolling 24-hour window.
 */
export function getActive24hCount(): number {
  const cutoff24h = Date.now() - 24 * 60 * 60 * 1000;
  try {
    const row = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM member_activity_24h
      WHERE last_active_at >= ?
    `).get(cutoff24h) as { count: number } | undefined;

    return row ? Number(row.count) : 0;
  } catch (err) {
    console.error('[DB] Failed to query 24h active count:', err);
    return 0;
  }
}

/**
 * Seed initial real online members from widget into 24h activity log
 */
export function seed24hActivityFromMembers(
  members: Array<{ id: string; username: string; avatar_url?: string }>
): void {
  for (const m of members) {
    if (!m.id || m.id === '0' || m.username.toLowerCase().includes('bot')) continue;
    recordMemberActivity(m.id, m.username, m.avatar_url || null, 'presence', false);
  }
}

export interface SupportTicketRecord {
  id: string;
  user_id: string | null;
  user_tag: string | null;
  user_avatar: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_token: string | null;
  category: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: number;
  updated_at: number;
}

export interface SupportMessageRecord {
  id: string;
  ticket_id: string;
  sender_type: 'visitor' | 'admin';
  sender_id: string | null;
  sender_name: string;
  sender_avatar: string | null;
  content: string;
  created_at: number;
}

export interface SessionRecord {
  session_token: string;
  user_id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  is_member: number;
  roles: string | null;
  expires_at: number;
}
