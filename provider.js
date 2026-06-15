import {
  loadModel,
  startQVACProvider,
  QWEN3_1_7B_INST_Q4,
} from "@qvac/sdk";

async function main() {
  console.log("[PROVIDER] Loading model on CPU (this device does the heavy lifting)...");

  await loadModel({
    modelSrc: QWEN3_1_7B_INST_Q4,
    modelType: "llm",
    modelConfig: { device: "cpu", ctx_size: 4096 },
  });

  console.log("[PROVIDER] Model loaded. Starting provider service...");

  const result = await startQVACProvider({});

  if (!result.success) {
    console.error("[PROVIDER] Failed to start:", result.error);
    process.exit(1);
  }

  console.log("\n========================================");
  console.log("[PROVIDER] ONLINE. Public key:");
  console.log(result.publicKey);
  console.log("========================================");
  console.log("\nCopy that public key into consumer.js, then run it in another terminal.");
  console.log("Leave this terminal running. Ctrl+C to stop (simulates the base going offline).\n");

  // Keep the process alive so it keeps serving
  setInterval(() => {}, 1 << 30);
}

main().catch((err) => {
  console.error("❌ [PROVIDER] ERROR:", err);
  process.exit(1);
});