# Studium — Decentralized Learning on Shelby

> The first decentralized course platform built on [Shelby Protocol](https://shelby.xyz) and the [Aptos](https://aptoslabs.com) blockchain. Teachers upload courses, students pay in ShelbyUSD, and every enrollment is verified on-chain — forever.

**Live Demo:** [studium.vercel.app](https://studium.vercel.app) &nbsp;|&nbsp; **Network:** Shelby Testnet · Aptos

---

## What is Studium?

Studium is a decentralized alternative to Coursera and Udemy. Instead of a centralized platform that takes a cut of every sale, controls your content, and can shut you down at any time — Studium puts teachers and students in direct contact, with Shelby Protocol as the infrastructure.

- **Teachers** upload course files (video, PDF, audio, slides) directly to Shelby decentralized storage
- **Students** pay course prices in ShelbyUSD directly to the teacher — no middleman, no platform fee
- **Every enrollment** is recorded as an on-chain transaction on Aptos — a permanent, verifiable proof of education
- **Content lives forever** — stored on Shelby, not on a server that can be shut down

---

## Features

### For Students
- Browse courses by category (Web3, Programming, Design, Business, AI, Music)
- Search and filter the course catalog
- Connect Petra wallet and enroll with one click
- Pay in ShelbyUSD — payments go directly to the teacher
- On-chain enrollment certificate recorded on Aptos
- Access all course lessons after enrollment

### For Teachers
- Upload a course in 3 steps — Course Info → Lessons → Pricing
- Attach any file type per lesson: video, PDF, audio, or slides
- Set free or paid pricing in ShelbyUSD
- Course files stored on Shelby decentralized storage
- 100% of earnings go directly to your wallet

### Platform
- Real Petra wallet integration via `@aptos-labs/wallet-adapter-react`
- On-chain transaction signing for enrollments
- Shelby SDK integrated for decentralized file storage
- Geomi API key for Shelbynet access
- Fully responsive design

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Blockchain | Aptos (Shelbynet) |
| Storage | Shelby Protocol SDK |
| Wallet | Petra Wallet via Aptos Wallet Adapter |
| API Keys | Geomi (geomi.dev) |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js v18+
- [Petra Wallet](https://petra.app) browser extension
- A Geomi API key from [geomi.dev](https://geomi.dev) (select **Shelbynet** network)
- ShelbyUSD tokens from the [Shelby Discord](https://discord.gg/shelbyserves)

### Installation

```bash
# Clone the repo
git clone https://github.com/kakah4/studium.git
cd studium

# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env
```

Edit `.env` and add your Geomi API key:

```env
VITE_APTOS_API_KEY=your_geomi_api_key_here
VITE_SHELBY_NETWORK=testnet
```

```bash
# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

---

## Project Structure

```
studium/
├── src/
│   ├── App.tsx              # Main application — full UI and logic
│   ├── WalletProvider.tsx   # Aptos wallet adapter setup
│   ├── shelby.ts            # Shelby SDK integration
│   ├── config.ts            # Network and API configuration
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
├── .env.example             # Environment variables template
├── .npmrc                   # Legacy peer deps flag for Vercel
├── vite.config.ts           # Vite + Node polyfills config
└── README.md
```

---

## How It Works

### Enrollment Flow

```
Student connects Petra wallet
        ↓
Student clicks "Enroll Now"
        ↓
Petra popup — sign transaction
        ↓
Transaction recorded on Aptos (Shelbynet)
        ↓
Enrollment proof stored on-chain
        ↓
All course lessons unlocked
```

### Course Upload Flow

```
Teacher connects Petra wallet
        ↓
Fills in course info + lessons + price
        ↓
Files uploaded to Shelby decentralized storage
        ↓
Blob registered on Aptos via ShelbyBlobClient
        ↓
Petra popup — sign registration transaction
        ↓
Course appears in catalog
```

---

## Shelby SDK Integration

Studium uses the official `@shelby-protocol/sdk` for decentralized file storage:

```typescript
import {
  ShelbyClient,
  ShelbyBlobClient,
  generateCommitments,
  createDefaultErasureCodingProvider,
  expectedTotalChunksets
} from "@shelby-protocol/sdk/browser";
```

The SDK handles:
- **Erasure coding** — files are encoded for fault-tolerant storage
- **Blob registration** — on-chain commitment via `ShelbyBlobClient.createRegisterBlobPayload()`
- **RPC upload** — file data uploaded to the Shelby storage network
- **Download URLs** — permanent URLs for accessing stored files

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_APTOS_API_KEY` | Your Geomi API key (Shelbynet network) |
| `VITE_SHELBY_NETWORK` | Network — `testnet` |

Get your API key at [geomi.dev](https://geomi.dev) — create a new API resource, select **Shelbynet**, enable **Client usage**.

---

## Roadmap

- [x] Course catalog with search and filtering
- [x] Petra wallet integration
- [x] On-chain enrollment transactions
- [x] Teacher course upload form
- [x] Shelby SDK integration
- [x] Vercel deployment
- [ ] Real Shelby RPC file upload (in progress)
- [ ] ShelbyUSD payment processing
- [ ] On-chain certificate NFTs
- [ ] Student dashboard with enrolled courses
- [ ] Teacher earnings dashboard
- [ ] Course reviews and ratings

---

## Built With Shelby

Studium is a showcase of what's possible when you combine:

- **Shelby Protocol** for permanent, decentralized file storage
- **Aptos blockchain** for fast, cheap on-chain transactions
- **ShelbyUSD** for direct peer-to-peer payments between teachers and students

No AWS. No centralized database. No platform that can shut you down.

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## License

MIT

---

## Links

- **Live Demo:** [studium.vercel.app](https://studium.vercel.app)
- **Shelby Protocol:** [shelby.xyz](https://shelby.xyz)
- **Shelby Docs:** [docs.shelby.xyz](https://docs.shelby.xyz)
- **Geomi API:** [geomi.dev](https://geomi.dev)
- **Aptos:** [aptoslabs.com](https://aptoslabs.com)
- **Discord:** [discord.gg/shelbyserves](https://discord.gg/shelbyserves)

---

*Built by [kakah4](https://github.com/kakah4) on Shelby Testnet · Aptos*
