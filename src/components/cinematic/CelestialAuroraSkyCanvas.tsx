import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulseOffset: number;
  hue: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  age: number;
  maxLife: number;
  alpha: number;
}

interface LightParticle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulseOffset: number;
  vx: number;
  vy: number;
}

export const CelestialAuroraSkyCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animId: number;
    let isVisible = true;
    let width = 0;
    let height = 0;

    const updateSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    // Observer to pause when scrolled out of view
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry ? entry.isIntersecting : false;
      },
      { threshold: 0.05 }
    );

    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }

    // 1. Tiny Distant Stars (Natural Celestial Constellations)
    const starCount = window.innerWidth < 768 ? 32 : 55;
    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random(),
      y: Math.random() * 0.75, // Distribute mainly in top 75% of sky
      radius: Math.random() * 0.9 + 0.6,
      baseAlpha: Math.random() * 0.4 + 0.35,
      pulseSpeed: Math.random() * 0.025 + 0.01,
      pulseOffset: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.4 ? 205 : 190, // Pale sky-blue and pearl-cyan
    }));

    // 2. Subtle Atmospheric Light Dust (Micro Stardust)
    const dustCount = window.innerWidth < 768 ? 14 : 24;
    const particles: LightParticle[] = Array.from({ length: dustCount }, () => ({
      x: Math.random() * (width || 1200),
      y: Math.random() * (height || 800),
      radius: Math.random() * 1.4 + 0.7,
      alpha: Math.random() * 0.4 + 0.2,
      baseAlpha: Math.random() * 0.4 + 0.2,
      pulseSpeed: Math.random() * 0.018 + 0.008,
      pulseOffset: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.2,
      vy: -(Math.random() * 0.22 + 0.1),
    }));

    // 3. Delicate Shooting Star State (Occasional, elegant, thin luminous trail)
    let activeShootingStar: ShootingStar | null = null;
    let nextShootingStarDelay = Math.random() * 200 + 160; // First meteor in ~3-4 seconds

    const spawnShootingStar = () => {
      // Travel diagonally across top/middle sky
      const angle = (Math.PI / 180) * (Math.random() * 12 + 30); // 30° to 42° below horizontal
      const speed = Math.random() * 3.5 + 8.5; // Smooth velocity
      const maxLife = Math.floor(Math.random() * 22 + 45); // 45 to 67 frames (~0.8-1.1s)
      const length = Math.random() * 35 + 65; // Thin trail 65-100px

      activeShootingStar = {
        x: Math.random() * (width * 0.65) + width * 0.05,
        y: Math.random() * (height * 0.35) + height * 0.05,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length,
        age: 0,
        maxLife,
        alpha: 0,
      };
    };

    let tick = 0;

    const render = () => {
      if (document.hidden || !isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      tick += 1;

      // =========================================================================
      // LAYER A: AURORA-LIKE LIGHT RIBBONS (GENTLE UNDULATING SKY SHEEN)
      // =========================================================================
      if (!prefersReducedMotion) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // Ribbon 1: Pale Celestial Cyan-Sky Ribbon
        const wave1Y = height * 0.28 + Math.sin(tick * 0.007) * 18;
        const grad1 = ctx.createLinearGradient(0, wave1Y - 45, width, wave1Y + 45);
        grad1.addColorStop(0, 'rgba(125, 211, 252, 0)');
        grad1.addColorStop(0.3, 'rgba(186, 230, 253, 0.14)');
        grad1.addColorStop(0.65, 'rgba(147, 197, 253, 0.18)');
        grad1.addColorStop(1, 'rgba(224, 242, 254, 0)');

        ctx.fillStyle = grad1;
        ctx.beginPath();
        ctx.moveTo(0, wave1Y + 30);
        ctx.bezierCurveTo(
          width * 0.3,
          wave1Y - 40 + Math.cos(tick * 0.006) * 15,
          width * 0.65,
          wave1Y + 50 + Math.sin(tick * 0.008) * 20,
          width,
          wave1Y - 20
        );
        ctx.lineTo(width, wave1Y + 110);
        ctx.bezierCurveTo(
          width * 0.65,
          wave1Y + 140,
          width * 0.3,
          wave1Y + 70,
          0,
          wave1Y + 120
        );
        ctx.closePath();
        ctx.fill();

        // Ribbon 2: Subtle Ethereal Lavender-Blue Light Ribbon
        const wave2Y = height * 0.42 + Math.cos(tick * 0.006) * 15;
        const grad2 = ctx.createLinearGradient(width * 0.1, wave2Y, width * 0.9, wave2Y);
        grad2.addColorStop(0, 'rgba(216, 180, 254, 0)');
        grad2.addColorStop(0.4, 'rgba(192, 132, 252, 0.10)');
        grad2.addColorStop(0.7, 'rgba(186, 230, 253, 0.12)');
        grad2.addColorStop(1, 'rgba(125, 211, 252, 0)');

        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.moveTo(0, wave2Y);
        ctx.bezierCurveTo(
          width * 0.35,
          wave2Y + 45 + Math.sin(tick * 0.005) * 16,
          width * 0.7,
          wave2Y - 35 + Math.cos(tick * 0.007) * 14,
          width,
          wave2Y + 25
        );
        ctx.lineTo(width, wave2Y + 95);
        ctx.bezierCurveTo(
          width * 0.7,
          wave2Y + 60,
          width * 0.35,
          wave2Y + 120,
          0,
          wave2Y + 80
        );
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // =========================================================================
      // LAYER B: TINY DISTANT STARS (SUBTLE TWINKLE, PURE PEARL & CYAN)
      // =========================================================================
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const sx = s.x * width;
        const sy = s.y * height;

        const currentAlpha = prefersReducedMotion
          ? s.baseAlpha
          : Math.max(0.15, s.baseAlpha + Math.sin(tick * s.pulseSpeed + s.pulseOffset) * 0.28);

        // Core star
        ctx.fillStyle = `hsla(${s.hue}, 90%, 96%, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, s.radius, 0, Math.PI * 2);
        ctx.fill();

        // Ambient micro glow
        if (s.radius > 1.1) {
          ctx.fillStyle = `hsla(${s.hue}, 80%, 82%, ${currentAlpha * 0.3})`;
          ctx.beginPath();
          ctx.arc(sx, sy, s.radius * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // =========================================================================
      // LAYER C: DELICATE OCCASIONAL SHOOTING STAR (THIN LUMINOUS TRAIL)
      // =========================================================================
      if (!prefersReducedMotion) {
        if (!activeShootingStar) {
          nextShootingStarDelay -= 1;
          if (nextShootingStarDelay <= 0) {
            spawnShootingStar();
            // Schedule next shooting star between 4.5s and 8.5s (270 to 510 frames at 60fps)
            nextShootingStarDelay = Math.random() * 240 + 270;
          }
        } else {
          const star = activeShootingStar;
          star.age += 1;
          star.x += star.vx;
          star.y += star.vy;

          // Envelope: Fade in smoothly over first 20%, sustain, fade out over final 35%
          const progress = star.age / star.maxLife;
          if (progress < 0.2) {
            star.alpha = progress / 0.2;
          } else if (progress > 0.65) {
            star.alpha = Math.max(0, (1 - progress) / 0.35);
          } else {
            star.alpha = 1;
          }

          // Calculate tail direction
          const velocityMag = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
          const dirX = star.vx / velocityMag;
          const dirY = star.vy / velocityMag;
          const tailX = star.x - dirX * star.length;
          const tailY = star.y - dirY * star.length;

          // Draw thin luminous starlight trail
          ctx.save();
          const trailGrad = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
          trailGrad.addColorStop(0, `rgba(255, 255, 255, ${star.alpha * 0.95})`);
          trailGrad.addColorStop(0.2, `rgba(224, 242, 254, ${star.alpha * 0.8})`);
          trailGrad.addColorStop(0.6, `rgba(186, 230, 253, ${star.alpha * 0.35})`);
          trailGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');

          ctx.strokeStyle = trailGrad;
          ctx.lineWidth = 1.35;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          // Luminous pearl-white meteor head
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * 0.98})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, 1.4, 0, Math.PI * 2);
          ctx.fill();

          // Delicate soft aura around head
          const headGlow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 4.5);
          headGlow.addColorStop(0, `rgba(255, 255, 255, ${star.alpha * 0.7})`);
          headGlow.addColorStop(0.5, `rgba(186, 230, 253, ${star.alpha * 0.35})`);
          headGlow.addColorStop(1, 'rgba(186, 230, 253, 0)');
          ctx.fillStyle = headGlow;
          ctx.beginPath();
          ctx.arc(star.x, star.y, 4.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

          if (star.age >= star.maxLife) {
            activeShootingStar = null;
          }
        }
      }

      // =========================================================================
      // LAYER D: SUBTLE BLUE-WHITE ATMOSPHERIC LIGHT PARTICLES (LIGHT DUST)
      // =========================================================================
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx + Math.sin(tick * 0.015 + p.pulseOffset) * 0.12;
          p.y += p.vy;

          p.alpha = Math.max(
            0.1,
            p.baseAlpha + Math.sin(tick * p.pulseSpeed + p.pulseOffset) * 0.15
          );

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }

        const glowRadius = p.radius * 3.2;
        const pGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        pGrad.addColorStop(0, `rgba(255, 255, 255, ${p.alpha * 0.9})`);
        pGrad.addColorStop(0.4, `rgba(186, 230, 253, ${p.alpha * 0.45})`);
        pGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');

        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none w-full h-full ${className}`}
      aria-hidden="true"
    />
  );
};
