## Main motivation
In a world where centralized platforms silently censor, alter, or erase content, we're building a censorship-resistant future — one short link at a time.

This isn't just a regular web utility. It's a tool for digital sovereignty.

Every link you create is immutable, verifiable, and yours — secured by the blockchain, owned by your wallet, and free from corporate interference.

Whether you're a journalist, whistleblower, activist, or just someone who believes the web should be open and permanent, this is your infrastructure.

No gatekeepers. No takedowns. Just truth, trust, and transparency.

Owning short links is made equally accessible for anyone, by leveraging Circles trust groups, where users can equally mint tokens.

# Decentralized URL Shortener (xDAI / Gnosis / Circles)

This is a trustless, decentralized URL shortener built on the Gnosis Chain (formerly xDAI). It stores short links permanently on-chain and allows users to generate both random and custom short URLs, optionally protected by a CRC token payment. Since CRC is an equally mintable token for everyone, it is a fair alternitive to other forms of currency.

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