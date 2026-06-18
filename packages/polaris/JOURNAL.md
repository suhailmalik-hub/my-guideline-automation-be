# Polaris — Development Journal

A running log of design decisions, architecture rationale, and implementation insights from the build of the `@polaris/core` package.

---

## What Is Polaris

An AI-powered browser automation library. You describe what you want to interact with in plain English — Polaris resolves the exact XPath from the live page structure and executes the action.

No manual selectors or XPaths. No brittle CSS class dependencies. The page structure is captured, AI picks the right element, Playwright executes the action.

---

## The Core Pipeline

```
AX Tree Pipeline
│
├── 1. GET AX TREE
│   └── CDP: Accessibility.getFullAXTree
│       └── Returns ~1,077 raw nodes
│           ├── Roles: "button", "heading", "link", "none", "generic"...
│           ├── Names: "Accept Cookies", "Sign In"...
│           └── backendDOMNodeId: 42  (bridge to real DOM)
│
├── 2. FILTER NOISE
│   ├── Drop excluded structural roles (nav, header, footer, sidebar, search)
│   ├── Drop nodes with no backendDOMNodeId
│   └── Result: ~1,077 → ~91 semantic nodes
│
├── 3. SINGLE NODE FLOW (×91, concurrent)
│   │
│   ├── AX Node: { role: "button", name: "Accept", backendDOMNodeId: 42 }
│   │
│   ├── CDP: DOM.resolveNode(backendDOMNodeId: 42)
│   │   └── Returns objectId (live JS reference)
│   │
│   └── CDP: Runtime.callFunctionOn(objectId)
│       └── Injects getXPath() into browser; runs on target element:
│           ├── Has ID?  → //*[@id="accept-btn"]          (short, stable)
│           ├── Is Body? → /html/body                     (base case)
│           └── Else?    → walk up parentElement chain
│                          → /html/body/div[2]/ul/li[3]/a (positional)
│
├── 4. MERGE RESULT (per node)
│   └── Output: { role, name, backendDOMNodeId, xpath }
│
├── 5. FORMAT COMBINED TREE (serialized flat list for AI)
│   └── One node per line:
│       ├── button "Accept Cookies" xpath=//*[@id="accept-btn"]
│       ├── heading "Overview"      xpath=/html/body/div/h2
│       └── link "Apply Now"        xpath=//*[@id="apply"]
│
└── 6. AI RESOLUTION
    ├── Input: Combined tree + targetDescription ("Overview content")
    ├── AI picks the matching XPath from the flat list
    └── Result: //*[@id="tourist"]/div/ul[2]/li[1]/a
```

---

## Architecture Decisions

### Why Accessibility Tree (not DOM scraping)

The AX tree gives us a semantic, pre-filtered view of the page. Rather than parsing thousands of DOM nodes, the AX tree exposes only meaningful elements (buttons, headings, links, form fields, content containers). This reduces the AI's context window requirements significantly and improves accuracy.

### Why CDP Directly (not Playwright's built-in AX methods)

Playwright's `page.accessibility.snapshot()` returns a nested tree that loses parent relationship context when flattened. Using `Accessibility.getFullAXTree` via CDP gives us a flat array of all nodes with their `backendDOMNodeId` — the bridge we need to resolve live DOM XPaths via `DOM.resolveNode` and `Runtime.callFunctionOn`.

### XPath Resolution Strategy

The `getXPath()` function injected into the browser follows a priority cascade:

1. If the element has an `id` → use `//*[@id="..."]` — stable, short
2. If the element is `<body>` → base case `/html/body`
3. Otherwise → walk up `parentElement` chain building a positional path

This keeps XPaths as short and stable as possible. ID-based paths survive minor DOM reshuffles; positional paths are only used as a last resort.

---

## Noise Filtering: Two Layers

### Layer 1 — Role exclusion

Entire subtrees under structural chrome roles are skipped entirely. No CDP calls are wasted on them:

```
navigation, banner, contentinfo, complementary, search
```

> **Important design note:** `\bnav\b` was intentionally _removed_ from the noise class patterns. The `navigation` role exclusion handles `<nav>` elements. Keeping `nav` as a class pattern caused false positives on content classes like `nav-item`, `nav-link`, `nav-tab`.

### Layer 2 — className noise patterns

Applied to **all roles** (not just `none`/`generic`) because structural noise can appear in any role. A `listitem` with className `mobile-footer` should be dropped even though its role is `listitem`.

Pattern: `navbar|topbar|header|footer|breadcrumb|cookie|sidebar|overlay|toast|banner|alert|announcement|skip-link|back-to-top|social|share|ad|ads|advertisement`

### The `none`/`generic` Problem

> **Previous broken approach:** Drop all nodes where `role === "none" || role === "generic"`.

This was wrong. Content container divs get `role="none"` or `role="generic"` from the AX tree. For example:

```html
<div class="visa-type-content">
  <!-- role="none", but holds entire Overview section -->
</div>
```

If we dropped all `none`/`generic` nodes, entire page sections became unreachable to the AI.

**Correct approach:** Keep `none`/`generic` nodes that have a `className`. Use the className as their name (prefixed with `.`). Drop only anonymous `none`/`generic` nodes with no className (those are genuine structural noise).

---

## Modes

### `play` mode

AI is called for every step. The AI resolves the XPath from the current AX tree snapshot against the `targetDescription`. Used during initial flow authoring — you describe what you want and the AI finds it.

### `run` mode

AI is skipped entirely. Steps must have a pre-resolved `xpath` field. Used in production/scheduled runs where the AI has already been used once to resolve and store XPaths. Fails fast if any step is missing an `xpath`.

---

## Session Modes

### `useSession: false` (default)

Each flow navigates the same browser tab. URL navigation is done via `navigateToPage()`. All flows run sequentially in a single tab. Suitable for single-domain flows.

### `useSession: true`

All flows share the same browser context (same cookies, localStorage, auth state). Each flow's URL is opened as a new tab using `openNewTab()`. Useful when flows depend on a shared authenticated session — e.g. log in once in flow 1, then access account pages in flows 2 and 3.

---

## Snapshot Lifecycle & `snapshotBeforeStep`

The AX tree is captured once at the start of each flow. This snapshot is passed through all steps as a shared `combinedTree` string.

**Problem:** After a click that triggers a DOM mutation (tab switch, accordion expand, modal open), the dynamically rendered content isn't in the initial snapshot. The AI would try to resolve XPaths that don't exist in the old tree.

**Solution:** `snapshotBeforeStep: true` on a step re-runs `captureSemanticTree()` before that step executes (and before any `waitBeforeStep` delay). The fresh tree replaces the shared `combinedTree` for that step and all subsequent steps.

```ts
{
  name: "Extract Visa Fees",
  action: "extract",
  targetDescription: "Visa Fees active tab content",
  snapshotBeforeStep: true,  // ← re-snapshot after "Click Visa Fees tab" mutated the DOM
}
```

---

## Step Types

### `extract`

Captures the `outerHTML` of the resolved element, converts it to Markdown via Turndown, and returns the text. Links have `href` stripped (text only). Scripts, styles, and images are removed. Tables are converted to a readable bullet-point format.

### `click`

Clicks the resolved element using `{ force: true }` to bypass Playwright's actionability checks (handles elements obscured by overlays). Waits for `load` state after the click to let SPA navigations settle.

### `extractPDF`

No AI resolution — operates directly on the `pdfUrl` field. Downloads the PDF to OS temp dir, sends it to Azure Computer Vision OCR (`/vision/v3.2/read/analyze`), polls until status is `succeeded`, extracts line-by-line text, cleans up the temp file.

Requires OCR credentials set in `polaris.config()`.

---

## Cookie Banner Suppression

Sites with consent banners (OneTrust, Cookiebot, TrustArc, SourcePoint, Quantcast) break AX tree capture by injecting overlay elements that the AX tree includes as high-priority nodes.

Two-pronged approach in `browser.ts`:

1. **Request interception** — known consent provider script URLs are aborted before they execute. The banner JS never runs.
2. **Pre-injected cookies** — `OptanonAlertBoxClosed`, `OptanonConsent`, `CookieConsent` are injected as pre-accepted cookies on the target domain. Sites that check these cookies suppress the banner themselves.

---

## HTML → Markdown Conversion

The `convertHtmlToMarkdown()` utility wraps Turndown with custom rules:

- `<a>` tags → text only (no markdown links, no URLs)
- `<script>`, `<style>` → stripped entirely
- `<img>` → removed
- `<table>` → converted to a bullet list with `Header: Value` pairs per row, preceded by `Table Information:`

This keeps extracted content clean for downstream AI consumption.

---

## Azure OCR Integration

Uses the Azure Computer Vision Read API v3.2 (`/vision/v3.2/read/analyze`). The API is asynchronous:

1. POST the raw PDF bytes — response includes an `operation-location` header
2. Poll `GET operation-location` every 3 seconds until `status === "succeeded"`
3. Walk `analyzeResult.readResults[].lines[].text` to assemble the full text output

---

## XPath Override Support

In `play` mode, if a step already has an `xpath` field populated, the AI is still called to validate — the resolved xpath from AI is used. In `run` mode, the `xpath` field is mandatory and AI is bypassed entirely.

For the `extractPDF` action, XPath resolution is always skipped regardless of mode — the `pdfUrl` is used directly.

---

## Public API Surface

```ts
// Main class
import { Polaris } from "@polaris/core";

// Browser utilities (used by runner internally, exposed for advanced use)
import { launchAutomationBrowser, navigateToPage } from "@polaris/core";

// All types
import type {
  AIModel,
  AIProvider,
  AutomationAction,
  AutomationFlow,
  AutomationFlowWithUrl,
  AutomationStep,
  ClickStep,
  ClaudeModel,
  ExtractPDFStep,
  ExtractStep,
  OpenAIModel,
  PolarisAIConfig,
  PolarisInstanceConfig,
  PolarisOCRConfig,
  PolarisRunConfig,
  PolarisRunResult,
  StepResult,
} from "@polaris/core";
```

---

## Changelog — 16 April 2026

### New Actions: `selectDropdownOption`, `fillTextInput`, `selectRadioInput`

Three new step action types added alongside `click`, `extract`, `extractPDF`.

- **`selectDropdownOption`** — uses Playwright `.selectOption()`. Takes `value` (required), `targetDescription`, optional `targetElement` and `xpath`.
- **`fillTextInput`** — uses Playwright `.fill()`. Takes `value` (required). Renamed from `fillFormField` in `actions.ts` to align with the action name pattern.
- **`selectRadioInput`** — uses Playwright `.check()` (correct method for radio/checkbox inputs, not `.click()`). No `value` field — the target description identifies the specific radio option.

Each follows the same discriminated union pattern: `SelectDropdownOptionStep`, `FillTextInputStep`, `SelectRadioInputStep` — all extend `BaseStep`, have their own result types, and are included in `AutomationStep` and `AutomationStepResult` unions.

---

### Bug Fix: Initial AX Tree Snapshot Missing `targetElement` Filter

**Problem:** The initial `captureSemanticTree()` call at the start of each flow had no `targetElement` filter — the full unfiltered AX tree was passed to AI for step 1. Only steps with `snapshotBeforeStep: true` benefited from the filtered snapshot.

```ts
// before — always full tree for step 1
let sharedCombinedTree = await captureSemanticTree(activePage);
```

**Fix:** The first step's `targetElement` is read and passed to the initial snapshot call:

```ts
const firstStep = flow.steps[0];
const firstTargetEl =
  firstStep && "targetElement" in firstStep
    ? firstStep.targetElement
    : undefined;
let sharedCombinedTree = await captureSemanticTree(activePage, firstTargetEl);
```

Steps 2+ are unaffected — they use `snapshotBeforeStep: true` with their own `targetElement`.

---

### Radio Button Disambiguation: Group Context in AX Tree

**Problem:** Multiple radio groups on the same page produce duplicate bare labels in the serialized AX tree:

```
radio "No" xpath=//*[@id="hasConjointFr_2"]
radio "No" xpath=//*[@id="hasFamillyNational_2"]
```

AI had no way to distinguish between `"No"` options from different questions and selected the wrong one.

**Solution:** Added `getGroup()` inside the `callFunctionOn` JS function injected into the browser. It walks up the DOM from each element and resolves the question/group context via:

1. Nearest `<fieldset>` → reads its `<legend>` text
2. Nearest ancestor with `aria-labelledby` → reads that element's text
3. Nearest ancestor with `aria-label` → reads the attribute value

The group is included in the serialized AX tree line when present:

```
radio "No" [group: "Are you married to a French national?"] xpath=//*[@id="hasConjointFr_2"]
radio "No" [group: "Do you have a family member who is a French national?"] xpath=//*[@id="hasFamillyNational_2"]
```

**`getGroup()`** is called for all elements but only produces output when group context exists — no performance impact for non-grouped elements. Meaningful output occurs only for grouped inputs like **radios** and **checkboxes**.

---

## Key Lessons

- **AX tree `none`/`generic` nodes are not always noise.** Container divs that hold entire page sections get these roles. Dropping them all breaks content extraction for most SPAs.
- **`snapshotBeforeStep` is essential for tab-based SPAs.** Without it, the AI uses a stale tree that doesn't include tab-panel content rendered after click.
- **`play` vs `run` mode separation is the right model.** Use AI during authoring to resolve and record XPaths; use pre-resolved XPaths in production to avoid paying AI costs per run and to eliminate AI latency from the critical path.
- **Consent banner suppression must happen before page load.** Route interception and pre-injected cookies must be set up on the `BrowserContext` before the first navigation — not after.
