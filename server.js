import http from "http";
import { readFile } from "fs/promises";
import {
  loadModel,
  completion,
  unloadModel,
  heartbeat,
  QWEN3_1_7B_INST_Q4,
} from "@qvac/sdk";
import {
  addReport,
  getReportsByLocation,
  getDistinctLocations,
  getAllReports,
  saveRecommendation,
} from "./db.js";

// Paste the provider.js public key here to enable delegation (optional):
const PROVIDER_KEY = process.env.PROVIDER_KEY || "";

const SYSTEM_PROMPT = `You are a field coordination assistant for workers operating with no internet access.
You receive multiple raw field reports about a single location, possibly from different people and possibly contradictory.
Your job: fuse them into ONE clear, actionable recommendation.

Rules:
- Resolve contradictions by reasoning about them (e.g. "trucks can't pass" + "bikes get through" = passable for small vehicles only).
- Be concise: 1-2 sentences maximum.
- State the actionable decision first, then the key caveat.
- Do not invent details not present in the reports.
- Output ONLY the recommendation. No preamble, no labels.

/no_think`;

function stripThink(text) {
  return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

async function providerOnline() {
  if (!PROVIDER_KEY) return false;
  try {
    await heartbeat({ delegate: { providerPublicKey: PROVIDER_KEY, timeout: 3000 } });
    return true;
  } catch {
    return false;
  }
}

async function fuse(location) {
  const reports = getReportsByLocation(location);
  if (reports.length === 0) return { recommendation: "No reports yet for this location.", mode: "none", seconds: 0, reports: [] };

  const online = await providerOnline();
  const loadOpts = {
    modelSrc: QWEN3_1_7B_INST_Q4,
    modelType: "llm",
    modelConfig: { device: "cpu", ctx_size: 4096 },
  };
  if (online) loadOpts.delegate = { providerPublicKey: PROVIDER_KEY, fallbackToLocal: true };

  const modelId = await loadModel(loadOpts);

  const reportBlock = reports.map((r, i) => `Report ${i + 1} (from ${r.source_device}): ${r.text}`).join("\n");
  const history = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Location: ${location}\n\nField reports:\n${reportBlock}\n\nFused recommendation:` },
  ];

  const start = Date.now();
  const result = completion({ modelId, history, stream: false });
  const recommendation = stripThink(await result.text);
  const seconds = ((Date.now() - start) / 1000).toFixed(1);

  saveRecommendation({ location, text: recommendation, sourceIds: reports.map((r) => r.id) });
  await unloadModel({ modelId, clearStorage: false });

  return { recommendation, mode: online ? "delegated" : "local", seconds, reports };
}

function json(res, code, data) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/") {
      const html = await readFile(new URL("./index.html", import.meta.url));
      res.writeHead(200, { "Content-Type": "text/html" });
      return res.end(html);
    }

    if (req.method === "GET" && req.url === "/api/state") {
      const locations = getDistinctLocations();
      const online = await providerOnline();
      return json(res, 200, { locations, online, reports: getAllReports() });
    }

    if (req.method === "POST" && req.url === "/api/report") {
      let body = "";
      for await (const chunk of req) body += chunk;
      const { location, text } = JSON.parse(body);
      if (!location || !text) return json(res, 400, { error: "Location and report text are both required." });
      addReport({ location: location.trim(), text: text.trim(), sourceDevice: "field-device" });
      return json(res, 200, { ok: true });
    }

    if (req.method === "POST" && req.url === "/api/fuse") {
      let body = "";
      for await (const chunk of req) body += chunk;
      const { location } = JSON.parse(body);
      const result = await fuse(location);
      return json(res, 200, result);
    }

    json(res, 404, { error: "Not found" });
  } catch (err) {
    console.error("Server error:", err);
    json(res, 500, { error: String(err.message || err) });
  }
});

server.listen(3000, () => {
  console.log("MeshScout running at http://localhost:3000");
  console.log(PROVIDER_KEY ? "Delegation enabled (PROVIDER_KEY set)." : "No PROVIDER_KEY — running local-only. Set PROVIDER_KEY env var to enable base delegation.");
});