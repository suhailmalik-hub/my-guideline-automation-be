// ── Polaris — Accessibility Tree & XPath Resolution ─────────────────────────

import { CDPSession, Page } from "playwright";

// ── Layer 1: AX roles that are pure structural chrome ────────────────────────
// Entire subtrees under these roles are skipped — no CDP calls are made for them.
const EXCLUDED_ROLES = new Set([
  "navigation", // <nav>, navbars
  "banner", // <header>, topbar
  "contentinfo", // <footer>
  "complementary", // sidebars, asides
  "search", // search bars
]);

// ── Layer 2: className patterns for structural noise in generic/none nodes ────
// Matched case-insensitively against the full className string.
const NOISE_CLASS_PATTERN =
  /\b(navbar|topbar|footer|breadcrumb|cookie|sidebar|side-bar|overlay|toast|banner|alert|announcement|skip-link|back-to-top|social|share|ad|ads|advertisement)\b/i;
// NOTE: "\bnav\b" intentionally removed — <nav> chrome is handled by EXCLUDED_ROLES ("navigation").
// NOTE: "\bheader\b" intentionally removed — <header> chrome is handled by EXCLUDED_ROLES ("banner").
// Keeping it would false-positive on content classes like "nav-item", "nav-link", "nav-tab", "accordion-header", "tab-header", "section-header".

async function snapshotPageSemanticTree(cdp: CDPSession): Promise<any[]> {
  try {
    const { nodes } = await cdp.send("Accessibility.getFullAXTree", {});
    return nodes;
  } catch (error) {
    throw new Error(
      `Failed to capture accessibility tree: ${error instanceof Error ? error.message : error}`,
    );
  }
}

async function enrichSemanticNodesWithXPaths(
  cdp: CDPSession,
  axNodes: any[],
  targetElement?: string,
): Promise<any[]> {
  try {
    // ── Layer 1: Filter by role ───────────────────────────────────────────────
    // Exclude structural chrome roles entirely (saves downstream CDP calls too).
    // "none" and "generic" are kept here; anonymous ones are dropped after resolve.
    const filteredNodes = axNodes.filter((node) => {
      const role = node.role?.value;
      /**
       * ⚠️ Old approach (removed): if (!role || role === "none" || role === "generic") return false;
       * dropping all none/generic roles excluded content containers too
       * — e.g.
       * <div class="visa-type-content">
       * gets role="none" but holds the entire Overview section we need to target.
       */
      if (!role) return false;
      if (EXCLUDED_ROLES.has(role)) return false;
      if (!node.backendDOMNodeId) return false;
      if (targetElement && role !== targetElement) return false;
      return true;
    });

    // ── Concurrently resolve XPath + textContent for each node (2N CDP calls) ─
    const results = await Promise.all(
      filteredNodes.map(async (node) => {
        try {
          const { object } = await cdp.send("DOM.resolveNode", {
            backendNodeId: node.backendDOMNodeId,
          });
          const { result } = await cdp.send("Runtime.callFunctionOn", {
            objectId: object.objectId,
            functionDeclaration: `function() {
              function getXPath(el) {
                if (!el) return '';
                // Only use id-based xpath when the id is unique in the document.
                // Duplicate ids (e.g. id="visaCatBtn" on 23 links) would all resolve
                // to the same xpath and Playwright would always pick the first match.
                if (el.id && document.querySelectorAll('[id="' + el.id + '"]').length === 1) {
                  return '//*[@id="' + el.id + '"]';
                }
                if (el === document.body) return '/html/body';
                const siblings = Array.from(el.parentNode?.children ?? []);
                const sameTag  = siblings.filter(s => s.tagName === el.tagName);
                const index    = sameTag.indexOf(el) + 1;
                const suffix   = sameTag.length > 1 ? '[' + index + ']' : '';
                return getXPath(el.parentElement) + '/' + el.tagName.toLowerCase() + suffix;
              }
              function getGroup(el) {
                let cur = el.parentElement;
                while (cur && cur !== document.body) {
                  if (cur.tagName === 'FIELDSET') {
                    const legend = cur.querySelector('legend');
                    if (legend) return legend.textContent?.trim() || null;
                  }
                  const labelledBy = cur.getAttribute('aria-labelledby');
                  if (labelledBy) {
                    const labelEl = document.getElementById(labelledBy);
                    if (labelEl) return labelEl.textContent?.trim() || null;
                  }
                  const ariaLabel = cur.getAttribute('aria-label');
                  if (ariaLabel) return ariaLabel.trim() || null;
                  cur = cur.parentElement;
                }
                return null;
              }
              return {
                xpath: getXPath(this) || null,
                text:  this.textContent?.trim().substring(0, 200) ?? null,
                className: this.className?.trim() || null,
                group: getGroup(this) || null,
              };
            }`,
            returnByValue: true,
          });

          const { xpath, text, className, group } = result.value as {
            xpath: string | null;
            text: string | null;
            className: string | null;
            group: string | null;
          };
          if (!xpath) return null;

          // Drop anonymous none/generic containers (no className = structural noise)
          if (
            (node.role.value === "none" || node.role.value === "generic") &&
            !className
          )
            return null;

          // ── Layer 2: Drop any node whose className matches noise patterns ──
          // Applied to ALL roles — e.g. listitem ".mobile-footer" has role "listitem"
          // (not none/generic) so it must be caught here too.
          if (className && NOISE_CLASS_PATTERN.test(className)) return null;

          let name = node.name?.value;
          // For container nodes (divs/sections), use className as primary identifier
          if (!name && className) name = `.${className}`;
          if (!name && text && text.length > 0) name = text;

          return {
            role: node.role.value,
            name,
            group: group ?? null,
            backendDOMNodeId: node.backendDOMNodeId,
            xpath,
          };
        } catch {
          return null;
        }
      }),
    );

    return results.filter(Boolean);
  } catch (error) {
    throw new Error(
      `Failed to enrich semantic nodes with XPaths: ${error instanceof Error ? error.message : error}`,
    );
  }
}

function serializeSemanticTreeForAI(mergedNodes: any[]): {
  combinedTree: string;
  xpathLookup: Map<string, string>;
} {
  const lines: string[] = [];
  const xpathLookup = new Map<string, string>();

  for (const node of mergedNodes) {
    const label = node.name ? `"${node.name}"` : "";
    const groupPart = node.group ? ` [group: "${node.group}"]` : "";
    const line = `${node.role} ${label}${groupPart} xpath=${node.xpath}`.trim();
    lines.push(line);

    if (node.name) {
      xpathLookup.set(`${node.role}:${node.name}`, node.xpath);
    }
  }

  return { combinedTree: lines.join("\n"), xpathLookup };
}

// ── Capture & serialize the AX tree for the current page state ───────────────
export async function captureSemanticTree(
  page: Page,
  targetElement?: string,
): Promise<string> {
  try {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("DOM.enable");
    await cdp.send("Accessibility.enable");
    await cdp.send("Runtime.enable");
    const axNodes = await snapshotPageSemanticTree(cdp);
    const mergedNodes = await enrichSemanticNodesWithXPaths(
      cdp,
      axNodes,
      targetElement,
    );
    const { combinedTree } = serializeSemanticTreeForAI(mergedNodes);
    await cdp.detach();
    return combinedTree;
  } catch (error) {
    throw new Error(
      `Failed to capture semantic tree: ${error instanceof Error ? error.message : error}`,
    );
  }
}
