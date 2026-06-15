import {
  loadModel,
  completion,
  unloadModel,
  QWEN3_1_7B_INST_Q4,
} from "@qvac/sdk";
import { getReportsByLocation, saveRecommendation } from "./db.js";

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

export async function fuseLocation(modelId, location) {
  const reports = getReportsByLocation(location);
  if (reports.length === 0) {
    return { location, recommendation: "No reports for this location.", sourceIds: [] };
  }

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

  const result = completion({ modelId, history, stream: false });
  const raw = await result.text;
  const recommendation = stripThink(raw);

  const sourceIds = reports.map((r) => r.id);
  saveRecommendation({ location, text: recommendation, sourceIds });

  return { location, recommendation, sourceIds, reportCount: reports.length };
}

// Standalone test runner
async function main() {
  console.log("Loading model on CPU...");
  const modelId = await loadModel({
    modelSrc: QWEN3_1_7B_INST_Q4,
    modelType: "llm",
    modelConfig: { device: "cpu", ctx_size: 4096 },
  });
  console.log("Model loaded.\n");

  const locations = ["Market Road", "Main Road", "North Bridge"];
  for (const loc of locations) {
    console.log(`\n=== ${loc} ===`);
    const start = Date.now();
    const { recommendation, reportCount } = await fuseLocation(modelId, loc);
    console.log(`(fused ${reportCount} reports in ${((Date.now() - start) / 1000).toFixed(1)}s)`);
    console.log("→", recommendation);
  }

  await unloadModel({ modelId, clearStorage: false });
  console.log("\nDone.");
}

// Only run main() if this file is executed directly
if (process.argv[1] && process.argv[1].endsWith("fusion.js")) {
  main().catch((err) => {
    console.error("❌ ERROR:", err);
    process.exit(1);
  });
}