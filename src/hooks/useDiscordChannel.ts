import { useState, useEffect, useCallback, useRef } from 'react';

export interface DiscordMessageAuthor {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string;
  bot: boolean;
  roleColor?: string;
}

export interface DiscordMessageAttachment {
  id: string;
  url: string;
  proxyUrl: string;
  filename: string;
  contentType: string | null;
  size: number;
  width: number | null;
  height: number | null;
}

export interface DiscordMessageEmbed {
  title: string | null;
  description: string | null;
  url: string | null;
  color: number | null;
  image: { url: string; proxyUrl?: string } | null;
  thumbnail: { url: string } | null;
  timestamp: string | null;
  footer: { text: string } | null;
}

export interface DiscordMessage {
  id: string;
  channelId: string;
  author: DiscordMessageAuthor;
  content: string;
  timestamp: string;
  timeFormatted: string;
  editedTimestamp: string | null;
  attachments: DiscordMessageAttachment[];
  embeds: DiscordMessageEmbed[];
  isWebsiteBridge: boolean;
  bridgeMember: {
    username: string;
    globalName?: string;
    avatar?: string;
  } | null;
}

export type ChannelConnectionStatus = 'connected' | 'connecting' | 'unconfigured' | 'error' | 'disconnected';

export interface UseDiscordChannelReturn {
  messages: DiscordMessage[];
  isLoading: boolean;
  status: ChannelConnectionStatus;
  statusDetail: string | null;
  error: string | null;
  isSending: boolean;
  cooldownSeconds: number;
  sendMessage: (content: string) => Promise<{ success: boolean; error?: string }>;
  refresh: () => Promise<void>;
}

export function useDiscordChannel(channelId: string): UseDiscordChannelReturn {
  const [messages, setMessages] = useState<DiscordMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<ChannelConnectionStatus>('connecting');
  const [statusDetail, setStatusDetail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch initial channel message history
  const fetchMessages = useCallback(async () => {
    if (!channelId) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/discord/channels/${channelId}/messages?limit=50`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.error || `HTTP error ${res.status}`);
        setStatus('error');
        return;
      }

      const data = await res.json();
      setMessages(data.messages || []);

      if (data.source === 'unconfigured') {
        setStatus('unconfigured');
        setStatusDetail(data.error || 'Gateway/Bot unconfigured');
      } else {
        setStatus('connected');
        setStatusDetail(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch messages');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (ignore) return;
      await fetchMessages();
    }
    load();
    return () => {
      ignore = true;
    };
  }, [fetchMessages]);

  // Connect to SSE stream for real-time live message updates
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    function connectSse() {
      try {
        eventSource = new EventSource('/api/discord/events');

        eventSource.onopen = () => {
          // SSE stream open
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'status') {
              if (data.data?.state === 'connected') {
                setStatus('connected');
                setStatusDetail(null);
              } else if (data.data?.state === 'unconfigured') {
                setStatus('unconfigured');
                setStatusDetail(data.data?.error || 'Discord Bot unconfigured');
              } else if (data.data?.state === 'error') {
                setStatus('error');
                setStatusDetail(data.data?.error || 'Connection error');
              }
            } else if (data.type === 'message:create' && data.channelId === channelId) {
              setMessages((prev) => {
                // Avoid duplicates
                if (prev.some((m) => m.id === data.message.id)) {
                  return prev;
                }
                const updated = [...prev, data.message];
                return updated.slice(Math.max(0, updated.length - 60));
              });
            } else if (data.type === 'message:update' && data.channelId === channelId) {
              setMessages((prev) =>
                prev.map((m) => (m.id === data.message.id ? data.message : m))
              );
            } else if (data.type === 'message:delete' && data.channelId === channelId) {
              setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
            }
          } catch {
            // Ignore parse errors on keepalive comments
          }
        };

        eventSource.onerror = () => {
          eventSource?.close();
          retryTimer = setTimeout(connectSse, 5000);
        };
      } catch {
        retryTimer = setTimeout(connectSse, 8000);
      }
    }

    connectSse();

    return () => {
      eventSource?.close();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [channelId]);

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldownSeconds > 0) {
      cooldownTimerRef.current = setTimeout(() => {
        setCooldownSeconds((s) => s - 1);
      }, 1000);
    }
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, [cooldownSeconds]);

  // Send message via transparent bridge
  const sendMessage = useCallback(
    async (content: string): Promise<{ success: boolean; error?: string }> => {
      if (!content.trim()) {
        return { success: false, error: 'Message cannot be empty.' };
      }
      if (cooldownSeconds > 0) {
        return { success: false, error: `Please wait ${cooldownSeconds}s before sending another message.` };
      }

      setIsSending(true);

      try {
        const res = await fetch(`/api/discord/channels/${channelId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ content: content.trim() }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { success: false, error: data.error || `Error ${res.status}` };
        }

        // Add confirmed message immediately to local state if not already received via SSE
        if (data.message) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
        }

        // Start 5-second cooldown
        setCooldownSeconds(5);

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Network error submitting message' };
      } finally {
        setIsSending(false);
      }
    },
    [channelId, cooldownSeconds]
  );

  return {
    messages,
    isLoading,
    status,
    statusDetail,
    error,
    isSending,
    cooldownSeconds,
    sendMessage,
    refresh: fetchMessages,
  };
}
