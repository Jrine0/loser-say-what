import { SignUp } from "@clerk/nextjs";
import styles from "../../signin/page.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - DEBTIFY",
  description: "Create your DEBTIFY account and start reducing debt with AI coaching.",
};

export default function SignUpPage() {
  return (
    <div className={styles.authPage}>
      <div className={styles.authKanji}>兵</div>
      <div className={styles.authContainer}>
        <SignUp />
      </div>
    </div>
  );
}
