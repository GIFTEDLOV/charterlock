import { CHAIN_ID } from "./domain/types";

export type CharterLockMode = "demo" | "live";

export const config = {
  mode: (import.meta.env.VITE_CHARTERLOCK_MODE ?? "demo") as CharterLockMode,
  chainId: CHAIN_ID,
  rpcUrl: import.meta.env.VITE_CHARTERLOCK_RPC_URL ?? "https://studio-dev.genlayer.com/api",
  contractAddress: import.meta.env.VITE_CHARTERLOCK_CONTRACT_ADDRESS,
  sourceSha256: "70ca83b07e5c646d90d61d97f2a8828c4541dc955f0758eea0252e0905a1757a",
  deploymentTxHash: "0x6a2f52cb7eb781b2e74fcc9cd73031e4633bffb591532d3f573ce960d305b721",
  repositoryUrl: "https://github.com/GIFTEDLOV/charterlock",
  productionUrl: "https://charterlock.vercel.app",
  qualificationCharterId: "CHR-00000002",
  qualificationCaseId: "CASE-00000002",
};

export const isLiveConfigured = config.mode === "live" && Boolean(config.contractAddress);

export function contractDisplayAddress(mode: CharterLockMode, address?: string) {
  return address ?? (mode === "live" ? "LIVE_CONTRACT_NOT_CONFIGURED" : "CONTROLLED_DEMO_NO_ADDRESS");
}
