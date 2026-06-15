import {
  loadModel,
  completion,
  unloadModel,
  QWEN3_1_7B_INST_Q4,
} from "@qvac/sdk";

async function main() {
  console.log("Loading Qwen3-1.7B on CPU...");

  const modelId = await loadModel({
    modelSrc: QWEN3_1_7B_INST_Q4,
    modelType: "llm",
    modelConfig: {
      device: "cpu",
      ctx_size: 4096,
    },
    onProgress: (p) => {
      if (p && typeof p.percentage === "number") {
        process.stdout.write(`\rLoading: ${p.percentage.toFixed(1)}%   `);
      }
    },
  });

  console.log(`\nModel loaded. ID: ${modelId}`);
  console.log("\n--- MODEL OUTPUT ---");

  const history = [
    {
      role: "user",
      content: "Say hello in one short sentence and confirm you are running locally.",
    },
  ];

  const result = completion({ modelId, history, stream: true });

  for await (const token of result.tokenStream) {
    process.stdout.write(token);
  }

  console.log("\n--- END ---");

  await unloadModel({ modelId, clearStorage: false });
  console.log("Done. Model unloaded.");
}

main().catch((err) => {
  console.error("❌ ERROR:", err);
  process.exit(1);
});