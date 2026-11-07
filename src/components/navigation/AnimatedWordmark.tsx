import React, { useEffect, useState } from 'react';
import { SITE_CONFIG } from '../../data/siteData';

interface AnimatedWordmarkProps {
  variant?: 'default' | 'light';
  className?: string;
}

// Module-level guard to prevent replaying entrance animation on internal route transitions
let hasWordmarkMounted = false;

export const AnimatedWordmark: React.FC<AnimatedWordmarkProps> = ({
  variant: _variant = 'default',
  className = '',
}) => {
  // Check if entrance animation should play (only on initial website load)
  const [shouldAnimateEntrance, setShouldAnimateEntrance] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (hasWordmarkMounted) return false;
    try {
      const alreadySeen = sessionStorage.getItem('lovepixel_wordmark_entrance_seen');
      return !alreadySeen;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    hasWordmarkMounted = true;
    try {
      sessionStorage.setItem('lovepixel_wordmark_entrance_seen', 'true');
    } catch {
      // sessionStorage unavailable
    }
    if (shouldAnimateEntrance) {
      const timer = setTimeout(() => {
        setShouldAnimateEntrance(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldAnimateEntrance]);

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${
        shouldAnimateEntrance ? 'animate-wordmark-entrance' : ''
      } ${className}`}
    >
      <span
        className={`font-display font-semibold uppercase tracking-[0.22em] sm:tracking-[0.26em] text-[15px] sm:text-[17px] leading-none transition-all duration-300 ease-out group-hover:tracking-[0.28em] text-white drop-shadow-[0_2px_10px_rgba(247,202,213,0.3)] group-hover:text-[#fff0f4]`}
      >
        {SITE_CONFIG.name}
      </span>
    </div>
  );
};
