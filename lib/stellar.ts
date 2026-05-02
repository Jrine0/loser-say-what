import { Networks, StrKey } from "stellar-sdk";

export type StellarNetwork = "testnet" | "public";

export interface StellarNetworkConfig {
  network: StellarNetwork;
  networkPassphrase: string;
  horizonUrl: string;
  explorerNetworkPath: string;
}

function parseNetworkValue(value?: string | null): StellarNetwork {
  return value?.toLowerCase() === "public" ? "public" : "testnet";
}

export function getStellarNetworkConfig(): StellarNetworkConfig {
  const envValue =
    process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? process.env.STELLAR_NETWORK;
  const network = parseNetworkValue(envValue);

  if (network === "public") {
    return {
      network,
      networkPassphrase: Networks.PUBLIC,
      horizonUrl: "https://horizon.stellar.org",
      explorerNetworkPath: "public",
    };
  }

  return {
    network,
    networkPassphrase: Networks.TESTNET,
    horizonUrl: "https://horizon-testnet.stellar.org",
    explorerNetworkPath: "testnet",
  };
}

export function getStellarExplorerTxUrl(txHash: string): string {
  const config = getStellarNetworkConfig();
  return `https://stellar.expert/explorer/${config.explorerNetworkPath}/tx/${txHash}`;
}

export function isValidStellarPublicKey(address: string): boolean {
  return StrKey.isValidEd25519PublicKey(address);
}

export function formatXlmAmount(amount: number): string {
  return amount.toFixed(7);
}
