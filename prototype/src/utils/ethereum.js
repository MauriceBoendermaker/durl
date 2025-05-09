import { BrowserProvider } from 'ethers';

const provider = new BrowserProvider(window.ethereum);

export async function connectWallet() {
    try {
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        return signer.getAddress();
    } catch (error) {
        if (error.code === -32002) {
            alert('A MetaMask request is already pending. Please check your MetaMask extension.');
        } else {
            console.error(error);
        }
        return null;
    }
}
