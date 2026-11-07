import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowUpRight, Heart, HelpCircle } from 'lucide-react';
import { SITE_CONFIG } from '../../data/siteData';
import { CircularLogo } from '../navigation/CircularLogo';
import { AnimatedWordmark } from '../navigation/AnimatedWordmark';
import { useSupportModal } from '../../hooks/useSupportModal';

export const Footer: React.FC = () => {
  const { openSupport } = useSupportModal();
  return (
    <footer className="relative bg-gradient-to-b from-[#0e050f] via-[#120514] to-[#070208] text-[#f8fafc] pt-24 pb-12 overflow-hidden border-t border-[#e8a8b8]/15">
      {/* Ambient Celestial Sky Starlight and Rose Bloom */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-t from-sky-600/15 via-[#b54a67]/10 to-transparent blur-3xl pointer-events-none -z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Closing Hero Scene */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-dark text-xs text-[#e0f2fe] uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
            <span>The Door Is Open, Quietly</span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#ffffff] font-normal tracking-normal mb-6">
            Where strangers become memories.
          </h2>

          <p className="font-editorial text-lg sm:text-xl text-[#d4e4f0] leading-relaxed max-w-xl mx-auto mb-10">
            A softly moderated community for people who like their internet quiet, kind, and beautifully made.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={SITE_CONFIG.discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-medium text-[#071624] bg-gradient-to-r from-[#ffffff] via-[#e0f2fe] to-[#bae6fd] hover:from-white hover:to-[#e0f2fe] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              data-cursor-text="JOIN"
            >
              <span className="font-medium tracking-wide">Enter LovePixels</span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <NavLink
              to="/community"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-base font-medium text-[#fdf2f4] liquid-glass-dark hover:scale-[1.03] active:scale-[0.98] transition-all"
              data-cursor-text="EXPLORE"
            >
              <span>Explore Community</span>
            </NavLink>
          </div>
        </div>

        {/* Separator line */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-sky-200/20 to-transparent my-16" />

        {/* Footer Navigation & Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <CircularLogo size="md" />
              <AnimatedWordmark variant="light" />
            </div>
            <p className="text-sm text-[#cbd5e1] max-w-sm leading-relaxed">
              Quiet nights, creative circles and rewarded presence. Built like a lounge, not a lobby.
            </p>
            <div className="text-xs text-[#94a3b8] pt-2">
              <span>Permanent Sanctuary Invite: </span>
              <a
                href={SITE_CONFIG.discordInviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#bae6fd] hover:text-[#f7cad5] hover:underline underline-offset-4 transition-colors"
              >
                discord.gg/kwHcdGg2f
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-[#f7cad5] mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm text-[#cbd5e1]">
              {SITE_CONFIG.navLinks.map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Elsewhere Column */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-[#f7cad5] mb-4">
              Elsewhere
            </h3>
            <ul className="space-y-2.5 text-sm text-[#cbd5e1]">
              <li>
                <a
                  href={SITE_CONFIG.discordInviteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors duration-200 inline-flex items-center gap-1.5"
                >
                  <span>Discord Sanctuary</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href={SITE_CONFIG.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors duration-200 inline-flex items-center gap-1.5"
                >
                  <span>Instagram</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE_CONFIG.socials.contactEmail}`}
                  className="hover:text-white transition-colors duration-200 inline-flex items-center gap-1.5"
                >
                  <span>Contact Caretakers</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openSupport}
                  className="hover:text-white transition-colors duration-200 inline-flex items-center gap-1.5 text-left"
                >
                  <span>Private Questions & Help</span>
                  <HelpCircle className="w-3 h-3 text-[#f472b6]" />
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Legal */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#94a3b8] gap-4">
          <div className="flex items-center gap-2">
            <span>© {SITE_CONFIG.currentYear} LovePixels. Made softly.</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              With care for quiet minds <Heart className="w-3 h-3 text-[#f472b6] fill-current" />
            </span>
          </div>
          <div className="flex items-center gap-6 text-[#94a3b8]">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span>·</span>
            <span className="hover:text-white cursor-pointer transition-colors">Guidelines</span>
            <span>·</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
