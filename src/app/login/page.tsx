"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BrandLockup } from "@/components/brand-lockup";
import { storageKeys } from "@/lib/household-data";
import styles from "./page.module.css";

const socialProviders = [
  { id: "google", icon: "G", label: "Google", displayName: "Google Guest" },
  { id: "facebook", icon: "f", label: "Facebook", displayName: "Facebook Guest" },
  { id: "microsoft", icon: "◫", label: "Microsoft", displayName: "Microsoft Guest" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  function deriveDisplayName(value: string) {
    const fallback = "John";
    const trimmed = value.trim();

    if (!trimmed) {
      return fallback;
    }

    const base = trimmed.includes("@") ? trimmed.split("@")[0] : trimmed;
    const normalized = base.replace(/[._-]+/g, " ").trim();

    return normalized
      ? normalized
          .split(" ")
          .filter(Boolean)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ")
      : fallback;
  }

  function persistProfile(displayName: string, provider: string) {
    window.localStorage.setItem(
      storageKeys.authProfile,
      JSON.stringify({
        displayName,
        provider,
        rememberMe,
        loggedInAt: new Date().toISOString(),
      }),
    );
  }

  function goToDashboard(displayName: string, provider: string) {
    persistProfile(displayName, provider);
    router.push("/dashboard");
  }

  function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Enter your email or username and password to continue.");
      return;
    }

    setError(null);
    goToDashboard(deriveDisplayName(email), "password");
  }

  function handleSignup() {
    if (!email.trim() || !password.trim()) {
      setError("Add an email or username and password to create your space.");
      return;
    }

    setError(null);
    goToDashboard(deriveDisplayName(email), "signup");
  }

  function handleProviderLogin(displayName: string, provider: string) {
    setError(null);
    goToDashboard(displayName, provider);
  }

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

          <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
            <input
              className={styles.input}
              type="text"
              placeholder="Email / Username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <div className={styles.passwordRow}>
              <input
                className={styles.input}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                className={styles.eyeButton}
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((current) => !current)}
              >
                <span className={styles.eye} aria-hidden="true">◔</span>
              </button>
            </div>
            <Link className={styles.forgotLink} href="/assistant">
              Forgot password?
            </Link>
            <button className={styles.primaryButton} type="button" onClick={handleLogin}>Login</button>
            <button className={styles.secondaryButton} type="button" onClick={handleSignup}>Sign Up</button>
            {error ? <p className={styles.errorText}>{error}</p> : null}
          </form>

          <div className={styles.optionsRow}>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
              <span>Remember Me</span>
            </label>
          </div>

          <div className={styles.socialRow}>
            {socialProviders.map((provider) => (
              <button
                key={provider.id}
                className={`${styles.socialButton} ${styles[`socialButton${provider.id}`]}`}
                type="button"
                onClick={() => handleProviderLogin(provider.displayName, provider.id)}
              >
                <span className={styles.socialIcon} aria-hidden="true">{provider.icon}</span>
                <span>{provider.label}</span>
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
          <p>© {currentYear} DomestiQ AI. All rights reserved.</p>
        </footer>
      </section>
    </main>
  );
}