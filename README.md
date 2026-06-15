# PromptoHub

**A decentralized AI prompt marketplace built on Shelby + Aptos Testnet.**

Anyone can connect their Petra wallet, upload their best AI prompts, set a price, and earn ShelbyUSD directly every time someone pays to unlock them. Every transaction is cryptographically verified on-chain.

---

## Live Demo

🔗 [promptohub.vercel.app](https://shelby-ai-prompt-marketplace.vercel.app)

---

## What it does

- **Browse** a marketplace of AI prompts (Midjourney, ChatGPT, Claude, Stable Diffusion and more)
- **Connect** your Petra wallet on Shelby Testnet with one click
- **Upload** your own prompts, set your own price, earn ShelbyUSD directly
- **Pay to unlock** any prompt — every unlock is recorded on Aptos with on-chain proof
- **Download** unlocked prompts as `.txt` files

---

## Why Shelby

Shelby is Web3's first decentralized hot storage protocol — built for real-time, read-heavy workloads like AI data distribution. PromptoHub uses Shelby's paid reads and verifiable storage to turn AI prompts into ownable, monetizable on-chain assets. Every read is cryptographically provable and every creator earns directly from their work.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Storage & Reads | Shelby Protocol (Aptos Testnet) |
| Blockchain | Aptos — 30k+ TPS, sub-50ms coordination |
| Wallet | Petra Wallet (Shelbynet) |
| Frontend | HTML, Tailwind CSS, Vanilla JS |
| Hosting | Vercel |

---

## Screenshots

> Coming after Early Access approval — first real upload and pay-to-read flow

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/kakah4/shelby-ai-prompt-marketplace.git
cd shelby-ai-prompt-marketplace

# Open in browser (no build step needed)
open index.html
```

To use with real Shelby uploads:

1. Install [Petra Wallet](https://petra.app) and switch to Shelby Testnet
2. Get test tokens from the [Shelby faucet](https://docs.shelby.xyz/apis/faucet/shelbyusd)
3. Add your `SHELBY_API_KEY` to `.env` (see `.env.example`)

---

## Roadmap

- [x] Wallet connect (Petra + Shelby Testnet)
- [x] Browse and search marketplace
- [x] Upload form with category and pricing
- [x] Pay-to-unlock modal with on-chain proof badge
- [x] Download unlocked prompts
- [ ] Real Shelby SDK upload (pending Early Access)
- [ ] Real ShelbyUSD micropayment on unlock
- [ ] Creator dashboard with earnings history
- [ ] Token-gated prompt collections
- [ ] AI agent integration via Shelby MCP server

---

## Official Links

- Shelby Website: [shelby.xyz](https://shelby.xyz)
- Shelby Docs: [docs.shelby.xyz](https://docs.shelby.xyz)
- Discord: [discord.gg/shelbyserves](https://discord.gg/shelbyserves)
- Aptos: [aptoslabs.com](https://aptoslabs.com)

---

Built by [@kakah4](https://github.com/kakah4) · Proof of work for Shelby Early Access · March 2026
