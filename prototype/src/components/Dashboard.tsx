import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import abi from '../abi.json';
import { ShowToast } from './utils/ShowToast';
import QRModal from './utils/QRModal';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS as string;
const PROJECT_URL = process.env.REACT_APP_PROJECT_URL as string;

function Dashboard() {
    const [account, setAccount] = useState('');
    const [links, setLinks] = useState<{ shortId: string; url: string }[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [qrTarget, setQrTarget] = useState<string | null>(null);

    useEffect(() => {
        async function loadLinks() {
            if (!window.ethereum) return;

            try {
                setLoading(true);
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const address = await signer.getAddress();
                setAccount(address);

                const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
                const shortIds: string[] = await contract.getUserLinks(address);

                const formatted = await Promise.all(
                    shortIds.map(async (shortId) => {
                        const url = await contract.getOriginalUrl(shortId);
                        return { shortId, url };
                    })
                );

                setLinks(formatted);
                setError('');
            } catch (err: any) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadLinks();
    }, []);

    function copyToClipboard(shortId: string) {
        const fullUrl = `${PROJECT_URL}/#/${shortId}`;
        navigator.clipboard.writeText(fullUrl);
        ShowToast('Copied to clipboard', 'success');
    }

    function downloadDashboardQR() {
        const canvas = document.querySelector('#dashboardQrModal canvas') as HTMLCanvasElement;
        if (!canvas || !qrTarget) return;

        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `${qrTarget.split('/').pop()}.png`;
        a.click();
    }

    return (
        <section className="dashboard-container">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-10 glass-card">
                        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                            <h2 className="title-glow m-0">Your Shortened Links</h2>
                            <span className="text-light small">Wallet: {account}</span>
                        </div>

                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center my-5">
                                <div className="spinner-border text-light" role="status" />
                                <p className="mt-3">Loading links...</p>
                            </div>
                        ) : links.length === 0 ? (
                            <div className="alert alert-danger">No links found for this wallet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-dark align-middle">
                                    <thead>
                                        <tr>
                                            <th>Short link</th>
                                            <th>Original URL</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {links.map((link) => {
                                            const shortUrl = `${PROJECT_URL}/#/${link.shortId}`;
                                            return (
                                                <tr key={link.shortId}>
                                                    <td>
                                                        <a
                                                            href={shortUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-light text-decoration-none"
                                                        >
                                                            <code>{link.shortId}</code>
                                                            &nbsp;
                                                            <i className="fas fa-external-link-alt small" />
                                                        </a>
                                                    </td>
                                                    <td style={{ wordBreak: 'break-all' }}>
                                                        <a
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-light text-decoration-none"
                                                        >
                                                            {link.url}
                                                            &nbsp;
                                                            <i className="fas fa-external-link-alt small" />
                                                        </a>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="d-flex justify-content-center gap-2 flex-wrap">
                                                            <button
                                                                className="btn btn-sm btn-outline-light"
                                                                onClick={() => copyToClipboard(link.shortId)}
                                                                title="Copy short link"
                                                            >
                                                                <i className="fas fa-copy" />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-light"
                                                                title="Show QR"
                                                                onClick={() => {
                                                                    setQrTarget(shortUrl);
                                                                    setTimeout(() => {
                                                                        const modal = new (window as any).bootstrap.Modal(document.getElementById('dashboardQrModal'));
                                                                        modal.show();
                                                                    }, 0);
                                                                }}
                                                            >
                                                                <i className="fas fa-qrcode" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {qrTarget && (
                <QRModal
                    id="dashboardQrModal"
                    qrValue={qrTarget}
                    onDownload={downloadDashboardQR}
                />
            )}
        </section>
    );
}

export default Dashboard;
