import { test, expect } from "@playwright/test";

// Controlled proof suites intentionally use independent browser contexts per test.
  test("landing page explains the locked trust problem", async ({ page }) => {
    const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message)); page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto("/"); await expect(page.getByRole("heading", { name: /Freeze the rules/ })).toBeVisible(); await expect(page.getByText("Controlled local preview · live reads are separated from fixtures")).toBeVisible(); expect(errors).toEqual([]);
  });

  test("runs create → freeze → case → evidence → resolution → challenge → final", async ({ page }) => {
    const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message)); page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto("/charters/new"); await page.getByRole("button", { name: "Create draft charter" }).click(); await page.waitForURL(/\/charters\/CHR-00000002$/);
    await page.getByRole("button", { name: "Add bound authority" }).click(); await expect(page.getByText("official-record")).toBeVisible();
    await page.getByRole("button", { name: "Freeze charter" }).click(); await expect(page.getByText("FROZEN").first()).toBeVisible();
    await page.getByRole("button", { name: "Open case against charter" }).click(); await page.waitForURL(/\/cases\/CASE-00000002$/);
    await page.goto("/cases/CASE-00000002/evidence"); await page.getByRole("button", { name: "Commit evidence metadata" }).click(); await expect(page.getByText("EVID-00000003")).toBeVisible();
    await page.getByRole("button", { name: "Seal evidence snapshot" }).click(); await expect(page.getByText("Sealed", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Adjudicate sealed evidence" }).click(); await expect(page.getByRole("button", { name: "Adjudicate sealed evidence" })).toHaveCount(0); await page.goto("/cases/CASE-00000002/resolution"); await expect(page.getByText("YES").first()).toBeVisible(); await expect(page.getByText("Event occurred")).toBeVisible();
    await page.goto("/cases/CASE-00000002/challenge"); await page.getByText("PROCEDURAL_VIOLATION", { exact: true }).click(); await page.getByRole("button", { name: "Submit challenge" }).click(); await expect(page.getByText("Challenge accepted for readjudication")).toBeVisible();
    await page.getByRole("button", { name: "Readjudicate" }).click(); await expect(page.getByText("Readjudication complete")).toBeVisible();
    await page.getByRole("button", { name: "Finalize case" }).click(); await expect(page.getByText("Final resolution")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("proof page does not fabricate deployment metadata", async ({ page }) => {
    await page.goto("/proof"); await expect(page.locator("span.status-pill", { hasText: "NOT DEPLOYED" })).toBeVisible(); await expect(page.getByText("NOT YET PERFORMED", { exact: true })).toBeVisible(); await expect(page.getByText("70ca83b07e5c646d90d61d97f2a8828c4541dc955f0758eea0252e0905a1757a", { exact: true })).toBeVisible();
  });

  test("core route surfaces load without horizontal overflow", async ({ page }) => {
    for (const route of ["/app", "/charters", "/cases", "/activity", "/integrate", "/docs"]) {
      await page.goto(route); await expect(page.locator("main")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1); expect(overflow, `${route} overflowed viewport`).toBe(false);
    }
  });
