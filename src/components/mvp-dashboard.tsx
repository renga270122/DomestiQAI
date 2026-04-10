"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  readRemindersFromStorage,
  readTasksFromStorage,
  storageKeys,
  type Reminder,
  type Task,
} from "@/lib/household-data";
import { BrandLockup } from "@/components/brand-lockup";
import styles from "./mvp-dashboard.module.css";

const quoteStorageKey = "domestiq-ai-quote-favorites";

const roomCards = [
  { label: "Home", icon: "⌂", accent: "teal" },
  { label: "Balcony", icon: "▦", accent: "green" },
  { label: "Laundry", icon: "▣", accent: "blue" },
  { label: "Vehicles", icon: "◪", accent: "navy" },
];

const weeklyBars = [28, 52, 68, 44, 34, 58, 82];

const mindfulQuotes = [
  {
    id: "clear-mind",
    text: "A clean space clears the mind.",
    note: "Today’s inspiration",
  },
  {
    id: "prayer-for-peace",
    text: "Every sweep is a prayer for peace.",
    note: "Mindful cleaning moment",
  },
  {
    id: "order-calm",
    text: "Order outside invites calm inside.",
    note: "Gentle reminder",
  },
  {
    id: "inner-rhythm",
    text: "Your home reflects your inner rhythm.",
    note: "Sacred space note",
  },
  {
    id: "small-serenity",
    text: "Small chores, big serenity.",
    note: "Quiet progress",
  },
  {
    id: "reset-energy",
    text: "Reset your space, reset your energy.",
    note: "Daily reset",
  },
];

function getDayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;

  return Math.floor(diff / oneDay);
}

function readFavoriteQuotes() {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    const saved = window.localStorage.getItem(quoteStorageKey);
    return saved ? (JSON.parse(saved) as string[]) : [];
  } catch {
    return [] as string[];
  }
}

function readAuthProfileName() {
  if (typeof window === "undefined") {
    return "John";
  }

  try {
    const saved = window.localStorage.getItem(storageKeys.authProfile);

    if (!saved) {
      return "John";
    }

    const profile = JSON.parse(saved) as { displayName?: string };
    return profile.displayName?.trim() || "John";
  } catch {
    return "John";
  }
}

function buildDashboardInsights(tasks: Task[], reminders: Reminder[]) {
  const openTasks = tasks.filter((task) => !task.completed);
  const activeReminders = reminders.filter((reminder) => reminder.enabled);

  return [
    activeReminders.length > 0 ? "Energy Saving Tip" : "Add a timed evening reset",
    openTasks.some((task) => task.area === "Balcony") ? "Clutter Detected" : "Refresh the balcony soon",
    openTasks.some((task) => task.area === "Living room") ? "Vacuum the living room soon" : "Wash the car soon",
  ];
}

export function MvpDashboard() {
  const isHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [tasks, setTasks] = useState<Task[]>(readTasksFromStorage);
  const [reminders] = useState<Reminder[]>(readRemindersFromStorage);
  const [favoriteQuotes, setFavoriteQuotes] = useState<string[]>(readFavoriteQuotes);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [displayName] = useState(readAuthProfileName);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKeys.tasks, JSON.stringify(tasks));
    window.localStorage.setItem(storageKeys.reminders, JSON.stringify(reminders));
  }, [reminders, tasks]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(quoteStorageKey, JSON.stringify(favoriteQuotes));
  }, [favoriteQuotes]);

  const completedCount = tasks.filter((task) => task.completed).length;
  const completionRate = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  useEffect(() => {
    if (!completionMessage) {
      return;
    }

    const timer = window.setTimeout(() => setCompletionMessage(null), 2800);

    return () => window.clearTimeout(timer);
  }, [completionMessage]);

  if (!isHydrated) {
    return (
      <section className={styles.shell}>
        <article className={styles.dashboardCard}>
          <BrandLockup
            kicker="Dashboard"
            title="DomestiQ AI"
            tagline="Loading your rooms, reminders, and smart suggestions."
            compact
          />
        </article>
      </section>
    );
  }

  const todayTasks = tasks.slice(0, 4);
  const activeSuggestion = reminders.find((reminder) => reminder.enabled)?.label ?? "Water the garden";
  const insights = buildDashboardInsights(tasks, reminders);
  const quoteIndex = (getDayOfYear(new Date()) + completedCount) % mindfulQuotes.length;
  const currentQuote = mindfulQuotes[quoteIndex];
  const isFavoriteQuote = favoriteQuotes.includes(currentQuote.id);

  function toggleTask(taskId: string) {
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        const nextCompleted = !task.completed;

        if (nextCompleted) {
          setCompletionMessage("Well done. Clean space, clear mind.");
        }

        return { ...task, completed: nextCompleted };
      }),
    );
  }

  function toggleFavoriteQuote() {
    setFavoriteQuotes((current) =>
      current.includes(currentQuote.id)
        ? current.filter((quoteId) => quoteId !== currentQuote.id)
        : [...current, currentQuote.id],
    );
  }

  async function shareQuote() {
    const shareText = `${currentQuote.text} — DomestiQ AI`;

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText, title: "Mindful Cleaning Moment" });
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCompletionMessage("Quote copied. Share it anywhere you like.");
    } catch {
      setCompletionMessage("Sharing is not available on this device yet.");
    }
  }

  return (
    <section className={styles.shell}>
      <article className={styles.topBar}>
        <BrandLockup
          kicker="Smart home dashboard"
          title="DomestiQ AI"
          tagline="Smarter living starts at home"
          compact
        />
        <div className={styles.profileBadge}>
          <span className={styles.avatar}>{displayName.charAt(0).toUpperCase()}</span>
          <strong>Hello, {displayName}!</strong>
        </div>
      </article>

      <article className={`${styles.dashboardCard} ${styles.mindfulCard}`}>
        <div className={styles.sectionHeaderSplit}>
          <h2>Mindful Cleaning Moments</h2>
        </div>
        <p className={styles.mindfulNote}>{currentQuote.note}</p>
        <blockquote className={styles.mindfulQuote}>{currentQuote.text}</blockquote>
        <div className={styles.mindfulActions}>
          <button className={styles.mindfulButton} type="button" onClick={toggleFavoriteQuote}>
            {isFavoriteQuote ? "Saved" : "Save Favorite"}
          </button>
          <button className={styles.mindfulButtonSecondary} type="button" onClick={() => void shareQuote()}>
            Share Quote
          </button>
        </div>
      </article>

      <article className={styles.dashboardCard}>
        <div className={styles.sectionHeader}>
          <h2>Today&apos;s Tasks</h2>
        </div>
        <div className={styles.taskList}>
          {todayTasks.map((task) => (
            <button key={task.id} className={styles.taskRow} type="button" onClick={() => toggleTask(task.id)}>
              <span className={`${styles.taskCheck} ${task.completed ? styles.taskCheckDone : ""}`}>✓</span>
              <span>{task.title}</span>
            </button>
          ))}
        </div>

        <div className={styles.progressRow}>
          <span className={styles.progressBadge}>Progress</span>
          <strong>{completedCount} / {tasks.length} Completed</strong>
          <div className={styles.progressTrack} aria-hidden="true">
            <span style={{ width: `${completionRate}%` }} />
          </div>
        </div>
      </article>

      <div className={styles.roomGrid}>
        {roomCards.map((room) => (
          <article key={room.label} className={styles.roomCard}>
            <span className={`${styles.roomIcon} ${styles[`roomIcon${room.accent}`]}`}>{room.icon}</span>
            <strong>{room.label}</strong>
          </article>
        ))}
      </div>

      <article className={styles.dashboardCard}>
        <div className={styles.sectionHeader}>
          <h2>Smart Suggestions</h2>
        </div>
        <p className={styles.suggestionText}>Time to {activeSuggestion.toLowerCase()}!</p>
        <button className={styles.reminderButton} type="button">Set Reminder</button>
      </article>

      <div className={styles.bottomGrid}>
        <article className={styles.dashboardCard}>
          <div className={styles.sectionHeaderSplit}>
            <h2>Weekly Stats</h2>
          </div>
          <div className={styles.weeklyLabel}>Task Completion</div>
          <div className={styles.chart} aria-hidden="true">
            {weeklyBars.map((value, index) => (
              <span key={`${value}-${index}`} style={{ height: `${value}%` }} />
            ))}
          </div>
          <div className={styles.chartAxis}>
            <span>S</span>
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
          </div>
        </article>

        <article className={styles.dashboardCard}>
          <div className={styles.sectionHeaderSplit}>
            <h2>AI Insights</h2>
          </div>
          <ul className={styles.insightList}>
            {insights.map((insight) => (
              <li key={insight}>{insight}</li>
            ))}
          </ul>
        </article>
      </div>

      {completionMessage ? <aside className={styles.completionToast}>{completionMessage}</aside> : null}

      <footer className={styles.footer}>© 2026 DomestiQ AI. All rights reserved.</footer>
    </section>
  );
}