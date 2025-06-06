import { useState } from 'react';
import { ethers } from 'ethers';
import abi from '../abi_xDAI.json';
import { ShowToast } from './utils/ShowToast';
import { switchToGnosis } from 'utils/NetworkSwitcher';
import { CRCPaymentProvider, sendV2GroupCRC } from 'contractMethods/CRCPaymentProvider';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS as string;

let CRC_PAYMENT_RECEIVER = '0x266C002fd57F76138dAAf2c107202377e4C3B5A7';

const CRC_PAYMENT_AMOUNT = '5';

export function UrlForms() {
    const [originalUrl, setOriginalUrl] = useState('');
    const [status, setStatus] = useState('');
    const [txHash, setTxHash] = useState('');
    const [generatedShortId, setGeneratedShortId] = useState('');
    const [urlInvalid, setUrlInvalid] = useState(false);
    const [CRCVersion, setCRCVersion] = useState(true);
    const [shortUrl, setShortUrl] = useState('');

    function isValidUrl(string: string) {
        try {
            new URL(string);
            return true;
        } catch {
            return false;
        }
    }

    function validateInputUrl() {
        if (!isValidUrl(originalUrl)) {
            setUrlInvalid(true);
            ShowToast('Please enter a valid URL (https://...)', 'danger');
            return false;
        }
        return true;
    }

    const [shortUrlExistsError, setShortUrlExistsError] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setShortUrlExistsError(false);
        if (!validateInputUrl()) return;

        if (CRCVersion && !/^\/.*/.test(shortUrl)) {
            setUrlInvalid(true);
            return;
        }

        if (!window.ethereum) {
            ShowToast('MetaMask not detected', 'danger');
            return;
        }

        try {
            setStatus('Switching to Gnosis...');
            await switchToGnosis();

            if (typeof window === 'undefined' || !window.ethereum) {
                ShowToast('MetaMask not detected. Please install MetaMask to continue.', 'danger');
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            if ((await signer.getAddress()) === CRC_PAYMENT_RECEIVER) {
                CRC_PAYMENT_RECEIVER = '0x4335b31e5747ad4678348589e44513ce39ea0466';
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

            if (CRCVersion) {
                const customId = shortUrl.slice(1);

                const exists = await contract.shortIdExists(customId);
                if (exists) {
                    setShortUrlExistsError(true);
                    return;
                }

                setStatus('Requesting wallet access...');
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });

                if (!accounts || accounts.length === 0) {
                    ShowToast('Please connect your wallet first using the button above.', 'danger');
                    return;
                }

                setStatus('Paying with CRC...');
                //const TxCRC = CRCPaymentProvider(signer, CRC_PAYMENT_AMOUNT, CRC_PAYMENT_RECEIVER);
                const TxCRC = await sendV2GroupCRC(
                    signer,
                    '0x4335b31e5747ad4678348589e44513ce39ea0466',
                    CRC_PAYMENT_RECEIVER,
                    CRC_PAYMENT_AMOUNT
                );
                ShowToast(`Paid ${CRC_PAYMENT_AMOUNT} CRC successfully.`, 'success');
                ShowToast(`CRC Transaction confirmed in block ${(await TxCRC).blockNumber}`, 'success');

                setStatus('Sending URL to blockchain...');
                const GasTx = await contract.createCustomShortUrl(customId, originalUrl);
                const receipt = await GasTx.wait();
                const iface = new ethers.Interface(abi);
                const parsedLog = receipt.logs
                    .map((log: { topics: string[]; data: string }) => {
                        try {
                            return iface.parseLog(log);
                        } catch {
                            return null;
                        }
                    })
                    .find((log: any) => log?.name === 'ShortUrlCreated');

                const shortId = parsedLog?.args?.shortId;
                setGeneratedShortId(shortId);
                setTxHash(receipt.hash);
                setStatus('Confirmed in block ' + receipt.blockNumber);
            } else {
                setStatus('Switching to Gnosis...');
                await switchToGnosis();

                setStatus('Requesting wallet access...');
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });

                if (!accounts || accounts.length === 0) {
                    ShowToast('Please connect your wallet first using the button above.', 'danger');
                    return;
                }

                setStatus('Sending URL to blockchain...');
                const tx = await contract.generateShortUrl(originalUrl);
                const receipt = await tx.wait();
                const iface = new ethers.Interface(abi);
                const parsedLog = receipt.logs
                    .map((log: { topics: string[]; data: string }) => {
                        try {
                            return iface.parseLog(log);
                        } catch {
                            return null;
                        }
                    })
                    .find((log: any) => log?.name === 'ShortUrlCreated');

                const shortId = parsedLog?.args?.shortId;
                setGeneratedShortId(shortId);
                setTxHash(receipt.hash);
                setStatus('Confirmed in block ' + receipt.blockNumber);

            }
        } catch (err: any) {
            if (err.code === 4001) {
                setStatus('Transaction was cancelled by the user.');
            } else {
                setStatus('Error: ' + (err.message || 'Unknown error'));
            }
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
                        Custom URL
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${!CRCVersion ? 'active' : ''}`}
                        onClick={() => setCRCVersion(false)}
                    >
                        Random
                    </button>
                </li>
            </ul>

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

                    {CRCVersion && (
                        <div className="input-group mt-3">
                            <span className="input-group-text">durl.dev/</span>
                            <input
                                type="text"
                                value={shortUrl}
                                onChange={(e) => {
                                    let value = e.target.value.trim();

                                    value = value.replace(/\s+/g, '-');

                                    value = value.replace(/[^a-zA-Z0-9_-]/g, '');

                                    if (!value.startsWith('/')) {
                                        value = '/' + value;
                                    }

                                    setShortUrl(value);
                                    setUrlInvalid(false);
                                    setShortUrlExistsError(false);
                                }}

                                placeholder="custom-link"
                                className={`form-control ${shortUrlExistsError || !/^\/.*/.test(shortUrl) ? 'is-invalid' : ''}`}
                            />
                        </div>
                    )}

                    {shortUrlExistsError && (
                        <div className="invalid-feedback d-block mt-1">
                            That short URL is already taken.
                        </div>
                    )}
                </div>
                <div className="button-group mt-3">
                    <button type="submit" className="btn btn-primary w-100">
                        Submit to Blockchain
                    </button>
                </div>

                <div className="price-disclaimer small mt-3">
                    {CRCVersion
                        ? 'Cost: 5 CRC + xDAI gas fee'
                        : 'Cost: only xDAI gas fee'}
                </div>
            </form>

            {status && <div className="alert alert-info mt-3">{status}</div>}
            {txHash && (
                <div className="mt-2">
                    <span>Your shortened URL: </span>
                    <a
                        href={`https://durl.dev/#/${generatedShortId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-light underline"
                    >
                        <br />
                        https://durl.dev/#/{generatedShortId}</a> points to {originalUrl}
                    <a
                        href={`https://gnosisscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-light"
                    >
                        <br />
                        View on GnosisScan
                    </a>

                </div>
            )}
        </div>
    );
}
