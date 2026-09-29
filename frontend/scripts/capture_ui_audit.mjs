/* global console process window document */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const base = "http://127.0.0.1:4173";
const captureMode = process.env.CAPTURE_MODE ?? "LIVE";
const outputDir = path.resolve(process.cwd(), "..", "artifacts", "ui-audit");
const viewports = [
  { name: "desktop-1440", width: 1440, height: 1000 },
  { name: "tablet-768", width: 768, height: 1000 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "mobile-390", width: 390, height: 844 },
];
const routes = [
  ["landing", "/"],
  ["app-dashboard", "/app"],
  ["charter-explorer", "/charters"],
  ["new-charter", "/charters/new"],
  ["charter-detail", "/charters/CHR-00000001"],
  ["case-explorer", "/cases"],
  ["case-command-center", "/cases/CASE-00000001"],
  ["evidence", "/cases/CASE-00000001/evidence"],
  ["resolution", "/cases/CASE-00000001/resolution"],
  ["challenge", "/cases/CASE-00000001/challenge"],
  ["activity", "/activity"],
  ["proof", "/proof"],
  ["integrate", "/integrate"],
  ["docs", "/docs"],
];

fs.mkdirSync(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  await context.addInitScript(() => {
    window.ethereum = {
      request: async ({ method }) => {
        if (method === "eth_chainId") return "0xf22d";
        throw new Error("WALLET_WRITE_NOT_REQUESTED");
      },
    };
  });
  for (const [name, route] of routes) {
    const page = await context.newPage();
    const consoleErrors = [];
    const runtimeErrors = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    const started = Date.now();
    try {
      await page.goto(`${base}${route}`, { waitUntil: "networkidle", timeout: 30_000 });
      await page.waitForTimeout(450);
      const filename = `${name}--${viewport.name}.png`;
      await page.screenshot({ path: path.join(outputDir, filename), fullPage: true });
      const metrics = await page.evaluate(() => {
        const focusables = Array.from(document.querySelectorAll("a,button,input,select,textarea,[tabindex]:not([tabindex='-1'])"));
        const overflowNodes = Array.from(document.querySelectorAll("*"))
          .filter((element) => element.scrollWidth > element.clientWidth + 1)
          .slice(0, 8)
          .map((element) => ({ tag: element.tagName, className: String(element.className), scrollWidth: element.scrollWidth, clientWidth: element.clientWidth }));
        return {
          title: document.title,
          bodyText: document.body.innerText.slice(0, 300),
          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          overflowNodes,
          focusableCount: focusables.length,
          unlabeledInputs: Array.from(document.querySelectorAll("input,select,textarea")).filter((element) => !element.getAttribute("aria-label") && !element.id && !element.closest("label")).length,
        };
      });
      results.push({ route, viewport: viewport.name, screenshot: filename, consoleErrors, runtimeErrors, durationMs: Date.now() - started, ...metrics });
    } catch (error) {
      results.push({ route, viewport: viewport.name, screenshot: null, consoleErrors, runtimeErrors: [...runtimeErrors, String(error)], durationMs: Date.now() - started });
    } finally {
      await page.close();
    }
  }
  await context.close();
}

await browser.close();
const summary = {
  base,
  mode: captureMode,
  capturedAt: new Date().toISOString(),
  viewportCount: viewports.length,
  routeCount: routes.length,
  results,
  consoleErrorCount: results.reduce((count, item) => count + item.consoleErrors.length, 0),
  runtimeErrorCount: results.reduce((count, item) => count + item.runtimeErrors.length, 0),
  overflowCount: results.filter((item) => item.horizontalOverflow).length,
  unlabeledInputCount: results.reduce((count, item) => count + (item.unlabeledInputs ?? 0), 0),
};
fs.writeFileSync(path.join(outputDir, "ui-audit-results.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
console.log(JSON.stringify(summary, null, 2));
if (summary.consoleErrorCount || summary.runtimeErrorCount || summary.overflowCount) process.exitCode = 1;
