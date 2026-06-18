// ── Polaris — Test Runner ─────────────────────────────────────────────────────
// Run with: npm test (from packages/polaris/)
// Requires: OPENAI_API_KEY (or CLAUDE_API_KEY) in .env at repo root

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AZURE_COMPUTERVISION_OCR_SUBSCRIPTION_KEY =
  process.env.AZURE_COMPUTERVISION_OCR_SUBSCRIPTION_KEY;
const AZURE_COMPUTERVISION_OCR_ENDPOINT =
  process.env.AZURE_COMPUTERVISION_OCR_ENDPOINT;

import "dotenv/config";
import { Polaris } from "../src/polaris";
import { PolarisRunConfig } from "../src/types";
import { netherlandsConfig } from "./mocks";

const polaris = new Polaris();

polaris.config({
  ai: {
    aiProvider: "openai",
    aiProviderApiKey: OPENAI_API_KEY!,
    aiModel: "gpt-4o-mini",
  },
  ocr: {
    azureOcrSubscriptionKey: AZURE_COMPUTERVISION_OCR_SUBSCRIPTION_KEY!,
    azureOcrEndpoint: AZURE_COMPUTERVISION_OCR_ENDPOINT!,
  },
});

const runConfig: PolarisRunConfig = netherlandsConfig;

async function main() {
  try {
    await polaris.run(runConfig);
  } catch (error) {
    console.error(
      "❌ Test failed:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

main();
