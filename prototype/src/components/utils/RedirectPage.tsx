import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import abi from '../../abi_xDAI.json';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS as string;
const INFURA_URL = process.env.REACT_APP_INFURA_URL as string;

function RedirectPage() {
    const { shortId } = useParams() as { shortId: string };

    useEffect(() => {
        async function resolveRedirect() {
            console.log("Received shortId from route:", shortId);
            const id1 = shortId.startsWith('/') ? shortId.slice(1) : shortId;
            const id2 = shortId;

            try {
                const provider = new ethers.JsonRpcProvider(INFURA_URL);
                const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
                console.log("Connected to contract:", contract.address);

                let destination = '';
                try {
                    console.log("Trying with id1:", id1);
                    destination = await contract.getOriginalUrl(id1);
                    console.log("Result from id1:", destination);
                } catch (e) {
                    console.warn("First lookup failed, trying fallback...");
                }

                if (!destination || destination.trim() === '') {
                    console.log("Trying with id2:", id2);
                    destination = await contract.getOriginalUrl(id2);
                    console.log("Result from id2:", destination);
                }

                if (!destination || destination.trim() === '') {
                    throw new Error("Empty destination after both attempts");
                }

                window.location.href = destination;
            } catch (err) {
                console.error("Redirect failed:", err);
                window.location.href = '/';
            }
        }

        resolveRedirect();
    }, [shortId]);

    return <p>Redirecting...</p>;
}

export default RedirectPage;
