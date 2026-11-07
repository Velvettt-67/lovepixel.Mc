import { useState, useEffect, useCallback } from 'react';
import type { AuthNoticeData } from '../components/auth/AuthNoticeModal';

export interface DiscordUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string;
  isMember: boolean;
  isAdmin: boolean;
}

export interface DiscordAuthState {
  user: DiscordUser | null;
  isAuthenticated: boolean;
  isMember: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isConfigured: boolean | null;
  missingConfig: string[];
  redirectUri: string;
  authNotice: AuthNoticeData | null;
  clearAuthNotice: () => void;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useDiscordAuth(): DiscordAuthState {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [missingConfig, setMissingConfig] = useState<string[]>([]);
  const [redirectUri, setRedirectUri] = useState<string>('http://localhost:5173/api/auth/discord/callback');
  const [authNotice, setAuthNotice] = useState<AuthNoticeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check backend configuration status
  const checkConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/config-status');
      if (res.ok) {
        const data = await res.json();
        setIsConfigured(data.configured);
        setMissingConfig(data.missing || []);
        if (data.redirectUri) setRedirectUri(data.redirectUri);
      }
    } catch {
      // Ignore network errors on initial check
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      await fetchCurrentUser();
      await checkConfig();

      if (ignore) return;
      // Parse URL query parameters from OAuth redirects
      const params = new URLSearchParams(window.location.search);
      if (params.has('auth')) {
        const authType = params.get('auth');

        if (authType === 'success') {
          await fetchCurrentUser();
          if (!ignore) {
            setAuthNotice({
              type: 'success',
              title: 'Welcome to LovePixels',
              message: 'Signed in successfully with your Discord profile.',
            });
          }
        } else if (authType === 'unconfigured') {
          const missing = params.get('missing')?.split(',') || ['DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET'];
          if (!ignore) {
            setAuthNotice({
              type: 'unconfigured',
              title: 'Discord OAuth Configuration Required',
              message:
                'Discord sign-in requires DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET to be added to your .env file.',
              missing,
              redirectUri,
            });
          }
        } else if (authType === 'cancelled') {
          if (!ignore) {
            setAuthNotice({
              type: 'cancelled',
              title: 'Sign-in Cancelled',
              message: 'You cancelled Discord authorization. You can sign in anytime.',
            });
          }
        } else if (authType === 'error') {
          const reason = params.get('reason') || 'unknown';
          const detail = params.get('detail') || '';
          if (!ignore) {
            setAuthNotice({
              type: 'error',
              title: 'Authentication Error',
              message:
                reason === 'invalid_state'
                  ? 'Security validation failed (invalid state token). Please retry.'
                  : reason === 'token_exchange_failed'
                  ? 'Failed to exchange authorization code with Discord. Please check client secret and redirect URI.'
                  : 'Discord authorization failed.',
              detail: detail || undefined,
            });
          }
        }

        // Clean query parameters from address bar without page reload
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
    init();

    return () => {
      ignore = true;
    };
  }, [fetchCurrentUser, checkConfig, redirectUri]);

  const login = useCallback(() => {
    // If we know configuration is missing, show helpful modal immediately without page jump
    if (isConfigured === false) {
      setAuthNotice({
        type: 'unconfigured',
        title: 'Discord OAuth Configuration Required',
        message:
          'Your existing bot application credentials need to be configured in .env before initiating login.',
        missing: missingConfig.length > 0 ? missingConfig : ['DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET'],
        redirectUri,
      });
      return;
    }

    // Direct browser to OAuth start endpoint
    window.location.href = '/api/auth/discord/login';
  }, [isConfigured, missingConfig, redirectUri]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch {
      setUser(null);
    }
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    isMember: Boolean(user?.isMember),
    isAdmin: Boolean(user?.isAdmin),
    isLoading,
    isConfigured,
    missingConfig,
    redirectUri,
    authNotice,
    clearAuthNotice: () => setAuthNotice(null),
    error,
    login,
    logout,
    refresh: fetchCurrentUser,
  };
}
