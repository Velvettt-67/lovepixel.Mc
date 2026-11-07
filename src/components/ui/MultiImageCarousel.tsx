import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CarouselItem {
  src: string;
  alt?: string;
  label?: string;
  title?: string;
  artist?: string;
  category?: string;
  subtitle?: string;
}

export interface MultiImageCarouselProps {
  images: CarouselItem[] | string[];
  intervalMs?: number;
  aspectRatio?: string;
  className?: string;
  showIndicators?: boolean;
  showArrows?: boolean;
  overlayGradient?: boolean;
  children?: React.ReactNode;
}

export const MultiImageCarousel: React.FC<MultiImageCarouselProps> = ({
  images,
  intervalMs = 1000,
  aspectRatio = 'aspect-[16/10]',
  className = '',
  showIndicators = true,
  showArrows = true,
  overlayGradient = true,
  children,
}) => {
  const normalizedImages = images.map((img) =>
    typeof img === 'string' ? { src: img, alt: '' } : img
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const total = normalizedImages.length;

  // Preload all images in the collection
  useEffect(() => {
    normalizedImages.forEach((item) => {
      if (item.src) {
        const img = new Image();
        img.src = item.src;
      }
    });
  }, [normalizedImages]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleSelect = useCallback((idx: number) => {
    setCurrentIndex(idx);
  }, []);

  // 1,000 ms auto-advancing rotation with hover pause & cleanup
  useEffect(() => {
    if (total <= 1) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    if (isHovered) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    timerRef.current = setTimeout(() => {
      handleNext();
    }, intervalMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isHovered, total, intervalMs, handleNext]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (deltaX > 40) {
      handlePrev();
    } else if (deltaX < -40) {
      handleNext();
    }
  };

  return (
    <div
      className={`relative overflow-hidden select-none group ${aspectRatio} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Stacked crossfading image layers */}
      {normalizedImages.map((item, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={item.src}
              alt={item.alt || `Visual scene ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </div>
        );
      })}

      {/* Atmospheric depth overlay */}
      {overlayGradient && (
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
      )}

      {/* Manual Prev / Next arrow buttons */}
      {showArrows && total > 1 && (
        <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 z-30 flex items-center justify-between pointer-events-none">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="w-8 h-8 rounded-full liquid-glass-dark text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-auto hover:scale-110 active:scale-95 shadow-md"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="w-8 h-8 rounded-full liquid-glass-dark text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-auto hover:scale-110 active:scale-95 shadow-md"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Manual dot indicators */}
      {showIndicators && total > 1 && (
        <div className="absolute bottom-3 right-4 z-30 flex items-center gap-1.5">
          {normalizedImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-5 bg-[#f472b6]'
                  : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Item metadata caption overlay if present */}
      {normalizedImages[currentIndex] &&
        (normalizedImages[currentIndex].title || normalizedImages[currentIndex].category) && (
          <div className="absolute bottom-5 left-5 right-20 z-30 text-white pointer-events-none transition-all duration-300">
            {normalizedImages[currentIndex].category && (
              <span className="text-[10px] uppercase tracking-widest text-[#f472b6] font-semibold block mb-0.5">
                {normalizedImages[currentIndex].category}{' '}
                {normalizedImages[currentIndex].artist ? `• by ${normalizedImages[currentIndex].artist}` : ''}
              </span>
            )}
            {normalizedImages[currentIndex].title && (
              <h4 className="font-display text-lg text-white leading-snug line-clamp-1">
                {normalizedImages[currentIndex].title}
              </h4>
            )}
          </div>
        )}

      {/* Optional custom overlay content passed via children */}
      {children && <div className="relative z-30 w-full h-full pointer-events-none">{children}</div>}
    </div>
  );
};
