"use client";

import { useMemo, useState } from "react";
import { useStellarWallet } from "./WalletProvider";

export default function WalletButton() {
  const [connecting, setConnecting] = useState(false);
  const {
    connected,
    walletAddress,
    walletType,
    network,
    connectFreighter,
    connectAlbedo,
    disconnect,
  } = useStellarWallet();

  const shortAddress = useMemo(() => {
    if (!walletAddress) {
      return "";
    }
    return `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
  }, [walletAddress]);

  const handleConnectFreighter = async () => {
    try {
      setConnecting(true);
      await connectFreighter();
    } finally {
      setConnecting(false);
    }
  };

  const handleConnectAlbedo = async () => {
    try {
      setConnecting(true);
      await connectAlbedo();
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {connected ? (
        <>
          <span
            style={{
              border: "1px solid var(--color-border)",
              padding: "0 10px",
              height: 38,
              display: "inline-flex",
              alignItems: "center",
              fontFamily: "var(--font-headline)",
              fontSize: 11,
              letterSpacing: "0.08em",
            }}
          >
            {walletType?.toUpperCase()} {shortAddress} ({network.toUpperCase()})
          </span>
          <button className="btn btn-ghost btn-sm" onClick={disconnect}>
            DISCONNECT
          </button>
        </>
      ) : (
        <>
          <button className="btn btn-ghost btn-sm" onClick={handleConnectFreighter} disabled={connecting}>
            {connecting ? "CONNECTING..." : "CONNECT FREIGHTER"}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleConnectAlbedo} disabled={connecting}>
            {connecting ? "CONNECTING..." : "CONNECT ALBEDO"}
          </button>
        </>
      )}
    </div>
  );
}
