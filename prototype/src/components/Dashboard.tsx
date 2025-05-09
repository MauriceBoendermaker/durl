import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import abi from '../abi.json';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS as string;

function Dashboard() {
    const [account, setAccount] = useState('');
    const [links, setLinks] = useState<{ shortId: string; url: string }[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadLinks() {
            if (!window.ethereum) return;

            try {
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
            } catch (err: any) {
                console.error(err);
                setError('Unable to fetch your links. The contract may not support this operation.');
            }
        }

        loadLinks();
    }, []);

    return (
        <div className="container py-5">
            <h2 className="mb-4">Your Shortened Links</h2>
            <p>Connected wallet: {account}</p>
            {error && <div className="alert alert-danger">{error}</div>}
            <table className="table table-dark table-striped mt-4">
                <thead>
                    <tr>
                        <th>Short ID</th>
                        <th>Original URL</th>
                    </tr>
                </thead>
                <tbody>
                    {links.map((link, index) => (
                        <tr key={index}>
                            <td>{link.shortId}</td>
                            <td>{link.url}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Dashboard;
