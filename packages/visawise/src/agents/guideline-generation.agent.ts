import { createChatModel } from "../lib/utils";
import { guidelineGenerationPrompt } from "../prompts";
import { guidelineGenerationSchema } from "../schemas";

type AIProvider = "openai" | "claude";

export const runGenerationAgent = async (args: {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  aggregatedAnalysisResult: any;
}) => {
  const { provider, apiKey, model: modelId, aggregatedAnalysisResult } = args;
  const model = createChatModel(provider, apiKey, modelId);

  const userMessageContent = `
    --- GUIDELINE GENERATION INPUT ---

    This JSON contains the aggregated results from multiple source files. Apply all rules from the System Instruction to synthesize this into the final guideline.

    ### AGGREGATED VISA DATA START ###

    ${JSON.stringify(aggregatedAnalysisResult)}

    ### AGGREGATED VISA DATA END ###

    Execute the final Guideline Generation task using ONLY the data provided above and strictly adhere to the System Instruction's conflict resolution and field mapping rules.`;

  const generationModel = model.withStructuredOutput(guidelineGenerationSchema);

  const result = await generationModel.invoke([
    {
      role: "system",
      content: guidelineGenerationPrompt,
    },
    {
      role: "user",
      content: userMessageContent,
    },
  ]);

  return result; // typed as UpdatedGuidelineResponse
};
