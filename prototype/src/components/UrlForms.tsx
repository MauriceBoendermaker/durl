import { useState } from 'react';
import { ethers } from 'ethers';
import abi from '../abi.json';
import { ShowToast } from './utils/ShowToast';
import { switchToGnosis, switchToSepolia} from 'utils/NetworkSwitcher';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS as string;
const PROJECT_URL = process.env.REACT_APP_PROJECT_URL as string;
const INFURIA_URL = process.env.REACT_APP_INFURA_URL as string;
const SEPOLIA_CHAIN_ID = '0xaa36a7';

const CRC_TOKEN_ADDRESS = '0xc15cbda9e25f98043facac170d74b569971293b2';
const CRC_PAYMENT_RECEIVER = '0x266c002fd57f76138daaf2c107202377e4c3b5a7';
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

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!validateInputUrl()) return;
        if (CRCVersion && !/^\/.*/.test(shortUrl)) {
            setUrlInvalid(true);
            ShowToast('Short URL must start with `/` (e.g., /custom)', 'danger');
            return;
        }

        if (!window.ethereum) {
            ShowToast('MetaMask not detected', 'danger');
            return;
        }

        try {
            setStatus('Requesting wallet access...');

            if (CRCVersion) {
                await switchToGnosis();
                setStatus('Requesting wallet access...');

                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const CirclesAddress = signer.getAddress();
                setStatus('Paying with CRC...');

                const erc20Abi = [
                    'function transfer(address to, uint256 amount) public returns (bool)',
                    'function decimals() public view returns (uint8)',
                ];
                const token = new ethers.Contract(CRC_TOKEN_ADDRESS, erc20Abi, signer);
                const decimals = await token.decimals();
                const amount = ethers.parseUnits(CRC_PAYMENT_AMOUNT, decimals);

                const transferTx = await token.transfer(CRC_PAYMENT_RECEIVER, amount);
                await transferTx.wait();

                ShowToast(`Paid ${CRC_PAYMENT_AMOUNT} CRC successfully.`, 'success');
            }

            setStatus('Switching to Sepolia...');
            await switchToSepolia();

            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            setStatus('Sending URL to blockchain...');
            const sepoliaProvider = new ethers.BrowserProvider(window.ethereum);
            const sepoliaSigner = await sepoliaProvider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, sepoliaSigner);

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
                        Custom CRC Link
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${!CRCVersion ? 'active' : ''}`}
                        onClick={() => setCRCVersion(false)}
                    >
                        Random Link
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
                        <input
                            type="text"
                            value={shortUrl}
                            onChange={(e) => {
                                setShortUrl(e.target.value);
                                setUrlInvalid(false);
                            }}
                            placeholder="Short URL (e.g. /customLink)"
                            className={`form-control mt-2 ${!/^\/.*/.test(shortUrl) ? 'is-invalid' : ''}`}
                        />
                    )}
                </div>
                <div className="button-group mt-3">
                    <button type="submit" className="btn btn-primary w-100">
                        Submit to Blockchain
                    </button>
                </div>
            </form>

            {status && <div className="alert alert-info mt-3">{status}</div>}
            {txHash && (
                <div className="mt-2">
                    <a
                        href={`https://sepolia.etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-light"
                    >
                        View on Etherscan
                    </a>
                </div>
            )}
        </div>
    );
}
