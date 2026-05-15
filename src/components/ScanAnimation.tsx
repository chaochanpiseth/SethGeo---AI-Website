import { useEffect, useRef } from "react";

export function ScanAnimation({ isScanning }: { isScanning: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isScanning || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 192;
    canvas.height = 192;
    let angle = 0;
    let dots: { x: number; y: number; alpha: number; speed: number }[] = [];

    const draw = () => {
      const cx = 96, cy = 96, r = 80;
      ctx.clearRect(0, 0, 192, 192);

      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(52,211,153,0.25)"; ctx.lineWidth = 1; ctx.stroke();
      [0.6, 0.35].forEach(f => {
        ctx.beginPath(); ctx.arc(cx, cy, r * f, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(52,211,153,0.12)"; ctx.lineWidth = 0.5; ctx.stroke();
      });

      ctx.strokeStyle = "rgba(52,211,153,0.1)"; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
      ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();

      const end = angle * (Math.PI / 180);
      const start = end - Math.PI * 0.5;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, "rgba(52,211,153,0.15)"); grad.addColorStop(1, "rgba(52,211,153,0)");
      ctx.fillStyle = grad; ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end); ctx.closePath(); ctx.fill();

      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * Math.cos(end), cy + r * Math.sin(end));
      ctx.strokeStyle = "rgba(52,211,153,0.9)"; ctx.lineWidth = 1.5; ctx.stroke();

      if (Math.random() < 0.04) {
        const rd = r * (0.15 + Math.random() * 0.75);
        const a = end + (Math.random() - 0.5) * 0.3;
        dots.push({ x: cx + rd * Math.cos(a), y: cy + rd * Math.sin(a), alpha: 1, speed: 0.02 + Math.random() * 0.03 });
      }
      dots = dots.filter(d => d.alpha > 0);
      dots.forEach(d => {
        ctx.beginPath(); ctx.arc(d.x, d.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52,211,153,${d.alpha})`; ctx.fill(); d.alpha -= d.speed;
      });

      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(52,211,153,0.9)"; ctx.fill();
      angle = (angle + 1.5) % 360;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [isScanning]);

  if (!isScanning) return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm rounded-lg">
      <canvas ref={canvasRef} width={192} height={192} />
      <div className="mt-4 flex flex-col items-center gap-2">
        <p className="text-primary text-sm font-mono tracking-widest uppercase pulse-glow">Analyzing Location</p>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary pulse-glow" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
