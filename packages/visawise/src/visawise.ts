import { runVisaGuidelineWorkflow } from "./runner";
import { IVisawiseConfig, IVisawiseInput } from "./types";

export class Visawise {
  private _config: IVisawiseConfig;

  constructor(config: IVisawiseConfig) {
    try {
      if (config.aiProvider !== "openai" && config.aiProvider !== "claude") {
        throw new Error(
          `Unsupported AI provider: ${config.aiProvider}. Supported: "openai", "claude".`,
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
        provider: this._config.aiProvider,
        apiKey: this._config.aiProviderKey,
        model: this._config.aiModel,
        metaData: input.metaData,
        sources: input.sources,
        existingGuideline: input.existingGuideline ?? {},
      });
    } catch (error) {
      throw new Error(
        `Visawise.run failed: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}
