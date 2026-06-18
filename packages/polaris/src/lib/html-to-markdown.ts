import TurndownService from "turndown";

const turndownService = new TurndownService();

//  Ignore <a> tags — remove href and extract only text
turndownService.addRule("removeLinks", {
  filter: "a",
  replacement: function (content) {
    return content;
  },
});

// Remove <script> and <style> tags and their content
turndownService.addRule("removeScriptsStyles", {
  filter: (node) => ["SCRIPT", "STYLE"].includes(node.nodeName),
  replacement: () => "",
});

// Remove <img> tags
turndownService.addRule("removeImages", {
  filter: "img",
  replacement: () => "",
});

// Convert section-header <li> elements to ## headings.
// Detection logic (works globally across sites):
//   1. No nested <ul>/<ol> — not a parent list item
//   2. Has at least one block child (<div> or <p>) — not a plain "* text" bullet item
//   3. No <div> directly inside another <div> — nested divs signal a content item, not a badge/label
//   4. Short trimmed text (≤ 80 chars) — badge/label pattern
// Examples that match:  <li><div><badge>Pre-requisites</badge></div></li>
// Examples that don't: <li><div><div>ID photograph.</div></div></li>  (has div>div)
//                      <li>Paris</li>  (no block child)
turndownService.addRule("listItemSectionHeader", {
  filter: (node) => {
    if (node.nodeName !== "LI") return false;
    // Must not contain nested lists
    if (node.querySelector("ul, ol")) return false;
    // Must have at least one block child — excludes plain text <li>Simple text</li>
    if (!node.querySelector("div, p")) return false;
    // Must NOT have nested divs (div > div) — content items use this pattern
    if (node.querySelector("div > div")) return false;
    const text = node.textContent?.trim() ?? "";
    return text.length > 0 && text.length <= 80;
  },
  replacement: (_content, node) => {
    const text = node.textContent?.trim() ?? "";
    return `\n\n## ${text}\n\n`;
  },
});

// For Table Conversion
turndownService.addRule("tableToReadableText", {
  filter: "table",
  replacement: function (_content, node) {
    const rows = Array.from(node.querySelectorAll("tr"));
    if (rows.length === 0) return "";

    // Extract headers
    const headers = Array.from(rows[0].querySelectorAll("th, td"))
      .map((cell) => cell.textContent?.trim())
      .filter(Boolean);

    let output = "\n\nTable Information:\n";

    // Process data rows
    rows.slice(1).forEach((row) => {
      const cells = Array.from(row.querySelectorAll("td")).map((cell) =>
        cell.textContent?.trim(),
      );

      if (cells.length === 0) return;

      output += "\n- ";
      cells.forEach((cell, index) => {
        output += `${headers[index]}: ${cell}\n  `;
      });
    });

    return output + "\n";
  },
});

export const convertHtmlToMarkdown = (content: string) => {
  return turndownService.turndown(content);
};
