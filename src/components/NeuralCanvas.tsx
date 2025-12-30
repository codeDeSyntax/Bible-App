import React, { useRef, useEffect } from "react";

interface NeuralCanvasProps {
  className?: string;
  particleCount?: number;
}

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// Lightweight flow-field based neural-ish art (no external libs)
const NeuralCanvas: React.FC<NeuralCanvasProps> = ({
  className,
  particleCount = 120,
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let w = 0;
    let h = 0;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      w = canvas.clientWidth || canvas.width;
      h = canvas.clientHeight || canvas.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    // Particle structure
    type P = { x: number; y: number; vx: number; vy: number; life: number };
    const particles: P[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: 0,
        vy: 0,
        life: Math.random() * 100 + 50,
      });
    }

    // field: combination of sines to mimic organic flow (cheap alternative to Perlin)
    const fieldAngle = (x: number, y: number, t: number) => {
      const nx = x / Math.max(1, w);
      const ny = y / Math.max(1, h);
      const a = Math.sin((nx + t * 0.02) * 6.0) * 0.9;
      const b = Math.cos((ny - t * 0.015) * 4.5) * 0.7;
      const c = Math.sin((nx + ny + Math.sin(t * 0.005)) * 3.5) * 0.6;
      return (a + b + c) * Math.PI; // angle in radians
    };

    let last = performance.now();
    let accum = 0;

    // fetch theme color
    const getColor = () => {
      try {
        const v = getComputedStyle(document.documentElement).getPropertyValue(
          "--text-primary"
        );
        return v || "#e8e7e7";
      } catch (e) {
        return "#e8e7e7";
      }
    };

    const color = getColor();

    // Background is transparent; we draw subtle, low-alpha strokes
    ctx.lineCap = "round";

    const step = (now: number) => {
      const dt = Math.min(40, now - last);
      last = now;
      accum += dt;

      // limit to ~30fps rendering
      if (accum < 33) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      accum = 0;

      ctx.clearRect(0, 0, w, h);

      // subtle background glow behind neurons
      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, w, h);

      const t = now;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const angle = fieldAngle(p.x, p.y, t);
        // accelerate along field
        p.vx += Math.cos(angle) * 0.06;
        p.vy += Math.sin(angle) * 0.06;
        // damp
        p.vx *= 0.92;
        p.vy *= 0.92;
        const nx = p.x + p.vx;
        const ny = p.y + p.vy;

        // draw segment
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = color || "#e8e7e7";
        ctx.globalAlpha = 0.085;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        p.x = nx;
        p.y = ny;

        // respawn if out of bounds or life ended
        p.life -= 0.3;
        if (
          p.x < -10 ||
          p.x > w + 10 ||
          p.y < -10 ||
          p.y > h + 10 ||
          p.life <= 0
        ) {
          p.x = Math.random() * w;
          p.y = Math.random() * h;
          p.vx = 0;
          p.vy = 0;
          p.life = Math.random() * 120 + 60;
        }
      }

      // draw brighter nodes at some particle positions
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = color || "#e8e7e7";
      for (let i = 0; i < 12; i++) {
        const idx = Math.floor((i / 12) * particles.length);
        const p = particles[idx];
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [particleCount]);

  return <canvas ref={ref} className={className} />;
};

export default NeuralCanvas;
