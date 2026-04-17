"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { BrandLockup } from "@/components/brand-lockup";
import { storageKeys } from "@/lib/household-data";
import styles from "./page.module.css";

const socialProviders = [
  { id: "google", icon: "G", label: "Google", displayName: "Google Guest" },
  { id: "facebook", icon: "f", label: "Facebook", displayName: "Facebook Guest" },
  { id: "microsoft", icon: "◫", label: "Microsoft", displayName: "Microsoft Guest" },
];

type AuthMode = "login" | "signup";

type StoredAccount = {
  fullName: string;
  email: string;
  householdName: string;
  password: string;
  createdAt: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  function readStoredAccounts() {
    try {
      const saved = window.localStorage.getItem(storageKeys.accounts);
      return saved ? (JSON.parse(saved) as StoredAccount[]) : [];
    } catch {
      return [] as StoredAccount[];
    }
  }

  function persistAccount(account: StoredAccount) {
    const existingAccounts = readStoredAccounts();
    const nextAccounts = [
      ...existingAccounts.filter((savedAccount) => savedAccount.email.toLowerCase() !== account.email.toLowerCase()),
      account,
    ];

    window.localStorage.setItem(storageKeys.accounts, JSON.stringify(nextAccounts));
  }

  function resetSignupFields() {
    setFullName("");
    setHouseholdName("");
    setPassword("");
    setConfirmPassword("");
  }

  function switchMode(mode: AuthMode) {
    setAuthMode(mode);
    setError(null);
    setSuccessMessage(null);
    setShowPassword(false);
    setShowConfirmPassword(false);

    if (mode === "login") {
      setConfirmPassword("");
      setFullName("");
      setHouseholdName("");
    }
  }

  function goToDashboard(displayName: string, provider: string) {
    persistProfile(displayName, provider);
    router.push("/dashboard");
  }

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }
    setError(null);
    setSuccessMessage(null);
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/dashboard");
    }
  }

  function handleSignup() {
    setError("Sign up is only available for the demo user in this MVP. Please use demo@demo.com / demo to log in.");
  }

  function handleProviderLogin(displayName: string, provider: string) {
    setError("Social login is not enabled in this MVP.");
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
            <div className={styles.modeTabs}>
              <button
                className={`${styles.modeTab} ${authMode === "login" ? styles.modeTabActive : ""}`}
                type="button"
                onClick={() => switchMode("login")}
              >
                Login
              </button>
              <button
                className={`${styles.modeTab} ${authMode === "signup" ? styles.modeTabActive : ""}`}
                type="button"
                onClick={() => switchMode("signup")}
              >
                Sign Up
              </button>
            </div>
            <h1>{authMode === "signup" ? "Create Your Account" : "Welcome Back"}</h1>
            <p>
              {authMode === "signup"
                ? "Add your details so DomestiQ AI can save your account and household profile."
                : "Sign in to continue managing your home flow."}
            </p>
          </div>

          <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
            {authMode === "signup" ? (
              <>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Home Name"
                  value={householdName}
                  onChange={(event) => setHouseholdName(event.target.value)}
                />
              </>
            ) : null}
            <input
              className={styles.input}
              type="text"
              placeholder={authMode === "signup" ? "Email Address" : "Email / Username"}
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
            {authMode === "signup" ? (
              <div className={styles.passwordRow}>
                <input
                  className={styles.input}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                <button
                  className={styles.eyeButton}
                  type="button"
                  aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                  onClick={() => setShowConfirmPassword((current) => !current)}
                >
                  <span className={styles.eye} aria-hidden="true">◔</span>
                </button>
              </div>
            ) : (
              <Link className={styles.forgotLink} href="/assistant">
                Forgot password?
              </Link>
            )}
            <button
              className={styles.primaryButton}
              type="button"
              onClick={authMode === "signup" ? handleSignup : handleLogin}
            >
              {authMode === "signup" ? "Create Account" : "Login"}
            </button>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => switchMode(authMode === "signup" ? "login" : "signup")}
            >
              {authMode === "signup" ? "Back to Login" : "Create New Account"}
            </button>
            {error ? <p className={styles.errorText}>{error}</p> : null}
            {successMessage ? <p className={styles.successText}>{successMessage}</p> : null}
          </form>

          <div className={styles.optionsRow}>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
              <span>Remember Me</span>
            </label>
          </div>

          {authMode === "login" ? (
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
          ) : (
            <div className={styles.signupNote}>
              <strong>Your details stay on this device for now.</strong>
              <span>When you create an account, DomestiQ AI saves your profile locally and prepares your dashboard greeting.</span>
            </div>
          )}

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