import {
  loadModel,
  completion,
  unloadModel,
  heartbeat,
  QWEN3_1_7B_INST_Q4,
} from "@qvac/sdk";
import { getReportsByLocation, saveRecommendation } from "./db.js";

// ⚠️ PASTE the public key printed by provider.js here:
const PROVIDER_KEY =
  "cfb4c3913c333e035371f20797c73ed72c3e93a4b0d73d33e22db4308654205c";

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
  try {
    await heartbeat({
      delegate: { providerPublicKey: PROVIDER_KEY, timeout: 3000 },
    });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const location = "Market Road";
  console.log(`[FIELD] Need a recommendation for: ${location}`);

  console.log("[FIELD] Checking if base station is reachable...");
  const online = await providerOnline();

  let modelId;
  if (online) {
    console.log("[FIELD] ✅ Base ONLINE — delegating inference to base station.");
    modelId = await loadModel({
      modelSrc: QWEN3_1_7B_INST_Q4,
      modelType: "llm",
      modelConfig: { device: "cpu", ctx_size: 4096 },
      delegate: {
        providerPublicKey: PROVIDER_KEY,
        fallbackToLocal: true,
      },
    });
  } else {
    console.log("[FIELD] ⚠️ Base OFFLINE — running inference locally on this device.");
    modelId = await loadModel({
      modelSrc: QWEN3_1_7B_INST_Q4,
      modelType: "llm",
      modelConfig: { device: "cpu", ctx_size: 4096 },
    });
  }

  const reports = getReportsByLocation(location);
  const reportBlock = reports
    .map((r, i) => `Report ${i + 1} (from ${r.source_device}): ${r.text}`)
    .join("\n");

  const history = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Location: ${location}\n\nField reports:\n${reportBlock}\n\nFused recommendation:`,
    },
  ];

  console.log("[FIELD] Fusing reports...\n");
  const start = Date.now();
  const result = completion({ modelId, history, stream: false });
  const recommendation = stripThink(await result.text);
  const secs = ((Date.now() - start) / 1000).toFixed(1);

  saveRecommendation({
    location,
    text: recommendation,
    sourceIds: reports.map((r) => r.id),
  });

  console.log(`=== ${location} (${online ? "DELEGATED to base" : "LOCAL"}, ${secs}s) ===`);
  console.log("→", recommendation);

  await unloadModel({ modelId, clearStorage: false });
  console.log("\n[FIELD] Done.");
}

main().catch((err) => {
  console.error("❌ [FIELD] ERROR:", err);
  process.exit(1);
});