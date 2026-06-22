import { Visawise } from "@visawise/core";

// export const visawise = new Visawise({
//   aiProvider: "openai",
//   aiProviderKey: process.env.OPENAI_API_KEY!,
// });

// export const visawise = new Visawise({
//   aiProvider: "claude",
//   aiProviderKey: process.env.ANTHROPIC_API_KEY!,
//   aiModel: "claude-sonnet-4-6",
// });

export const visawise = new Visawise({
  aiProvider: "azure-openai",
  aiProviderKey: process.env.AZURE_OPENAI_API_KEY!,
  azureEndpoint: process.env.AZURE_OPENAI_API_ENDPOINT!,
  azureApiVersion: "2025-01-01-preview",
  aiModel: "gpt-4o",
});
