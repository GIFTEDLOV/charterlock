import { studionet } from "genlayer-js/chains";
import { CHAIN_ID } from "../domain/types";
import { config } from "../config";

// The SDK's built-in studionet is 61999. CharterLock targets Studio-dev 61997,
// so this explicit clone prevents an accidental write to the wrong network.
export const charterLockStudio = {
  ...studionet,
  id: CHAIN_ID,
  name: "CharterLock Studio-dev",
  rpcUrls: { default: { http: [config.rpcUrl] } },
} as typeof studionet;

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
