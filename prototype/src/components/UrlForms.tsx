import { useState, useRef, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from '../abi.json';
import { ShowToast } from './utils/ShowToast';
import {sdk} from './../utils/CirclesConfig'
import { Address } from '@circles-sdk/utils';


const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS as string;
const PROJECT_URL = process.env.REACT_APP_PROJECT_URL as string;

export function UrlForms() {
    const [originalUrl, setOriginalUrl] = useState('');
    const [status, setStatus] = useState('');
    const [txHash, setTxHash] = useState('');
    const [generatedShortId, setGeneratedShortId] = useState('');
    const qrRef = useRef<HTMLCanvasElement | null>(null);
    const cardRef = useRef<HTMLDivElement | null>(null);
    const [urlInvalid, setUrlInvalid] = useState(false);
    const [CRCVersion, setCRCVersion] = useState(true);
    const [shortUrl, setShortUrl] = useState('');

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
        if (CRCVersion && !/^\/.*/.test(shortUrl)){
            setUrlInvalid(true);
            ShowToast('Please enter a valid short URL, starting with /, e.g. /custom', 'danger');
            return;
        }

        if (!window.ethereum) {
            alert('MetaMask not detected');
            return;
        }

        try {
            setStatus('');
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const userAddress = await signer.getAddress();
            const avatar = await sdk.getAvatar(userAddress as Address);
            console.log('avatar info: ' + avatar.avatarInfo);


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
        <div>
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <button
                        className={`nav-link ${CRCVersion ? 'active' : ''}`}
                        onClick={() => setCRCVersion(true)}
                    >
                        custom CRC link
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${!CRCVersion ? 'active' : ''}`}
                        onClick={() => setCRCVersion(false)}
                    >
                        Random link
                    </button>
                </li>
            </ul>

            {!CRCVersion && (
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
            </form>)}

            {CRCVersion && (
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

                    <input
                        type="text"
                        value={shortUrl}
                        onChange={(e) => {
                            setShortUrl(e.target.value);
                            setUrlInvalid(false);
                        }}
                        placeholder="Short Url (e.g. /customUrl)"
                        className={`form-control ${/^\/.*/.test(shortUrl) ? 'is-invalid' : ''}`}
                    />
                </div>
                <div className="button-group mt-3">
                    <button type="submit" className="btn btn-primary">Submit to Blockchain</button>
                    {/* <button type="button" className="btn btn-outline-light px-4" onClick={handleQRModal}>
                                        Generate QR Code
                                    </button> */}
                </div>
            </form>)}

        </div>
    )
}