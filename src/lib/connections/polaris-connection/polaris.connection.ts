import { Polaris } from "@polaris/core";

export const polaris = new Polaris();
// polaris.config({
//   ai: {
//     aiProvider: "openai",
//     aiProviderApiKey: process.env.OPENAI_API_KEY!,
//     aiModel: "gpt-4o-mini",
//   },
//   ocr: {
//     azureOcrSubscriptionKey:
//       process.env.AZURE_COMPUTERVISION_OCR_SUBSCRIPTION_KEY!,
//     azureOcrEndpoint: process.env.AZURE_COMPUTERVISION_OCR_ENDPOINT!,
//   },
// });

// polaris.config({
//   ai: {
//     aiProvider: "claude",
//     aiProviderApiKey: process.env.ANTHROPIC_API_KEY!,
//     aiModel: "claude-sonnet-4-6",
//   },
//   ocr: {
//     azureOcrSubscriptionKey:
//       process.env.AZURE_COMPUTERVISION_OCR_SUBSCRIPTION_KEY!,
//     azureOcrEndpoint: process.env.AZURE_COMPUTERVISION_OCR_ENDPOINT!,
//   },
// });

polaris.config({
  ai: {
    aiModel: "gpt-4o",
    aiProvider: "azure-openai",
    aiProviderApiKey: process.env.AZURE_OPENAI_API_KEY!,
    azureApiVersion: process.env.AZURE_OPENAI_API_VERSION!,
    azureEndpoint: process.env.AZURE_OPENAI_API_ENDPOINT!,
  },
  ocr: {
    azureOcrSubscriptionKey:
      process.env.AZURE_COMPUTERVISION_OCR_SUBSCRIPTION_KEY!,
    azureOcrEndpoint: process.env.AZURE_COMPUTERVISION_OCR_ENDPOINT!,
  },
});
