import Navbar from "./components/Navbar";
import FallingLeaves from "./components/FallingLeaves";
import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  console.log("[LandingPage] Rendering landing page");
  return (
    <>
      <Navbar />
      <FallingLeaves />
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroKanji}>武</div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Financial Discipline.
              <br />
              <span className={styles.heroTitleAccent}>No Excuses.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              AI debt coaching with lethal precision. We analyze your
              liabilities, identify the weakest links, and execute a strike plan
              to eliminate your debt. Are you ready to conquer?
            </p>
            <div className={styles.heroActions}>
              <Link href="/signup" className="btn btn-primary">
                GET STARTED
                <span className="material-icons" style={{ fontSize: 18 }}>
                  arrow_forward_ios
                </span>
              </Link>
              <Link href="#strike-plan" className="btn btn-secondary">
                VIEW METHODOLOGY
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.mascotWrapper}>
              <Image
                src="/mascot.png"
                alt="DEBTIFY Mascot"
                width={520}
                height={520}
                className={styles.mascotImage}
                priority
              />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className={styles.features} id="strike-plan">
          <div className={styles.sectionHeader}>
            <span className="label-caps text-primary">THE METHODOLOGY</span>
            <h2>Three Strikes. Zero Mercy.</h2>
            <p className="text-muted body-lg">
              Our AI coach deploys a battle-tested framework to systematically
              dismantle your debt.
            </p>
          </div>
          <div className={styles.featureGrid}>
            <div className={`card card-accent asanoha-bg ${styles.featureCard}`}>
              <div className={styles.featureIcon}>
                <span className="material-icons">search</span>
              </div>
              <div className={styles.featureNumber}>01</div>
              <h3>Identify</h3>
              <p className="text-muted">
                Deep forensic analysis of every liability. Interest rates,
                minimum payments, penalty structures — nothing hides from the
                coach.
              </p>
            </div>
            <div className={`card card-accent asanoha-bg ${styles.featureCard}`}>
              <div className={styles.featureIcon}>
                <span className="material-icons">gps_fixed</span>
              </div>
              <div className={styles.featureNumber}>02</div>
              <h3>Attack</h3>
              <p className="text-muted">
                AI-generated strike plans prioritize high-interest targets. The
                avalanche method meets machine precision.
              </p>
            </div>
            <div className={`card card-accent asanoha-bg ${styles.featureCard}`}>
              <div className={styles.featureIcon}>
                <span className="material-icons">delete_sweep</span>
              </div>
              <div className={styles.featureNumber}>03</div>
              <h3>Eliminate</h3>
              <p className="text-muted">
                Automated tracking, brutal accountability, and no-excuse
                coaching until every balance reads zero.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={styles.stats} id="stats">
          <div className={styles.statGrid}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>$2.4M+</div>
              <div className={styles.statLabel}>Debt Eliminated</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>1,247</div>
              <div className={styles.statLabel}>Active Members</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>94%</div>
              <div className={styles.statLabel}>Strike Success Rate</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>14mo</div>
              <div className={styles.statLabel}>Avg. Time to Freedom</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.cta} id="commitment">
          <div className={styles.ctaKanji}>道</div>
          <h2>Your Debt Ends Here.</h2>
          <p className="text-muted body-lg">
            Stop negotiating with mediocrity. Start your accountability plan.
          </p>
          <Link href="/signup" className="btn btn-primary">
            BEGIN YOUR PLAN
            <span className="material-icons" style={{ fontSize: 18 }}>
              arrow_forward_ios
            </span>
          </Link>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className="blade-divider"></div>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Image src="/logo.png" alt="DEBTIFY Logo" width={24} height={24} style={{ objectFit: 'contain' }} className={styles.footerLogoImage} />
                <span className={styles.footerLogo}>DEBTIFY</span>
              </div>
              <span className="text-muted" style={{ fontSize: 12 }}>
                © 2026 DEBTIFY. ACCOUNTABILITY THAT MOVES YOUR DEBT DOWN.
              </span>
            </div>
            <div className={styles.footerLinks}>
              <Link href="#">TERMINOLOGY</Link>
              <Link href="#">PRIVACY PROTOCOL</Link>
              <Link href="#">CODE OF CONDUCT</Link>
              <Link href="#">SUPPORT</Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
