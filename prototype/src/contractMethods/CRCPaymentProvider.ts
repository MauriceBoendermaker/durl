import { sdk } from "utils/CirclesConfig";
import { ethers } from 'ethers';

export async function CRCPaymentProvider(sdk: Sdk, recipient: string, amount: string){
    try {

    const senderAddress = await sdk.signer.getAddress();

   
    const avatar = await sdk.getAvatar(senderAddress as Address);

  
    const tokenContract = avatar.token;


    const decimals = await tokenContract.decimals();
    const parsedAmount = ethers.parseUnits(amount, decimals);


    const tx = await tokenContract.transfer(recipient, parsedAmount);
    console.log('Transaction sent:', tx.hash);


    const receipt = await tx.wait();
    console.log('Transaction confirmed in block', receipt.blockNumber);

    return receipt;

  } catch (err) {
    console.error('Transfer failed:', err);
    throw err;
  }

}