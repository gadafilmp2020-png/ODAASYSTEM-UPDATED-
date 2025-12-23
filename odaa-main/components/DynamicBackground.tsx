
import React, { useEffect, useRef, useState } from 'react';
import { User, Transaction } from '../types';
import { getDashboardVisuals } from '../services/geminiService';
import { Sparkles } from 'lucide-react';

interface Props {
  user: User;
  transactions: Transaction[];
}

interface VisualConfig {
  primaryColor: string;
  secondaryColor: string;
  pulseSpeed: number;
  particleCount: number;
  mood: string;
}

interface Point {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export const DynamicBackground: React.FC<Props> = ({ user, transactions }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<VisualConfig | null>(null);
  const mouseRef = useRef<{ x: number | null, y: number | null }>({ x: null, y: null });

  // Fetch AI Config
  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      const visualData = await getDashboardVisuals(user, transactions);
      if (isMounted) setConfig(visualData);
    };
    const timer = setTimeout(fetchConfig, 500);
    return () => { 
        isMounted = false; 
        clearTimeout(timer); 
    };
  }, [user.balance, user.rank, transactions.length]);

  // Mouse Handlers
  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          mouseRef.current = {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
          };
      };
      const handleMouseLeave = () => { mouseRef.current = { x: null, y: null }; };

      const container = containerRef.current;
      if (container) {
          container.addEventListener('mousemove', handleMouseMove);
          container.addEventListener('mouseleave', handleMouseLeave);
      }
      return () => {
          if (container) {
              container.removeEventListener('mousemove', handleMouseMove);
              container.removeEventListener('mouseleave', handleMouseLeave);
          }
      };
  }, []);

  // Triangulation Animation Loop
  useEffect(() => {
    if (!config || !canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = containerRef.current.clientWidth;
    let height = containerRef.current.clientHeight;
    
    const resizeObserver = new ResizeObserver(() => {
        if (containerRef.current) {
            width = containerRef.current.clientWidth;
            height = containerRef.current.clientHeight;
            canvas.width = width;
            canvas.height = height;
        }
    });
    resizeObserver.observe(containerRef.current);
    
    canvas.width = width;
    canvas.height = height;

    // Initialize Points for Mesh
    const points: Point[] = [];
    const spacing = 120; // Increased spacing for cleaner look
    
    // Create a flexible grid of points
    for (let x = 0; x < width + spacing; x += spacing) {
        for (let y = 0; y < height + spacing; y += spacing) {
            const offsetX = (Math.random() - 0.5) * spacing * 0.6;
            const offsetY = (Math.random() - 0.5) * spacing * 0.6;
            points.push({
                x: x + offsetX,
                y: y + offsetY,
                originX: x + offsetX,
                originY: y + offsetY,
                vx: 0,
                vy: 0,
                size: Math.random() * 1.5 + 0.5,
                color: Math.random() > 0.5 ? config.primaryColor : config.secondaryColor
            });
        }
    }

    let animationId: number;
    let time = 0;

    const render = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        time += 0.005 * config.pulseSpeed;

        // Draw Connections (Triangulation)
        ctx.lineWidth = 0.3;
        
        for (let i = 0; i < points.length; i++) {
            const p = points[i];

            // 1. Organic Movement (Sine waves)
            const movementRange = 10;
            const targetX = p.originX + Math.sin(time + p.originY * 0.01) * movementRange;
            const targetY = p.originY + Math.cos(time + p.originX * 0.01) * movementRange;

            // 2. Mouse Magnetism (Pull towards mouse)
            let magnetX = 0;
            let magnetY = 0;
            if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
                const dx = mouseRef.current.x - p.x;
                const dy = mouseRef.current.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const magnetRadius = 250;
                
                if (dist < magnetRadius) {
                    const force = (magnetRadius - dist) / magnetRadius;
                    magnetX = dx * force * 0.05;
                    magnetY = dy * force * 0.05;
                }
            }

            // Smoothly move towards target + magnet influence
            p.x += (targetX + magnetX - p.x) * 0.05;
            p.y += (targetY + magnetY - p.y) * 0.05;

            // 3. Draw Connections to Neighbors
            let connections = 0;
            for (let j = i + 1; j < points.length; j++) {
                const p2 = points[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxLinkDist = 140;

                if (dist < maxLinkDist) {
                    ctx.beginPath();
                    const grad = ctx.createLinearGradient(p.x, p.y, p2.x, p2.y);
                    grad.addColorStop(0, `${p.color}00`);
                    grad.addColorStop(0.5, `${config.primaryColor}20`); // Reduced opacity
                    grad.addColorStop(1, `${p2.color}00`);
                    
                    ctx.strokeStyle = grad;
                    ctx.globalAlpha = (1 - (dist / maxLinkDist)) * 0.5;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                    connections++;
                }
                if (connections > 3) break;
            }

            // 4. Draw Points (Subtle)
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }
        
        ctx.globalAlpha = 1.0;
        animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
        cancelAnimationFrame(animationId);
        resizeObserver.disconnect();
    };
  }, [config]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden rounded-3xl pointer-events-auto bg-slate-950/40">
      <canvas ref={canvasRef} className="w-full h-full opacity-20 mix-blend-screen block" />
      {config && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-full border border-white/5 animate-fade-in z-10 shadow-lg pointer-events-none backdrop-blur-sm">
             <Sparkles size={10} className="text-slate-500 animate-pulse" />
             <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">
                SYSTEM: <span className="font-bold text-slate-400">{config.mood}</span>
             </span>
          </div>
      )}
    </div>
  );
};
