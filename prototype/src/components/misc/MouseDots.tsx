import { useEffect, useRef } from 'react';

function MouseDots() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const mouse = useRef({ x: 0, y: 0 });
    const dotsRef = useRef<{ x: number; y: number; vx: number; vy: number }[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d')!;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const dots = Array.from({ length: 40 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: Math.random() * 0.4 - 0.2,
            vy: Math.random() * 0.4 - 0.2,
        }));
        dotsRef.current = dots;

        const handleMouseMove = (e: MouseEvent) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
        };

        let lastRender = performance.now();

        const animate = (time: number) => {
            const delta = time - lastRender;
            if (delta < 16) {
                requestAnimationFrame(animate);
                return;
            }
            lastRender = time;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (const dot of dotsRef.current) {
                dot.x += dot.vx;
                dot.y += dot.vy;

                if (dot.x <= 0 || dot.x >= canvas.width) dot.vx *= -1;
                if (dot.y <= 0 || dot.y >= canvas.height) dot.vy *= -1;

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 160, 240, 0.8)';
                ctx.fill();
            }

            // Draw connections (less frequent, no shadows)
            for (let i = 0; i < dots.length; i++) {
                const a = dots[i];
                for (let j = i + 1; j < dots.length; j++) {
                    const b = dots[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < 6400) {
                        const alpha = 1 - Math.sqrt(distSq) / 80;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(255, 160, 240, ${alpha})`;
                        ctx.stroke();
                    }
                }

                // Mouse line (only draw if close enough)
                const dx = a.x - mouse.current.x;
                const dy = a.y - mouse.current.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < 22500) {
                    const alpha = 1 - Math.sqrt(distSq) / 150;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(mouse.current.x, mouse.current.y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.stroke();
                }
            }

            requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 1,
                pointerEvents: 'none',
            }}
        />
    );
}

export default MouseDots;
