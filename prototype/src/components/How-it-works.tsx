import React from 'react';

function HowItWorks() {
    return (
        <section className="how-it-works-container d-flex align-items-center justify-content-center min-vh-100">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8 glass-card">
                        <h1 className="title-glow mb-4">How it works</h1>
                        <p>
                            The Decentralized URL Shortener is built to store and manage links fully on-chain.
                            It uses a smart contract deployed on Gnosis Chain to create permanent, tamper-proof, and publicly verifiable short URLs.
                        </p>
                        <ul>
                            <li>Random links are generated using a keccak256 hash of the sender address, original URL, and timestamp.</li>
                            <br />
                            <li>Custom links require a 5 CRC token payment and are reserved by the slug you choose.</li>
                            <br />
                            <li>Links are stored in a public smart contract and can be resolved by anyone using the short ID.</li>
                            <br />
                            <li>The front-end at <a className="btn-link" href="https://durl.dev" target="_blank" rel="noopener noreferrer">durl.dev</a> interacts with the chain via MetaMask and ethers.js.</li>
                            <br />
                            <li>Styling is handled using Bootstrap 5 and custom SCSS.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HowItWorks;
