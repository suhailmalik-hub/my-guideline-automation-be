import { Browser, BrowserContext, Page, chromium } from "playwright";

export interface BrowserLaunchOptions {
  headless?: boolean;
  viewportWidth?: number;
  viewportHeight?: number;
  fullViewport?: boolean; // use full screen size, ignores viewportWidth/viewportHeight
}

// ── Cookie consent suppression ────────────────────────────────────────────────
// Known consent-provider script URL patterns — requests matching these are
// aborted so the banner JS never executes.
const CONSENT_SCRIPT_PATTERNS = [
  /cdn\.cookielaw\.org/, // OneTrust
  /optanon\.blob\.core/, // OneTrust CDN variant
  /cookiebot\.com/, // Cookiebot
  /consent\.trustarc\.com/, // TrustArc
  /privacy-mgmt\.com/, // SourcePoint
  /quantcast\.mgr\.consensu/, // Quantcast Choice
  /gdpr-cookie/i, // generic GDPR cookie scripts
];

// Pre-inject cookies that consent providers set on "Accept All" so sites
// suppress the banner themselves before the page loads.
const CONSENT_COOKIES = [
  // OneTrust — mark all groups as accepted
  { name: "OptanonAlertBoxClosed", value: new Date().toISOString() },
  {
    name: "OptanonConsent",
    value:
      "isGpcEnabled=0&datestamp=" +
      encodeURIComponent(new Date().toISOString()) +
      "&version=6.30.0&isIABGlobal=false&groups=1%3A1%2C2%3A1%2C3%3A1%2C4%3A1&hosts=&consentId=suppressed&interactionCount=1&landingPath=NotLandingPage&name=OptanonConsent&isAnonUser=1",
  },
  // Cookiebot
  {
    name: "CookieConsent",
    value:
      "{stamp:%27suppressed%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cmethod:%27explicit%27%2Cver:1%2Cutc:" +
      Date.now() +
      "%2Cregion:%27in%27}",
  },
  // Tarteaucitron (france-visas.gouv.fr and other French government sites)
  { name: "tarteaucitron", value: "!eulerian-analytics=true" },
];

async function suppressCookieBanners(
  context: BrowserContext,
  url: string,
): Promise<void> {
  try {
    // Approach 1: abort consent-provider script requests
    await context.route("**/*", (route) => {
      const reqUrl = route.request().url();
      if (CONSENT_SCRIPT_PATTERNS.some((pattern) => pattern.test(reqUrl))) {
        route.abort();
      } else {
        route.continue();
      }
    });

    // Approach 2: pre-inject "already accepted" cookies for the target domain
    const domain = new URL(url).hostname;
    await context.addCookies(
      CONSENT_COOKIES.map((cookie) => ({
        ...cookie,
        domain,
        path: "/",
      })),
    );
  } catch (error) {
    throw new Error(
      `Failed to suppress cookie banners: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function launchAutomationBrowser(
  url: string,
  options: BrowserLaunchOptions = {},
): Promise<{ browser: Browser; page: Page }> {
  try {
    // headless = false → visible browser window (debug);
    // headless = true → invisible headless (production)
    const {
      headless = true,
      viewportWidth = 1280,
      viewportHeight = 800,
      fullViewport = true,
    } = options;

    const browser = await chromium.launch({
      headless,
      args: [
        // --start-maximized is ignored in headless mode; use --window-size instead
        ...(fullViewport && !headless ? ["--start-maximized"] : []),
        ...(fullViewport && headless ? ["--window-size=1920,1080"] : []),
        "--disable-dev-shm-usage", // prevents blank pages from shared memory exhaustion
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding", // keeps renderer active between runs
        "--disable-backgrounding-occluded-windows",
        "--no-sandbox",
        // Prevent sites from detecting headless mode via automation flags
        "--disable-blink-features=AutomationControlled",
      ],
    });

    // In headless mode, viewport: null falls back to Chromium's 800×600 default
    // (--start-maximized is ignored). Always provide an explicit size for headless.
    const viewportConfig =
      fullViewport && !headless
        ? { viewport: null as null }
        : {
            viewport: {
              width: fullViewport ? 1920 : viewportWidth,
              height: fullViewport ? 1080 : viewportHeight,
            },
          };

    const context = await browser.newContext({
      ...viewportConfig,
      // Spoof the user agent to remove the "HeadlessChrome" marker
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      // Mask navigator.webdriver and other automation fingerprints
      javaScriptEnabled: true,
    });

    // Remove the webdriver property that headless Chrome exposes
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });

    // Suppress cookie consent banners before any page loads in this context
    await suppressCookieBanners(context, url);

    const page = await context.newPage();

    return { browser, page };
  } catch (error) {
    throw new Error(
      `Failed to launch automation browser: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function navigateToPage(page: Page, url: string): Promise<void> {
  try {
    // "networkidle" waits for dynamic content to settle — critical in headless mode
    // where "load" fires before JS-rendered elements (and their XPaths) are ready.
    await page.goto(url, { waitUntil: "load", timeout: 30000 });
  } catch (error) {
    throw new Error(
      `Failed to navigate to "${url}": ${error instanceof Error ? error.message : error}`,
    );
  }
}

// ── Open a new tab in the same browser context (useSession: true) ─────────────
export async function openNewTab(page: Page, url: string): Promise<Page> {
  try {
    const newPage = await page.context().newPage();
    await newPage.goto(url, { waitUntil: "load" });
    return newPage;
  } catch (error) {
    throw new Error(
      `Failed to open new tab for "${url}": ${error instanceof Error ? error.message : error}`,
    );
  }
}

async function clearBrowserSession(browser: Browser): Promise<void> {
  for (const context of browser.contexts()) {
    await context.clearCookies().catch(() => {});
    for (const page of context.pages()) {
      await page
        .evaluate(() => {
          try {
            localStorage.clear();
          } catch (_) {}
          try {
            sessionStorage.clear();
          } catch (_) {}
        })
        .catch(() => {});
    }
  }
}

// ── Clear session data (best-effort), then always close the browser ───────────
export async function closeBrowser(browser: Browser): Promise<void> {
  await clearBrowserSession(browser).catch(() => {});
  await browser.close();
}

 