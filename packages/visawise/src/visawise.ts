import { runVisaGuidelineWorkflow } from "./runner";
import { IVisawiseConfig, IVisawiseInput } from "./types";

export class Visawise {
  private _config: IVisawiseConfig;

  constructor(config: IVisawiseConfig) {
    try {
      if (config.aiProvider !== "openai") {
        throw new Error(
          `Unsupported AI provider: ${config.aiProvider}. Only "openai" is supported.`,
        );
      }
      if (!config.aiProviderKey) {
        throw new Error("aiProviderKey is required.");
      }
      this._config = config;
    } catch (error) {
      throw new Error(
        `Visawise initialization failed: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async run(input: IVisawiseInput) {
    try {
      return await runVisaGuidelineWorkflow({
        apiKey: this._config.aiProviderKey,
        metaData: input.metaData,
        sources: input.sources,
        existingGuideline: input.existingGuideline ?? {}, // Pass an empty object if existingGuideline is not provided
      });
    } catch (error) {
      throw new Error(
        `Visawise.run failed: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}
