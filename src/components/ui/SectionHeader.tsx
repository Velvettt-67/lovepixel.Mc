import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface SectionHeaderProps {
  eyebrow?: string;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href: string;
    isExternal?: boolean;
    cursorText?: string;
  };
  align?: 'left' | 'center';
  className?: string;
  titleClassName?: string;
  tone?: 'dark' | 'light';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  icon,
  title,
  subtitle,
  action,
  align = 'left',
  className = '',
  titleClassName = '',
  tone = 'dark',
}) => {
  const isCentered = align === 'center';
  const isLight = tone === 'light';

  return (
    <div
      className={`w-full mb-10 sm:mb-14 ${
        action
          ? 'flex flex-col md:flex-row md:items-end justify-between gap-6'
          : isCentered
          ? 'text-center max-w-3xl mx-auto'
          : 'max-w-3xl'
      } ${className}`}
    >
      <div className={isCentered ? 'mx-auto' : 'flex-1'}>
        {/* Eyebrow Badge — Guaranteed block isolation preventing any overlap with heading */}
        {eyebrow && (
          <div className={`flex ${isCentered ? 'justify-center' : 'justify-start'} mb-3 sm:mb-4`}>
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest select-none shadow-xs ${
                isLight
                  ? 'bg-white/95 border border-[#f3d2dc] text-[#b54a67]'
                  : 'bg-[#220a22]/90 border border-[#f472b6]/25 text-[#f472b6]'
              }`}
            >
              {icon}
              <span>{eyebrow}</span>
            </div>
          </div>
        )}

        {/* Section Heading — Cormorant Garamond with natural kerning, zero serif collision */}
        <h2
          className={`font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-normal leading-[1.18] sm:leading-[1.15] block ${
            isLight ? 'text-[#240f17]' : 'text-[#fdf2f4]'
          } ${titleClassName}`}
        >
          {title}
        </h2>

        {/* Section Subtitle / Description */}
        {subtitle && (
          <p
            className={`font-editorial text-base sm:text-lg leading-relaxed mt-3 sm:mt-4 max-w-2xl ${
              isLight ? 'text-[#6b5860]' : 'text-[#d8afbf]'
            } ${isCentered ? 'mx-auto' : ''}`}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Action Button — Positioned right or below with proper clearance */}
      {action && (
        <div className="shrink-0 pt-2 md:pt-0">
          {action.isExternal ? (
            <a
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-xs ${
                isLight
                  ? 'text-[#b54a67] border border-[#d3738b]/40 hover:bg-[#b54a67] hover:text-white'
                  : 'text-[#f472b6] border border-[#f472b6]/35 hover:bg-[#f472b6] hover:text-white'
              }`}
              data-cursor-text={action.cursorText || 'OPEN'}
            >
              <span>{action.label}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          ) : (
            <NavLink
              to={action.href}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-xs ${
                isLight
                  ? 'text-[#b54a67] border border-[#d3738b]/40 hover:bg-[#b54a67] hover:text-white'
                  : 'text-[#f472b6] border border-[#f472b6]/35 hover:bg-[#f472b6] hover:text-white'
              }`}
              data-cursor-text={action.cursorText || 'OPEN'}
            >
              <span>{action.label}</span>
              <ArrowUpRight className="w-4 h-4" />
            </NavLink>
          )}
        </div>
      )}
    </div>
  );
};
