// ── Polaris — Test Runner ─────────────────────────────────────────────────────
// Run with: npm test (from packages/polaris/)
// Requires: OPENAI_API_KEY (or CLAUDE_API_KEY) in .env at repo root

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AZURE_COMPUTERVISION_OCR_SUBSCRIPTION_KEY =
  process.env.AZURE_COMPUTERVISION_OCR_SUBSCRIPTION_KEY;
const AZURE_COMPUTERVISION_OCR_ENDPOINT =
  process.env.AZURE_COMPUTERVISION_OCR_ENDPOINT;

const AZURE_OPENAI_API_ENDPOINT = process.env.AZURE_OPENAI_API_ENDPOINT;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_API_MODEL = "gpt-4o";
const AZURE_OPENAI_API_VERSION = "2025-01-01-preview";

import "dotenv/config";
import { Polaris } from "../src/polaris";
import { PolarisRunConfig } from "../src/types";
import { franceConfig } from "./mocks";

const polaris = new Polaris();

// polaris.config({
//   ai: {
//     aiProvider: "openai",
//     aiProviderApiKey: OPENAI_API_KEY!,
//     aiModel: "gpt-4o",
//   },
//   ocr: {
//     azureOcrSubscriptionKey: AZURE_COMPUTERVISION_OCR_SUBSCRIPTION_KEY!,
//     azureOcrEndpoint: AZURE_COMPUTERVISION_OCR_ENDPOINT!,
//   },
// });

polaris.config({
  ai: {
    aiModel: "gpt-4o",
    aiProvider: "azure-openai",
    aiProviderApiKey: AZURE_OPENAI_API_KEY!,
    azureApiVersion: AZURE_OPENAI_API_VERSION!,
    azureEndpoint: AZURE_OPENAI_API_ENDPOINT!,
  },
  ocr: {
    azureOcrSubscriptionKey: AZURE_COMPUTERVISION_OCR_SUBSCRIPTION_KEY!,
    azureOcrEndpoint: AZURE_COMPUTERVISION_OCR_ENDPOINT!,
  },
});

const runConfig: PolarisRunConfig = franceConfig;

async function main() {
  try {
    const result = await polaris.run(runConfig);
    console.log(
      "✅ Test completed successfully. Result: ",
      JSON.stringify(result, null, 2),
    );
  } catch (error) {
    console.error(
      "❌ Test failed:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

main();
