import { runVisaGuidelineWorkflow } from "./runner";
import { IVisawiseConfig, IVisawiseInput } from "./types";

export class Visawise {
  private _config: IVisawiseConfig;

  constructor(config: IVisawiseConfig) {
    try {
      if (config.aiProvider !== "openai" && config.aiProvider !== "claude" && config.aiProvider !== "azure-openai") {
        throw new Error(
          `Unsupported AI provider: ${config.aiProvider}. Supported: "openai", "claude", "azure-openai".`,
        );
      }
      if (config.aiProvider === "azure-openai" && !config.azureEndpoint) {
        throw new Error(`azureEndpoint is required when aiProvider is "azure-openai".`);
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
        azureEndpoint: this._config.azureEndpoint,
        azureApiVersion: this._config.azureApiVersion,
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
