import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
}

interface Pulse {
  startNode: Node;
  endNode: Node;
  progress: number;
  speed: number;
}

export const FloatingCoinsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const nodes: Node[] = [];
    const nodeCount = 50;
    const pulses: Pulse[] = [];
    
    const colors = ['#84cc16', '#22d3ee', '#10b981'];

    const createNode = (): Node => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 800,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      vz: (Math.random() - 0.5) * 0.3,
      size: 1.2 + Math.random() * 2.5,
      color: colors[Math.floor(Math.random() * colors.length)]
    });

    for (let i = 0; i < nodeCount; i++) {
      nodes.push(createNode());
    }

    const drawPulse = (pulse: Pulse) => {
      const x1 = pulse.startNode.x;
      const y1 = pulse.startNode.y;
      const x2 = pulse.endNode.x;
      const y2 = pulse.endNode.y;

      const px = x1 + (x2 - x1) * pulse.progress;
      const py = y1 + (y2 - y1) * pulse.progress;
      const pz = pulse.startNode.z + (pulse.endNode.z - pulse.startNode.z) * pulse.progress;
      
      const pScale = 600 / (600 + pz);

      ctx.beginPath();
      ctx.arc(px, py, 3.5 * pScale, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 20;
      ctx.shadowColor = pulse.startNode.color;
      ctx.globalAlpha = 0.8 * (1 - pz / 1000);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
    };

    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update and Draw Nodes/Connections
      nodes.forEach((node, i) => {
        // Move
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        // Wrap Logic
        if (node.x < -100) node.x = width + 100;
        if (node.x > width + 100) node.x = -100;
        if (node.y < -100) node.y = height + 100;
        if (node.y > height + 100) node.y = -100;
        if (node.z < 0 || node.z > 800) node.vz *= -1;

        const pScale = 600 / (600 + node.z);
        const opacity = (1 - node.z / 1000) * 0.5;

        // Draw Node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * pScale, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = opacity;
        ctx.fill();

        // Check Neighbors (Optimized range check)
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 220) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            const lineOpacity = (1 - dist / 220) * 0.15 * opacity;
            
            // Connection Gradient
            const grad = ctx.createLinearGradient(node.x, node.y, other.x, other.y);
            grad.addColorStop(0, node.color);
            grad.addColorStop(1, other.color);
            
            ctx.strokeStyle = grad;
            ctx.globalAlpha = lineOpacity;
            ctx.lineWidth = 0.8 * pScale;
            ctx.stroke();

            // Randomly trigger high-speed pulse
            if (Math.random() > 0.999 && pulses.length < 8) {
              pulses.push({
                startNode: node,
                endNode: other,
                progress: 0,
                speed: 0.008 + Math.random() * 0.015
              });
            }
          }
        }
      });

      // Process and render data pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.progress += pulse.speed;
        drawPulse(pulse);
        if (pulse.progress >= 1) {
          pulses.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0 opacity-50 dark:opacity-30 mix-blend-screen"
    />
  );
};