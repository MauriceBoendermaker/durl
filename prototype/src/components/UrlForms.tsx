import { useState, useRef, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from '../abi.json';
import MouseDots from './misc/MouseDots';
import { QRCodeCanvas } from 'qrcode.react';
import { ShowToast } from './utils/ShowToast';
import handleQRModal from './ShortenPage'

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS as string;
const PROJECT_URL = process.env.REACT_APP_PROJECT_URL as string;

export function UrlForms() {
    const [originalUrl, setOriginalUrl] = useState('');
    const [status, setStatus] = useState('');
    const [txHash, setTxHash] = useState('');
    const [generatedShortId, setGeneratedShortId] = useState('');
    const qrRef = useRef<HTMLCanvasElement | null>(null);
    const [qrUrl, setQrUrl] = useState('');
    const cardRef = useRef<HTMLDivElement | null>(null);
    const [urlInvalid, setUrlInvalid] = useState(false);

    function isValidUrl(string: string) {
        let url;

        try {
            url = new URL(string);
        } catch (_) {
            return false;
        }

        return true; //url.protocol === "http:" || url.protocol === "https:";
    }

    function validateInputUrl() {
        let validUrl = isValidUrl(originalUrl);

        if (!validUrl) {
            setUrlInvalid(true);

            ShowToast('Please enter a valid URL, including the protocol (e.g., https://example.com).', 'danger');
            return false;
        }

        return true;
    }

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

            if (err.code === 4001) {
                setStatus('Transaction was cancelled by the user.');
            }

            setStatus('Error: ' + err.message);

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
    )
}