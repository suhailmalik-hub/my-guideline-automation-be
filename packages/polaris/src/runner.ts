// ── Polaris — Flow Runner & Orchestrator ─────────────────────────────────────

import { Page } from "playwright";
import {
  clickElement,
  extractElementContent,
  extractPdfFromUrl,
  fillTextInput,
  selectDropdownOption,
  selectRadioInput,
  takePageScreenshot,
} from "./actions";
import { extractContentFromScreenshot, locateElementXPathWithAI } from "./ai";
import { captureSemanticTree } from "./ax-tree";
import {
  closeBrowser,
  launchAutomationBrowser,
  navigateToPage,
  openNewTab,
} from "./browser";
import {
  AutomationFlowResult,
  AutomationStep,
  AutomationStepResult,
  ClickStep,
  ClickStepResult,
  ExtractPDFStep,
  ExtractPDFStepResult,
  ExtractScreenshotStep,
  ExtractScreenshotStepResult,
  ExtractStep,
  ExtractStepResult,
  FillTextInputStep,
  FillTextInputStepResult,
  PolarisContext,
  PolarisMode,
  PolarisRunConfig,
  PolarisRunResult,
  ScreenshotExtractionHint,
  SelectDropdownOptionStep,
  SelectDropdownOptionStepResult,
  SelectRadioInputStep,
  SelectRadioInputStepResult,
  TokenUsage,
} from "./types";

// ── Retry threshold — number of retry attempts after the first failure ────────
const STEP_RETRY_COUNT = 2;

const snapshot = async ({
  page,
  mode,
  step,
}: {
  page: Page;
  mode: PolarisMode;
  step: AutomationStep;
}): Promise<string | null> => {
  /**
   * capture semantic tree only in play mode
   * no need to capture in run mode since xpaths are pre-resolved
   */

  // short-circuit for run mode since xpaths are pre-resolved
  if (mode === "run") return null;
  console.log(`  📸 Snapshot for step ${step.order}: ${step.name}`);
  // capture semantic tree at very first step
  if (step.order === 1) {
    const targetEl = "targetElement" in step ? step.targetElement : undefined;
    return await captureSemanticTree(page, targetEl);
  }

  // capture semantic tree before steps that have snapshotBeforeStep=true
  if (step.snapshotBeforeStep) {
    const targetEl = "targetElement" in step ? step.targetElement : undefined;
    return await captureSemanticTree(page, targetEl);
  }
  return null;
};

// ── xpath resolver — play: AI-resolved, run: pre-resolved from step ────────
async function resolveXPath({
  query,
  step,
  mode,
  combinedTree,
  context,
}: {
  query: string;
  step: AutomationStep;
  mode: PolarisMode;
  combinedTree: string;
  context: PolarisContext;
}): Promise<{ xpath: string; usage: TokenUsage | undefined }> {
  if (mode === "run") {
    const stepXPath = (step as { xpath?: string }).xpath;
    if (!stepXPath) {
      throw new Error(
        `Step "${step.name}" is missing xpath — pre-resolved xpath is required in "run" mode`,
      );
    }
    return { xpath: stepXPath, usage: undefined };
  }
  const resolved = await locateElementXPathWithAI(
    combinedTree,
    query,
    context.ai.provider,
    context.ai.apiKey,
    context.ai.model,
  );
  return { xpath: resolved.xpath, usage: resolved.usage };
}

// -- Execute a single step against the current page state --
async function executeAutomationStep(
  page: Page,
  step: AutomationStep,
  flowName: string,
  stepIndex: number,
  context: PolarisContext,
  existingCombinedTree: string,
  mode: PolarisMode,
): Promise<{ result: AutomationStepResult; combinedTree: string }> {
  try {
    let combinedTree = existingCombinedTree;

    // Optional wait before this step (lets DOM settle after a previous click/navigation)
    if (step.waitBeforeStep) {
      await page.waitForTimeout(step.waitBeforeStep);
    }

    // Re-snapshot via snapshot() — handles play/run mode, order=1, and snapshotBeforeStep
    // null → no snapshot needed, keep previous tree; string → always use the fresh tree
    const snapshotResult = await snapshot({ page, mode, step });
    if (snapshotResult !== null) combinedTree = snapshotResult;

    // ── Action jump table — each handler resolves xpath and executes ────────
    type ActionHandler = () => Promise<AutomationStepResult>;
    const actionMap: Record<string, ActionHandler> = {
      extractPDF: async () => {
        const _step = step as ExtractPDFStep;
        const extractedContent = await extractPdfFromUrl(
          _step.pdfUrl,
          context.ocr,
        );
        return { ..._step, extractedContent } as ExtractPDFStepResult;
      },
      extractScreenshot: async () => {
        const _step = step as ExtractScreenshotStep;
        const imageBase64 = await takePageScreenshot(
          page,
          _step.contentFrom,
          _step.contentUpto,
        );
        // boundaries define the scope; targetDescription is a filter applied to that scoped content
        const extractionHint: ScreenshotExtractionHint = {
          contentFrom: _step.contentFrom,
          contentUpto: _step.contentUpto,
          filter: _step.targetDescription,
        };
        const { extractedContent, usage } = await extractContentFromScreenshot(
          imageBase64,
          extractionHint,
          context.ai.provider,
          context.ai.apiKey,
          context.ai.model,
        );
        return {
          ..._step,
          extractedContent,
          usage,
        } as ExtractScreenshotStepResult;
      },
      click: async () => {
        const _step = step as ClickStep;
        const { xpath, usage } = await resolveXPath({
          query: _step.targetDescription,
          step,
          mode,
          combinedTree,
          context,
        });
        await clickElement(page, xpath);
        return { ..._step, xpath, usage } as ClickStepResult;
      },
      selectDropdownOption: async () => {
        const _step = step as SelectDropdownOptionStep;
        const { xpath, usage } = await resolveXPath({
          query: _step.targetDescription,
          step,
          mode,
          combinedTree,
          context,
        });
        await selectDropdownOption(page, xpath, _step.value);
        return { ..._step, xpath, usage } as SelectDropdownOptionStepResult;
      },
      fillTextInput: async () => {
        const _step = step as FillTextInputStep;
        const { xpath, usage } = await resolveXPath({
          query: _step.targetDescription,
          step,
          mode,
          combinedTree,
          context,
        });
        await fillTextInput(page, xpath, _step.value);
        return { ..._step, xpath, usage } as FillTextInputStepResult;
      },
      selectRadioInput: async () => {
        const _step = step as SelectRadioInputStep;
        const { xpath, usage } = await resolveXPath({
          query: `${_step.value} — ${_step.targetDescription}`,
          step,
          mode,
          combinedTree,
          context,
        });
        await selectRadioInput(page, xpath);
        return { ..._step, xpath, usage } as SelectRadioInputStepResult;
      },
      extract: async () => {
        const _step = step as ExtractStep;
        const { xpath, usage } = await resolveXPath({
          query: _step.targetDescription,
          step,
          mode,
          combinedTree,
          context,
        });
        const extractedContent = await extractElementContent(page, xpath);
        return {
          ..._step,
          xpath,
          extractedContent,
          usage,
        } as ExtractStepResult;
      },
    };

    const handler = actionMap[step.action];
    if (!handler) {
      throw new Error(`Unhandled action: ${step.action}`);
    }

    // extractPDF / extractScreenshot — no retry
    if (step.action === "extractPDF" || step.action === "extractScreenshot") {
      const result = await handler();
      return { result, combinedTree };
    }

    // run mode — xpath is pre-resolved; if the element is not found the page structure
    // has changed and retrying the same xpath won't help — throw immediately
    if (mode === "run") {
      console.log(`  ▶ Running step ${step.order}: ${step.name}`);
      const result = await handler();
      return { result, combinedTree };
    }

    // play mode — retry up to threshold; each attempt re-snapshots so AI can re-resolve xpath
    const maxAttempts = STEP_RETRY_COUNT + 1;
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (attempt > 1) {
          console.log(
            `  🔄 Retry attempt ${attempt - 1}/${STEP_RETRY_COUNT} for step ${step.order}: ${step.name}`,
          );
          // Re-snapshot before retry in play mode — DOM may have changed after failed action
          if (mode === "play") {
            const targetEl =
              "targetElement" in step ? step.targetElement : undefined;
            combinedTree = await captureSemanticTree(page, targetEl);
          }
        }
        const result = await handler();
        return { result, combinedTree };
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  } catch (error) {
    throw new Error(
      `Step ${stepIndex + 1} "${step.action} → ${"targetDescription" in step ? step.targetDescription : step.pdfUrl}" in flow "${flowName}" failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}

// ── Execute all flows sequentially ───────────────────────────────────────────
export async function executePolarisAutomation(
  config: PolarisRunConfig,
  context: PolarisContext,
): Promise<PolarisRunResult> {
  // Determine the entry URL — first flow's url for both modes
  const firstFlow = Object.values(config.flows)[0];
  const entryUrl = firstFlow.url ?? "";

  const { browser, page: entryPage } = await launchAutomationBrowser(entryUrl, {
    // headless = false → visible browser window (debug);
    // headless = true → invisible headless (production)
    headless: true,
  });

  const flowResults: Record<string, AutomationFlowResult> = {};
  const totalUsage: TokenUsage = {
    input_tokens: 0,
    output_tokens: 0,
    total_tokens: 0,
  };

  // Active page — updated per flow in session mode (new tab), stays as entryPage otherwise
  let activePage = entryPage;

  let sharedCombinedTree = "";

  try {
    for (const [flowName, flow] of Object.entries(config.flows)) {
      console.log(`▶ Flow ${flowName} started`);

      if (config.useSession) {
        // ── Session mode: open each flow's url as a new tab in the same context ──
        activePage = await openNewTab(entryPage, flow.url as string);
      } else {
        // ── No-session mode: navigate in the same tab if url provided, else stay ─
        if (flow.url) {
          await navigateToPage(activePage, flow.url);
        }
      }

      // Optional settle wait after navigation
      if (flow.waitBeforeStart && flow.waitBeforeStart > 0) {
        console.log(`⏳ Waiting ${flow.waitBeforeStart}ms before flow starts`);
        await activePage.waitForTimeout(flow.waitBeforeStart);
      }

      await activePage
        .waitForLoadState("load", { timeout: 8000 })
        .catch(() => {});

      const stepResults: AutomationStepResult[] = [];

      for (let i = 0; i < flow.steps.length; i++) {
        const step = flow.steps[i];
        const { result, combinedTree: updatedTree } =
          await executeAutomationStep(
            activePage,
            step,
            flowName,
            i,
            context,
            sharedCombinedTree,
            config.mode,
          );

        sharedCombinedTree = updatedTree;
        stepResults.push(result);
        // console.log(result);
        // console.log(sharedCombinedTree);

        const stepUsage = "usage" in result ? result.usage : undefined;
        if (stepUsage) {
          totalUsage.input_tokens += stepUsage.input_tokens;
          totalUsage.output_tokens += stepUsage.output_tokens;
          totalUsage.total_tokens += stepUsage.total_tokens;
        }
      }

      flowResults[flowName] = {
        url: flow.url,
        waitBeforeStart: flow.waitBeforeStart,
        steps: stepResults,
      };

      console.log(`✅ Flow ${flowName} completed`);
    }
  } catch (error) {
    throw new Error(
      `Polaris automation failed: ${error instanceof Error ? error.message : error}`,
    );
  } finally {
    await closeBrowser(browser);
  }

  return { flows: flowResults, totalUsage };
}
