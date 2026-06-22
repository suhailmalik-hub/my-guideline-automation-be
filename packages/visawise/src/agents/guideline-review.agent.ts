import { createChatModel } from "../lib/utils";
import { guidelineReviewPrompt } from "../prompts";
import { guidelineGenerationSchema } from "../schemas";

type AIProvider = "openai" | "claude" | "azure-openai";

export const runReviewAgent = async (args: {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  azureEndpoint?: string;
  azureApiVersion?: string;
  existingGuideline: any;
  aggregatedAnalysisResult: any;
}) => {
  const {
    provider,
    apiKey,
    model: modelId,
    azureEndpoint,
    azureApiVersion,
    existingGuideline,
    aggregatedAnalysisResult,
  } = args;
  const model = createChatModel(provider, apiKey, modelId, azureEndpoint, azureApiVersion);

  const userMessageContent = `
    --- GUIDELINE REVIEW INPUT ---

    Your task is to compare and synthesize the two JSON objects below based on the System Instruction's Review and Update Commands.
    
    ### 1. EXISTING GUIDELINE (CURRENT VERSION) START ### 

    ${JSON.stringify(existingGuideline, null, 2)}

    ### 1. EXISTING GUIDELINE (CURRENT VERSION) END ###

    ### 2. NEW AGGREGATED DATA (RECENT EXTRACTIONS) START ###

    ${JSON.stringify(aggregatedAnalysisResult, null, 2)}

    ### 2. NEW AGGREGATED DATA (RECENT EXTRACTIONS) END ###

    Execute the Guideline Review task by applying the conflict resolution, retirement, and preservation rules defined in the System Instruction. Your output MUST be the complete updated guideline JSON object.
  `;

  const reviewModel = model.withStructuredOutput(guidelineGenerationSchema);

  const result = await reviewModel.invoke([
    {
      role: "system",
      content: guidelineReviewPrompt,
    },
    {
      role: "user",
      content: userMessageContent,
    },
  ]);

  return result;
};
