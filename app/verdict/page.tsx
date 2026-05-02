"use client";

import { useState, useRef } from "react";
import { useStellarWallet } from "../components/WalletProvider";
import styles from "./page.module.css";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function VerdictPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);
  const [releaseResult, setReleaseResult] = useState<{
    pass: boolean;
    message: string;
    explorerUrl: string;
    txHash: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { walletAddress, connected } = useStellarWallet();

  console.log("[VerdictPage] Rendering. Wallet connected:", connected);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragOut = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setFileName(files[0].name);
    }
  };

  const handleRelease = async (pass: boolean) => {
    if (!walletAddress) {
      console.error("[VerdictPage] No wallet connected for release");
      return;
    }

    setIsReleasing(true);
    console.log("[VerdictPage] Releasing stake. Pass:", pass, "User:", walletAddress);

    try {
      const res = await fetch("/api/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: "payoff", // In production, pull from context/URL
          userId: walletAddress,
          pass,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Release failed");
      }

      console.log("[VerdictPage] Release complete:", data);
      setReleaseResult(data);
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Release failed");
      console.error("[VerdictPage] Release error:", error);
      setReleaseResult({
        pass,
        message: `Error: ${message}`,
        explorerUrl: "",
        txHash: "",
      });
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <div className={styles.verdictPage}>
      <div className={styles.header}>
        <span className="label-caps text-primary">JUDGMENT CHAMBER</span>
        <h1 style={{ fontSize: 32, marginTop: 8 }}>The Verdict</h1>
        <p className="text-muted" style={{ marginTop: 8 }}>
          Submit your financial transgressions for judgment.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className={`${styles.uploadZone} ${isDragging ? styles.uploadZoneDragging : ""}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        id="verdict-upload-zone"
      >
        <input
          type="file"
          ref={fileRef}
          className={styles.fileInput}
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) setFileName(files[0].name);
          }}
        />
        <span className="material-icons" style={{ fontSize: 48, color: "var(--color-on-surface-muted)" }}>
          upload_file
        </span>
        <h3 style={{ fontSize: 18, marginTop: 16 }}>
          Drag & drop scrolls here
        </h3>
        <p className="text-muted" style={{ fontSize: 14, marginTop: 4 }}>
          or click to browse local files
        </p>
        {fileName && (
          <div className={styles.uploadedFile}>
            <span className="material-icons" style={{ fontSize: 16 }}>description</span>
            {fileName}
          </div>
        )}
      </div>

      {/* Verdict Results */}
      <div className={styles.resultsSection}>
        <h2 style={{ fontSize: 24, marginBottom: 24 }}>CAPITAL DEPLOYMENT</h2>

        <div className={styles.verdictResult}>
          <div className={`card ${styles.verdictCard}`}>
            <div className={styles.verdictHeader}>
              <div className={styles.verdictStatus}>
                <span className="kanji-tag kanji-tag-danger" style={{ fontSize: 16, padding: "10px 20px" }}>
                  <span style={{ fontFamily: "var(--font-kanji)", fontSize: 20 }}>罰</span>
                  FAIL
                </span>
              </div>
            </div>
            <p className={styles.verdictText}>
              Unacceptable indiscipline detected in recent <strong>Dining</strong> transactions.
            </p>

            <div className={styles.verdictBreakdown}>
              <div className={styles.breakdownItem}>
                <span className="label-caps text-muted">CATEGORY</span>
                <span>Dining & Restaurants</span>
              </div>
              <div className={styles.breakdownItem}>
                <span className="label-caps text-muted">TOTAL SPEND</span>
                <span className="text-primary" style={{ fontFamily: "var(--font-headline)", fontWeight: 700 }}>$342.50</span>
              </div>
              <div className={styles.breakdownItem}>
                <span className="label-caps text-muted">BUDGET LIMIT</span>
                <span>$150.00</span>
              </div>
              <div className={styles.breakdownItem}>
                <span className="label-caps text-muted">OVERAGE</span>
                <span style={{ color: "var(--color-primary-light)", fontFamily: "var(--font-headline)", fontWeight: 700 }}>+$192.50</span>
              </div>
            </div>

            {/* Stake Release Buttons */}
            {connected && !releaseResult && (
              <div style={{
                marginTop: 32,
                paddingTop: 24,
                borderTop: "1px solid var(--color-border)",
                display: "flex",
                gap: 16,
              }}>
                <button
                  className="btn"
                  style={{
                    flex: 1,
                    background: "rgba(74, 124, 89, 0.15)",
                    border: "1px solid var(--color-success)",
                    color: "var(--color-success)",
                  }}
                  onClick={() => handleRelease(true)}
                  disabled={isReleasing}
                  id="verdict-pass"
                >
                  <span className="material-icons" style={{ fontSize: 18 }}>check_circle</span>
                  {isReleasing ? "PROCESSING..." : "PASS — RETURN XLM"}
                </button>
                <button
                  className="btn"
                  style={{
                    flex: 1,
                    background: "rgba(192, 57, 43, 0.15)",
                    border: "1px solid var(--color-primary)",
                    color: "var(--color-primary-light)",
                  }}
                  onClick={() => handleRelease(false)}
                  disabled={isReleasing}
                  id="verdict-fail"
                >
                  <span className="material-icons" style={{ fontSize: 18 }}>local_fire_department</span>
                  {isReleasing ? "PROCESSING..." : "FAIL — DONATE TO CHARITY"}
                </button>
              </div>
            )}

            {/* Release Result */}
            {releaseResult && (
              <div style={{
                marginTop: 32,
                padding: 24,
                background: releaseResult.pass
                  ? "rgba(74, 124, 89, 0.1)"
                  : "rgba(192, 57, 43, 0.1)",
                border: `1px solid ${releaseResult.pass ? "var(--color-success)" : "var(--color-primary)"}`,
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}>
                  <span className="material-icons" style={{
                    fontSize: 28,
                    color: releaseResult.pass ? "var(--color-success)" : "var(--color-primary-light)",
                  }}>
                    {releaseResult.pass ? "verified" : "local_fire_department"}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-headline)",
                    fontSize: 18,
                    fontWeight: 700,
                    color: releaseResult.pass ? "var(--color-success)" : "var(--color-primary-light)",
                  }}>
                    {releaseResult.pass ? "XLM RETURNED TO WALLET" : "XLM DONATED TO CHARITY"}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: "var(--color-on-surface-muted)", marginBottom: 12 }}>
                  {releaseResult.message}
                </p>
                {releaseResult.explorerUrl && (
                  <a
                    href={releaseResult.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "10px 20px",
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-primary-soft)",
                      fontFamily: "var(--font-headline)",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textDecoration: "none",
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 16 }}>open_in_new</span>
                    VIEW ON STELLAR EXPLORER
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
