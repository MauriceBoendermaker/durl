import { useState, useRef, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from '../abi.json';
import MouseDots from './misc/MouseDots';
import { QRCodeCanvas } from 'qrcode.react';
import { ShowToast } from './utils/ShowToast';
import handleQRModal from './ShortenPage'

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS as string;
const PROJECT_URL = process.env.REACT_APP_PROJECT_URL as string;

function UrlForms() {
    const [originalUrl, setOriginalUrl] = useState('');
    const [status, setStatus] = useState('');
    const [txHash, setTxHash] = useState('');
    const [generatedShortId, setGeneratedShortId] = useState('');
    const qrRef = useRef<HTMLCanvasElement | null>(null);
    const [qrUrl, setQrUrl] = useState('');
    const cardRef = useRef<HTMLDivElement | null>(null);
    const [urlInvalid, setUrlInvalid] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
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
        } catch (err) {
            if (err instanceof Error) {
                setStatus('Error: ' + err.message);
            } else {
                setStatus('An unknown error occurred.');
            }
        }
    }
    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <input
                    type="text"
                    value={originalUrl}
                    onChange={(e) => {
                        setOriginalUrl(e.target.value);
                        if (urlInvalid) setUrlInvalid(false);
                    }}
                    placeholder="Original URL (e.g. https://mauriceb.nl)"
                    className={`form-control ${urlInvalid ? 'is-invalid' : ''}`}
                    required
                />
            </div>
            <div className="button-group mt-3">
                <button type="submit" className="btn btn-primary">Submit to Blockchain</button>
                <button type="button" className="btn btn-outline-light px-4" onClick={handleQRModal}>
                    Generate QR Code
                </button>
            </div>
        </form>
    )
}