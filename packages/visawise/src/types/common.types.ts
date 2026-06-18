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

type aiProvider = "openai";
export interface IVisawiseConfig {
  aiProvider: aiProvider;
  aiProviderKey: string;
}

export interface IVisawiseInput {
  metaData: IScrapeMetaData;
  sources: IGuidelineSource[];
  existingGuideline: Record<string, any>;
}
