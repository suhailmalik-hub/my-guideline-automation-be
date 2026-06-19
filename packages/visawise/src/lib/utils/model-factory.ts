import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";

type AIProvider = "openai" | "claude";

const OPENAI_DEFAULT = "gpt-4o";
const CLAUDE_DEFAULT = "claude-sonnet-4-6";

export function createChatModel(
  provider: AIProvider,
  apiKey: string,
  model?: string,
) {
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
