import { useState, useRef, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from '../abi.json';
import MouseDots from './misc/MouseDots';
import { QRCodeCanvas } from 'qrcode.react';
import { ShowToast } from './utils/ShowToast';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS as string;
const PROJECT_URL = process.env.REACT_APP_PROJECT_URL as string;

declare global {
    interface Window {
        ethereum?: any;
    }
}

function ShortenPage() {
    const [originalUrl, setOriginalUrl] = useState('');
    const [status, setStatus] = useState('');
    const [txHash, setTxHash] = useState('');
    const [generatedShortId, setGeneratedShortId] = useState('');
    const qrRef = useRef<HTMLCanvasElement | null>(null);
    const [qrUrl, setQrUrl] = useState('');
    const [modalMouse, setModalMouse] = useState({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement | null>(null);
    const [urlInvalid, setUrlInvalid] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!validateInputUrl()) return;

        if (!window.ethereum) {
            alert('MetaMask not detected');
            return;
        }

        try {
            setStatus('');
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

            const tx = await contract.generateShortUrl(originalUrl);
            setStatus('Transaction sent, waiting for confirmation...');
            const receipt = await tx.wait();
            setTxHash(receipt.hash);

            const iface = new ethers.Interface(abi);
            const parsedLog = receipt.logs
                .map((log: { topics: ReadonlyArray<string>; data: string }) => {
                    try {
                        return iface.parseLog(log);
                    } catch {
                        return null;
                    }
                })
                .find((log: any) => log?.name === 'ShortUrlCreated');

            const shortId = parsedLog?.args?.shortId;
            setGeneratedShortId(shortId);
            setStatus('Confirmed in block ' + receipt.blockNumber);
        } catch (err: any) {
            console.log(err.code)
            if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
                ShowToast('Transaction was cancelled by the user.', 'danger');
            } else {
                setStatus('Error: ' + err.message);
            }
            

        }
    }

    function downloadQR() {
        const canvas = qrRef.current;
        if (!canvas) return;
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `${generatedShortId}.png`;
        a.click();
    }

    function isValidUrl(string: string) {
        let url;
        
        try {
          url = new URL(string);
        } catch (_) {
          return false;  
        }
      
        return true; //url.protocol === "http:" || url.protocol === "https:";
      }

    function validateInputUrl()
    {
        let validUrl = isValidUrl(originalUrl);

        if (!validUrl) {
            setUrlInvalid(true);
   
            ShowToast('Please enter a valid URL, including the protocol (e.g., https://example.com).', 'danger');
            return false;
        }

        return true;
    }

    function handleQRModal() {
        
        if (!validateInputUrl()) return;

        const fullUrl = `${PROJECT_URL}/#/${generatedShortId || 'preview'}`;
        setQrUrl(fullUrl);
        const modal = new (window as any).bootstrap.Modal(document.getElementById('qrModal'));
        modal.show();
    }

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        function handleDocumentMouseMove(e: MouseEvent) {
            const card = cardRef.current;
            if (!card) return;

            const { innerWidth, innerHeight } = window;
            const x = e.clientX / innerWidth - 0.5;
            const y = e.clientY / innerHeight - 0.5;

            const rotateX = y * -10;
            const rotateY = x * 10;

            card.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale(1.03)
            `;

            const glare = card.querySelector('.glare') as HTMLDivElement | null;
            if (glare) {
                const glareX = e.clientX / innerWidth * 100;
                const glareY = e.clientY / innerHeight * 100;
                glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.25), transparent 60%)`;
            }
        }

        function resetTilt() {
            if (card) {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
            }
        }

        document.addEventListener('mousemove', handleDocumentMouseMove);
        document.addEventListener('mouseleave', resetTilt);

        return () => {
            document.removeEventListener('mousemove', handleDocumentMouseMove);
            document.removeEventListener('mouseleave', resetTilt);
        };
    }, []);

    const fullShortUrl = `${PROJECT_URL}/#/${generatedShortId}`;

    return (
        <>
            <MouseDots />
            <section className="homepage-hero">
                <div className="container py-5">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 text-center">
                            <h1 className="title">Decentralized URL Shortener</h1>
                            <p className="subtitle-glow mb-5">Trustless. On-chain. Powered by Ethereum.</p>
                        </div>
                    </div>
                    <div className="row justify-content-center mt-5">
                        <div className="col-md-8 glass-card">
                            <h1 className="title-glow pb-4">Shorten a long link</h1>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        value={originalUrl}
                                        onChange={(e) => {
                                            setOriginalUrl(e.target.value);
                                            setUrlInvalid(false);
                                        }}
                                        placeholder="Original URL (e.g. https://aboutcircles.com/)"
                                        className={`form-control ${urlInvalid ? 'is-invalid' : ''}`}
                                        
                                    />
                                </div>
                                <div className="button-group mt-3">
                                    <button type="submit" className="btn btn-primary">Submit to Blockchain</button>
                                    {/* <button type="button" className="btn btn-outline-light px-4" onClick={handleQRModal}>
                                        Generate QR Code
                                    </button> */}
                                </div>
                            </form>
                            <div className="status mt-3">
                                {status && <p>{status}</p>}
                                {txHash && (
                                    <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                                        View on Etherscan
                                    </a>
                                )}
                                {generatedShortId && (
                                    <div className="mt-3 text-center">
                                        <strong>Your short link:</strong><br />
                                        <a href={fullShortUrl} target="_blank" rel="noopener noreferrer">{fullShortUrl}</a>
                                        <div className="mt-3">
                                            <QRCodeCanvas
                                                value={fullShortUrl}
                                                bgColor="#ffffff"
                                                fgColor="#000000"
                                                level="H"
                                                includeMargin={true}
                                                ref={qrRef}
                                            />
                                            <br />
                                            <button className="btn btn-outline-light mt-2" onClick={downloadQR}>
                                                Download QR Code
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div
                className="modal fade"
                id="qrModal"
                tabIndex={-1}
                aria-labelledby="qrModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div
                        ref={cardRef}
                        className="glare modal-content text-center text-white border-0 qr-card"
                        style={{
                            transform: `rotateX(${modalMouse.y * 10}deg) rotateY(${modalMouse.x * 15}deg)`,
                            background: `radial-gradient(circle at ${50 + modalMouse.x * 50
                                }% ${50 + modalMouse.y * 20}%, rgba(58,0,128,0.35), #111)`,
                            transition: 'transform 0.1s ease-out, background 0.3s ease',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '1.5rem',
                            boxShadow: '0 0 30px rgba(128,0,255,0.5), 0 0 10px rgba(0,255,255,0.3)'
                        }}
                    >
                        <div className="modal-header border-0">
                            <h5 className="modal-title w-100" id="qrModalLabel">QR Code</h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <QRCodeCanvas
                                value={qrUrl || `${PROJECT_URL}/#/example`}
                                size={200}
                                bgColor="#ffffff"
                                fgColor="#000000"
                                level="H"
                                includeMargin={true}
                                ref={qrRef}
                            />
                            <br />
                            <button className="btn btn-outline-light mt-3" onClick={downloadQR}>
                                Download QR Code
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ShortenPage;