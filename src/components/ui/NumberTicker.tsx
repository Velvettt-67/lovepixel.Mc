import React, { useEffect, useRef, useState } from 'react';

interface NumberTickerProps {
  value: number;
  direction?: 'up' | 'down';
  delay?: number;
  duration?: number; // duration in seconds
  className?: string;
  prefix?: string;
  suffix?: string;
  formatIndian?: boolean;
}

export const NumberTicker: React.FC<NumberTickerProps> = ({
  value,
  direction = 'up',
  delay = 0,
  duration = 1.8,
  className = '',
  prefix = '',
  suffix = '',
  formatIndian = false,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return value;
    }
    return direction === 'down' ? value : 0;
  });
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const hasAnimated = useRef(false);

  // Format number (with optional Indian currency style: e.g., 2,00,000)
  const formatNumber = (num: number): string => {
    const rounded = Math.round(num);
    if (formatIndian) {
      // Indian numbering system formatting: 2,00,000
      return rounded.toLocaleString('en-IN');
    }
    return rounded.toLocaleString('en-US');
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const node = containerRef.current;
    if (!node) return;

    let rafId: number | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          const startTime = performance.now() + delay * 1000;
          const totalDuration = duration * 1000;
          const startVal = direction === 'down' ? value : 0;
          const endVal = direction === 'down' ? 0 : value;

          const updateCounter = (currentTime: number) => {
            if (currentTime < startTime) {
              rafId = requestAnimationFrame(updateCounter);
              return;
            }

            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / totalDuration, 1);

            // Smooth cubic ease-out curve
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const currentNumber = startVal + (endVal - startVal) * easeOutProgress;

            setDisplayValue(currentNumber);

            if (progress < 1) {
              rafId = requestAnimationFrame(updateCounter);
            } else {
              setDisplayValue(endVal);
            }
          };

          rafId = requestAnimationFrame(updateCounter);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [value, direction, delay, duration]);

  return (
    <span ref={containerRef} className={`inline-block tabular-nums font-bold ${className}`}>
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  );
};
