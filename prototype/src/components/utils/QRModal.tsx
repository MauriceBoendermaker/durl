import { useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRModalProps {
    id: string;
    qrValue: string;
    onDownload: () => void;
}

function QRModal({ id, qrValue, onDownload }: QRModalProps) {
    const cardRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        function handleMouseMove(e: MouseEvent) {
            if (!card) return;
            const { innerWidth, innerHeight } = window;
            const x = e.clientX / innerWidth - 0.5;
            const y = e.clientY / innerHeight - 0.5;
            const rotateX = y * -10;
            const rotateY = x * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
            
            const glare = card.querySelector('.glare') as HTMLDivElement | null;
            if (glare) {
                const glareX = e.clientX / innerWidth * 100;
                const glareY = e.clientY / innerHeight * 100;
                glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.02), transparent 60%)`;
            }
        }

        function reset() {
            if (card) {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
            }
        }

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', reset);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', reset);
        };
    }, []);

    return (
        <div
            className="modal fade"
            id={id}
            tabIndex={-1}
            aria-labelledby={`${id}Label`}
            aria-hidden="true"
        >
            <div className="modal-dialog modal-dialog-centered">
                <div
                    ref={cardRef}
                    className="modal-content text-center text-white border-0 qr-card"
                    style={{
                        background: 'radial-gradient(circle at center, rgba(58,0,128,0.35), #111)',
                        transition: 'transform 0.1s ease-out, background 0.3s ease',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '1.5rem',
                        boxShadow: '0 0 30px rgba(128,0,255,0.5), 0 0 10px rgba(0,255,255,0.3)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div className="glare position-absolute top-0 start-0 w-100 h-100" />
                    <div className="modal-header border-0">
                        <h5 className="modal-title w-100" id={`${id}Label`}>QR Code</h5>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <QRCodeCanvas
                            value={qrValue}
                            size={200}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            includeMargin={true}
                            level="H"
                        />
                        <br />
                        <button className="btn btn-outline-light mt-3" onClick={onDownload}>
                            Download QR Code
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QRModal;
