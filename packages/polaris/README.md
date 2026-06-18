# @polaris/core

AI-powered browser automation library. Describe what you want to do in plain English — Polaris uses an AI model to locate elements on the page and execute actions for you. No selectors or XPaths to write manually.

---

## How It Works

1. Launches a Chromium browser via Playwright
2. Captures the page's accessibility tree (AX tree) via Chrome DevTools Protocol
3. Sends the tree to your chosen AI model with a plain-English description of the target element
4. AI resolves the exact XPath from the tree
5. Executes the action (click, fill, extract, etc.) against that XPath
6. Returns structured results with extracted content and AI token usage

---

## Installation

```bash
npm install /path/to/packages/polaris
```

Or once published to npm:

```bash
npm install @polaris/core
```

---

## Quick Start

```ts
import { Polaris, PolarisRunConfig } from "@polaris/core";

const polaris = new Polaris();

polaris.config({
  ai: {
    aiProvider: "openai",
    aiProviderApiKey: process.env.OPENAI_API_KEY!,
    aiModel: "gpt-4o-mini",
  },
  ocr: {
    azureOcrSubscriptionKey:
      process.env.AZURE_COMPUTERVISION_OCR_SUBSCRIPTION_KEY!,
    azureOcrEndpoint: process.env.AZURE_COMPUTERVISION_OCR_ENDPOINT!,
  },
});

const runConfig: PolarisRunConfig = {
  useSession: false,
  flows: {
    example: {
      url: "https://example.com",
      steps: [
        {
          action: "extract",
          target: "main heading text",
          targetElement: "",
        },
      ],
    },
  },
};

const result = await polaris.run(runConfig);
console.log(result.results);
console.log(result.totalUsage);
```

---

## Configuration

### `polaris.config(instanceConfig)`

Sets credentials once. Must be called before `polaris.run()`.

```ts
polaris.config({
  ai: {
    aiProvider: "openai" | "claude", // required
    aiProviderApiKey: "your-api-key", // required
    aiModel: "gpt-4o-mini", // required — see supported models below
  },
  ocr: {
    // optional — only required for extractPDF action
    azureOcrSubscriptionKey: "your-key",
    azureOcrEndpoint: "https://your-endpoint.cognitiveservices.azure.com",
  },
});
```

### Supported AI Models

**OpenAI**
| Model | Notes |
|---|---|
| `gpt-4o` | Best accuracy |
| `gpt-4o-mini` | Faster, cheaper — recommended default |

**Claude (Anthropic)**
| Model | Notes |
|---|---|
| `claude-sonnet-4-20250514` | Latest Claude Sonnet |

---

## Running Automations

### `polaris.run(runConfig)`

Returns a `Promise<PolarisRunResult>`.

```ts
const result = await polaris.run(runConfig);
```

#### `PolarisRunConfig`

Two modes controlled by `useSession`:

**`useSession: false`** — Each flow navigates in the same browser tab.

```ts
{
  useSession: false,
  flows: {
    flowName: {
      url: "https://example.com",       // required
      waitBeforeStart: 2000,            // optional — ms to wait before first step
      steps: [ ... ],
    },
  },
}
```

**`useSession: true`** — All flows share the same browser context. Each flow opens its URL in a new tab. `url` is required per flow.

```ts
{
  useSession: true,
  flows: {
    flowName: {
      url: "https://example.com",       // required
      waitBeforeStart: 2000,
      steps: [ ... ],
    },
  },
}
```

---

## Steps

Each step in a flow describes a single browser action using `AutomationStep`.

```ts
interface AutomationStep {
  action: "click" | "fill" | "select" | "extract" | "extractPDF";
  target: string; // plain-English description of the element
  targetElement: string; // narrows AX tree to this ARIA role (e.g. "tab", "button") — leave "" for no filter
  value?: string; // required for "fill" and "select"
  pdfUrl?: string; // required for "extractPDF" — direct URL to the PDF
  snapshotBeforeStep?: boolean; // re-snapshot AX tree before this step (use after DOM mutations)
  waitBeforeStep?: number; // ms to wait before this step executes
}
```

### Actions

| Action       | Description                        | Required fields   |
| ------------ | ---------------------------------- | ----------------- |
| `click`      | Clicks an element                  | `target`          |
| `fill`       | Types text into an input           | `target`, `value` |
| `select`     | Selects a dropdown option          | `target`, `value` |
| `extract`    | Extracts content as Markdown       | `target`          |
| `extractPDF` | Downloads and OCRs a PDF via Azure | `pdfUrl`          |

### `snapshotBeforeStep`

Use this on any step that follows a DOM mutation (tab switch, accordion open, modal). Without it, the AI uses the initial page snapshot which won't include dynamically rendered content.

```ts
{
  action: "extract",
  target: "Visa Fees tab content",
  targetElement: "",
  snapshotBeforeStep: true,   // re-captures AX tree after the previous click changed the DOM
}
```

### `targetElement`

Narrows the AX tree snapshot to only elements with this ARIA role before sending it to the AI. Reduces noise and improves accuracy for elements like tabs and buttons.

```ts
{
  action: "click",
  target: "Documents Required tab",
  targetElement: "tab",   // only tab-role elements are included in the AI prompt
}
```

---

## Result

```ts
interface PolarisRunResult {
  results: StepResult[];
  totalUsage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

interface StepResult {
  flowName: string;
  stepIndex: number;
  action: string;
  target: string;
  xpath: string; // the XPath the AI resolved
  extractedContent?: string; // Markdown content (for extract / extractPDF steps)
  usage?: {
    // AI token usage for this step
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}
```

---

## Full Example — Multi-tab Scraping

```ts
import { Polaris, PolarisRunConfig } from "@polaris/core";

const polaris = new Polaris();
polaris.config({
  ai: {
    aiProvider: "openai",
    aiProviderApiKey: process.env.OPENAI_API_KEY!,
    aiModel: "gpt-4o-mini",
  },
  ocr: {
    azureOcrSubscriptionKey:
      process.env.AZURE_COMPUTERVISION_OCR_SUBSCRIPTION_KEY!,
    azureOcrEndpoint: process.env.AZURE_COMPUTERVISION_OCR_ENDPOINT!,
  },
});

const runConfig: PolarisRunConfig = {
  useSession: false,
  flows: {
    overview: {
      url: "https://visa.vfsglobal.com/ind/en/bel/visa-type#shorttermvisa",
      waitBeforeStart: 8000,
      steps: [
        {
          action: "extract",
          target: "Overview active tab content",
          targetElement: "",
        },
        {
          action: "click",
          target: "Visa Fees tab button",
          targetElement: "",
        },
        {
          action: "extract",
          target: "Visa Fees active tab content",
          targetElement: "",
          snapshotBeforeStep: true,
        },
        {
          action: "extractPDF",
          target: "",
          targetElement: "",
          pdfUrl: "https://example.com/requirements.pdf",
        },
      ],
    },
  },
};

polaris
  .run(runConfig)
  .then((result) => {
    console.log("Results:", JSON.stringify(result.results, null, 2));
    console.log("Total AI usage:", result.totalUsage);
  })
  .catch((err) => console.error(err.message));
```

---

## Environment Variables

| Variable                                    | Required for        |
| ------------------------------------------- | ------------------- |
| `OPENAI_API_KEY`                            | OpenAI provider     |
| `ANTHROPIC_API_KEY`                         | Claude provider     |
| `AZURE_COMPUTERVISION_OCR_SUBSCRIPTION_KEY` | `extractPDF` action |
| `AZURE_COMPUTERVISION_OCR_ENDPOINT`         | `extractPDF` action |

---

## Architecture

```
src/
  polaris.ts      ← Facade (public entry point)
  runner.ts       ← Orchestrator (flow execution)
  actions.ts      ← Browser action executors
  ai.ts           ← AI provider abstraction (OpenAI / Claude)
  ax-tree.ts      ← Accessibility tree capture via CDP
  browser.ts      ← Playwright browser lifecycle
  lib/
    azure-ocr.ts          ← Azure Computer Vision adapter
    html-to-markdown.ts   ← HTML → Markdown converter
  types.ts        ← All type definitions
  index.ts        ← Public exports
```

---

## Dependencies

| Package             | Purpose                      |
| ------------------- | ---------------------------- |
| `playwright`        | Browser automation           |
| `openai`            | OpenAI API client            |
| `@anthropic-ai/sdk` | Claude API client            |
| `turndown`          | HTML to Markdown conversion  |
| `dotenv`            | Environment variable loading |

---

## Internal Deep Dive — AX Tree Pipeline & XPath Mapping

This section explains exactly how Polaris locates elements without you writing a single selector.

---

### Code Flow Mind Map

```
polaris.run(runConfig)
│
├── runner.ts — executePolarisAutomation()
│   │
│   ├── browser.ts — launchAutomationBrowser()
│   │   └── Launches Chromium via Playwright
│   │       ├── Suppresses cookie banners (blocks consent scripts, pre-injects cookies)
│   │       └── Opens browser context + navigates to flow URL
│   │
│   └── For each flow → for each step:
│       │
│       ├── [if snapshotBeforeStep] ax-tree.ts — captureSemanticTree()
│       │   └── (see AX Tree Pipeline below)
│       │
│       ├── [if action != extractPDF] ai.ts — locateElementXPathWithAI()
│       │   └── (see AI XPath Resolution below)
│       │
│       └── actions.ts — execute action with resolved xpath
│           ├── click      → page.locator(xpath).click()
│           ├── fill       → page.locator(xpath).fill(value)
│           ├── select     → page.locator(xpath).selectOption(value)
│           ├── extract    → page.locator(xpath).evaluate(outerHTML) → Markdown
│           └── extractPDF → fetch(pdfUrl) → Azure OCR → extracted text
```

---

### AX Tree Pipeline (`ax-tree.ts`)

The AX tree is the browser's semantic representation of the page — the same tree screen readers use. Polaris uses Chrome DevTools Protocol (CDP) to capture and process it.

```
captureSemanticTree(page, targetElement?)
│
├── STEP 1 — Open CDP session
│   ├── DOM.enable
│   ├── Accessibility.enable
│   └── Runtime.enable
│
├── STEP 2 — Snapshot full AX tree
│   └── CDP: Accessibility.getFullAXTree
│       └── Returns all raw AX nodes (can be 1,000+ on complex pages)
│           Each node has:
│           ├── role.value    → "button", "heading", "tab", "generic", "none"...
│           ├── name.value    → "Accept Cookies", "Sign In", "" (sometimes empty)
│           └── backendDOMNodeId → bridge key to the real DOM element
│
├── STEP 3 — Filter noise (Layer 1: role-based)
│   ├── Drop nodes with no role
│   ├── Drop nodes with no backendDOMNodeId (can't resolve to DOM)
│   ├── Drop entire structural chrome roles:
│   │   └── "navigation" | "banner" | "contentinfo" | "complementary" | "search"
│   └── [if targetElement set] keep only nodes matching that ARIA role
│       e.g. targetElement="tab" → only tab-role nodes pass through
│           → drastically reduces AI prompt size for click steps
│
├── STEP 4 — Resolve XPath + class for each node (concurrent, 2× CDP calls per node)
│   │
│   ├── CDP: DOM.resolveNode(backendDOMNodeId)
│   │   └── Returns objectId — a live JS reference to the DOM element
│   │
│   └── CDP: Runtime.callFunctionOn(objectId)
│       └── Injects getXPath() directly into the browser and runs it on the element:
│           │
│           ├── Has element.id?
│           │   └── → //*[@id="accept-btn"]          (shortest, most stable)
│           │
│           ├── Is document.body?
│           │   └── → /html/body                     (base case)
│           │
│           └── Otherwise: walk up parentElement chain
│               ├── Count siblings with same tag → determine index
│               └── → /html/body/div[2]/ul/li[3]/a   (positional path)
│
│           Also returns: textContent (first 200 chars), className
│
├── STEP 5 — Filter noise (Layer 2: className-based)
│   ├── Drop none/generic nodes with no className (anonymous structural divs)
│   └── Drop any node whose className matches noise patterns:
│       navbar | header | footer | breadcrumb | cookie | sidebar |
│       overlay | toast | banner | ad | advertisement | social | share...
│
├── STEP 6 — Build final node: { role, name, xpath }
│   ├── Primary name source:  node.name.value (AX name set by the browser)
│   ├── Fallback for containers: ".className"  e.g. ".visa-type-content"
│   └── Last fallback: textContent snippet
│
└── STEP 7 — Serialize to flat text for AI
    └── One line per node:
        │
        ├── button "Accept Cookies" xpath=//*[@id="accept-btn"]
        ├── heading "Overview"      xpath=/html/body/div/h2
        ├── tab "Visa Fees"         xpath=//*[@id="visafees"]
        └── generic ".visa-type-content" xpath=//*[@id="shorttermvisa"]/div/...
```

**Why not drop `none`/`generic` entirely?**
Container divs like `<div class="visa-type-content">` carry `role="none"` but wrap entire content sections. Dropping them would make it impossible to extract section content. Polaris keeps them if they have a `className` and the className doesn't match noise patterns.

---

### AI XPath Resolution (`ai.ts`)

Once the combined tree string is ready, Polaris asks the AI to pick the right XPath.

````
locateElementXPathWithAI(combinedTree, targetDescription, provider, apiKey, model)
│
├── Build prompt:
│   ├── Paste the full combined tree (serialized flat list)
│   ├── State the target in plain English:  "Visa Fees active tab content"
│   └── Rules sent to AI:
│       ├── Pick the xpath EXACTLY as it appears — do NOT construct or modify
│       ├── If target is "content" of a section → prefer container (.className node)
│       │   not the heading or paragraph inside it
│       └── Return ONLY the xpath string, nothing else
│
├── Call AI provider:
│   ├── OpenAI  → client.chat.completions.create({ model, max_tokens: 200 })
│   └── Claude  → client.messages.create({ model, max_tokens: 200 })
│
├── Sanitize raw AI response:
│   ├── Strip opening/closing ``` code fences
│   ├── Strip single backtick wrapping
│   └── Strip literal "xpath=" prefix if AI included it
│
└── Return { xpath, usage: { input_tokens, output_tokens, total_tokens } }
````

**Why max_tokens: 200?**
The AI only needs to return a single XPath string. A 200-token ceiling prevents verbose responses and keeps cost minimal.

---

### Cookie Banner Suppression (`browser.ts`)

Polaris automatically handles cookie consent banners so they never block automation.

```
Two-pronged approach (runs before page loads):
│
├── Approach 1 — Block consent scripts at network level
│   └── context.route("**/*") intercepts all requests
│       └── Aborts requests matching known CDN patterns:
│           ├── cdn.cookielaw.org     (OneTrust)
│           ├── cookiebot.com         (Cookiebot)
│           ├── consent.trustarc.com  (TrustArc)
│           ├── privacy-mgmt.com      (SourcePoint)
│           └── quantcast.mgr.consensu (Quantcast)
│
└── Approach 2 — Pre-inject "already accepted" cookies
    └── context.addCookies() before navigation:
        ├── OptanonAlertBoxClosed + OptanonConsent  (OneTrust)
        └── CookieConsent                           (Cookiebot)
        → Site reads these cookies on load and suppresses the banner itself
```

---

### XPath Strategy — Priority Order

When `getXPath()` runs inside the browser on a target element:

```
Priority 1 — element has an id attribute
             //*[@id="visafees"]
             Shortest and most stable — survives DOM restructuring

Priority 2 — element is document.body
             /html/body
             Base case for the recursive walk

Priority 3 — positional path (recursive walk up)
             count siblings with the same tag to determine index
             /html/body/div[2]/div/ul/li[3]/a
             Built by concatenating parent path + tag + optional [index]
             Index is only added when there are multiple siblings with same tag
```

---

### Data Flow Summary

```
User code
  │  polaris.run({ flows: { ... steps with plain-English targets } })
  ▼
runner.ts
  │  Navigate → snapshot AX tree → for each step → ask AI → execute
  ▼
ax-tree.ts
  │  CDP raw nodes (1000+) → filter → resolve DOM → XPath → serialize
  ▼
  "button 'Accept' xpath=//*[@id='accept-btn']
   tab 'Visa Fees' xpath=//*[@id='visafees']
   generic '.visa-type-content' xpath=//*[@id='shorttermvisa']/div/..."
  ▼
ai.ts
  │  Combined tree + "Visa Fees active tab content" → AI → "//*[@id='visafees']"
  ▼
actions.ts
  │  page.locator("xpath=//*[@id='visafees']").click()
  ▼
Result: { flowName, stepIndex, action, xpath, extractedContent, usage }
```
