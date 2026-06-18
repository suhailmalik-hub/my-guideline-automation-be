import { ChatOpenAI } from "@langchain/openai";
import { guidelineAnalysisPrompt } from "../prompts";
import { individualFileAnalysisSchema } from "../schemas";

export const runAnalysisAgent = async (args: {
  apiKey: string;
  officialData: {
    sourceFileName: string;
    sourceUrl: string;
    sourceContent: string;
  };
}) => {
  const { apiKey, officialData } = args;
  const model = new ChatOpenAI({ model: "gpt-4o", temperature: 0.7, apiKey });

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
