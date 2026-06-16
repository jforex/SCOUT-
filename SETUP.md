# Scout — Setup Guide

This guide walks two people through running Scout together: one person runs the **base station** (the strong device that does the AI work), and one or more people run a **field device** (which borrows the base's compute, and falls back to running locally if the base disappears).

You can also run **both roles on a single machine** in two terminals — useful for testing on your own. That path is covered at the end.

---

## Before you start (everyone)

**1. Install Node.js (version 22.17 or newer).**

- **macOS:** download from [nodejs.org](https://nodejs.org), or with Homebrew: `brew install node`
- **Windows:** download the installer from [nodejs.org](https://nodejs.org) and run it
- **Linux:** use your distro's package manager, e.g. `sudo apt install nodejs npm` (Debian/Ubuntu), or [nodejs.org](https://nodejs.org)

Confirm it worked — in a terminal (Windows: use **PowerShell** or **Command Prompt**):

```
node --version
```

You should see `v22.17` or higher.

**2. Get the project.**

```
git clone https://github.com/jforex/SCOUT-.git
cd SCOUT-
```

**3. Install dependencies.**

```
npm install
```

This downloads everything, including the QVAC SDK. It may take a few minutes. Warnings are normal; wait for it to finish and return your prompt.

> **Note:** On first run, the AI model (~1 GB) downloads automatically and is cached locally. This is the only step that needs internet. After that, Scout runs with no internet connection.

**4. Network requirement.**

For a base + field-device setup across two machines, **both devices must be on the same Wi-Fi or local network** so they can find each other. They do **not** need internet access to the outside world — just a shared local network. (A single device running everything locally needs no network at all.)

---

## Role A — The Base Station

The base station holds the model and does the AI computation for field devices that connect to it.

**1. Start the base station:**

```
node provider.js
```

**2. Wait for it to load the model and print a public key**, shown inside a banner like this:

```
========================================
[PROVIDER] ONLINE. Public key:
a6cf8a8f08035f4c8d2951d4b69ee4473bbe823ac28aeae6cc6c2332d7f508d7
========================================
```

**3. Copy that public key and share it with your field-device users.** They need it to connect.

**4. Leave this terminal running.** Closing it (or pressing `Ctrl+C`) takes the base offline — which is exactly what triggers field devices to fall back to local mode.

> The public key is regenerated each time you start `provider.js`. If you restart the base, share the new key.

---

## Role B — The Field Device

The field device runs the Scout interface. When the base is reachable, it sends AI work to the base. When the base is gone, it runs the model locally instead.

**1. Start the field device, supplying the base station's public key.**

**macOS / Linux:**

```
PROVIDER_KEY=PASTE_BASE_KEY_HERE node server.js
```

**Windows (PowerShell):**

```
$env:PROVIDER_KEY="PASTE_BASE_KEY_HERE"; node server.js
```

**Windows (Command Prompt):**

```
set PROVIDER_KEY=PASTE_BASE_KEY_HERE
node server.js
```

Replace `PASTE_BASE_KEY_HERE` with the key the base station operator gave you.

**2. You should see:**

```
Scout running at http://localhost:3000
Delegation enabled (PROVIDER_KEY set).
```

`Delegation enabled` confirms the field device is set to use the base.

**3. Open the interface** in a browser:

```
http://localhost:3000
```

The banner at the top shows the status:
- **Green — "Base station online"**: AI work is being delegated to the base over an encrypted peer-to-peer link.
- **Amber — "Base offline"**: the base isn't reachable, so the model runs locally on this device.

**4. Use it:** log reports for a location, then press **Get call** to get one fused recommendation. The tag on each recommendation shows whether it was computed on the base (*Delegated to base*) or locally (*Local*).

---

## Seeing the resilience (the key demo)

With a field device connected to a live base (green banner):

1. Press **Get call** on a location — the recommendation comes back tagged **Delegated to base**.
2. On the base station machine, press `Ctrl+C` to stop it (simulating the base going offline or out of range).
3. Within a few seconds, the field device's banner turns **amber** on its own.
4. Press **Get call** again — it still works, now tagged **Local**. The field device kept working with no base and no internet.

This is the core idea: there is no single point of failure. When the strong device disappears, each device keeps working on its own.

---

## Running both roles on one machine (solo testing)

You don't need two computers to try Scout. Use two terminals on the same machine.

**Terminal 1 — base station:**

```
node provider.js
```

Copy the printed public key.

**Terminal 2 — field device:**

macOS / Linux:

```
PROVIDER_KEY=PASTE_KEY_HERE node server.js
```

Windows (PowerShell):

```
$env:PROVIDER_KEY="PASTE_KEY_HERE"; node server.js
```

Then open `http://localhost:3000`. Everything works exactly as the two-machine setup, with both roles running as separate processes on one computer.

**Local-only (no base at all):** just run `node server.js` with no key. The banner stays amber and all AI runs locally on that device.

---

## Troubleshooting

- **`EADDRINUSE: address already in use :::3000`** — another server is still running on port 3000. Stop it first:
  - macOS / Linux: `lsof -ti tcp:3000 | xargs kill -9`
  - Windows: find it with `netstat -ano | findstr :3000`, then `taskkill /PID <pid> /F`
- **Banner stays amber when you expected green** — confirm the base station is still running, that you used its *current* public key (it changes each restart), and that both machines are on the same network.
- **First run is slow** — the model is downloading (~1 GB, one time). Subsequent runs are fast and offline.
- **A scary red error appears when you stop the base** — this is expected. It's the field device detecting that the base is gone, right before it falls back to local mode.

---

## Platform notes

Scout has been developed and tested on **macOS**. The QVAC SDK targets macOS, Windows, and Linux, so the steps above apply across all three, but the Windows and Linux paths follow QVAC's documented cross-platform support rather than the author's direct testing. If you hit a platform-specific issue, please open an issue on the repository.
