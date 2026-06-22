import { createChatModel } from "../lib/utils";
import { guidelineAnalysisPrompt } from "../prompts";
import { individualFileAnalysisSchema } from "../schemas";

type AIProvider = "openai" | "claude" | "azure-openai";

export const runAnalysisAgent = async (args: {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  azureEndpoint?: string;
  azureApiVersion?: string;
  officialData: {
    sourceFileName: string;
    sourceUrl: string;
    sourceContent: string;
  };
}) => {
  const { provider, apiKey, model: modelId, azureEndpoint, azureApiVersion, officialData } = args;
  const model = createChatModel(provider, apiKey, modelId, azureEndpoint, azureApiVersion);

  const userMessageContent = `
    ### INPUT DATA FOR EXTRACTION
    
    1. **Base URL (for 'baseUrl' field):** ${officialData.sourceUrl}
    2. **Source File Name (for 'sourceFileName' field):** ${officialData.sourceFileName}
    
    --- RAW WEB CONTENT ---
    
    ${officialData.sourceContent}
    
    --- END OF RAW WEB CONTENT ---
    
    Analyze the raw content above and STRICTLY adhere to the System Instruction  and the defined schema to generate the output JSON.
  `;

  const analysisModel = model.withStructuredOutput(
    individualFileAnalysisSchema,
  );

  const result = await analysisModel.invoke([
    {
      role: "system",
      content: guidelineAnalysisPrompt,
    },
    {
      role: "user",
      content: userMessageContent,
    },
  ]);
  return result;
};
