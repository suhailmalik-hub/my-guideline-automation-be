import { ChatAnthropic } from "@langchain/anthropic";
import { AzureChatOpenAI, ChatOpenAI } from "@langchain/openai";

type AIProvider = "openai" | "claude" | "azure-openai";

const OPENAI_DEFAULT = "gpt-4o";
const CLAUDE_DEFAULT = "claude-sonnet-4-6";
const AZURE_DEFAULT_DEPLOYMENT = "gpt-4o";
const AZURE_DEFAULT_API_VERSION = "2025-01-01-preview";

export function createChatModel(
  provider: AIProvider,
  apiKey: string,
  model?: string,
  azureEndpoint?: string,
  azureApiVersion?: string,
) {
  if (provider === "azure-openai") {
    // Extract instance name from endpoint: https://my-instance.openai.azure.com → my-instance
    const instanceName = azureEndpoint
      ? new URL(azureEndpoint).hostname.split(".")[0]
      : undefined;
    return new AzureChatOpenAI({
      azureOpenAIApiKey: apiKey,
      azureOpenAIApiInstanceName: instanceName,
      azureOpenAIApiDeploymentName: model ?? AZURE_DEFAULT_DEPLOYMENT,
      azureOpenAIApiVersion: azureApiVersion ?? AZURE_DEFAULT_API_VERSION,
      temperature: 0.7,
    });
  }
  if (provider === "claude") {
    return new ChatAnthropic({
      model: model ?? CLAUDE_DEFAULT,
      temperature: 0.7,
      apiKey,
    });
  }
  return new ChatOpenAI({
    model: model ?? OPENAI_DEFAULT,
    temperature: 0.7,
    apiKey,
  });
}
