// ── Polaris — AI Provider Abstraction ────────────────────────────────────────

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { AIModel, AIProvider, ScreenshotExtractionHint } from "./types";

export interface XPathResolutionResult {
  xpath: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

export interface ScreenshotExtractionResult {
  extractedContent: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

// ── Strip markdown code fences and backticks the AI may wrap around the xpath ─
function sanitizeXPath(raw: string): string {
  return raw
    .replace(/^```[a-z]*\n?/i, "") // opening code fence
    .replace(/```$/, "") // closing code fence
    .replace(/^`(.+)`$/, "$1") // single backtick wrapping e.g. `//xpath`
    .replace(/^xpath=/i, "") // literal "xpath=" prefix
    .trim();
}

export async function locateElementXPathWithAI(
  combinedTree: string,
  targetDescription: string,
  provider: AIProvider,
  apiKey: string,
  model: AIModel,
): Promise<XPathResolutionResult> {
  const prompt = `Here is the page structure. Each line has: role "name" xpath=<path>
Notes:
- "generic" or "none" role lines whose name starts with "." are CONTAINER ELEMENTS (divs/sections) identified by CSS class, e.g. ".visa-type-content" is the div wrapping the Overview section.
- When the user asks for "content" or "section content", prefer a container element (role generic/none with a .className) over an individual heading or paragraph inside it.
                  ${combinedTree}
                  Find the xpath for: "${targetDescription}"
                  Rules:
                  - Pick the xpath EXACTLY as it appears in the lines above
                  - Do NOT construct or modify any xpath
                  - If the target is described as "content" of a section, return the container div (generic/none with .className), NOT the heading inside it
                  - Return ONLY the xpath string, nothing else`;

  try {
    if (provider === "openai") {
      const client = new OpenAI({ apiKey });
      const response = await client.chat.completions.create({
        model: model,
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      });

      const xpath = sanitizeXPath(
        response.choices[0].message.content?.trim() ?? "",
      );
      return {
        xpath,
        usage: {
          input_tokens: response.usage?.prompt_tokens ?? 0,
          output_tokens: response.usage?.completion_tokens ?? 0,
          total_tokens: response.usage?.total_tokens ?? 0,
        },
      };
    }

    // Claude (default)
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: model,
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const xpath = sanitizeXPath(
      (response.content[0] as Anthropic.TextBlock).text.trim(),
    );
    return {
      xpath,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        total_tokens:
          response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  } catch (error) {
    throw new Error(
      `Failed to resolve xpath via ${provider} for "${targetDescription}": ${error instanceof Error ? error.message : error}`,
    );
  }
}

// ── Vision AI — extract text content from a screenshot ───────────────────────
export async function extractContentFromScreenshot(
  imageBase64: string | string[],
  hint: ScreenshotExtractionHint,
  provider: AIProvider,
  apiKey: string,
  model: AIModel,
): Promise<ScreenshotExtractionResult> {
  const frames = Array.isArray(imageBase64) ? imageBase64 : [imageBase64];
  const multiFrame = frames.length > 1;
  const prompt = `${
    multiFrame
      ? `These are ${frames.length} consecutive viewport screenshots of a webpage, taken by scrolling down. They form a continuous vertical strip of the page.`
      : "This is a screenshot of a webpage."
  }
Step 1 — Extract the scoped content:
Transcribe the EXACT verbatim text between (and including) the following boundaries:
- Start boundary: "${hint.contentFrom}"
- End boundary: "${hint.contentUpto}"
Rules:
- Copy text EXACTLY as it appears — do NOT paraphrase, summarise, or invent content
- Only include text literally visible in the image(s)
- Deduplicate content that appears in overlapping regions between frames
- Do NOT include anything before the start boundary or after the end boundary
- Preserve structure: use ## for section headings, * for bullet list items
- If a bullet has sub-items, indent them with two spaces

Step 2 — Filter by instruction:
From the scoped content extracted in Step 1, return ONLY what matches this instruction:
"${hint.filter}"

Return only the final filtered text, nothing else.`;

  try {
    if (provider === "openai") {
      const client = new OpenAI({ apiKey });
      const response = await client.chat.completions.create({
        model,
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: [
              ...frames.map((f) => ({
                type: "image_url" as const,
                image_url: { url: `data:image/jpeg;base64,${f}` },
              })),
              { type: "text" as const, text: prompt },
            ],
          },
        ],
      });
      return {
        extractedContent: response.choices[0].message.content?.trim() ?? "",
        usage: {
          input_tokens: response.usage?.prompt_tokens ?? 0,
          output_tokens: response.usage?.completion_tokens ?? 0,
          total_tokens: response.usage?.total_tokens ?? 0,
        },
      };
    }

    // Claude (default)
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model,
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            ...frames.map((f) => ({
              type: "image" as const,
              source: {
                type: "base64" as const,
                media_type: "image/jpeg" as const,
                data: f,
              },
            })),
            { type: "text", text: prompt },
          ],
        },
      ],
    });
    return {
      extractedContent: (
        response.content[0] as Anthropic.TextBlock
      ).text.trim(),
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        total_tokens:
          response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  } catch (error) {
    throw new Error(
      `Failed to extract content from screenshot via ${provider}: ${error instanceof Error ? error.message : error}`,
    );
  }
}
