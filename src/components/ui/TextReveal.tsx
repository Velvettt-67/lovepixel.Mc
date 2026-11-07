import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  stagger?: number;
  delay?: number;
  triggerOnScroll?: boolean;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  className = '',
  as: Component = 'h2',
  stagger = 0.04,
  delay = 0.1,
  triggerOnScroll = true,
}) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const words = containerRef.current.querySelectorAll('.reveal-word');
    if (!words.length) return;

    const ctx = gsap.context(() => {
      if (triggerOnScroll) {
        gsap.fromTo(
          words,
          {
            y: '100%',
            opacity: 0,
            filter: 'blur(4px)',
          },
          {
            y: '0%',
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'power3.out',
            stagger,
            delay,
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        );
      } else {
        gsap.fromTo(
          words,
          {
            y: '100%',
            opacity: 0,
            filter: 'blur(4px)',
          },
          {
            y: '0%',
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'power3.out',
            stagger,
            delay,
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [stagger, delay, triggerOnScroll, text]);

  const words = text.split(' ');

  return (
    // @ts-expect-error dynamic component type
    <Component ref={containerRef} className={`block w-full ${className}`}>
      {words.map((word, index) => (
        <span key={index} className="inline-block overflow-hidden mr-[0.28em] py-0.5 align-top">
          <span className="reveal-word inline-block will-change-transform">{word}</span>
        </span>
      ))}
    </Component>
  );
};
