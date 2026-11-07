import React, { useEffect, useRef } from 'react';

interface TrailParticle {
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  scale: number;
  life: number;
  maxLife: number;
}

export const BlossomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const trailContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 1. Accessibility & Touch Detection
    const isTouch =
      window.matchMedia('(pointer: coarse)').matches ||
      !window.matchMedia('(hover: hover)').matches;
    const prefersReducedMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) {
      return;
    }

    const cursor = cursorRef.current;
    const trailContainer = trailContainerRef.current;
    if (!cursor || !trailContainer) return;

    // 2. High-Performance Movement State (No React Re-Renders)
    let mouseX = -100;
    let mouseY = -100;
    let targetX = -100;
    let targetY = -100;
    let lastSpawnX = -100;
    let lastSpawnY = -100;
    let currentAngle = -10;
    let targetAngle = -10;
    let isHoveringInteractive = false;
    let isVisible = false;
    let animId: number;

    // 3. Bounded Micro-Trail Pool (Max 5 tiny particles)
    const MAX_TRAIL = 5;
    const trailParticles: TrailParticle[] = [];
    const trailElements: HTMLDivElement[] = [];

    // Create pooled DOM elements for the trail
    for (let i = 0; i < MAX_TRAIL; i++) {
      const el = document.createElement('div');
      el.style.position = 'fixed';
      el.style.top = '0px';
      el.style.left = '0px';
      el.style.width = '7px';
      el.style.height = '9px';
      el.style.pointerEvents = 'none';
      el.style.zIndex = '99998';
      el.style.opacity = '0';
      el.style.willChange = 'transform, opacity';
      el.innerHTML = `
        <svg viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
          <path d="M5 12 C1 9 0 5 1 2.5 C2 0.5 4 1 5 2 C6 1 8 0.5 9 2.5 C10 5 9 9 5 12 Z" fill="#f8b4c8" opacity="0.85" />
        </svg>
      `;
      trailContainer.appendChild(el);
      trailElements.push(el);
    }

    // 4. Mouse Event Listeners
    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        mouseX = targetX;
        mouseY = targetY;
        cursor.style.opacity = '1';
      }

      // Check velocity for natural subtle rotation
      const dx = targetX - mouseX;
      const dy = targetY - mouseY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 1.5) {
        // Subtle tilt based on movement direction (clamped)
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        // Dampen and bias toward gentle organic angle
        targetAngle = Math.max(-35, Math.min(35, angle * 0.25 - 10));

        // Spawn restrained trail particle only after moving > 22px
        const distFromLast = Math.hypot(targetX - lastSpawnX, targetY - lastSpawnY);
        if (distFromLast > 22 && trailParticles.length < MAX_TRAIL) {
          lastSpawnX = targetX;
          lastSpawnY = targetY;
          trailParticles.push({
            x: targetX,
            y: targetY,
            rotation: targetAngle + (Math.random() - 0.5) * 40,
            opacity: 0.7,
            scale: 0.9,
            life: 20,
            maxLife: 20,
          });
        }
      } else {
        targetAngle = -10; // Return to gentle resting tilt
      }

      // Check interactive hover
      const target = (e.target as HTMLElement).closest(
        'a, button, [role="button"], input, select, [data-cursor-interactive]'
      );
      isHoveringInteractive = !!target;
    };

    const onMouseLeave = () => {
      isVisible = false;
      cursor.style.opacity = '0';
    };

    const onMouseEnter = () => {
      isVisible = true;
      cursor.style.opacity = '1';
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // 5. High-Frequency Render Loop (Smooth Lerp Physics)
    const tick = () => {
      // Smooth position interpolation (lerp: 0.72 for crisp, instant response with zero lag)
      mouseX += (targetX - mouseX) * 0.72;
      mouseY += (targetY - mouseY) * 0.72;
      currentAngle += (targetAngle - currentAngle) * 0.18;

      const scale = isHoveringInteractive ? 1.2 : 1.0;
      const glow = isHoveringInteractive
        ? 'drop-shadow(0 0 7px rgba(244, 114, 182, 0.65))'
        : 'drop-shadow(0 2px 4px rgba(181, 74, 103, 0.25))';

      // Update main petal cursor
      // Pointer hotspot is precisely at the tip/stem (top-left offset: -2px, -2px)
      cursor.style.transform = `translate3d(${mouseX - 2}px, ${mouseY - 2}px, 0) rotate(${currentAngle}deg) scale(${scale})`;
      cursor.style.filter = glow;

      // Update trailing micro-particles
      for (let i = trailParticles.length - 1; i >= 0; i--) {
        const p = trailParticles[i];
        p.life--;
        p.y += 0.4; // Gentle downward drift
        p.opacity = (p.life / p.maxLife) * 0.65;
        p.scale = (p.life / p.maxLife) * 0.85;

        const el = trailElements[i];
        if (el) {
          el.style.opacity = `${p.opacity}`;
          el.style.transform = `translate3d(${p.x - 3}px, ${p.y - 4}px, 0) rotate(${p.rotation}deg) scale(${p.scale})`;
        }

        if (p.life <= 0) {
          trailParticles.splice(i, 1);
          if (el) el.style.opacity = '0';
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      trailElements.forEach((el) => el.remove());
    };
  }, []);

  return (
    <>
      {/* 1. Main Blossom Petal Cursor */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[99999] opacity-0 transition-opacity duration-200 select-none"
        style={{ width: '18px', height: '22px', willChange: 'transform, opacity' }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 18 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Soft, naturally curved petal gradient */}
            <linearGradient id="blossomPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="28%" stopColor="#fde8ef" />
              <stop offset="65%" stopColor="#f9a8c0" />
              <stop offset="100%" stopColor="#e86b8c" />
            </linearGradient>

            {/* Subtle inner petal vein highlight */}
            <linearGradient id="blossomVeinGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#f48fb1" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Naturally curved Sakura petal with delicate notch at top */}
          <path
            d="M 2 2 C 0.5 6, 1.5 12, 6 17 C 8 19.5, 10 20.5, 12 18 C 16 13, 17.5 7, 15.5 2 C 14 3.5, 12 2, 9.5 4 C 7.5 2, 4.5 3.5, 2 2 Z"
            fill="url(#blossomPetalGrad)"
            stroke="rgba(255, 255, 255, 0.65)"
            strokeWidth="0.6"
          />

          {/* Center translucent delicate petal spine */}
          <path
            d="M 9.5 4 C 9 8, 8 13, 9 17"
            stroke="url(#blossomVeinGrad)"
            strokeWidth="0.6"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* 2. Container for pooled micro-trail particles */}
      <div ref={trailContainerRef} aria-hidden="true" />
    </>
  );
};
