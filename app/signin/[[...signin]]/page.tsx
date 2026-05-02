import { SignIn } from "@clerk/nextjs";
import styles from "../../page.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - DEBTIFY",
  description: "Sign in to your DEBTIFY account.",
};

export default function SignInPage() {
  return (
    <div className={styles.authPage}>
      <div className={styles.authKanji}>入</div>
      <div className={styles.authContainer}>
        <SignIn />
      </div>
    </div>
  );
}
