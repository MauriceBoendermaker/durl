import { sdk } from "utils/CirclesConfig";
import { ethers } from 'ethers';


export async function CRCPaymentProvider(signer: ethers.Signer,
    CRC_PAYMENT_AMOUNT: string,
    CRC_PAYMENT_RECEIVER: string) {

    try {
        const senderAddress = await signer.getAddress();
        const avatar = await sdk.getAvatar(senderAddress as `0x${string}`);
        const process = await avatar.isTrustedBy(CRC_PAYMENT_RECEIVER as `0x${string}`);
        console.log("trust level: ", process);

        if (!process) {
            const trustReceipt = await avatar.trust(CRC_PAYMENT_RECEIVER as `0x${string}`);
        }

        const amount = ethers.parseUnits(CRC_PAYMENT_AMOUNT, 18);

        const transferTx = await avatar.transfer(
            CRC_PAYMENT_RECEIVER as `0x${string}`,
            amount);

        console.log('CRC Transaction confirmed in block ', transferTx.blockNumber);

        return transferTx;

    } catch (err) {
        console.error('Transfer failed:', err);
        throw err;
    }
}

const erc1155Abi = [
    'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external'
];

/**
 * Sends CRC tokens (ERC-1155) from a V2 group.
 * 
 * @param signer Ethers signer (already connected to wallet)
 * @param mintHandlerAddress The minting contract address (from AboutCircles group info)
 * @param groupAddress The group avatar address (used as token ID)
 * @param toAddress Recipient address
 * @param amount Number of tokens to send (as bigint or string)
 */
export async function sendV2GroupCRC(
    signer: ethers.Signer,
    mintHandlerAddress: string,
    groupAddress: string,
    toAddress: string,
    amount: bigint | string
) {
    try {
        const senderAddress = await signer.getAddress();
        const tokenId = BigInt(groupAddress.toLowerCase());
        const int_amount = BigInt(amount);

        const contract = new ethers.Contract(mintHandlerAddress, erc1155Abi, signer);
        const tx = await contract.safeTransferFrom(
            senderAddress,
            toAddress,
            tokenId,
            int_amount,
            '0x'
        );

        await tx.wait();
        console.log(`✅ Sent ${amount} CRC (ERC-1155) to ${toAddress}`);
        console.log('CRC Transaction confirmed in block ', tx.blockNumber);

        return tx;
    }
    catch (err) {
        console.error('Transfer failed:', err);
        throw err;
    }
}