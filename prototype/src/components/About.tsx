import React from 'react';

function About() {
    return (
        <section className="about-container d-flex align-items-center justify-content-center min-vh-100">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 glass-card">
                        <h1 className="title-glow mb-4">About dURL</h1>
                        <p>
                            <strong>dURL</strong> is a decentralized, blockchain-based URL shortener hosted at <a className="btn-link" href="https://durl.dev" target="_blank" rel="noopener noreferrer">durl.dev</a>.
                            It is designed for users who want to shorten links in a trustless, permanent, and censorship-resistant way.
                        </p>
                        <p>
                            All data is stored on the Gnosis Chain using a public smart contract, ensuring transparency and immutability.
                            This project demonstrates how traditional web utilities can be reimagined using decentralized technology.
                        </p>
                        <p>
                            You retain complete control over your links, and no one can alter or remove them after creation.
                            MetaMask is required to interact with the system, and a small CRC token fee applies when creating custom links to introduce value into the Circles system, similar to NFTs.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default About;
