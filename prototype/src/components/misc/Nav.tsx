import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShowToast } from '../utils/ShowToast';

export default function Nav() {
    const [isConnected, setIsConnected] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
                if (accounts.length > 0) setIsConnected(true);
            });

            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                setIsConnected(accounts.length > 0);
            });
        }
    }, []);

    async function connectWallet() {
        if (!window.ethereum) {
            ShowToast('MetaMask not detected', 'danger');
            return;
        }

        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            ShowToast('Wallet connected successfully!', 'success');
            setIsConnected(true);
        } catch {
            ShowToast('Connection rejected.', 'danger');
        }
    }

    return (
        <>
            <div className="navbar-container">
                <nav className="navbar navbar-expand-lg">
                    <div className="container">
                        <div className="row justify-content-center w-100">
                            <div className="col-12">
                                <div className="d-flex justify-content-between align-items-center w-100">
                                    <Link className="navbar-brand" to="/">dURL <small>//dev</small></Link>
                                    <button
                                        className="navbar-toggler"
                                        type="button"
                                        onClick={() => setSidebarOpen(!sidebarOpen)}
                                    >
                                        <span className="navbar-toggler-icon" />
                                    </button>
                                    <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                                        <ul className="navbar-nav align-items-center">
                                            <li className="nav-item">
                                                <NavLink to="/" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                                                    Home
                                                </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink to="/how-it-works" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                                                    How it works
                                                </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink to="/about" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                                                    About
                                                </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                {!isConnected ? (
                                                    <button className="btn btn-outline-light ms-3" onClick={connectWallet}>
                                                        Connect Wallet
                                                    </button>
                                                ) : (
                                                    <NavLink to="/dashboard" className={({ isActive }) => 'btn btn-outline-light ms-4' + (isActive ? ' active' : '')}>
                                                        Dashboard
                                                    </NavLink>
                                                )}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>

            {sidebarOpen && (
                <>
                    <div className="mobile-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
                    <div className="mobile-sidebar">
                        <div className="sidebar-content">
                            <button className="close-btn" onClick={() => setSidebarOpen(false)}>&times;</button>
                            <NavLink to="/" className="nav-link" onClick={() => setSidebarOpen(false)}>Home</NavLink>
                            <NavLink to="/how-it-works" className="nav-link" onClick={() => setSidebarOpen(false)}>How it works</NavLink>
                            <NavLink to="/about" className="nav-link" onClick={() => setSidebarOpen(false)}>About</NavLink>
                            {!isConnected ? (
                                <button className="btn btn-outline-light mt-3" onClick={() => { connectWallet(); setSidebarOpen(false); }}>
                                    Connect Wallet
                                </button>
                            ) : (
                                <NavLink to="/dashboard" className="btn-link" onClick={() => setSidebarOpen(false)}>
                                    Dashboard
                                </NavLink>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
