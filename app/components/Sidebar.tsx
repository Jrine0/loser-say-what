"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

const navItems = [
  { icon: "dashboard", label: "Overview", href: "/dashboard" },
  { icon: "forum", label: "Coach Chat", href: "/chat" },
  { icon: "gavel", label: "The Verdict", href: "/verdict" },
  { icon: "local_fire_department", label: "The Roast", href: "/roast" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Link href="/" className={styles.logoLink} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Image src="/logo.png" alt="DEBTIFY Logo" width={32} height={32} style={{ objectFit: 'contain' }} className={styles.sidebarLogoImage} />
            <span className={styles.logoBrand}>DEBTIFY</span>
          </div>
          <div className={styles.logoTagline}>FOCUSED ACCOUNTABILITY</div>
        </Link>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${
              pathname === item.href ? styles.navItemActive : ""
            }`}
          >
            <span className="material-icons">{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        <Link href="/goals" className={styles.footerLink}>
          Goals
        </Link>
        <Link href="#" className={styles.footerLink}>
          Method
        </Link>
        <Link href="#" className={styles.footerLink}>
          Reports
        </Link>
      </div>
    </aside>
  );
}
