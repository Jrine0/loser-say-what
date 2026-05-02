"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isValidStellarPublicKey, getStellarNetworkConfig } from "@/lib/stellar";

type WalletType = "freighter" | "albedo";

type FreighterSignResponse = {
  error?: string;
  signedTxXdr?: string;
};

type FreighterAddressResponse = {
  error?: string;
  address?: string;
};

type FreighterApi = {
  requestAccess: () => Promise<{ error?: string }>;
  getAddress: () => Promise<FreighterAddressResponse>;
  signTransaction: (xdr: string, params: { networkPassphrase: string; address: string }) => Promise<FreighterSignResponse>;
};

type AlbedoTxResult = {
  signed_envelope_xdr?: string;
};

type AlbedoClient = {
  tx: (params: { xdr: string; network: "testnet" | "public" }) => Promise<AlbedoTxResult>;
};

interface StellarWalletContextValue {
  connected: boolean;
  walletAddress: string | null;
  walletType: WalletType | null;
  network: "testnet" | "public";
  connectFreighter: () => Promise<void>;
  connectAlbedo: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (xdr: string) => Promise<string>;
}

const StellarWalletContext = createContext<StellarWalletContextValue | null>(null);

export function useStellarWallet() {
  const context = useContext(StellarWalletContext);
  if (!context) {
    throw new Error("useStellarWallet must be used inside WalletConnectionProvider");
  }
  return context;
}

export default function WalletConnectionProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const networkConfig = useMemo(() => getStellarNetworkConfig(), []);

  const connectFreighter = useCallback(async () => {
    const freighterApi = (await import("@stellar/freighter-api")) as unknown as FreighterApi;
    const accessResult = await freighterApi.requestAccess();

    if (accessResult?.error) {
      throw new Error(accessResult.error);
    }

    const addressResult = await freighterApi.getAddress();
    if (addressResult?.error || !addressResult?.address) {
      throw new Error(addressResult?.error ?? "Unable to fetch Freighter wallet address");
    }

    if (!isValidStellarPublicKey(addressResult.address)) {
      throw new Error("Freighter returned an invalid Stellar public key");
    }

    setWalletAddress(addressResult.address);
    setWalletType("freighter");
  }, []);

  const connectAlbedo = useCallback(async () => {
    const input = window.prompt("Enter your Albedo Stellar public key (starts with G):", "");
    const publicKey = input?.trim() ?? "";

    if (!publicKey) {
      throw new Error("Albedo wallet connection was cancelled");
    }

    if (!isValidStellarPublicKey(publicKey)) {
      throw new Error("Invalid Stellar public key supplied for Albedo");
    }

    setWalletAddress(publicKey);
    setWalletType("albedo");
  }, []);

  const disconnect = useCallback(() => {
    setWalletAddress(null);
    setWalletType(null);
  }, []);

  const signTransaction = useCallback(
    async (xdr: string) => {
      if (!walletAddress || !walletType) {
        throw new Error("Connect a wallet before signing");
      }

      if (walletType === "freighter") {
        const freighterApi = (await import("@stellar/freighter-api")) as unknown as FreighterApi;
        const signed = await freighterApi.signTransaction(xdr, {
          networkPassphrase: networkConfig.networkPassphrase,
          address: walletAddress,
        });

        if (signed?.error) {
          throw new Error(signed.error);
        }

        if (!signed?.signedTxXdr) {
          throw new Error("Freighter did not return a signed transaction envelope");
        }

        return signed.signedTxXdr as string;
      }

      const albedoWindow = window as Window & { albedo?: AlbedoClient };
      const albedo = albedoWindow.albedo;
      if (!albedo?.tx) {
        throw new Error("Albedo signing is unavailable in this browser session");
      }

      const network = networkConfig.network === "public" ? "public" : "testnet";
      const result = await albedo.tx({
        xdr,
        network,
      });

      const signedXdr = result?.signed_envelope_xdr;
      if (!signedXdr) {
        throw new Error("Albedo did not return a signed transaction envelope");
      }

      return signedXdr as string;
    },
    [networkConfig.network, networkConfig.networkPassphrase, walletAddress, walletType]
  );

  const value = useMemo<StellarWalletContextValue>(
    () => ({
      connected: Boolean(walletAddress),
      walletAddress,
      walletType,
      network: networkConfig.network,
      connectFreighter,
      connectAlbedo,
      disconnect,
      signTransaction,
    }),
    [
      connectAlbedo,
      connectFreighter,
      disconnect,
      networkConfig.network,
      signTransaction,
      walletAddress,
      walletType,
    ]
  );

  return <StellarWalletContext.Provider value={value}>{children}</StellarWalletContext.Provider>;
}
