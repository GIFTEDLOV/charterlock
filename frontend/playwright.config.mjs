export default {
  testDir: "./e2e",
  fullyParallel: false,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure", screenshot: "only-on-failure", video: "retain-on-failure", colorScheme: "dark" },
  webServer: { command: "npm run dev -- --host 127.0.0.1", url: "http://127.0.0.1:4173", reuseExistingServer: true, env: { VITE_CHARTERLOCK_MODE: "demo" } },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "mobile-430", use: { viewport: { width: 430, height: 932 }, isMobile: true } },
    { name: "mobile-390", use: { viewport: { width: 390, height: 844 }, isMobile: true } },
  ],
};
