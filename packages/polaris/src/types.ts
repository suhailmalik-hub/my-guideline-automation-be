// ── Polaris — Type Definitions ────────────────────────────────────────────────

export type AIProvider = "claude" | "openai";

export type OpenAIModel = "gpt-4o" | "gpt-4o-mini";

export type ClaudeModel = "claude-sonnet-4-20250514";

export type AIModel = OpenAIModel | ClaudeModel;

export type AutomationAction =
  | "click"
  | "extract"
  | "extractPDF"
  | "extractScreenshot"
  | "selectDropdownOption"
  | "fillTextInput"
  | "selectRadioInput";

export type PolarisMode = "play" | "run";

// ── Shared base fields for all step types ────────────────────────────────────
interface BaseStep {
  name: string;
  order: number;
  snapshotBeforeStep?: boolean; // Re-captures the full AX tree before this step — use after DOM mutations (tab switch, accordion, modal)
  waitBeforeStep?: number; // Optional ms to wait before executing this step (and before any re-snapshot)
}

export interface ExtractStep extends BaseStep {
  action: "extract";
  targetDescription: string;
  targetElement?: string;
  xpath?: string; // pre-resolved xpath — required in "run" mode, ignored in "play" mode
}

export interface ExtractPDFStep extends BaseStep {
  action: "extractPDF";
  pdfUrl: string;
}

export interface ExtractScreenshotStep extends BaseStep {
  action: "extractScreenshot";
  targetDescription: string; // extra instruction passed to the AI (e.g. "focus on bullet points only")
  contentFrom: string; // visible text marking section start — scroll here before tiling
  contentUpto: string; // visible text marking section end — stop tiling when this appears
}

export interface ClickStep extends BaseStep {
  action: "click";
  targetDescription: string;
  targetElement?: string;
  xpath?: string; // pre-resolved xpath — required in "run" mode, ignored in "play" mode
}

export interface SelectDropdownOptionStep extends BaseStep {
  action: "selectDropdownOption";
  targetDescription: string;
  targetElement?: string;
  value: string; // option value to select
  xpath?: string; // pre-resolved xpath — required in "run" mode, ignored in "play" mode
}

export interface FillTextInputStep extends BaseStep {
  action: "fillTextInput";
  targetDescription: string;
  targetElement?: string;
  value: string; // text to fill into the input
  xpath?: string; // pre-resolved xpath — required in "run" mode, ignored in "play" mode
}

export interface SelectRadioInputStep extends BaseStep {
  action: "selectRadioInput";
  targetDescription: string;
  value: string; // the option to select — e.g. "Yes" / "No"
  targetElement?: string;
  xpath?: string; // pre-resolved xpath — required in "run" mode, ignored in "play" mode
}

export type AutomationStep =
  | ExtractStep
  | ExtractPDFStep
  | ExtractScreenshotStep
  | ClickStep
  | SelectDropdownOptionStep
  | FillTextInputStep
  | SelectRadioInputStep;

export interface AutomationFlow {
  url: string;
  waitBeforeStart?: number; // optional ms to wait before first step — use after a flow that triggers navigation
  steps: AutomationStep[];
}

// ── Flow variant where url is required (useSession: true) ────────────────────
export interface AutomationFlowWithUrl extends AutomationFlow {
  url: string;
}

// ── Run configuration (flows — credentials are set once via Polaris.config()) ─
// useSession: true  → shared browser context, each flow opens its url as a new tab
// useSession: false → per-flow browser context, url is optional (tab-switching flows omit it)
type SessionRunConfig = {
  useSession: true;
  mode: PolarisMode;
  flows: Record<string, AutomationFlowWithUrl>;
};

type NoSessionRunConfig = {
  useSession: false;
  mode: PolarisMode;
  flows: Record<string, AutomationFlow>;
};

export type PolarisRunConfig = SessionRunConfig | NoSessionRunConfig;

// ── Instance configuration (credentials set once via polaris.config()) ────────
export interface PolarisAIConfig {
  aiProvider: AIProvider;
  aiProviderApiKey: string;
  aiModel: AIModel;
}

export interface PolarisOCRConfig {
  azureOcrSubscriptionKey: string;
  azureOcrEndpoint: string;
}

export interface PolarisInstanceConfig {
  ai: PolarisAIConfig;
  ocr?: PolarisOCRConfig;
}

// ── Screenshot extraction hint ─────────────────────────────────────────────
export interface ScreenshotExtractionHint {
  contentFrom: string;
  contentUpto: string;
  filter: string;
}

// ── Token usage ──────────────────────────────────────────────────────────────
export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

// ── Step result types — input fields preserved + output fields added ──────────
export type ExtractStepResult = ExtractStep & {
  xpath: string;
  extractedContent: string;
  usage?: TokenUsage;
};

export type ExtractPDFStepResult = ExtractPDFStep & {
  extractedContent: string;
};

export type ExtractScreenshotStepResult = ExtractScreenshotStep & {
  extractedContent: string;
  usage?: TokenUsage;
};

export type ClickStepResult = ClickStep & {
  xpath: string;
  usage?: TokenUsage;
};

export type SelectDropdownOptionStepResult = SelectDropdownOptionStep & {
  xpath: string;
  usage?: TokenUsage;
};

export type FillTextInputStepResult = FillTextInputStep & {
  xpath: string;
  usage?: TokenUsage;
};

export type SelectRadioInputStepResult = SelectRadioInputStep & {
  xpath: string;
  usage?: TokenUsage;
};

export type AutomationStepResult =
  | ExtractStepResult
  | ExtractPDFStepResult
  | ExtractScreenshotStepResult
  | ClickStepResult
  | SelectDropdownOptionStepResult
  | FillTextInputStepResult
  | SelectRadioInputStepResult;

// ── Flow result — mirrors AutomationFlow with resolved steps ──────────────────
export interface AutomationFlowResult {
  url: string;
  waitBeforeStart?: number;
  steps: AutomationStepResult[];
}

export interface PolarisRunResult {
  flows: Record<string, AutomationFlowResult>;
  totalUsage: TokenUsage;
}

// ── Internal context — carries credentials through the call chain ─────────────
export interface PolarisContext {
  ai: {
    provider: AIProvider;
    apiKey: string;
    model: AIModel;
  };
  ocr?: {
    subscriptionKey: string;
    endpoint: string;
  };
}
