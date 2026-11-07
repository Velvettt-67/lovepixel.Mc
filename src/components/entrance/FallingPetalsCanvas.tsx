import React, { useEffect, useRef } from 'react';

interface FallingPetalsCanvasProps {
  isEntering?: boolean;
  className?: string;
}

interface Petal {
  x: number;
  y: number;
  z: number; // 0: background, 1: midground, 2: foreground
  size: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  speedY: number;
  speedX: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmp: number;
  opacity: number;
  colorType: number;
}

export const FallingPetalsCanvas: React.FC<FallingPetalsCanvasProps> = ({
  isEntering = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isEnteringRef = useRef(isEntering);

  useEffect(() => {
    isEnteringRef.current = isEntering;
  }, [isEntering]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const petalCount = prefersReduced ? 8 : window.innerWidth < 768 ? 24 : 45;

    const petals: Petal[] = [];

    const colors = [
      { fill: '#fde8ef', shadow: '#f8b4c8' }, // Soft blush
      { fill: '#fbcfe8', shadow: '#f472b6' }, // Petal rose
      { fill: '#ffffff', shadow: '#fce7ee' }, // Pearl ivory white
      { fill: '#ffd1dc', shadow: '#e87999' }, // Sakura candy pink
    ];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    const createPetal = (startY?: number): Petal => {
      const z = Math.random() < 0.25 ? 2 : Math.random() < 0.6 ? 1 : 0;
      const baseSize = z === 2 ? 18 + Math.random() * 10 : z === 1 ? 12 + Math.random() * 6 : 7 + Math.random() * 4;
      return {
        x: Math.random() * (width + 200) - 100,
        y: startY !== undefined ? startY : Math.random() * (height + 100) - 50,
        z,
        size: baseSize,
        rotationX: Math.random() * Math.PI * 2,
        rotationY: Math.random() * Math.PI * 2,
        rotationZ: Math.random() * Math.PI * 2,
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.03,
        rotSpeedZ: (Math.random() - 0.5) * 0.015,
        speedY: (0.4 + Math.random() * 0.8) * (z === 2 ? 1.4 : z === 1 ? 1.0 : 0.6),
        speedX: (0.2 + Math.random() * 0.5) * (Math.random() < 0.2 ? -0.5 : 1),
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.01 + Math.random() * 0.015,
        swayAmp: 0.4 + Math.random() * 0.8,
        opacity: z === 2 ? 0.85 : z === 1 ? 0.75 : 0.45,
        colorType: Math.floor(Math.random() * colors.length),
      };
    };

    resize();
    window.addEventListener('resize', resize);

    // Initialize petals across the screen
    for (let i = 0; i < petalCount; i++) {
      petals.push(createPetal());
    }

    // Helper to draw a single organic curved sakura petal
    const drawPetalShape = (size: number) => {
      ctx.beginPath();
      ctx.moveTo(0, -size);
      // Left curve
      ctx.bezierCurveTo(-size * 0.7, -size * 0.5, -size * 0.7, size * 0.4, 0, size);
      // Right curve
      ctx.bezierCurveTo(size * 0.7, size * 0.4, size * 0.7, -size * 0.5, 0, -size);
      ctx.closePath();
    };

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.667, 2);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      const gustMultiplier = isEnteringRef.current ? 3.2 : 1.0;

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        // Motion physics
        p.swayPhase += p.swaySpeed * dt;
        const sway = Math.sin(p.swayPhase) * p.swayAmp;

        p.rotationX += p.rotSpeedX * dt * (isEnteringRef.current ? 2.5 : 1);
        p.rotationY += p.rotSpeedY * dt * (isEnteringRef.current ? 2.5 : 1);
        p.rotationZ += p.rotSpeedZ * dt * (isEnteringRef.current ? 2.5 : 1);

        const gustVx = isEnteringRef.current ? (p.x < width / 2 ? -2.5 : 2.5) : 0;
        p.x += (p.speedX + sway + gustVx) * dt * gustMultiplier;
        p.y += (p.speedY + (isEnteringRef.current ? 1.5 : 0)) * dt * gustMultiplier;

        // Reset if offscreen
        if (p.y > height + 60 || p.x < -120 || p.x > width + 120) {
          petals[i] = createPetal(-40);
        }

        // Render petal with 3D projection
        ctx.save();
        ctx.translate(p.x, p.y);

        // 3D rotation transform
        const scaleX = Math.cos(p.rotationY);
        const scaleY = Math.sin(p.rotationX);
        ctx.rotate(p.rotationZ);
        ctx.scale(scaleX, scaleY);

        ctx.globalAlpha = p.opacity;

        // Depth blur emulation for foreground/background
        if (p.z === 2) {
          ctx.shadowColor = colors[p.colorType].shadow;
          ctx.shadowBlur = 6;
        } else if (p.z === 0) {
          ctx.shadowBlur = 0;
        }

        // Radial/linear gradient fill for soft translucent petal
        const grad = ctx.createLinearGradient(-p.size, -p.size, p.size, p.size);
        grad.addColorStop(0, colors[p.colorType].fill);
        grad.addColorStop(1, colors[p.colorType].shadow);

        ctx.fillStyle = grad;
        drawPetalShape(p.size);
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-20 ${className}`}
      aria-hidden="true"
    />
  );
};
