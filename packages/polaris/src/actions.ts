// ── Polaris — Automation Action Executors ─────────────────────────────────────

import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { Page } from "playwright";
import {
  AzureOCRCredentials,
  convertHtmlToMarkdown,
  extractPdfTextAzure,
} from "./lib";

export async function clickElement(page: Page, xpath: string): Promise<void> {
  try {
    await page.locator(`xpath=${xpath}`).click({ force: true });
    // Wait for page to load after click — handles SPA navigations, AJAX tab loads, etc.
    // Gracefully ignored if no network activity or if it times out (pure DOM mutations).
    await page.waitForLoadState("load", { timeout: 8000 }).catch(() => {});
  } catch (error) {
    throw new Error(
      `Click failed on xpath "${xpath}": ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function fillTextInput(
  page: Page,
  xpath: string,
  value: string,
): Promise<void> {
  try {
    await page.locator(`xpath=${xpath}`).fill(value);
  } catch (error) {
    throw new Error(
      `Fill failed on xpath "${xpath}" with value "${value}": ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function selectDropdownOption(
  page: Page,
  dropdownXPath: string,
  value: string,
): Promise<void> {
  try {
    await page.locator(`xpath=${dropdownXPath}`).selectOption(value);
  } catch (error) {
    throw new Error(
      `Dropdown select failed on xpath "${dropdownXPath}" with value "${value}": ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function selectRadioInput(
  page: Page,
  xpath: string,
): Promise<void> {
  try {
    // await page.locator(`xpath=${xpath}`).check();
    await page.locator(`xpath=${xpath}`).click({ force: true });
  } catch (error) {
    throw new Error(
      `Radio input selection failed on xpath "${xpath}": ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function extractElementContent(
  page: Page,
  xpath: string,
): Promise<string> {
  try {
    const html = await page
      .locator(`xpath=${xpath}`)
      .evaluate((el) => el.outerHTML);
    return convertHtmlToMarkdown(html);
  } catch (error) {
    throw new Error(
      `Extract failed on xpath "${xpath}": ${error instanceof Error ? error.message : error}`,
    );
  }
}

// Each tile is captured at this height — within both Claude and GPT-4o native-resolution limits
const READABLE_TILE_HEIGHT = 1200;
// Small overlap so no line is cut at a tile boundary
const TILE_OVERLAP_PX = 50;
// Safety cap on tile count to prevent runaway loops
const MAX_TILES = 20;

const DEBUG_DIR = path.join(process.cwd(), "polaris-debug");

function saveDebugJpeg(buf: Buffer, label: string): void {
  try {
    fs.mkdirSync(DEBUG_DIR, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const file = path.join(DEBUG_DIR, `${ts}_${label}.jpg`);
    fs.writeFileSync(file, buf);
    console.log(`  💾 Debug JPEG saved: ${file}`);
  } catch (err) {
    console.error(`  ⚠️ Debug JPEG save failed: ${err instanceof Error ? err.message : err}`);
  }
}

export async function takePageScreenshot(
  page: Page,
  contentFrom: string | undefined,
  contentUpto: string | undefined,
): Promise<string[]> {
  try {
    const originalViewport = page.viewportSize();
    const viewportWidth = originalViewport?.width ?? 1280;
    const naturalHeight = originalViewport?.height ?? 768;
    console.log(`  🖥️ Viewport: ${viewportWidth}x${naturalHeight}`);

    // If no boundaries provided, capture just the current viewport as a single frame
    if (!contentFrom || !contentUpto) {
      const buf = await page.screenshot({
        fullPage: false,
        type: "jpeg",
        quality: 90,
      });
      // saveDebugJpeg(buf, "viewport");
      console.log(`  📷 Full viewport captured (no contentFrom/contentUpto)`);
      return [buf.toString("base64")];
    }

    // Resize viewport to READABLE_TILE_HEIGHT so each screenshot = one readable tile
    await page.setViewportSize({
      width: viewportWidth,
      height: READABLE_TILE_HEIGHT,
    });
    await page.waitForTimeout(200);

    // Scroll contentFrom into view — start of the section (use last() to skip TOC/nav occurrences)
    await page
      .getByText(contentFrom, { exact: false })
      .last()
      .scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    console.log(`  🎯 Scrolled to contentFrom: "${contentFrom}"`);

    const frames: string[] = [];
    let contentUptoReached = false;

    for (let i = 0; i < MAX_TILES; i++) {
      const buf = await page.screenshot({
        fullPage: false,
        type: "jpeg",
        quality: 90,
      });
      // saveDebugJpeg(buf, `tile-${i + 1}`);
      console.log(`  📷 Tile ${i + 1} captured`);
      frames.push(buf.toString("base64"));

      // Check if contentUpto is now in the viewport — if so, section is complete
      const reached = await page
        .getByText(contentUpto, { exact: false })
        .first()
        .evaluate((el) => {
          const rect = el.getBoundingClientRect();
          return rect.top >= 0 && rect.top <= window.innerHeight;
        })
        .catch(() => false);
      if (reached) {
        console.log(
          `  ✅ contentUpto reached: "${contentUpto}" — ${i + 1} tile(s) captured`,
        );
        contentUptoReached = true;
        break;
      }

      // Scroll down by one tile (with overlap) for the next frame
      await page.evaluate(
        (h) => window.scrollBy(0, h),
        READABLE_TILE_HEIGHT - TILE_OVERLAP_PX,
      );
      await page.waitForTimeout(200);
    }

    // Restore original viewport
    await page.setViewportSize({ width: viewportWidth, height: naturalHeight });

    if (!contentUptoReached) {
      throw new Error(
        `contentUpto "${contentUpto}" was not found on the page after ${MAX_TILES} tiles — check the text matches exactly what is visible on the page`,
      );
    }

    return frames;
  } catch (error) {
    throw new Error(
      `Page screenshot failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function extractPdfFromUrl(
  pdfUrl: string,
  ocrCredentials?: AzureOCRCredentials,
): Promise<string> {
  try {
    if (!ocrCredentials) {
      throw new Error(
        `"extractPDF" requires OCR credentials — set ocr in Polaris.config()`,
      );
    }
    // Download PDF into OS temp directory
    const tempDir = os.tmpdir();
    const fileName = `polaris-pdf-${Date.now()}.pdf`;
    const destFile = path.join(tempDir, fileName);

    const res = await fetch(pdfUrl);
    if (!res.ok) {
      throw new Error(`Failed to download PDF. HTTP ${res.status}: ${pdfUrl}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(destFile, Buffer.from(arrayBuffer));

    // Extract text via Azure OCR
    const extractedText = await extractPdfTextAzure(destFile, ocrCredentials);

    // Clean up temp file
    fs.unlinkSync(destFile);

    return extractedText;
  } catch (error) {
    throw new Error(
      `PDF extraction failed for "${pdfUrl}": ${error instanceof Error ? error.message : error}`,
    );
  }
}
