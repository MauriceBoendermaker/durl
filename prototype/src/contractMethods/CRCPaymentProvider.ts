import { sdk } from "utils/CirclesConfig";
import { ethers } from 'ethers';
import { Avatar, AvatarInterface } from "@circles-sdk/sdk";


export async function CRCPaymentProvider(signer: ethers.Signer,
  CRC_PAYMENT_AMOUNT: string,
  CRC_PAYMENT_RECEIVER: string){

    try {

    const senderAddress = await signer.getAddress();
    const avatar = await sdk.getAvatar(senderAddress as `0x${string}`);

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