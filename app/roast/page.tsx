import styles from "./page.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Roast - DEBTIFY",
  description: "Your weekly spending roast. No mercy. No filter.",
};

const roastItems = [
  {
    brand: "STARBUCKS",
    amount: "$67.40",
    icon: "local_cafe",
    roast:
      '"Your checking account is crying, but at least you have a green straw."',
  },
  {
    brand: "DOORDASH",
    amount: "$142.30",
    icon: "delivery_dining",
    roast:
      '"Paying $35 for cold nuggets. Peak financial strategy."',
  },
  {
    brand: "ASOS",
    amount: "$89.99",
    icon: "shopping_bag",
    roast:
      '"Another black t-shirt won\'t fix your credit score."',
  },
  {
    brand: "ONLYFANS",
    amount: "$29.99",
    icon: "favorite",
    roast: '"Simping while in debt is a modern tragedy."',
  },
  {
    brand: "UBER",
    amount: "$54.20",
    icon: "local_taxi",
    roast: '"You live 4 blocks away. Use your legs."',
  },
];

export default function RoastPage() {
  return (
    <div className={styles.roastPage}>
      <div className={styles.header}>
        <div>
          <span className="label-caps text-primary">SHAME PROTOCOL ACTIVATED</span>
          <h1 style={{ fontSize: 32, marginTop: 8 }}>
            Weekly Roast{" "}
            <span style={{ fontSize: 28 }}>🔥</span>
          </h1>
          <p className="text-muted" style={{ marginTop: 8 }}>
            by <strong style={{ color: "var(--color-primary-soft)" }}>Finance Uncle</strong>
          </p>
        </div>
      </div>

      <div className={styles.roastList}>
        {roastItems.map((item, i) => (
          <div
            key={item.brand}
            className={`card ${styles.roastCard}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={styles.roastCardInner}>
              <div className={styles.roastIcon}>
                <span className="material-icons">{item.icon}</span>
              </div>
              <div className={styles.roastContent}>
                <div className={styles.roastBrandRow}>
                  <h3 className={styles.roastBrand}>{item.brand}</h3>
                  <span className={styles.roastAmount}>{item.amount}</span>
                </div>
                <p className={styles.roastText}>{item.roast}</p>
              </div>
            </div>
            <div className={styles.roastAccent}></div>
          </div>
        ))}
      </div>

      <div className={styles.totalSection}>
        <div className={`card card-accent ${styles.totalCard}`}>
          <div className={styles.totalInner}>
            <div>
              <span className="label-caps text-muted">TOTAL WASTED</span>
              <div className={styles.totalAmount}>$383.88</div>
            </div>
            <div className={styles.totalVerdict}>
              <span className="kanji-tag kanji-tag-danger" style={{ fontSize: 14, padding: "8px 16px" }}>
                <span style={{ fontFamily: "var(--font-kanji)", fontSize: 18 }}>恥</span>
                SHAMEFUL
              </span>
              <p className="text-muted" style={{ fontSize: 13, marginTop: 8 }}>
                This could have paid 32% of your monthly debt target.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
