import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, ShieldAlert, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface AuthNoticeData {
  type: 'unconfigured' | 'error' | 'cancelled' | 'success';
  title: string;
  message: string;
  missing?: string[];
  redirectUri?: string;
  detail?: string;
}

interface AuthNoticeModalProps {
  notice: AuthNoticeData | null;
  onClose: () => void;
}

export const AuthNoticeModal: React.FC<AuthNoticeModalProps> = ({ notice, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!notice) return null;

  const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const redirectUri = notice.redirectUri || `${window.location.origin}/api/auth/discord/callback`;

  const envSnippet = `# Place in project root: .env
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=${redirectUri}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#16070e]/80 backdrop-blur-xl animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-notice-title"
    >
      <div
        className="relative w-full max-w-xl bg-[#240e18] rounded-[32px] border border-[#e8a8b8]/35 shadow-2xl overflow-hidden text-[#fdf2f4]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#1c0b12]">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center ${
                notice.type === 'unconfigured'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                  : notice.type === 'error'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                  : notice.type === 'cancelled'
                  ? 'bg-purple-950/80 text-purple-300 border border-purple-500/30'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {notice.type === 'unconfigured' && <ShieldAlert className="w-5 h-5" />}
              {notice.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {notice.type === 'cancelled' && <AlertCircle className="w-5 h-5" />}
              {notice.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <h2 id="auth-notice-title" className="font-display text-lg text-white font-normal">
                {notice.title}
              </h2>
              <span className="text-[11px] text-[#f7cad5]/70 font-sans">
                LovePixels Discord Community Authentication
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full liquid-glass-dark text-white hover:scale-105 active:scale-95 transition-all"
            aria-label="Close notice"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="font-editorial text-sm text-[#fcd9e2] leading-relaxed">
            {notice.message}
          </p>

          {notice.type === 'unconfigured' && isDevelopment && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#180810] border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#f8b4c8]">
                    Target File: <code className="text-white">.env</code> in project root
                  </span>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all"
                    title="Copy environment template"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="font-mono text-xs text-[#bae6fd] overflow-x-auto p-3 rounded-xl bg-black/40 whitespace-pre">
                  {envSnippet}
                </pre>
              </div>

              {/* Developer Instructions */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#fcd9e2]/90 space-y-2">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span>How to connect your existing Discord application:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#fcd9e2]/80 leading-relaxed">
                  <li>
                    Open your bot application in the{' '}
                    <a
                      href="https://discord.com/developers/applications"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-300 underline font-semibold hover:text-white inline-flex items-center gap-0.5"
                    >
                      <span>Discord Developer Portal</span>
                      <ExternalLink className="w-3 h-3 inline" />
                    </a>.
                  </li>
                  <li>
                    Navigate to the <strong className="text-white">OAuth2</strong> tab.
                  </li>
                  <li>
                    Copy your <strong className="text-white">Client ID</strong> and paste it as <code className="text-[#f8b4c8]">DISCORD_CLIENT_ID</code> in <code className="text-white">.env</code>.
                  </li>
                  <li>
                    Generate or copy your <strong className="text-white">Client Secret</strong> (under OAuth2) and paste it as <code className="text-[#f8b4c8]">DISCORD_CLIENT_SECRET</code> in <code className="text-white">.env</code>.
                    <br />
                    <span className="text-amber-300 font-semibold">Important:</span> Do not use your Bot Token as the Client Secret.
                  </li>
                  <li>
                    Under <strong className="text-white">Redirects</strong> on the same page, add:
                    <div className="font-mono bg-black/40 px-2 py-1 rounded mt-1 text-[#7dd3fc] select-all">
                      {redirectUri}
                    </div>
                  </li>
                  <li>Click <strong className="text-white">Save Changes</strong> in the Discord portal and restart the backend.</li>
                </ol>
              </div>
            </div>
          )}

          {notice.type === 'unconfigured' && !isDevelopment && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#fcd9e2]/80 leading-relaxed">
              Discord OAuth login is currently undergoing maintenance. The website continues to support full public reading of all verified channels.
            </div>
          )}

          {notice.detail && (
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-rose-300 overflow-x-auto">
              {notice.detail}
            </div>
          )}
        </div>

        {/* Action Button Footer */}
        <div className="px-6 py-4 bg-[#1c0b12] border-t border-white/10 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#b54a67] to-[#d3738b] hover:shadow-md transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
