/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHARTERLOCK_MODE?: "demo" | "live";
  readonly VITE_CHARTERLOCK_CONTRACT_ADDRESS?: string;
  readonly VITE_CHARTERLOCK_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
