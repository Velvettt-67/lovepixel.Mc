import React, { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  opacity: number;
  color: { fill: string; stroke: string };
  oscillationSpeed: number;
  oscillationOffset: number;
}

interface AmbientParticle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  speedY: number;
  speedX: number;
  pulseSpeed: number;
  pulseOffset: number;
  hue: number;
}

export const PetalAtmosphere: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const isMobile = window.innerWidth < 768;
    const petalCount = isMobile ? 12 : 22;
    const particleCount = isMobile ? 16 : 30;

    const petalColors = [
      { fill: 'rgba(253, 232, 239, 0.65)', stroke: 'rgba(244, 114, 182, 0.45)' }, // blush
      { fill: 'rgba(248, 205, 218, 0.55)', stroke: 'rgba(219, 74, 116, 0.35)' },  // petal pink
      { fill: 'rgba(255, 245, 248, 0.75)', stroke: 'rgba(247, 202, 213, 0.5)' },   // pearl ivory
      { fill: 'rgba(244, 180, 202, 0.50)', stroke: 'rgba(224, 102, 140, 0.4)' },  // candy blossom
    ];

    // 1. Organic Falling Petals with 3D projection
    const petals: Petal[] = Array.from({ length: petalCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 8 + 8,
      speedY: Math.random() * 0.65 + 0.35,
      speedX: Math.random() * 0.4 - 0.2,
      rotX: Math.random() * Math.PI * 2,
      rotY: Math.random() * Math.PI * 2,
      rotZ: Math.random() * Math.PI * 2,
      rotSpeedX: (Math.random() - 0.5) * 0.02,
      rotSpeedY: (Math.random() - 0.5) * 0.025,
      rotSpeedZ: (Math.random() - 0.5) * 0.015,
      opacity: Math.random() * 0.45 + 0.4,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      oscillationSpeed: Math.random() * 0.012 + 0.006,
      oscillationOffset: Math.random() * Math.PI * 2,
    }));

    // 2. Subtle Floating Ambient Stardust Particles
    const particles: AmbientParticle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.6,
      alpha: Math.random() * 0.4 + 0.2,
      baseAlpha: Math.random() * 0.35 + 0.15,
      speedY: -(Math.random() * 0.25 + 0.08), // Gentle upward drift
      speedX: (Math.random() - 0.5) * 0.15,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulseOffset: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.6 ? 340 : 205, // Subtle rose or pale celestial sky tint
    }));

    let tick = 0;

    const drawPetalShape = (size: number) => {
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.bezierCurveTo(-size * 0.75, -size * 0.4, -size * 0.7, size * 0.45, 0, size);
      ctx.bezierCurveTo(size * 0.7, size * 0.45, size * 0.75, -size * 0.4, 0, -size);
      ctx.closePath();
    };

    const render = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      tick += 1;

      // Render Floating Ambient Stardust Particles
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];
        pt.y += pt.speedY;
        pt.x += pt.speedX + Math.sin(tick * 0.01 + pt.pulseOffset) * 0.15;
        pt.alpha = pt.baseAlpha + Math.sin(tick * pt.pulseSpeed + pt.pulseOffset) * 0.15;

        if (pt.y < -10) {
          pt.y = height + 10;
          pt.x = Math.random() * width;
        }
        if (pt.x < -10) pt.x = width + 10;
        if (pt.x > width + 10) pt.x = -10;

        const glowRadius = pt.radius * 2.8;
        const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, glowRadius);
        grad.addColorStop(0, `hsla(${pt.hue}, 90%, 96%, ${Math.max(0, pt.alpha)})`);
        grad.addColorStop(0.5, `hsla(${pt.hue}, 80%, 82%, ${Math.max(0, pt.alpha * 0.4)})`);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render Falling Organic Petals with 3D projection
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(tick * p.oscillationSpeed + p.oscillationOffset) * 0.35;
        p.rotX += p.rotSpeedX;
        p.rotY += p.rotSpeedY;
        p.rotZ += p.rotSpeedZ;

        if (p.y > height + 30) {
          p.y = -30;
          p.x = Math.random() * width;
        }
        if (p.x > width + 30) p.x = -30;
        if (p.x < -30) p.x = width + 30;

        ctx.save();
        ctx.translate(p.x, p.y);

        // 3D projection scaling
        const scaleX = Math.cos(p.rotY);
        const scaleY = Math.sin(p.rotX);
        ctx.rotate(p.rotZ);
        ctx.scale(scaleX, scaleY);
        ctx.globalAlpha = p.opacity;

        ctx.fillStyle = p.color.fill;
        drawPetalShape(p.size);
        ctx.fill();

        ctx.strokeStyle = p.color.stroke;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30 transition-opacity duration-1000 opacity-90"
      aria-hidden="true"
    />
  );
};
