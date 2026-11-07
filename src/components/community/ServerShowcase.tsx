import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Eye } from 'lucide-react';
import { SHOWCASE_ITEMS } from '../../data/communityData';

export const ServerShowcase: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressStartTimeRef = useRef<number>(0);
  const [progress, setProgress] = useState(0);

  // Touch swipe support
  const touchStartXRef = useRef<number | null>(null);

  const AUTOPLAY_DURATION = 1000; // 1,000 ms (1 second) interval

  // Preload all 7 showcase images into browser cache
  useEffect(() => {
    SHOWCASE_ITEMS.forEach((item) => {
      const img = new Image();
      img.src = item.image;
    });
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
    progressStartTimeRef.current = Date.now();
    setProgress(0);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SHOWCASE_ITEMS.length) % SHOWCASE_ITEMS.length);
    progressStartTimeRef.current = Date.now();
    setProgress(0);
  }, []);

  const handleSelect = useCallback((idx: number) => {
    setCurrentIndex(idx);
    progressStartTimeRef.current = Date.now();
    setProgress(0);
  }, []);

  // Continuous rotation & synchronized progress bar (pauses on hover/interaction)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    if (isHovered) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    progressStartTimeRef.current = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - progressStartTimeRef.current;
      const pct = Math.min(100, (elapsed / AUTOPLAY_DURATION) * 100);
      setProgress(pct);
    }, 25);

    timerRef.current = setTimeout(() => {
      handleNext();
    }, AUTOPLAY_DURATION);

    return () => {
      clearInterval(progressInterval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isHovered, handleNext]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (deltaX > 45) {
      handlePrev();
    } else if (deltaX < -45) {
      handleNext();
    }
  };

  // Keyboard navigation support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  return (
    <div
      className="w-full select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Server Showcase 3D Coverflow Carousel"
    >
      {/* Editorial Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center px-3.5 py-1 rounded-full liquid-glass-rose text-xs font-semibold uppercase tracking-widest text-[#f472b6] mb-3">
            <span>Visual Atmosphere</span>
          </div>
          <h3 className="font-display text-3xl sm:text-4xl text-[#fdf2f4]">
            Server Showcase
          </h3>
          <p className="font-editorial text-lg text-[#d8afbf] mt-1 max-w-xl">
            A seven-scene visual journey through the soul, atmosphere, and rituals of LovePixels.
          </p>
        </div>

        {/* Carousel Navigation Buttons & Synchronized Counter */}
        <div className="flex items-center gap-3">
          <div className="relative px-4 py-2 rounded-full bg-[#180817]/90 border border-[#e8a8b8]/20 text-xs font-editorial text-[#d8afbf] tracking-wide overflow-hidden shadow-md">
            <span className="font-bold text-[#fdf2f4]">0{currentIndex + 1}</span> / 0{SHOWCASE_ITEMS.length}
            {/* Ambient subtle progress indicator underlying the counter */}
            <span
              className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#d3738b] to-[#38bdf8] transition-all duration-75 ease-linear pointer-events-none"
              style={{ width: `${progress}%` }}
              aria-hidden="true"
            />
          </div>
          <button
            onClick={handlePrev}
            className="w-11 h-11 rounded-full bg-[#180817]/90 border border-[#e8a8b8]/20 text-[#fdf2f4] flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 hover:border-[#f472b6]/50"
            aria-label="Previous showcase image"
            data-cursor-text="PREV"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="w-11 h-11 rounded-full bg-[#180817]/90 border border-[#e8a8b8]/20 text-[#fdf2f4] flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 hover:border-[#f472b6]/50"
            aria-label="Next showcase image"
            data-cursor-text="NEXT"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          21ST.DEV 3D COVERFLOW STAGE
          Deep spatial perspective with interactive side cards
          ========================================================================= */}
      <div className="relative w-full overflow-hidden py-4 sm:py-8">
        <div
          className="relative w-full h-[460px] sm:h-[540px] lg:h-[600px] flex items-center justify-center"
          style={{ perspective: '1200px' }}
        >
          {SHOWCASE_ITEMS.map((item, idx) => {
            const total = SHOWCASE_ITEMS.length;
            const diff = (idx - currentIndex + total) % total;
            const offset = diff > total / 2 ? diff - total : diff;

            const isCurrent = offset === 0;
            const isVisible = Math.abs(offset) <= 2;

            if (!isVisible) {
              return null;
            }

            // 3D Coverflow positioning physics
            let translateX = 0;
            let translateZ = 0;
            let rotateY = 0;
            let scale = 1;
            let opacity = 1;
            let zIndex = 30;

            if (isCurrent) {
              translateX = 0;
              translateZ = 0;
              rotateY = 0;
              scale = 1;
              opacity = 1;
              zIndex = 30;
            } else if (offset === -1) {
              translateX = -38;
              translateZ = -120;
              rotateY = 26;
              scale = 0.86;
              opacity = 0.72;
              zIndex = 20;
            } else if (offset === 1) {
              translateX = 38;
              translateZ = -120;
              rotateY = -26;
              scale = 0.86;
              opacity = 0.72;
              zIndex = 20;
            } else if (offset === -2) {
              translateX = -68;
              translateZ = -240;
              rotateY = 40;
              scale = 0.72;
              opacity = 0.35;
              zIndex = 10;
            } else if (offset === 2) {
              translateX = 68;
              translateZ = -240;
              rotateY = -40;
              scale = 0.72;
              opacity = 0.35;
              zIndex = 10;
            }

            const isSkyItem = item.id === 4;

            return (
              <div
                key={item.id}
                onClick={() => handleSelect(idx)}
                style={{
                  transform: `translate3d(${translateX}%, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  zIndex,
                  opacity,
                  transition: 'transform 0.5s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.5s ease, z-index 0.5s ease',
                }}
                className={`absolute w-[86%] sm:w-[72%] lg:w-[62%] h-full rounded-[28px] overflow-hidden cursor-pointer shadow-2xl border border-white/20 will-change-transform ${
                  isCurrent ? 'ring-2 ring-[#e8a8b8]/50 shadow-[0_25px_60px_-15px_rgba(44,14,24,0.6)]' : 'hover:opacity-90'
                }`}
                data-cursor-text={isCurrent ? 'LOOK' : `0${idx + 1}`}
              >
                {/* Image Stage */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center filter contrast-[1.02]"
                  loading={isCurrent ? 'eager' : 'lazy'}
                />

                {/* Ambient Depth Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a0810]/95 via-[#1a0810]/35 to-transparent" />

                {/* Top Badge on active card */}
                {isCurrent && (
                  <div
                    className={`absolute top-6 right-6 z-10 hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-dark text-xs ${
                      isSkyItem ? 'text-[#e0f2fe] border-sky-400/25' : 'text-[#fceef2]'
                    }`}
                  >
                    {isSkyItem && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
                    )}
                    <span>{item.accentNote}</span>
                  </div>
                )}

                {/* Editorial Metadata Overlay */}
                <div
                  className={`absolute bottom-0 inset-x-0 p-6 sm:p-10 transition-opacity duration-300 ${
                    isCurrent ? 'opacity-100' : 'opacity-0 sm:opacity-40'
                  }`}
                >
                  <div
                    className={`text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold mb-2 ${
                      isSkyItem ? 'text-[#7dd3fc]' : 'text-[#f7cad5]'
                    }`}
                  >
                    {item.category}
                  </div>
                  <h4 className="font-display text-2xl sm:text-4xl lg:text-5xl font-normal tracking-normal text-white mb-2 leading-tight">
                    {item.title}
                  </h4>
                  {isCurrent && (
                    <p className="font-editorial text-sm sm:text-lg text-[#fcd9e2] leading-relaxed max-w-2xl line-clamp-2 sm:line-clamp-none">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Side Card Overlay Hint */}
                {!isCurrent && (
                  <div className="absolute inset-0 bg-black/35 hover:bg-black/15 transition-colors flex items-center justify-center">
                    <span className="p-3 rounded-full liquid-glass-dark text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-5 h-5" />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-Thumbnail Interactive Ribbon with Synchronized Progress Highlighting */}
      <div className="grid grid-cols-7 gap-2 sm:gap-4 mt-4 sm:mt-6">
        {SHOWCASE_ITEMS.map((item, idx) => {
          const isActive = idx === currentIndex;
          const isSkyItem = item.id === 4;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(idx)}
              className={`group relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[4/3] border-2 transition-all duration-300 ${
                isActive
                  ? isSkyItem
                    ? 'border-[#38bdf8] ring-2 ring-[#38bdf8]/50 scale-102 shadow-md'
                    : 'border-[#b54a67] ring-2 ring-[#e8a8b8]/60 scale-102 shadow-md'
                  : 'border-transparent opacity-60 hover:opacity-100 hover:scale-101'
              }`}
              data-cursor-text={`0${idx + 1}`}
              aria-label={`View showcase scene 0${idx + 1}: ${item.title}`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div
                className={`absolute inset-0 transition-opacity ${
                  isActive
                    ? isSkyItem
                      ? 'bg-[#38bdf8]/15'
                      : 'bg-[#b54a67]/15'
                    : 'bg-black/25 group-hover:bg-transparent'
                }`}
              />

              {/* Active thumbnail progress bar */}
              {isActive && (
                <div className="absolute top-0 inset-x-0 h-[2.5px] bg-black/40 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-75 ease-linear ${
                      isSkyItem ? 'bg-[#38bdf8]' : 'bg-[#e8a8b8]'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              <span className="absolute bottom-1 right-1.5 text-[9px] sm:text-[11px] font-bold text-white liquid-glass-dark px-1.5 py-0.5 rounded-md">
                0{item.id}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
