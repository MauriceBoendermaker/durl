import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import abi from '../../abi.json';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS as string;
const INFURA_URL = process.env.REACT_APP_INFURA_URL as string;

function RedirectPage() {
    const { shortId } = useParams();

    useEffect(() => {
        if (!shortId) return;

        async function resolveRedirect() {
            console.log("Attempting to fetch with", { shortId, CONTRACT_ADDRESS });
            try {

                console.log("Extracted shortId:", shortId);
                console.log("Using Infura:", INFURA_URL);
                const provider = new ethers.JsonRpcProvider(INFURA_URL);
                const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

                const destination = await contract.getOriginalUrl(shortId);
                console.log("Resolved destination:", destination);

                if (!destination || destination.trim() === '') throw new Error("Empty result");
                window.location.href = destination;
            } catch (err) {
                console.error("Redirect failed:", err);
                window.location.href = '/faq';
            }
        }

        resolveRedirect();
    }, [shortId]);

    return <p>Redirecting...</p>;
}

export default RedirectPage;
