import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import WalletButton from "./WalletButton";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Image src="/logo.png" alt="DEBTIFY Logo" width={32} height={32} style={{ objectFit: 'contain' }} className={styles.brandImage} />
          <span>DEBTIFY</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/#strike-plan" className={styles.navLink}>
            METHOD
          </Link>
          <Link href="/#stats" className={styles.navLink}>
            STATS
          </Link>
          <Link href="/#commitment" className={styles.navLink}>
            COMMITMENT
          </Link>
          <Link href="/chat" className={styles.navLink}>
            COACH
          </Link>
        </nav>

        <div className={styles.actions} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <WalletButton />
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className={`btn btn-ghost btn-sm`}>SIGN IN</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className={`btn btn-primary btn-sm`}>GET STARTED</button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className={`btn btn-ghost btn-sm`} style={{ marginRight: '8px' }}>
              DASHBOARD
            </Link>
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
