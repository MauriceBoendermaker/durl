import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Nav() {
    return (
        <nav className="navbar navbar-expand-lg">
            <div className="container">
                <div className="row justify-content-center w-100">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <Link className="navbar-brand" to="/">dURL <small>//dev</small></Link>
                            <button
                                className="navbar-toggler"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#navbarNav"
                            >
                                <span className="navbar-toggler-icon" />
                            </button>
                            <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                                <ul className="navbar-nav align-items-center">
                                    <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                                    <li className="nav-item"><Link className="nav-link" to="/faq">FAQ</Link></li>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
