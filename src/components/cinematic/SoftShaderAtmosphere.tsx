import React, { useEffect, useRef } from 'react';

interface SoftShaderAtmosphereProps {
  className?: string;
  variant?: 'rose' | 'celestial' | 'dual';
  opacity?: number;
}

export const SoftShaderAtmosphere: React.FC<SoftShaderAtmosphereProps> = ({
  className = '',
  variant = 'dual',
  opacity = 0.55,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { powerPreference: 'low-power', alpha: true });
    if (!gl) return;

    let animId: number;
    let isVisible = true;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Vertex Shader
    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment Shader: Soft organic fluid atmospheric gradients
    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform int u_variant;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        
        // Gentle organic fluid coordinates
        float t = u_time * 0.25;
        float wave1 = sin(uv.x * 2.5 + t) * cos(uv.y * 2.0 + t * 0.8);
        float wave2 = cos(uv.y * 3.0 - t * 0.7) * sin(uv.x * 1.8 + t * 0.5);
        float fluid = (wave1 + wave2) * 0.5 + 0.5;

        // LovePixels Color Spectrum
        vec3 blushRose = vec3(0.97, 0.82, 0.87);    // #f7d1de
        vec3 deepBlush = vec3(0.85, 0.45, 0.58);     // #d97394
        vec3 celestialCyan = vec3(0.56, 0.82, 0.98); // #8fd1fa
        vec3 pearlWhite = vec3(0.99, 0.98, 0.97);    // #fdfaf7

        vec3 color = pearlWhite;

        if (u_variant == 0) {
          // Rose sanctuary variant
          color = mix(blushRose, deepBlush, fluid * 0.6);
        } else if (u_variant == 1) {
          // Celestial blue variant
          color = mix(celestialCyan, vec3(0.12, 0.24, 0.36), fluid * 0.7);
        } else {
          // Dual chromatic bridge
          vec3 pinkTone = mix(pearlWhite, blushRose, fluid);
          vec3 blueTone = mix(pearlWhite, celestialCyan, 1.0 - fluid);
          color = mix(pinkTone, blueTone, uv.x * 0.7 + sin(t * 0.4) * 0.3);
        }

        // Soft radial vignette to keep edges soft
        float dist = distance(uv, vec2(0.5));
        float alpha = smoothstep(0.85, 0.2, dist) * 0.65;

        gl_FragColor = vec4(color, alpha);
      }
    `;

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    // Full screen quad buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const variantLoc = gl.getUniformLocation(program, 'u_variant');

    const variantVal = variant === 'rose' ? 0 : variant === 'celestial' ? 1 : 2;
    gl.uniform1i(variantLoc, variantVal);

    // Resize handling with half-res scaling for maximum efficiency
    const resize = () => {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      const scale = 0.5; // High performance atmospheric blur does not need 1:1 pixel density
      canvas.width = Math.max(256, Math.floor(rect.width * scale));
      canvas.height = Math.max(256, Math.floor(rect.height * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    // IntersectionObserver to pause render loop when offscreen
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry ? entry.isIntersecting : false;
      },
      { threshold: 0.05 }
    );
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    let startTime = performance.now();

    const render = (time: number) => {
      if (!isVisible || document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      const elapsed = prefersReducedMotion ? 0 : (time - startTime) * 0.001;
      gl.uniform1f(timeLoc, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 w-full h-full filter blur-2xl transition-opacity duration-1000 ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    />
  );
};
