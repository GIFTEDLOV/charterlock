import { CHAIN_ID } from "./domain/types";

export const config = {
  mode: (import.meta.env.VITE_CHARTERLOCK_MODE ?? "demo") as "demo" | "live",
  chainId: CHAIN_ID,
  rpcUrl: import.meta.env.VITE_CHARTERLOCK_RPC_URL ?? "https://studio-dev.genlayer.com/api",
  contractAddress: import.meta.env.VITE_CHARTERLOCK_CONTRACT_ADDRESS,
  sourceSha256: "70ca83b07e5c646d90d61d97f2a8828c4541dc955f0758eea0252e0905a1757a",
};

export const isLiveConfigured = config.mode === "live" && Boolean(config.contractAddress);
