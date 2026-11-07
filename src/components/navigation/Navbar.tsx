import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X, LogOut, HelpCircle, Shield } from 'lucide-react';
import { SITE_CONFIG } from '../../data/siteData';
import { CircularLogo } from './CircularLogo';
import { AnimatedWordmark } from './AnimatedWordmark';
import { useDiscordServerData } from '../../hooks/useDiscordServerData';
import { useDiscordAuth } from '../../hooks/useDiscordAuth';
import { useSupportModal } from '../../hooks/useSupportModal';
import { AuthNoticeModal } from '../auth/AuthNoticeModal';
import { MagneticButton } from '../ui/MagneticButton';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const location = useLocation();
  const discord = useDiscordServerData(45000);
  const { user, isAuthenticated, isMember, isAdmin, login, logout, authNotice, clearAuthNotice } = useDiscordAuth();
  const { openSupport } = useSupportModal();

  // Close account menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer and account menu on route change
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  }

  return (
    <>
      {/* Global Navigation — In normal document flow so it scrolls away naturally without permanently floating */}
      <header className="relative w-full z-40 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* 1. Navigation Container / Pill — Compact, clean capsule holding brand & nav links */}
          <nav
            className="flex items-center gap-4 sm:gap-6 xl:gap-8 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full liquid-glass shadow-lg border border-white/10"
            aria-label="Main Navigation"
          >
            {/* Left Brand: Original Circular LovePixel Server Icon Emblem & LOVEPIXELS Wordmark */}
            <NavLink
              to="/"
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f472b6] rounded-full py-0.5 pr-1.5 shrink-0"
              data-cursor-text="HOME"
            >
              <CircularLogo size="sm" />
              <AnimatedWordmark />
            </NavLink>

            {/* Desktop Navigation Links — Organised cleanly inside the navigation area */}
            <div className="hidden xl:flex items-center gap-0.5 xl:gap-1.5">
              {SITE_CONFIG.navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `relative px-2.5 xl:px-3.5 py-1.5 text-[11px] xl:text-[12.5px] tracking-[0.12em] xl:tracking-[0.14em] uppercase font-medium rounded-full transition-all duration-300 ${
                      isActive
                        ? 'text-white font-semibold bg-white/15 border border-white/20 shadow-xs'
                        : 'text-[#d8afbf] hover:text-white hover:bg-white/10'
                    }`
                  }
                  data-cursor-text="OPEN"
                >
                  {({ isActive }) => (
                    <>
                      <span>{link.label}</span>
                      {isActive && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#f472b6] shadow-xs shadow-[#f472b6]/70" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* 2. OUTSIDE the navigation container: Discord controls separately aligned on the right with ample clearance */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 ml-auto">
            {/* Real verified Discord server presence indicator */}
            <div
              className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-rose text-[11px] text-[#fceef2] font-medium tracking-wide shadow-xs select-none"
              title={
                discord.status === 'live'
                  ? `LovePixels Discord (${SITE_CONFIG.discordGuildId}): ${discord.onlineFull} online · ${discord.memberFull} members · Verified Discord API`
                  : 'Syncing live Discord presence...'
              }
            >
              <span className="relative flex h-2 w-2 shrink-0">
                {discord.status === 'live' ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16a34a]"></span>
                  </>
                ) : discord.status === 'loading' ? (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f472b6] animate-pulse"></span>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e8a8b8]"></span>
                )}
              </span>

              {discord.status === 'live' ? (
                <span>
                  <strong className="font-semibold text-white">{discord.onlineFormatted}</strong> online
                </span>
              ) : discord.status === 'loading' ? (
                <span className="text-[#d8afbf]">Connecting Discord...</span>
              ) : (
                <span className="text-[#d8afbf]">Discord sync</span>
              )}
            </div>

            {/* Discord Authentication / Avatar Control — OUTSIDE navigation container */}
            <div ref={accountMenuRef} className="relative">
              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={login}
                  className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full liquid-glass-rose flex items-center justify-center text-[#fceef2] hover:text-white hover:scale-105 active:scale-95 transition-all shadow-xs border border-white/20 shrink-0"
                  title="Sign in with Discord"
                  aria-label="Sign in with Discord"
                  data-cursor-text="LOGIN"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-[#f472b6]/60 hover:ring-[#f472b6] transition-all hover:scale-105 active:scale-95 shadow-xs shrink-0"
                    aria-label="Open Discord account menu"
                    title={user?.global_name || user?.username}
                    data-cursor-text="PROFILE"
                  >
                    <img
                      src={user?.avatar}
                      alt={user?.global_name || user?.username}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${
                        isMember ? 'bg-[#16a34a]' : 'bg-[#f59e0b]'
                      }`}
                    />
                  </button>

                  {/* Liquid Glass Account Menu Dropdown */}
                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2.5 w-64 rounded-2xl liquid-glass shadow-2xl p-3 border border-white/20 z-50 animate-fade-in text-white">
                      <div className="flex items-center gap-2.5 pb-2.5 mb-2.5 border-b border-white/15">
                        <img
                          src={user?.avatar}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-white/30"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-xs truncate text-white">
                            {user?.global_name || user?.username}
                          </div>
                          <div className="text-[10px] text-[#d8afbf] truncate">
                            @{user?.username}
                          </div>
                        </div>
                      </div>

                      <div className="mb-2.5 px-2 py-1.5 rounded-xl bg-white/10 text-[11px] flex items-center justify-between">
                        <span className="text-[#d8afbf]">Status:</span>
                        {isMember ? (
                          <span className="font-bold text-[#4ade80]">Verified Member 🌸</span>
                        ) : (
                          <a
                            href={SITE_CONFIG.discordInviteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#fbbf24] hover:underline"
                          >
                            Join Server →
                          </a>
                        )}
                      </div>

                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            openSupport();
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-[#fdf2f4] hover:bg-white/15 transition-colors text-left"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-[#f472b6]" />
                          <span>Help & Support Inbox</span>
                        </button>

                        {isAdmin && (
                          <NavLink
                            to="/admin/inbox"
                            onClick={() => setAccountMenuOpen(false)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-sky-200 hover:bg-white/15 transition-colors text-left"
                          >
                            <Shield className="w-3.5 h-3.5 text-sky-400" />
                            <span className="font-semibold text-sky-300">Admin Support Inbox</span>
                          </NavLink>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-rose-300 hover:bg-rose-500/20 transition-colors text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Primary Discord CTA with Magnetic Proximity — OUTSIDE navigation container */}
            <MagneticButton
              as="a"
              href={SITE_CONFIG.discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              strength={0.2}
              className="group relative hidden sm:inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-[13px] font-semibold tracking-wider text-white bg-gradient-to-r from-[#b54a67] via-[#d3738b] to-[#b54a67] bg-[length:200%_auto] hover:bg-right shadow-md shadow-[#b54a67]/25 hover:shadow-lg hover:shadow-[#b54a67]/35 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
              cursorText="DISCORD"
            >
              <span>Join Discord</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </MagneticButton>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-full text-[#d8afbf] hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[#0e050f]/60 backdrop-blur-md transition-opacity duration-300 xl:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Drawer Content */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-4/5 max-w-sm bg-[#160718] shadow-2xl p-6 flex flex-col justify-between transition-transform duration-500 ease-out xl:hidden border-l border-white/10 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Mobile Navigation Menu"
      >
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-white/15">
            <div className="flex items-center gap-3">
              <CircularLogo size="sm" />
              <AnimatedWordmark />
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-[#d8afbf] hover:text-white rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-2 py-6">
            {SITE_CONFIG.navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-2xl text-base font-medium transition-all ${
                    isActive
                      ? 'bg-white/15 text-white font-semibold border border-white/20 shadow-xs'
                      : 'text-[#d8afbf] hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Drawer Bottom Actions */}
        <div className="pt-6 border-t border-white/15 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#d8afbf] px-2">
            <span>Community Presence</span>
            <span className="text-[#4ade80] font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block"></span>
              {discord.onlineFull ? `${discord.onlineFull} Online` : 'Syncing Discord...'}
            </span>
          </div>

          <a
            href={SITE_CONFIG.discordInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#b54a67] via-[#d3738b] to-[#b54a67] shadow-md shadow-[#b54a67]/25 hover:shadow-lg transition-all"
          >
            <span>Enter LovePixels Discord</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </aside>

      {/* Discord OAuth Notice Modal */}
      <AuthNoticeModal notice={authNotice} onClose={clearAuthNotice} />
    </>
  );
};
