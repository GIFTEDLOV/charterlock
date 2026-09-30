import { describe, expect, it } from "vitest";
import { contractDisplayAddress, shouldShowControlledDemoLabel } from "./config";

describe("live and controlled contract identity", () => {
  it("keeps controlled mode explicitly non-live when no address is configured", () => {
    expect(contractDisplayAddress("demo")).toBe("CONTROLLED_DEMO_NO_ADDRESS");
  });

  it("never presents the controlled placeholder in live mode", () => {
    expect(contractDisplayAddress("live")).toBe("LIVE_CONTRACT_NOT_CONFIGURED");
    expect(contractDisplayAddress("live", "0xa79C6437Aad95F5A487373d5e1673DC5bC301be8")).toBe("0xa79C6437Aad95F5A487373d5e1673DC5bC301be8");
  });

  it("shows the controlled label only outside live mode", () => {
    expect(shouldShowControlledDemoLabel("demo")).toBe(true);
    expect(shouldShowControlledDemoLabel("live")).toBe(false);
  });
});
