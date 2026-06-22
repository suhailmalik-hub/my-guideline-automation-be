// ── Polaris — Main Class ──────────────────────────────────────────────────────

import { executePolarisAutomation } from "./runner";
import {
  PolarisInstanceConfig,
  PolarisRunConfig,
  PolarisRunResult,
} from "./types";

export class Polaris {
  private _config: PolarisInstanceConfig | null = null;

  config(instanceConfig: PolarisInstanceConfig): this {
    try {
      this._config = instanceConfig;
      return this;
    } catch (error) {
      throw new Error(
        `Polaris config failed: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async run(runConfig: PolarisRunConfig): Promise<PolarisRunResult> {
    try {
      if (!this._config) {
        throw new Error("Call polaris.config() before polaris.run()");
      }

      return executePolarisAutomation(runConfig, {
        ai: {
          provider: this._config.ai.aiProvider,
          apiKey: this._config.ai.aiProviderApiKey,
          model: this._config.ai.aiModel,
          azureEndpoint: this._config.ai.azureEndpoint,
          azureApiVersion: this._config.ai.azureApiVersion,
        },
        ocr: this._config.ocr
          ? {
              subscriptionKey: this._config.ocr.azureOcrSubscriptionKey,
              endpoint: this._config.ocr.azureOcrEndpoint,
            }
          : undefined,
      });
    } catch (error) {
      throw new Error(
        `Polaris run failed: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}
