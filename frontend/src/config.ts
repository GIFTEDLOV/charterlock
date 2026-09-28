import { CHAIN_ID } from "./domain/types";

export const config = {
  mode: (import.meta.env.VITE_CHARTERLOCK_MODE ?? "demo") as "demo" | "live",
  chainId: CHAIN_ID,
  rpcUrl: import.meta.env.VITE_CHARTERLOCK_RPC_URL ?? "https://studio-dev.genlayer.com/api",
  contractAddress: import.meta.env.VITE_CHARTERLOCK_CONTRACT_ADDRESS,
  sourceSha256: "323fcf4a694d8b4070b043078b316055f090a643a6fdfb987afa5b9f2f7d3e45",
};

export const isLiveConfigured = config.mode === "live" && Boolean(config.contractAddress);
