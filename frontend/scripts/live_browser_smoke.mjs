/* global console window document process */
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const consoleErrors = [];
page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
page.on("pageerror", (error) => consoleErrors.push(error.message));
await page.addInitScript(() => {
  window.ethereum = { request: async ({ method }) => { if (method === "eth_chainId") return "0xf22d"; throw new Error("WALLET_WRITE_NOT_REQUESTED"); } };
});

const base = "http://127.0.0.1:4173";
await page.goto(`${base}/proof`, { waitUntil: "networkidle" });
const proofText = await page.locator("body").innerText();
const proof = {
  has_content: proofText.trim().length > 0,
  live_label: proofText.includes("LIVE"),
  studio_dev_label: proofText.includes("Studio-dev"),
};
await page.goto(`${base}/cases/CASE-00000001`, { waitUntil: "networkidle" });
const caseText = await page.locator("body").innerText();
const liveCase = {
  case_id: caseText.includes("CASE-00000001"),
  resolution_id: caseText.includes("RES-00000002"),
  typed_failure: caseText.includes("SOURCE_UNAVAILABLE"),
};
const result = {
  proof,
  live_case: liveCase,
  console_errors: consoleErrors,
  horizontal_overflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
  overflow_elements: await page.evaluate(() => Array.from(document.querySelectorAll("*"))
    .filter((element) => element.scrollWidth > element.clientWidth)
    .slice(0, 12)
    .map((element) => ({ tag: element.tagName, className: element.className, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth, text: (element.textContent ?? "").slice(0, 120) }))),
};
console.log(JSON.stringify(result, null, 2));
await browser.close();
if (!proof.has_content || !proof.live_label || !proof.studio_dev_label || !liveCase.case_id || !liveCase.resolution_id || !liveCase.typed_failure || consoleErrors.length > 0 || result.horizontal_overflow) process.exitCode = 1;
