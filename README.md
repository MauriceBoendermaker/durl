# Decentralized URL Shortener (xDAI / Gnosis / Circles)

This is a trustless, decentralized URL shortener built on the Gnosis Chain (formerly xDAI). It stores short links permanently on-chain and allows users to generate both random and custom short URLs, optionally protected by a CRC token payment to make it fair for everyone.

---

## Features

- Stores short links fully on-chain using a smart contract
- Supports both random and custom short link generation
- Custom links require a 5 CRC token payment
- Automatically generates QR codes for all shortened links
- View your personal link history by connecting your wallet
- Uses Gnosis Chain (low fees, fast confirmation times)
- Fully integrated with MetaMask

---

## How It Works

- The smart contract maps short slugs to full URLs.
- Random short links are created using a hash of the sender and original URL.
- Custom links require a payment of 5 CRC tokens to prevent spam and squatting.
- All interactions are handled via MetaMask and written to the Gnosis blockchain.
- The frontend is hosted at [https://durl.dev](https://durl.dev) and built with React + TypeScript.
- Layout is done with Bootstrap 5 framework and custom styling through SCSS.

---

## How to Use It

1. Visit [https://durl.dev](https://durl.dev)
2. Connect your MetaMask wallet
3. Paste your long URL
4. Choose between a random or custom short link
5. Submit the transaction
6. If using a custom link, 5 CRC tokens will be transferred from your wallet
7. Your short link and QR code will appear after confirmation

---

## Network Requirements

Make sure MetaMask is connected to Gnosis Chain:

```json
{
  "chainId": "0x64",
  "chainName": "Gnosis Chain",
  "nativeCurrency": {
    "name": "xDAI",
    "symbol": "xDAI",
    "decimals": 18
  },
  "rpcUrls": ["https://rpc.gnosischain.com"],
  "blockExplorerUrls": ["https://gnosisscan.io"]
}
```
---
