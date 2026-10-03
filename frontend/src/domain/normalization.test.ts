import { describe, expect, it } from "vitest";
import { normalizeAllowedOutcomes, normalizeSha256 } from "./normalization";

describe("contract argument normalization", () => {
  it("serializes the supported single contract outcome set exactly", () => {
    expect(() => normalizeAllowedOutcomes("YES")).toThrow("INVALID_ALLOWED_OUTCOMES");
    expect(normalizeAllowedOutcomes("YES, NO")).toBe('["YES","NO"]');
  });

  it("normalizes multiple outcomes and whitespace without inventing values", () => {
    expect(normalizeAllowedOutcomes("  YES  ,   NO ")).toBe('["YES","NO"]');
    expect(normalizeAllowedOutcomes('["NO", "YES"]')).toBe('["NO","YES"]');
  });

  it("rejects empty and malformed outcome items", () => {
    expect(() => normalizeAllowedOutcomes("YES,,NO")).toThrow("INVALID_ALLOWED_OUTCOME");
    expect(() => normalizeAllowedOutcomes("[YES,NO]")).toThrow("MALFORMED_ALLOWED_OUTCOMES");
    expect(() => normalizeAllowedOutcomes("YES, MAYBE")).toThrow("INVALID_ALLOWED_OUTCOMES");
  });

  it("canonicalizes all supported SHA-256 input forms", () => {
    const lower = "a".repeat(64);
    const upper = "A".repeat(64);
    expect(normalizeSha256(lower)).toBe(lower);
    expect(normalizeSha256(upper)).toBe(lower);
    expect(normalizeSha256(`0x${upper}`)).toBe(lower);
    expect(normalizeSha256(`0X${upper}`)).toBe(lower);
    expect(normalizeSha256(`  0x${upper}  `)).toBe(lower);
  });

  it("rejects every non-canonical digest shape", () => {
    for (const value of ["a".repeat(63), "a".repeat(65), "not-a-hash", `0x0x${"a".repeat(64)}`]) {
      expect(() => normalizeSha256(value)).toThrow("MALFORMED_SHA256");
    }
  });
});
