import { Router, type Request, type Response } from 'express';
import crypto from 'node:crypto';
import { db, type SupportTicketRecord, type SupportMessageRecord } from '../db.js';
import { getSessionFromReq, isUserAdmin } from './auth.js';

export const supportRouter = Router();

function paramStr(val: string | string[] | undefined): string {
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
}

// Middleware to require admin authorization
function requireAdmin(req: Request, res: Response, next: () => void) {
  const session = getSessionFromReq(req);
  if (!session || !isUserAdmin(session.user_id)) {
    res.status(403).json({
      error: 'Access denied. You do not have administrator permissions for the LovePixels Inbox.',
    });
    return;
  }
  next();
}

/**
 * POST /api/support/tickets
 * Visitor submits a question or reports an issue
 */
supportRouter.post('/tickets', (req: Request, res: Response) => {
  const { category, subject, message, guest_name, guest_email } = req.body;

  if (!category || typeof category !== 'string' || !category.trim()) {
    res.status(400).json({ error: 'Please select a category.' });
    return;
  }
  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    res.status(400).json({ error: 'Please enter a subject.' });
    return;
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    res.status(400).json({ error: 'Please enter your message.' });
    return;
  }

  const session = getSessionFromReq(req);
  const now = Date.now();
  const ticketId = `tick_${crypto.randomBytes(8).toString('hex')}`;
  const messageId = `msg_${crypto.randomBytes(8).toString('hex')}`;

  let userId: string | null = null;
  let userTag: string | null = null;
  let userAvatar: string | null = null;
  let guestToken: string | null = null;

  if (session) {
    userId = session.user_id;
    userTag = session.global_name ? `${session.global_name} (@${session.username})` : session.username;
    userAvatar = session.avatar;
  } else {
    // Unauthenticated guest ticket
    if (!guest_name || typeof guest_name !== 'string' || !guest_name.trim()) {
      res.status(400).json({ error: 'Please provide your name or log in with Discord.' });
      return;
    }
    guestToken = crypto.randomBytes(24).toString('hex');
  }

  // Insert ticket
  db.prepare(`
    INSERT INTO support_tickets (
      id, user_id, user_tag, user_avatar, guest_name, guest_email, guest_token,
      category, subject, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)
  `).run(
    ticketId,
    userId,
    userTag,
    userAvatar,
    guest_name ? String(guest_name).trim() : null,
    guest_email ? String(guest_email).trim() : null,
    guestToken,
    category.trim(),
    subject.trim(),
    now,
    now
  );

  // Insert initial message
  db.prepare(`
    INSERT INTO support_messages (
      id, ticket_id, sender_type, sender_id, sender_name, sender_avatar, content, created_at
    ) VALUES (?, ?, 'visitor', ?, ?, ?, ?, ?)
  `).run(
    messageId,
    ticketId,
    userId,
    userTag || String(guest_name).trim(),
    userAvatar,
    message.trim(),
    now
  );

  res.json({
    success: true,
    ticketId,
    guestToken,
    message: 'Support ticket submitted successfully.',
  });
});

/**
 * GET /api/support/my-tickets
 * Returns tickets belonging to the currently logged in Discord member
 */
supportRouter.get('/my-tickets', (req: Request, res: Response) => {
  const session = getSessionFromReq(req);
  if (!session) {
    res.json({ tickets: [] });
    return;
  }

  const tickets = db
    .prepare('SELECT * FROM support_tickets WHERE user_id = ? ORDER BY updated_at DESC')
    .all(session.user_id) as unknown as SupportTicketRecord[];

  res.json({ tickets });
});

/**
 * GET /api/support/tickets/:ticketId
 * Returns conversation details for a specific ticket (accessible by owner or admin)
 */
supportRouter.get('/tickets/:ticketId', (req: Request, res: Response) => {
  const ticketId = paramStr(req.params.ticketId);
  const guestToken = req.query.guestToken as string | undefined;
  const session = getSessionFromReq(req);

  const ticket = db
    .prepare('SELECT * FROM support_tickets WHERE id = ?')
    .get(ticketId) as unknown as SupportTicketRecord | undefined;

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  // Check access authorization
  const isAdmin = session && isUserAdmin(session.user_id);
  const isOwner = session && ticket.user_id === session.user_id;
  const isGuestAuth = guestToken && ticket.guest_token === guestToken;

  if (!isAdmin && !isOwner && !isGuestAuth) {
    res.status(403).json({ error: 'You do not have permission to view this ticket.' });
    return;
  }

  const messages = db
    .prepare('SELECT * FROM support_messages WHERE ticket_id = ? ORDER BY created_at ASC')
    .all(ticketId) as unknown as SupportMessageRecord[];

  res.json({
    ticket,
    messages,
  });
});

/**
 * POST /api/support/tickets/:ticketId/messages
 * Visitor sends a follow-up message in their ticket thread
 */
supportRouter.post('/tickets/:ticketId/messages', (req: Request, res: Response) => {
  const ticketId = paramStr(req.params.ticketId);
  const { content, guestToken } = req.body;

  if (!content || typeof content !== 'string' || !content.trim()) {
    res.status(400).json({ error: 'Message cannot be empty.' });
    return;
  }

  const ticket = db
    .prepare('SELECT * FROM support_tickets WHERE id = ?')
    .get(ticketId) as unknown as SupportTicketRecord | undefined;

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  const session = getSessionFromReq(req);
  const isOwner = session && ticket.user_id === session.user_id;
  const isGuestAuth = guestToken && ticket.guest_token === guestToken;

  if (!isOwner && !isGuestAuth) {
    res.status(403).json({ error: 'You do not have permission to reply to this ticket.' });
    return;
  }

  const now = Date.now();
  const messageId = `msg_${crypto.randomBytes(8).toString('hex')}`;
  const senderName = isOwner
    ? (session!.global_name || session!.username)
    : (ticket.guest_name || 'Visitor');
  const senderAvatar = isOwner ? session!.avatar : null;
  const senderId = isOwner ? session!.user_id : null;

  db.prepare(`
    INSERT INTO support_messages (
      id, ticket_id, sender_type, sender_id, sender_name, sender_avatar, content, created_at
    ) VALUES (?, ?, 'visitor', ?, ?, ?, ?, ?)
  `).run(
    messageId,
    ticketId,
    senderId,
    senderName,
    senderAvatar,
    content.trim(),
    now
  );

  db.prepare('UPDATE support_tickets SET updated_at = ?, status = ? WHERE id = ?').run(
    now,
    ticket.status === 'resolved' ? 'open' : ticket.status,
    ticketId
  );

  res.json({
    success: true,
    message: {
      id: messageId,
      ticket_id: ticketId,
      sender_type: 'visitor',
      sender_id: senderId,
      sender_name: senderName,
      sender_avatar: senderAvatar,
      content: content.trim(),
      created_at: now,
    },
  });
});

// =========================================================================
// OWNER / ADMIN ENDPOINTS (PROTECTED BY SERVER-SIDE ALLOWLIST)
// =========================================================================

/**
 * GET /api/admin/support/tickets
 * Admin lists all tickets with optional status filter
 */
supportRouter.get('/admin/tickets', requireAdmin, (req: Request, res: Response) => {
  const statusFilter = req.query.status as string | undefined;

  let query = 'SELECT * FROM support_tickets';
  const params: any[] = [];

  if (statusFilter && ['open', 'in_progress', 'resolved'].includes(statusFilter)) {
    query += ' WHERE status = ?';
    params.push(statusFilter);
  }

  query += ' ORDER BY updated_at DESC';

  const tickets = db.prepare(query).all(...params) as unknown as SupportTicketRecord[];

  // Also attach message count and latest message excerpt
  const enriched = tickets.map((t) => {
    const msgCount = (
      db.prepare('SELECT COUNT(*) as c FROM support_messages WHERE ticket_id = ?').get(t.id) as any
    )?.c || 0;
    const lastMsg = db
      .prepare('SELECT * FROM support_messages WHERE ticket_id = ? ORDER BY created_at DESC LIMIT 1')
      .get(t.id) as unknown as SupportMessageRecord | undefined;

    return {
      ...t,
      messageCount: msgCount,
      lastMessageExcerpt: lastMsg ? lastMsg.content.slice(0, 100) : '',
    };
  });

  res.json({ tickets: enriched });
});

/**
 * GET /api/admin/support/tickets/:ticketId
 * Admin gets full ticket conversation
 */
supportRouter.get('/admin/tickets/:ticketId', requireAdmin, (req: Request, res: Response) => {
  const ticketId = paramStr(req.params.ticketId);
  const ticket = db
    .prepare('SELECT * FROM support_tickets WHERE id = ?')
    .get(ticketId) as unknown as SupportTicketRecord | undefined;

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  const messages = db
    .prepare('SELECT * FROM support_messages WHERE ticket_id = ? ORDER BY created_at ASC')
    .all(ticketId) as unknown as SupportMessageRecord[];

  res.json({ ticket, messages });
});

/**
 * POST /api/admin/support/tickets/:ticketId/reply
 * Admin sends reply to visitor
 */
supportRouter.post('/admin/tickets/:ticketId/reply', requireAdmin, (req: Request, res: Response) => {
  const ticketId = paramStr(req.params.ticketId);
  const { content } = req.body;

  if (!content || typeof content !== 'string' || !content.trim()) {
    res.status(400).json({ error: 'Reply content cannot be empty.' });
    return;
  }

  const ticket = db
    .prepare('SELECT * FROM support_tickets WHERE id = ?')
    .get(ticketId) as unknown as SupportTicketRecord | undefined;

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  const session = getSessionFromReq(req)!;
  const now = Date.now();
  const messageId = `msg_${crypto.randomBytes(8).toString('hex')}`;
  const senderName = session.global_name || session.username || 'Staff Caretaker';

  db.prepare(`
    INSERT INTO support_messages (
      id, ticket_id, sender_type, sender_id, sender_name, sender_avatar, content, created_at
    ) VALUES (?, ?, 'admin', ?, ?, ?, ?, ?)
  `).run(
    messageId,
    ticketId,
    session.user_id,
    senderName,
    session.avatar,
    content.trim(),
    now
  );

  db.prepare("UPDATE support_tickets SET updated_at = ?, status = 'in_progress' WHERE id = ?").run(
    now,
    ticketId
  );

  res.json({
    success: true,
    message: {
      id: messageId,
      ticket_id: ticketId,
      sender_type: 'admin',
      sender_id: session.user_id,
      sender_name: senderName,
      sender_avatar: session.avatar,
      content: content.trim(),
      created_at: now,
    },
  });
});

/**
 * PATCH /api/admin/support/tickets/:ticketId/status
 * Admin updates ticket status
 */
supportRouter.patch('/admin/tickets/:ticketId/status', requireAdmin, (req: Request, res: Response) => {
  const ticketId = paramStr(req.params.ticketId);
  const { status } = req.body;

  if (!status || !['open', 'in_progress', 'resolved'].includes(status)) {
    res.status(400).json({ error: 'Invalid status. Must be open, in_progress, or resolved.' });
    return;
  }

  const ticket = db
    .prepare('SELECT * FROM support_tickets WHERE id = ?')
    .get(ticketId) as unknown as SupportTicketRecord | undefined;

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  const now = Date.now();
  db.prepare('UPDATE support_tickets SET status = ?, updated_at = ? WHERE id = ?').run(
    status,
    now,
    ticketId
  );

  res.json({ success: true, status });
});
