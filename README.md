# Scout

**Offline field coordination, powered by on-device AI.**

When teams operate in places where the internet is unreliable or absent, the people on the ground still need to make fast, shared decisions. Scout turns scattered, often-conflicting field reports into one clear recommendation per location — running the AI directly on local hardware, with no cloud and no connection to the outside world.

A capable device nearby (a laptop, a workstation) acts as a **base station**. Weaker devices in the field delegate the AI work to it over a direct, encrypted peer-to-peer link. If the base is unreachable, each device falls back to running the model locally. The result keeps working as conditions degrade — full connectivity, local-network-only, or fully offline.

Built for the [QVAC Unleash Edge AI Hackathon](https://qvac.tether.io). All inference runs through the QVAC SDK.

---

## What it does

- **Fuses field reports into one call.** Multiple people log what they see at a location, in plain words. Scout reconciles them — including contradictions — into a single actionable recommendation.
- **Runs AI on-device.** Inference uses Qwen3-1.7B through the QVAC SDK on CPU. No cloud, no API calls, no data leaving the hardware.
- **Delegates compute peer-to-peer.** A field device can borrow a stronger base station's compute over a direct encrypted P2P connection (Holepunch DHT), so low-power hardware gets fast AI it couldn't run alone.
- **Degrades gracefully.** Base reachable → delegate. Base gone → run locally. No internet at all → still runs locally on-device.

---

## Why it matters (the edge-AI case)

| Property | How Scout delivers it |
|---|---|
| **Privacy** | Reports and inference never leave local hardware. No cloud, no third party. |
| **Resilience** | Works across full connectivity, local-network-only, and fully offline. A dead base station degrades to local inference rather than failure. |
| **Cost** | Weak devices borrow one capable machine's compute instead of every device needing a datacenter or a paid API. |
| **Speed** | On-device fusion returns in ~5 seconds on CPU; no network round-trip to a remote provider. |

---

## Architecture

Scout uses a **star topology**: one base station, many field devices.  

field device ──┐
                   │  (P2P, encrypted, DHT discovery)
    field device ──┼──▶  BASE STATION  (runs the model)
                   │
    field device ──┘

- **Base station** (`provider.js`) — runs the QVAC provider, holds the model, serves delegated inference. Prints a public key on startup.
- **Field device** (`server.js` + `index.html`) — a small Node server that serves the web UI and runs fusion, either delegated to a base (when a provider key is supplied) or locally.
- **Data layer** (`db.js`) — local SQLite store for reports and recommendations.
- **Fusion** (`fusion.js`) — the prompt and logic that turn raw reports into one recommendation.

### Multiple independent teams

Separation is by **public key**. Each team runs its own base station, which has a unique key. A team's field devices point only at their own base's key, so multiple teams can operate on the same physical network without seeing each other's data — each base keeps its own store.

---

## Requirements

- **Node.js ≥ 22.17** (developed on v25)
- macOS, Linux, or Windows (desktop)
- A first-run internet connection to download npm packages and the model weights (~once; cached locally thereafter at `~/.qvac/models/`)

---

## Setup

```bash
git clone <your-repo-url>
cd scout
npm install
```

Seed some sample reports (optional, for a quick first look):

```bash
node seed.js
```

---

## Running it

Scout runs in two roles. For a single-machine demo, use two terminals.

### Local-only (one device, no base)

```bash
node server.js
```

Open **http://localhost:3000**. The banner shows *Base offline — running on this device*. All inference runs locally.

### Delegated (field device + base station)

**Terminal 1 — start the base station:**

```bash
node provider.js
```

It loads the model and prints a public key. Copy it.

**Terminal 2 — start the field device, pointed at that base:**

```bash
PROVIDER_KEY=<paste-the-key-here> node server.js
```

Open **http://localhost:3000**. The banner shows *Base station online — inference delegated*. Reports now fuse on the base station's compute over P2P.

### Seeing the fallback

With both running and the banner green, stop the base station (`Ctrl+C` in Terminal 1). Within a few seconds the banner turns amber on its own. Request a recommendation again — it still works, now tagged *Local*. This is the resilience path: the field device never stops working when the base disappears.

---

## Resilience: failure modes and what survives

| Situation | What happens |
|---|---|
| Base station online | Field device delegates inference to it over encrypted P2P. |
| Base station dies / out of range | Field device detects it (heartbeat fails) and runs the model locally. No interruption. |
| No internet, local network up | Devices discover each other over the local network; delegation still possible. Internet is not required. |
| No network at all | Each device runs fully offline on its own cached model. |
| Model already downloaded | No re-download needed; works with no connection. |

The system has no single point whose loss stops a field worker from getting a recommendation.

---

## Tech stack

- **[QVAC SDK](https://qvac.tether.io)** (`@qvac/sdk`) — all on-device inference and P2P
- **Qwen3-1.7B** (Q4, GGUF) — the language model, run on CPU
- **Holepunch DHT** (via QVAC) — peer discovery and direct encrypted connections
- **better-sqlite3** — local report storage
- **Node.js** + vanilla HTML/CSS/JS — server and UI

---

## Known limits (and what's next)

Scout deliberately ships a focused, working core. Honest boundaries of the current build:

- **Star, not mesh.** Field devices coordinate through a base, not directly with each other. A device that can't reach the base falls back to local — it doesn't route through a neighbor.
- **Delegation needs a shared network.** The base and field devices must share a local network (Wi-Fi/LAN) to discover each other. Fully air-gapped radio links (Bluetooth/Wi-Fi Direct) are not used; "offline" means no internet/cloud, not no network.
- **Text reports only.** No file or image input yet.

### Roadmap

- **Peer-to-peer mesh.** Devices relay through each other and gossip reports, removing the base as a single point and surviving any node's loss.
- **Document ingestion (PDF).** Pull recommendations that account for official advisories, permits, or briefings.
- **Mobile (Expo) build.** Run natively on phones, not just desktop.
- **Vision input.** Let the model reason over photos from the field.

---

## License

MIT © Christian. See [LICENSE](LICENSE).
