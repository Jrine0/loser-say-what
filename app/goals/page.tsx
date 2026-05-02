"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStellarWallet } from "../components/WalletProvider";
import styles from "./page.module.css";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

const objectives = [
  {
    id: "payoff",
    title: "Pay Off Debt",
    description: "Aggressively attack your highest interest balances.",
    icon: "gps_fixed",
  },
  {
    id: "freeze",
    title: "No New Spend",
    description: "Absolute freeze on all non-essential transactions.",
    icon: "ac_unit",
  },
  {
    id: "cut",
    title: "Cut EMI Ratio",
    description: "Restructure and reduce your monthly obligations.",
    icon: "content_cut",
  },
];

export default function GoalsPage() {
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);
  const [targetAmount, setTargetAmount] = useState("");
  const [penaltyStake, setPenaltyStake] = useState("");
  const [duration, setDuration] = useState("90");
  const [isStaking, setIsStaking] = useState(false);
  const [stakeStatus, setStakeStatus] = useState<string | null>(null);
  const [stakeTxHash, setStakeTxHash] = useState<string | null>(null);
  const [stakeExplorerUrl, setStakeExplorerUrl] = useState<string | null>(null);

  const router = useRouter();
  const { connected, walletAddress, signTransaction, network } = useStellarWallet();

  console.log("[GoalsPage] Rendering. Wallet connected:", connected, "pubkey:", walletAddress);

  const handleLockGoal = async () => {
    console.log("[GoalsPage] Lock Goal clicked");

    // Validate inputs
    if (!selectedObjective) {
      setStakeStatus("Select an objective first");
      return;
    }
    if (!penaltyStake || parseFloat(penaltyStake) <= 0) {
      setStakeStatus("Enter a penalty stake amount in XLM");
      return;
    }

    // Check wallet connected
    if (!connected || !walletAddress) {
      console.log("[GoalsPage] Wallet not connected, prompting user");
      setStakeStatus("Connect your Freighter or Albedo wallet first (use the button in the navbar)");
      return;
    }

    const amountXLM = parseFloat(penaltyStake);
    if (amountXLM > 5000) {
      setStakeStatus("Max 5000 XLM per goal. Keep it realistic.");
      return;
    }

    setIsStaking(true);
    setStakeStatus("Building transaction...");

    try {
      // 1. Request unsigned transaction from backend
      console.log("[GoalsPage] Requesting unsigned XDR from /api/stake");
      const stakeRes = await fetch("/api/stake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountXLM,
          goalId: selectedObjective,
          userId: walletAddress,
          userWallet: walletAddress,
        }),
      });

      if (!stakeRes.ok) {
        const err = await stakeRes.json();
        console.log("Stake error response:", err);
        throw new Error(err.error || "Failed to build transaction");
      }

      const { transactionXdr } = await stakeRes.json();
      console.log("[GoalsPage] Got unsigned XDR, requesting signature...");

      setStakeStatus("Approve the transaction in your wallet...");
      const signedXdr = await signTransaction(transactionXdr);

      // 2. Submit signed transaction with backend
      setStakeStatus("Submitting to Stellar network...");
      console.log("[GoalsPage] Signature received, sending to backend...");

      const confirmRes = await fetch("/api/confirm-stake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signedXdr,
          goalId: selectedObjective,
          userId: walletAddress,
          amountXLM,
          userWallet: walletAddress,
        }),
      });

      if (!confirmRes.ok) {
        const err = await confirmRes.json();
        throw new Error(err.error || "Failed to submit signed Stellar transaction");
      }

      const confirmData = await confirmRes.json();

      setStakeTxHash(confirmData.txHash);
      setStakeExplorerUrl(confirmData.explorerUrl ?? null);
      setStakeStatus(`${amountXLM} XLM staked. Goal locked.`);

      console.log("[GoalsPage] Stake complete! Navigating to /chat in 2s");

      // Navigate to chat after short delay
      setTimeout(() => {
        router.push("/chat");
      }, 2000);
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Transaction failed");
      console.error("[GoalsPage] Staking error:", error);
      setStakeStatus(`Error: ${message}`);
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <div className={styles.goalsPage}>
      <div className={styles.header}>
        <span className="label-caps text-primary">GOAL BRIEFING</span>
        <h1 style={{ fontSize: 32, marginTop: 8 }}>Define Your Goal</h1>
        <p className="text-muted" style={{ marginTop: 8 }}>
          Select your target, set your stakes, and commit to the discipline.
        </p>
      </div>

      {/* Objective Selection */}
      <div className={styles.section}>
        <h2 style={{ fontSize: 20, marginBottom: 20 }}>Objective Selection</h2>
        <div className={styles.objectiveGrid}>
          {objectives.map((obj) => (
            <button
              key={obj.id}
              className={`card ${styles.objectiveCard} ${
                selectedObjective === obj.id ? styles.objectiveCardSelected : ""
              }`}
              onClick={() => setSelectedObjective(obj.id)}
              id={`objective-${obj.id}`}
            >
              <div className={styles.objectiveIcon}>
                <span className="material-icons">{obj.icon}</span>
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>{obj.title}</h3>
              <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
                {obj.description}
              </p>
              {selectedObjective === obj.id && (
                <div className={styles.selectedIndicator}>
                  <span className="material-icons" style={{ fontSize: 16 }}>check</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Target Amount */}
      <div className={styles.section}>
        <h2 style={{ fontSize: 20, marginBottom: 20 }}>Target Amount</h2>
        <div className={styles.inputRow}>
          <div className={styles.currencyInput}>
            <span className={styles.currencySymbol}>$</span>
            <input
              type="text"
              className="input-field"
              placeholder="10,000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              id="goal-target-amount"
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>
      </div>

      {/* XLM Penalty Stake */}
      <div className={styles.section}>
        <h2 style={{ fontSize: 20, marginBottom: 20 }}>
          XLM Accountability Stake
          <span className="text-muted" style={{ fontSize: 13, fontWeight: 400, marginLeft: 8 }}>
            (Stellar {network})
          </span>
        </h2>
        <p className="text-muted" style={{ fontSize: 14, marginBottom: 16 }}>
          Lock XLM in escrow. Hit your goal and get it back. Miss your goal and it goes to charity.
        </p>
        <div className={styles.inputRow}>
          <div className={styles.currencyInput}>
            <span className={styles.currencySymbol} style={{ fontFamily: "var(--font-headline)" }}>XLM</span>
            <input
              type="number"
              className="input-field"
              placeholder="0.1"
              value={penaltyStake}
              onChange={(e) => setPenaltyStake(e.target.value)}
              id="goal-penalty-stake"
              style={{ paddingLeft: 36 }}
              step="0.01"
              min="0.01"
              max="10"
            />
          </div>
        </div>
        {!connected && (
          <p style={{ fontSize: 13, color: "var(--color-warning)", marginTop: 12 }}>
            <span className="material-icons" style={{ fontSize: 14, verticalAlign: "middle", marginRight: 4 }}>warning</span>
            Connect your wallet in the navbar to stake XLM
          </p>
        )}
      </div>

      {/* Duration */}
      <div className={styles.section}>
        <h2 style={{ fontSize: 20, marginBottom: 20 }}>Duration</h2>
        <div className={styles.durationGrid}>
          {["30", "60", "90", "180", "365"].map((d) => (
            <button
              key={d}
              className={`${styles.durationBtn} ${
                duration === d ? styles.durationBtnActive : ""
              }`}
              onClick={() => setDuration(d)}
              id={`duration-${d}`}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      <div className={styles.commitSection}>
        {/* Status message */}
        {stakeStatus && (
          <div style={{
            padding: "12px 20px",
            marginBottom: 20,
            background: stakeTxHash ? "rgba(74, 124, 89, 0.12)" : "rgba(192, 57, 43, 0.08)",
            border: `1px solid ${stakeTxHash ? "var(--color-success)" : "var(--color-border)"}`,
            fontSize: 14,
            fontFamily: "var(--font-headline)",
            color: stakeTxHash ? "var(--color-success)" : "var(--color-on-surface)",
          }}>
            {stakeStatus}
            {stakeExplorerUrl && (
              <a
                href={stakeExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  marginTop: 8,
                  fontSize: 12,
                  color: "var(--color-primary-soft)",
                }}
              >
                View on Stellar Explorer
              </a>
            )}
          </div>
        )}

        <p className="text-muted" style={{ fontSize: 14, marginBottom: 20 }}>
          There is no retreat. Once locked, the discipline begins.
        </p>
        <button
          className="btn btn-primary"
          id="goal-lock-goal"
          style={{ padding: "16px 40px" }}
          onClick={handleLockGoal}
          disabled={isStaking}
        >
          {isStaking ? (
            <>
              <span className="material-icons" style={{ fontSize: 18, animation: "glowPulse 1s infinite" }}>hourglass_top</span>
              STAKING...
            </>
          ) : (
            <>
              <span className="material-icons" style={{ fontSize: 18 }}>lock</span>
              LOCK GOAL ({penaltyStake || "0"} XLM)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
