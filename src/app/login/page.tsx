import Link from "next/link";
import { BrandLockup } from "@/components/brand-lockup";
import styles from "./page.module.css";

const socialProviders = ["G", "M", "A"];

export default function LoginPage() {
  return (
    <main className="page-shell app-screen">
      <section className={styles.shell}>
        <header className={styles.header}>
          <BrandLockup
            kicker="Smarter living starts at home"
            title="DomestiQ AI"
            tagline="One calm place for daily resets, reminders, and room-by-room routines."
          />
        </header>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h1>Welcome Back</h1>
            <p>Sign in to continue managing your home flow.</p>
          </div>

          <form className={styles.form}>
            <input className={styles.input} type="text" placeholder="Email / Username" />
            <div className={styles.passwordRow}>
              <input className={styles.input} type="password" placeholder="Password" />
              <span className={styles.eye} aria-hidden="true">◔</span>
            </div>
            <Link className={styles.forgotLink} href="/assistant">
              Forgot password?
            </Link>
            <button className={styles.primaryButton} type="button">Login</button>
            <button className={styles.secondaryButton} type="button">Sign Up</button>
          </form>

          <div className={styles.optionsRow}>
            <label className={styles.checkboxRow}>
              <input type="checkbox" defaultChecked />
              <span>Remember Me</span>
            </label>
          </div>

          <div className={styles.socialRow}>
            {socialProviders.map((provider) => (
              <button key={provider} className={styles.socialButton} type="button">
                {provider}
              </button>
            ))}
          </div>

          <Link className={styles.guestLink} href="/dashboard">
            Continue as Guest
          </Link>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerLinks}>
            <a href="#">Privacy Policy</a>
            <span>|</span>
            <a href="#">Terms of Service</a>
          </div>
          <p>© 2024 DomestiQ AI. All rights reserved.</p>
        </footer>
      </section>
    </main>
  );
}