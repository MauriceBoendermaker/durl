import { createCirclesSdk } from "utils/CirclesConfig";
import { ethers } from 'ethers';

export async function CRCPaymentProvider(
    signer: ethers.Signer,
    CRC_PAYMENT_AMOUNT: string,
    CRC_PAYMENT_RECEIVER: string
) {
    try {
        const sdk = await createCirclesSdk();

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
    'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external',
    'function balanceOf(address account, uint256 id) view returns (uint256)',
    'function isApprovedForAll(address account, address operator) view returns (bool)',
    'function setApprovalForAll(address operator, bool approved) external'
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
    groupAvatarAddress: string, // tokenId (your CRC group)
    toAddress: string,          // recipient
    amount: string              // amount in CRC units (e.g. "5")
) {
    try {
        const senderAddress = await signer.getAddress();

        const tokenAddress = '0x3D61f0A272eC69d65F5CFF097212079aaFDe8267';

        const tokenId = BigInt(`0x${groupAvatarAddress.replace(/^0x/, '')}`);
        const intAmount = BigInt(amount);

        const contract = new ethers.Contract(tokenAddress, erc1155Abi, signer);

        const balance = await contract.balanceOf(senderAddress, tokenId);
        if (balance < intAmount) throw new Error(`Insufficient CRC balance: You have ${balance}, need ${intAmount}.`);

        const isApproved = await contract.isApprovedForAll(senderAddress, toAddress);
        if (!isApproved) {
            const approvalTx = await contract.setApprovalForAll(toAddress, true);
            await approvalTx.wait();
        }

        const tx = await contract.safeTransferFrom(
            senderAddress,
            toAddress,
            tokenId,
            intAmount,
            '0x'
        );

        await tx.wait();
        console.log(`Sent ${amount} CRC (tokenId=${tokenId}) from ${senderAddress} to ${toAddress}`);
        return tx;
    } catch (err) {
        console.error('CRC V2 Transfer failed:', err);
        throw err;
    }
}