import { useEffect, useRef } from 'react';

function MouseDots() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const mouse = useRef({ x: 0, y: 0 });
    const dots: { x: number; y: number; vx: number; vy: number }[] = [];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d')!;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        for (let i = 0; i < 80; i++) {
            dots.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: Math.random() * 0.5 - 0.25,
                vy: Math.random() * 0.5 - 0.25,
            });
        }

        const handleMouseMove = (e: MouseEvent) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            dots.forEach((dot, i) => {
                dot.x += dot.vx;
                dot.y += dot.vy;

                if (dot.x <= 0 || dot.x >= canvas.width) dot.vx *= -1;
                if (dot.y <= 0 || dot.y >= canvas.height) dot.vy *= -1;

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 160, 240, 0.8)';
                ctx.shadowBlur = 8;
                ctx.shadowColor = 'rgba(255, 160, 240, 0.8)';
                ctx.fill();
                ctx.shadowBlur = 0;

                for (let j = i + 1; j < dots.length; j++) {
                    const dx = dot.x - dots[j].x;
                    const dy = dot.y - dots[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(dot.x, dot.y);
                        ctx.lineTo(dots[j].x, dots[j].y);
                        ctx.strokeStyle = `rgba(255, 160, 240, ${1 - dist / 100})`;
                        ctx.shadowBlur = 6;
                        ctx.shadowColor = 'rgba(255, 160, 240, 0.4)';
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }
                }

                const dx = dot.x - mouse.current.x;
                const dy = dot.y - mouse.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(dot.x, dot.y);
                    ctx.lineTo(mouse.current.x, mouse.current.y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / 150})`;
                    ctx.shadowBlur = 6;
                    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
            });

            requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        animate();

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
