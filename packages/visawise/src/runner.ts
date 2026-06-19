import { StateGraph } from "@langchain/langgraph";
import { diff } from "deep-object-diff";
import z from "zod";
import { runAnalysisAgent, runGenerationAgent, runReviewAgent } from "./agents";
import { aggregateAnalysisResults } from "./lib/utils";
import { IGuidelineSource, IScrapeMetaData } from "./types";

type AIProvider = "openai" | "claude";

// ---------- 1. Graph state ----------

// This is the state shared across all nodes in the graph
const VisaGuidelineState = z.object({
  country: z.string(),
  visaType: z.string(),
  subVisaType: z.string(),

  metaData: z.any().optional(),
  scrapeSources: z
    .array(
      z.object({
        stepName: z.string(),
        url: z.string(),
        content: z.string(),
      }),
    )
    .optional(),

  // Guideline currently on disk
  guideline: z.any().optional(),

  // Agent results
  analysisResults: z.array(z.any()).default([]),
  aggregatedAnalysisResult: z.any().optional(),

  // Flow control
  mode: z.enum(["generate", "review"]).optional(),

  // Diff between old and new guideline
  guidelineDiff: z.any().optional(),

  // Final output
  resultGuideline: z.any().optional(),
});
export type VisaGuidelineStateType = z.infer<typeof VisaGuidelineState>;

// ---------- 2. Nodes (units of work) ----------

const analyzeSourcesNode =
  (provider: AIProvider, apiKey: string, model?: string) =>
  async (
    state: VisaGuidelineStateType,
  ): Promise<Partial<VisaGuidelineStateType>> => {
    console.log("Analyzing sources");
    if (!state.scrapeSources) {
      throw new Error("Scrape sources missing from state");
    }
    const analysisResults: any[] = [];
    for (const source of state.scrapeSources) {
      try {
        const officialData = {
          sourceFileName: source.stepName,
          sourceUrl: source.url,
          sourceContent: source.content,
        };
        console.log("Running analysis agent for", source.stepName);
        const analysisResult = await runAnalysisAgent({
          provider,
          apiKey,
          model,
          officialData,
        });
        analysisResults.push(analysisResult);
      } catch (error) {
        console.error(`Error processing source ${source.stepName}:`, error);
      }
    }

    return { analysisResults };
  };

// Node: aggregate all analysis results
const aggregateNode = async (
  state: VisaGuidelineStateType,
): Promise<Partial<VisaGuidelineStateType>> => {
  console.log("Aggregating analysis results");
  const aggregated = aggregateAnalysisResults(state.analysisResults || []);
  return { aggregatedAnalysisResult: aggregated };
};

// Node: decide whether to generate new guideline or review existing one
const decideModeNode = (
  state: VisaGuidelineStateType,
): Partial<VisaGuidelineStateType> => {
  console.log("Deciding mode (generate vs review)");
  const guideline = state.guideline;
  const isEmpty =
    !guideline ||
    (typeof guideline === "object" && Object.keys(guideline).length === 0);
  const mode: "generate" | "review" = isEmpty ? "generate" : "review";
  console.log("mode", mode);

  return { mode };
};

// Node: generation agent
const generationNode =
  (provider: AIProvider, apiKey: string, model?: string) =>
  async (
    state: VisaGuidelineStateType,
  ): Promise<Partial<VisaGuidelineStateType>> => {
    console.log("Running generation agent");
    if (!state.aggregatedAnalysisResult) {
      throw new Error("aggregatedAnalysisResult missing in state");
    }

    const result = await runGenerationAgent({
      provider,
      apiKey,
      model,
      aggregatedAnalysisResult: state.aggregatedAnalysisResult,
    });

    // Add timestamp immediately after generation
    const currentTime = new Date().toISOString().replace("Z", "");
    result.syncedAt = currentTime;

    return { resultGuideline: result };
  };

const reviewNode =
  (provider: AIProvider, apiKey: string, model?: string) =>
  async (
    state: VisaGuidelineStateType,
  ): Promise<Partial<VisaGuidelineStateType>> => {
    console.log("Running review agent");
    if (!state.aggregatedAnalysisResult) {
      throw new Error("aggregatedAnalysisResult missing in state");
    }

    const result = await runReviewAgent({
      provider,
      apiKey,
      model,
      existingGuideline: state.guideline,
      aggregatedAnalysisResult: state.aggregatedAnalysisResult,
    });

    // Add timestamp immediately after review
    const currentTime = new Date().toISOString().replace("Z", "");
    result.syncedAt = currentTime;

    return { resultGuideline: result };
  };

// Node: compare result
const computeDiffNode = async (state: VisaGuidelineStateType) => {
  console.log("Computing guideline diff");
  const oldGuideline = state.guideline || {};
  const newGuideline = state.resultGuideline || {};

  const guidelineDiff = diff(oldGuideline, newGuideline);

  // Just store it back into the state so it appears in the graph output
  return { guidelineDiff };
};

// Node: log final guideline result
const saveGuidelineNode = async (
  state: VisaGuidelineStateType,
): Promise<Partial<VisaGuidelineStateType>> => {
  console.log(
    `Guideline generated for ${state.visaType} / ${state.subVisaType}:`,
  );
  // console.log(JSON.stringify(state.resultGuideline, null, 2));
  return {};
};

// ---------- 3. Build the graph ----------

const buildGraph = (provider: AIProvider, apiKey: string, model?: string) => {
  const builder = new StateGraph(VisaGuidelineState)
    .addNode("analyzeSources", analyzeSourcesNode(provider, apiKey, model))
    .addNode("aggregate", aggregateNode)
    .addNode("decideMode", decideModeNode)
    .addNode("generation", generationNode(provider, apiKey, model))
    .addNode("review", reviewNode(provider, apiKey, model))
    .addNode("computeDiff", computeDiffNode)
    .addNode("saveGuideline", saveGuidelineNode);

  builder.addEdge("__start__", "analyzeSources");
  builder.addEdge("analyzeSources", "aggregate");
  builder.addEdge("aggregate", "decideMode");

  builder.addConditionalEdges(
    "decideMode",
    (state: VisaGuidelineStateType) => state.mode!,
    {
      generate: "generation",
      review: "review",
    },
  );

  builder.addEdge("generation", "saveGuideline");
  builder.addEdge("review", "computeDiff");
  builder.addEdge("computeDiff", "saveGuideline");
  builder.addEdge("saveGuideline", "__end__");

  return builder.compile();
};

// ---------- 4. Public API ----------

export const runVisaGuidelineWorkflow = async (input: {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  metaData: IScrapeMetaData;
  sources: IGuidelineSource[];
  existingGuideline: Record<string, any>;
}) => {
  try {
    const { provider, apiKey, model, metaData, sources, existingGuideline } =
      input;

    const graph = buildGraph(provider, apiKey, model);

    const resultState = await graph.invoke({
      country: metaData.country,
      visaType: metaData.visaType,
      subVisaType: metaData.subVisaType,
      metaData,
      scrapeSources: sources,
      guideline: existingGuideline ?? {},
      analysisResults: [],
    });

    return {
      scrapeSources: resultState.scrapeSources,
      analysisResults: resultState.analysisResults,
      resultGuideline: resultState.resultGuideline,
      mode: resultState.mode,
    };
  } catch (error) {
    throw new Error(
      `runVisaGuidelineWorkflow failed: ${error instanceof Error ? error.message : error}`,
    );
  }
};
