import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useDiscordAuth } from '../hooks/useDiscordAuth';

interface AdminTicket {
  id: string;
  user_id: string | null;
  user_tag: string | null;
  user_avatar: string | null;
  guest_name: string | null;
  guest_email: string | null;
  category: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: number;
  updated_at: number;
  messageCount: number;
  lastMessageExcerpt: string;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'visitor' | 'admin';
  sender_id: string | null;
  sender_name: string;
  sender_avatar: string | null;
  content: string;
  created_at: number;
}

export const AdminInbox: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isLoading: isAuthLoading } = useDiscordAuth();

  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<TicketMessage[]>([]);
  const [activeTicket, setActiveTicket] = useState<AdminTicket | null>(null);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [isLoadingThread, setIsLoadingThread] = useState(false);

  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Load ticket list
  const loadTickets = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoadingTickets(true);
    try {
      const url = statusFilter === 'all' ? '/api/support/admin/tickets' : `/api/support/admin/tickets?status=${statusFilter}`;
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoadingTickets(false);
    }
  }, [isAdmin, statusFilter]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (ignore) return;
      await loadTickets();
    }
    load();
    return () => {
      ignore = true;
    };
  }, [loadTickets]);

  // Load active ticket thread
  const loadThread = useCallback(async (ticketId: string) => {
    setIsLoadingThread(true);
    try {
      const res = await fetch(`/api/support/admin/tickets/${ticketId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setActiveTicket(data.ticket);
        setActiveMessages(data.messages || []);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoadingThread(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load(id: string) {
      if (ignore) return;
      await loadThread(id);
    }
    if (selectedTicketId) {
      load(selectedTicketId);
    }
    return () => {
      ignore = true;
    };
  }, [selectedTicketId, loadThread]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyText.trim()) return;

    setIsReplying(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch(`/api/support/admin/tickets/${selectedTicketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: replyText.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveMessages((prev) => [...prev, data.message]);
        setReplyText('');
        setFeedbackMsg('Reply sent successfully.');
        loadTickets();
      } else {
        const data = await res.json();
        setFeedbackMsg(data.error || 'Failed to send reply');
      }
    } catch (err: any) {
      setFeedbackMsg(err.message || 'Network error');
    } finally {
      setIsReplying(false);
    }
  };

  const handleUpdateStatus = async (newStatus: 'open' | 'in_progress' | 'resolved') => {
    if (!selectedTicketId) return;
    try {
      const res = await fetch(`/api/support/admin/tickets/${selectedTicketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        if (activeTicket) {
          setActiveTicket({ ...activeTicket, status: newStatus });
        }
        loadTickets();
      }
    } catch {
      // Ignore
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center pt-32 pb-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#b54a67] border-t-transparent animate-spin mb-3" />
      </div>
    );
  }

  // Unauthorized access state
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center pt-32 pb-20 px-4">
        <div className="max-w-md w-full p-8 rounded-[32px] bg-[#240e18] border border-rose-500/30 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-rose-950/80 text-rose-300 flex items-center justify-center mx-auto mb-4 border border-rose-600/30">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="font-display text-2xl text-white mb-2">Access Restricted</h2>
          <p className="font-editorial text-sm text-[#fcd9e2]/80 mb-6 leading-relaxed">
            The LovePixels Support Inbox is restricted to authorized server administrators and owner accounts configured in <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">ADMIN_DISCORD_IDS</code>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <NavLink
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-[#b54a67] hover:bg-[#9a3b54] transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-white/10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-rose text-[11px] font-bold uppercase tracking-widest text-[#f472b6] mb-2">
            <span>Staff Administration</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-[#fdf2f4]">
            Support & Inquiry Inbox
          </h1>
          <p className="font-editorial text-sm text-[#d8afbf] mt-1">
            Private visitor questions and website inquiries persisted in local SQLite.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTickets}
            className="p-2.5 rounded-full liquid-glass text-[#fdf2f4] hover:scale-105 active:scale-95 transition-all"
            title="Refresh tickets"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingTickets ? 'animate-spin' : ''}`} />
          </button>
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/30 text-xs font-semibold">
            Admin Verified: {user?.global_name || user?.username}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
        {/* Left Column: Tickets Master List */}
        <div className="lg:col-span-5 bg-[#240e18] rounded-[28px] border border-[#e8a8b8]/25 p-4 sm:p-5 flex flex-col justify-between shadow-xl">
          <div>
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 pb-4 mb-4 border-b border-white/10 overflow-x-auto">
              {(['all', 'open', 'in_progress', 'resolved'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider capitalize whitespace-nowrap transition-all ${
                    statusFilter === filter
                      ? 'bg-[#b54a67] text-white shadow-sm'
                      : 'text-[#d39ba9] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {filter.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Tickets List */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {isLoadingTickets && tickets.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#d39ba9]">Loading tickets...</div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-16 text-sm text-[#d39ba9] font-editorial">
                  No tickets found in this view.
                </div>
              ) : (
                tickets.map((t) => {
                  const isSelected = t.id === selectedTicketId;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#351423] border-[#f472b6] shadow-md'
                          : 'bg-[#1c0b12] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#f8b4c8]">
                          {t.category}
                        </span>
                        <div
                          className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${
                            t.status === 'resolved'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/30'
                              : t.status === 'in_progress'
                              ? 'bg-sky-950 text-sky-300 border border-sky-600/30'
                              : 'bg-rose-950 text-rose-300 border border-rose-600/30'
                          }`}
                        >
                          {t.status}
                        </div>
                      </div>

                      <h4 className="text-sm font-semibold text-white truncate mb-1">
                        {t.subject}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] text-[#f7cad5]/60">
                        <span>From: {t.user_tag || t.guest_name || 'Visitor'}</span>
                        <span>{t.messageCount} msg</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 text-[11px] text-[#d39ba9] text-center">
            {tickets.length} total tickets in view
          </div>
        </div>

        {/* Right Column: Ticket Conversation Detail */}
        <div className="lg:col-span-7 bg-[#240e18] rounded-[28px] border border-[#e8a8b8]/25 p-5 sm:p-6 flex flex-col justify-between shadow-xl">
          {selectedTicketId && activeTicket ? (
            <div className="flex flex-col h-full justify-between">
              <div>
                {/* Thread Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/10 gap-3">
                  <div>
                    <h3 className="font-display text-xl text-white">{activeTicket.subject}</h3>
                    <div className="text-xs text-[#f7cad5]/70 flex items-center gap-2 mt-1">
                      <span>Sender: <strong>{activeTicket.user_tag || activeTicket.guest_name}</strong></span>
                      {activeTicket.guest_email && <span>({activeTicket.guest_email})</span>}
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5">
                    {(['open', 'in_progress', 'resolved'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(st)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider capitalize transition-all ${
                          activeTicket.status === st
                            ? st === 'resolved'
                              ? 'bg-emerald-600 text-white'
                              : st === 'in_progress'
                              ? 'bg-sky-600 text-white'
                              : 'bg-rose-600 text-white'
                            : 'bg-white/5 text-[#d39ba9] hover:bg-white/10'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-2">
                  {isLoadingThread ? (
                    <div className="text-center py-12 text-xs text-[#d39ba9]">Loading conversation...</div>
                  ) : (
                    activeMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-2xl border ${
                          msg.sender_type === 'admin'
                            ? 'bg-[#152a38]/80 border-sky-400/30 ml-6'
                            : 'bg-[#1d0a13] border-white/10 mr-6'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            {msg.sender_avatar ? (
                              <img src={msg.sender_avatar} alt="" className="w-5 h-5 rounded-full" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-[#9a3b54] text-white flex items-center justify-center text-[10px] font-bold">
                                {msg.sender_name.slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <span className="text-xs font-semibold text-white">
                              {msg.sender_name}
                            </span>
                            {msg.sender_type === 'admin' && (
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-400/30">
                                Staff Reply
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#f7cad5]/50">
                            {new Date(msg.created_at).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-[#fcd9e2] leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Admin Reply Form */}
              <div className="pt-4 mt-4 border-t border-white/10">
                {feedbackMsg && (
                  <div className="mb-2 text-xs text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{feedbackMsg}</span>
                  </div>
                )}
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write official caretaker reply..."
                    className="flex-1 bg-[#1d0a13] border border-white/10 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-[#f472b6] resize-none"
                    disabled={isReplying}
                  />
                  <button
                    type="submit"
                    disabled={isReplying || !replyText.trim()}
                    className="px-5 rounded-2xl bg-gradient-to-r from-[#b54a67] to-[#d3738b] text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <span>{isReplying ? 'Sending...' : 'Reply'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-24 text-[#d39ba9]">
              <AlertCircle className="w-10 h-10 mb-2 opacity-40 text-[#b54a67]" />
              <p className="font-editorial text-base text-[#fcd9e2]">Select a ticket to view conversation</p>
              <p className="text-xs text-[#a4687a] mt-1">
                Choose any inquiry on the left to read or reply.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
