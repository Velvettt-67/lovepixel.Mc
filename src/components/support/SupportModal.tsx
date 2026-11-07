import React, { useState, useEffect, useCallback } from 'react';
import { X, Send, HelpCircle, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { useDiscordAuth } from '../../hooks/useDiscordAuth';

interface SupportTicket {
  id: string;
  category: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: number;
  updated_at: number;
  guest_name?: string | null;
  guest_email?: string | null;
  guest_token?: string | null;
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_type: 'visitor' | 'admin';
  sender_id: string | null;
  sender_name: string;
  sender_avatar: string | null;
  content: string;
  created_at: number;
}

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useDiscordAuth();

  const [activeTab, setActiveTab] = useState<'new' | 'list'>('new');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState('General Question');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Conversation State
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<SupportMessage[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // Ticket List State
  const [ticketsList, setTicketsList] = useState<SupportTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  // Load user or guest tickets
  const loadTickets = useCallback(async () => {
    setIsLoadingTickets(true);
    try {
      if (isAuthenticated) {
        const res = await fetch('/api/support/my-tickets', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setTicketsList(data.tickets || []);
        }
      } else {
        // Load stored guest tickets
        const stored = localStorage.getItem('lp_guest_tickets');
        if (stored) {
          const list: { id: string; guestToken: string }[] = JSON.parse(stored);
          const loaded: SupportTicket[] = [];
          for (const item of list.slice(-5)) {
            const res = await fetch(`/api/support/tickets/${item.id}?guestToken=${item.guestToken}`);
            if (res.ok) {
              const data = await res.json();
              if (data.ticket) loaded.push(data.ticket);
            }
          }
          setTicketsList(loaded);
        }
      }
    } catch {
      // Ignore load error
    } finally {
      setIsLoadingTickets(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (ignore) return;
      await loadTickets();
    }
    if (isOpen) {
      load();
    }
    return () => {
      ignore = true;
    };
  }, [isOpen, loadTickets]);

  // Load active conversation
  const loadConversation = useCallback(async (ticketId: string) => {
    try {
      let guestToken = '';
      if (!isAuthenticated) {
        const stored = localStorage.getItem('lp_guest_tickets');
        if (stored) {
          const list = JSON.parse(stored);
          const found = list.find((t: any) => t.id === ticketId);
          if (found) guestToken = found.guestToken;
        }
      }

      const res = await fetch(
        `/api/support/tickets/${ticketId}${guestToken ? `?guestToken=${guestToken}` : ''}`,
        { credentials: 'include' }
      );

      if (res.ok) {
        const data = await res.json();
        setActiveTicket(data.ticket);
        setTicketMessages(data.messages || []);
      }
    } catch {
      // Ignore error
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let ignore = false;
    async function load(id: string) {
      if (ignore) return;
      await loadConversation(id);
    }
    if (selectedTicketId) {
      load(selectedTicketId);
    }
    return () => {
      ignore = true;
    };
  }, [selectedTicketId, loadConversation]);

  if (!isOpen) return null;

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!subject.trim()) {
      setFormError('Please enter a subject.');
      return;
    }
    if (!message.trim()) {
      setFormError('Please enter your question or message.');
      return;
    }
    if (!isAuthenticated && !guestName.trim()) {
      setFormError('Please enter your name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          category,
          subject: subject.trim(),
          message: message.trim(),
          guest_name: guestName.trim() || undefined,
          guest_email: guestEmail.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to submit ticket');
        return;
      }

      // If guest, save ticket token to localStorage
      if (!isAuthenticated && data.guestToken) {
        const stored = localStorage.getItem('lp_guest_tickets');
        const list = stored ? JSON.parse(stored) : [];
        list.push({ id: data.ticketId, guestToken: data.guestToken });
        localStorage.setItem('lp_guest_tickets', JSON.stringify(list));
      }

      setFormSuccess('Your question has been securely submitted! Our staff will reply soon.');
      setSubject('');
      setMessage('');
      loadTickets();

      // Automatically open conversation view
      setTimeout(() => {
        setSelectedTicketId(data.ticketId);
      }, 900);
    } catch (err: any) {
      setFormError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyContent.trim()) return;

    setIsReplying(true);
    try {
      let guestToken = '';
      if (!isAuthenticated) {
        const stored = localStorage.getItem('lp_guest_tickets');
        if (stored) {
          const list = JSON.parse(stored);
          const found = list.find((t: any) => t.id === selectedTicketId);
          if (found) guestToken = found.guestToken;
        }
      }

      const res = await fetch(`/api/support/tickets/${selectedTicketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: replyContent.trim(),
          guestToken: guestToken || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTicketMessages((prev) => [...prev, data.message]);
        setReplyContent('');
      }
    } catch {
      // Ignore
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#16070e]/80 backdrop-blur-xl animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
    >
      <div
        className="relative w-full max-w-2xl bg-[#240e18] rounded-[32px] border border-[#e8a8b8]/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#1c0b12]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full liquid-glass-rose flex items-center justify-center text-[#9a3b54]">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 id="support-modal-title" className="font-display text-lg text-white font-normal">
                LovePixels Support & Inquiries
              </h2>
              <p className="text-[11px] text-[#f7cad5]/70 font-sans">
                Private questions handled by staff caretakers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full liquid-glass-dark text-white hover:scale-105 active:scale-95 transition-all"
            aria-label="Close support modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {!selectedTicketId && (
          <div className="flex border-b border-white/10 px-6 pt-3 bg-[#1d0a13]">
            <button
              onClick={() => setActiveTab('new')}
              className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'new'
                  ? 'border-[#f472b6] text-white'
                  : 'border-transparent text-[#d39ba9] hover:text-white'
              }`}
            >
              Ask a Question
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'list'
                  ? 'border-[#f472b6] text-white'
                  : 'border-transparent text-[#d39ba9] hover:text-white'
              }`}
            >
              <span>My Questions</span>
              {ticketsList.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#b54a67] text-white">
                  {ticketsList.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 text-[#fdf2f4]">
          {selectedTicketId && activeTicket ? (
            /* CONVERSATION VIEW */
            <div className="flex flex-col h-full space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <button
                    onClick={() => {
                      setSelectedTicketId(null);
                      setActiveTicket(null);
                    }}
                    className="text-xs text-[#f8b4c8] hover:underline mb-1 inline-block"
                  >
                    ← Back to tickets
                  </button>
                  <h3 className="font-display text-lg text-white">{activeTicket.subject}</h3>
                  <div className="text-[11px] text-[#f7cad5]/70 flex items-center gap-2 mt-0.5">
                    <span>{activeTicket.category}</span>
                    <span>•</span>
                    <span className="capitalize">Status: {activeTicket.status}</span>
                  </div>
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                    activeTicket.status === 'resolved'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/30'
                      : activeTicket.status === 'in_progress'
                      ? 'bg-sky-950 text-sky-300 border border-sky-600/30'
                      : 'bg-rose-950 text-rose-300 border border-rose-600/30'
                  }`}
                >
                  {activeTicket.status}
                </div>
              </div>

              {/* Message Thread */}
              <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                {ticketMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-2xl border ${
                      msg.sender_type === 'admin'
                        ? 'bg-[#152a38]/80 border-sky-400/30 ml-4'
                        : 'bg-[#1d0a13] border-white/10 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {msg.sender_avatar ? (
                          <img
                            src={msg.sender_avatar}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#9a3b54] text-white flex items-center justify-center text-[10px] font-bold">
                            {msg.sender_name.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs font-semibold text-white">
                          {msg.sender_name}
                        </span>
                        {msg.sender_type === 'admin' && (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-400/30">
                            Staff Caretaker
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#f7cad5]/50">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#fcd9e2] leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Follow-up Reply Input */}
              <form onSubmit={handleSendReply} className="pt-2">
                <div className="flex items-center gap-2 bg-[#1d0a13] p-2 rounded-2xl border border-white/10">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type a follow-up reply..."
                    className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white focus:outline-none"
                    disabled={isReplying}
                  />
                  <button
                    type="submit"
                    disabled={isReplying || !replyContent.trim()}
                    className="p-2 rounded-xl bg-gradient-to-r from-[#b54a67] to-[#d3738b] text-white hover:opacity-90 disabled:opacity-40 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          ) : activeTab === 'new' ? (
            /* NEW QUESTION FORM */
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              {formSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {formError && (
                <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/30 text-rose-200 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#f7cad5] font-semibold mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#1c0b12] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#f472b6]"
                >
                  <option value="General Question">General Question</option>
                  <option value="Website Feedback">Website Feedback</option>
                  <option value="Event Inquiry">Event & Giveaway Inquiry</option>
                  <option value="Membership & Roles">Membership & Verification</option>
                  <option value="Technical Confusion">Technical or Bug Report</option>
                </select>
              </div>

              {!isAuthenticated && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#f7cad5] font-semibold mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Kaia"
                      className="w-full bg-[#1c0b12] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#f472b6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#f7cad5] font-semibold mb-1">
                      Your Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="e.g. kaia@example.com"
                      className="w-full bg-[#1c0b12] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#f472b6]"
                    />
                  </div>
                </div>
              )}

              {isAuthenticated && user && (
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs flex items-center gap-2 text-[#fcd9e2]">
                  <img src={user.avatar} alt="" className="w-5 h-5 rounded-full" />
                  <span>
                    Submitting as verified account: <strong>{user.global_name || user.username}</strong>
                  </span>
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#f7cad5] font-semibold mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summary of what you'd like to ask..."
                  className="w-full bg-[#1c0b12] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#f472b6]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#f7cad5] font-semibold mb-1">
                  Question / Details
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Tell us what you're confused about or need help with..."
                  className="w-full bg-[#1c0b12] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#f472b6] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase text-white bg-gradient-to-r from-[#b54a67] via-[#d3738b] to-[#b54a67] hover:scale-102 active:scale-98 transition-all disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? 'Sending...' : 'Submit Private Question'}
                </button>
              </div>
            </form>
          ) : (
            /* TICKET LIST VIEW */
            <div className="space-y-3">
              {isLoadingTickets ? (
                <div className="text-center py-10 text-xs text-[#d39ba9]">Loading questions...</div>
              ) : ticketsList.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-8 h-8 text-[#9a3b54] mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-editorial text-[#fcd9e2]">No questions submitted yet.</p>
                  <p className="text-xs text-[#a4687a] mt-1">
                    Have an inquiry? Use the "Ask a Question" tab.
                  </p>
                </div>
              ) : (
                ticketsList.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className="p-4 rounded-2xl bg-[#1d0a13] hover:bg-[#200c16] border border-white/10 hover:border-[#f472b6]/40 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#f8b4c8]">
                          {ticket.category}
                        </span>
                        <span className="text-white/20">•</span>
                        <span className="text-[10px] text-[#a4687a] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ticket.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-[#fcd9e2] transition-colors">
                        {ticket.subject}
                      </h4>
                    </div>

                    <div
                      className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                        ticket.status === 'resolved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/30'
                          : ticket.status === 'in_progress'
                          ? 'bg-sky-950 text-sky-300 border border-sky-600/30'
                          : 'bg-rose-950 text-rose-300 border border-rose-600/30'
                      }`}
                    >
                      {ticket.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
