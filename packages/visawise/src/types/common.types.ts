export interface IGuidelineSource {
  url: string;
  stepName: string;
  content: string;
}

export interface IScrapeMetaData {
  country: string;
  visaType: string;
  subVisaType: string;
}

type aiProvider = "openai" | "claude" | "azure-openai";
export interface IVisawiseConfig {
  aiProvider: aiProvider;
  aiProviderKey: string;
  aiModel?: string;
  azureEndpoint?: string;   // e.g. https://nuron-sandbox-openai.openai.azure.com
  azureApiVersion?: string; // e.g. 2025-01-01-preview
}

export interface IVisawiseInput {
  metaData: IScrapeMetaData;
  sources: IGuidelineSource[];
  existingGuideline: Record<string, any>;
}
