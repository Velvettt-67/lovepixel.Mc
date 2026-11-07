import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;
let tickerCallback: ((time: number) => void) | null = null;

export function initSmoothScroll(): Lenis {
  if (lenisInstance) {
    return lenisInstance;
  }

  // Check if reduced motion is requested
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const lenis = new Lenis({
    duration: prefersReducedMotion ? 0.01 : 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: !prefersReducedMotion,
    touchMultiplier: 1.5,
  });

  lenisInstance = lenis;

  // Sync Lenis with GSAP ScrollTrigger
  const onScroll = () => {
    ScrollTrigger.update();
  };
  lenis.on('scroll', onScroll);

  tickerCallback = (time: number) => {
    if (lenisInstance) {
      lenisInstance.raf(time * 1000);
    }
  };

  gsap.ticker.add(tickerCallback);
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function destroySmoothScroll(): void {
  if (tickerCallback) {
    gsap.ticker.remove(tickerCallback);
    tickerCallback = null;
  }
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}
