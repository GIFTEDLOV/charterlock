import type { CharterDraft, EvidenceDraft } from "./types";

const SHA256 = /^[0-9a-f]{64}$/;
const ALLOWED_OUTCOMES = new Set(["YES", "NO"]);

/** Convert the operator-facing outcome field to the exact contract string. */
export function normalizeAllowedOutcomes(value: string): string {
  const raw = value.trim();
  if (!raw) throw new Error("MALFORMED_ALLOWED_OUTCOMES");

  let values: unknown;
  if (raw.startsWith("[")) {
    try { values = JSON.parse(raw); } catch { throw new Error("MALFORMED_ALLOWED_OUTCOMES"); }
  } else {
    values = raw.split(",").map((item) => item.trim());
  }

  if (!Array.isArray(values) || values.length === 0) throw new Error("INVALID_ALLOWED_OUTCOMES");
  const normalized = values.map((item) => {
    if (typeof item !== "string" || item.trim() === "") throw new Error("INVALID_ALLOWED_OUTCOME");
    return item.trim();
  });
  if (normalized.length !== 2 || normalized.some((item) => !ALLOWED_OUTCOMES.has(item)) || new Set(normalized).size !== normalized.length) {
    throw new Error("INVALID_ALLOWED_OUTCOMES");
  }
  return JSON.stringify(normalized);
}

/** Return the canonical SHA-256 representation accepted by CharterLock. */
export function normalizeSha256(value: string): string {
  let normalized = value.trim();
  if (normalized.startsWith("0x") || normalized.startsWith("0X")) normalized = normalized.slice(2);
  if (normalized.startsWith("0x") || normalized.startsWith("0X") || !/^[0-9a-f]+$/i.test(normalized) || normalized.length !== 64) {
    throw new Error("MALFORMED_SHA256");
  }
  normalized = normalized.toLowerCase();
  if (!SHA256.test(normalized)) throw new Error("MALFORMED_SHA256");
  return normalized;
}

export function normalizeCharterForContract(draft: CharterDraft): CharterDraft & { allowed_outcomes: string } {
  return { ...draft, allowed_outcomes: normalizeAllowedOutcomes(draft.allowed_outcomes) };
}

export function normalizeEvidenceForContract(draft: EvidenceDraft): EvidenceDraft {
  return { ...draft, content_sha256: normalizeSha256(draft.content_sha256) };
}
