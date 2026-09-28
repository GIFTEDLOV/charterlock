import { CHAIN_ID } from "./domain/types";

export const config = {
  mode: (import.meta.env.VITE_CHARTERLOCK_MODE ?? "demo") as "demo" | "live",
  chainId: CHAIN_ID,
  rpcUrl: import.meta.env.VITE_CHARTERLOCK_RPC_URL ?? "https://studio.genlayer.com/api",
  contractAddress: import.meta.env.VITE_CHARTERLOCK_CONTRACT_ADDRESS,
  sourceSha256: "7cbf394642bfc4a4d626888b0601c12c7d53568f99e51244a14632869083c0b1",
};

export const isLiveConfigured = config.mode === "live" && Boolean(config.contractAddress);
