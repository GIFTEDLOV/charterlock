import { studioDevnet } from "genlayer-js/chains";
import { CHAIN_ID } from "../domain/types";

// genlayer-js 2.0.0-rc.1 provides the authoritative Studio-dev definition.
// Keep the application guard below so wallet/network mismatches remain explicit.
export const charterLockStudio = studioDevnet;

if (charterLockStudio.id !== CHAIN_ID) throw new Error("SDK_STUDIO_DEV_CHAIN_MISMATCH");

export function networkGuard(chainId: number, contractAddress?: string) {
  return {
    chainId,
    expectedChainId: CHAIN_ID,
    contractAddress,
    configured: Boolean(contractAddress),
    match: chainId === CHAIN_ID && Boolean(contractAddress),
  };
}

export async function readBrowserChainId(): Promise<number> {
  const ethereum = (window as Window & { ethereum?: { request(args: { method: string }): Promise<string> } }).ethereum;
  if (!ethereum) throw new Error("WALLET_NOT_AVAILABLE");
  const hex = await ethereum.request({ method: "eth_chainId" });
  return Number.parseInt(hex, 16);
}

export async function requestBrowserAccount(): Promise<string> {
  const ethereum = (window as Window & { ethereum?: { request(args: { method: string }): Promise<string[]> } }).ethereum;
  if (!ethereum) throw new Error("WALLET_NOT_AVAILABLE");
  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  if (!accounts[0]) throw new Error("WALLET_REJECTED");
  return accounts[0];
}
