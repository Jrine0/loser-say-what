import styles from "./page.module.css";
import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "Overview - DEBTIFY",
  description: "Your financial command center. Track debt elimination progress.",
};

export default function DashboardPage() {
  console.log("[DashboardPage] Rendering dashboard");
  return (
    <>
      <Navbar />
      <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <span className="label-caps text-primary">PROGRESS CONTROL</span>
          <h1 style={{ fontSize: 32, marginTop: 8 }}>Overview</h1>
        </div>
        <Link href="/goals" className="btn btn-primary btn-sm">
          <span className="material-icons" style={{ fontSize: 16 }}>add</span>
          NEW GOAL
        </Link>
      </div>

      {/* Overview Cards */}
      <div className={styles.overviewGrid}>
        <div className={`card card-accent asanoha-bg ${styles.overviewCard}`}>
          <span className="label-caps text-muted">TOTAL DEBT</span>
          <div className={styles.overviewValue}>$24,850</div>
          <div className={styles.overviewChange}>
            <span style={{ color: "var(--color-success)" }}>↓ $4,200</span>
            <span className="text-muted"> this month</span>
          </div>
        </div>

        <div className={`card card-accent asanoha-bg ${styles.overviewCard}`}>
          <span className="label-caps text-muted">MONTHLY PAYMENT</span>
          <div className={styles.overviewValue}>$1,200</div>
          <div className={styles.overviewChange}>
            <span className="kanji-tag kanji-tag-success">
              <span style={{ fontFamily: "var(--font-kanji)" }}>済</span>
              ON TRACK
            </span>
          </div>
        </div>

        <div className={`card card-accent asanoha-bg ${styles.overviewCard}`}>
          <span className="label-caps text-muted">INTEREST SAVED</span>
          <div className={styles.overviewValue}>$892</div>
          <div className={styles.overviewChange}>
            <span style={{ color: "var(--color-success)" }}>+$142</span>
            <span className="text-muted"> vs. minimum</span>
          </div>
        </div>

        <div className={`card card-accent asanoha-bg ${styles.overviewCard}`}>
          <span className="label-caps text-muted">FREEDOM DATE</span>
          <div className={styles.overviewValue}>Mar 2026</div>
          <div className={styles.overviewChange}>
            <span style={{ color: "var(--color-primary-soft)" }}>4 months ahead</span>
          </div>
        </div>
      </div>

      {/* Debt Targets */}
      <div className={styles.section}>
        <h2 style={{ fontSize: 24, marginBottom: 24 }}>Active Targets</h2>
        <div className={styles.targetList}>
          <div className={`card ${styles.targetCard}`}>
            <div className={styles.targetHeader}>
              <div>
                <h3 style={{ fontSize: 18 }}>Chase Sapphire</h3>
                <span className="text-muted" style={{ fontSize: 13 }}>Credit Card · 22.99% APR</span>
              </div>
              <span className="kanji-tag kanji-tag-danger">
                <span style={{ fontFamily: "var(--font-kanji)" }}>攻</span>
                PRIORITY
              </span>
            </div>
            <div className={styles.targetProgress}>
              <div className={styles.targetAmounts}>
                <span className="label-caps text-primary">$8,420 REMAINING</span>
                <span className="label-caps text-muted">$15,000 ORIGINAL</span>
              </div>
              <div className="debt-striker">
                <div className="debt-striker-fill" style={{ width: "44%" }}></div>
              </div>
            </div>
          </div>

          <div className={`card ${styles.targetCard}`}>
            <div className={styles.targetHeader}>
              <div>
                <h3 style={{ fontSize: 18 }}>Student Loan</h3>
                <span className="text-muted" style={{ fontSize: 13 }}>Federal · 5.5% APR</span>
              </div>
              <span className="kanji-tag kanji-tag-warning">
                <span style={{ fontFamily: "var(--font-kanji)" }}>守</span>
                HOLDING
              </span>
            </div>
            <div className={styles.targetProgress}>
              <div className={styles.targetAmounts}>
                <span className="label-caps text-primary">$12,300 REMAINING</span>
                <span className="label-caps text-muted">$18,000 ORIGINAL</span>
              </div>
              <div className="debt-striker">
                <div className="debt-striker-fill" style={{ width: "32%" }}></div>
              </div>
            </div>
          </div>

          <div className={`card ${styles.targetCard}`}>
            <div className={styles.targetHeader}>
              <div>
                <h3 style={{ fontSize: 18 }}>Car Loan</h3>
                <span className="text-muted" style={{ fontSize: 13 }}>Auto · 4.2% APR</span>
              </div>
              <span className="kanji-tag kanji-tag-success">
                <span style={{ fontFamily: "var(--font-kanji)" }}>済</span>
                LOW RISK
              </span>
            </div>
            <div className={styles.targetProgress}>
              <div className={styles.targetAmounts}>
                <span className="label-caps text-primary">$4,130 REMAINING</span>
                <span className="label-caps text-muted">$12,000 ORIGINAL</span>
              </div>
              <div className="debt-striker">
                <div className="debt-striker-fill" style={{ width: "66%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
