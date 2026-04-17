"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getDailyInspiration, type DailyInspiration } from "@/lib/daily-inspiration";
import {
  readRemindersFromStorage,
  readTasksFromStorage,
  storageKeys,
  type Reminder,
  type Task,
} from "@/lib/household-data";
import { BrandLockup } from "@/components/brand-lockup";
import AnalyticsTrends from "@/components/analytics-trends";
import RoutineTemplates from "@/components/routine-templates";
import CleaningResources from "@/components/cleaning-resources";
import RoomGuideModal from "@/components/room-guide-modal";

// Audio ref for reminder chime
const reminderAudio = typeof window !== "undefined" ? new Audio("/reminder-chime.mp3") : null;
import styles from "./mvp-dashboard.module.css";

const quoteStorageKey = "domestiq-ai-quote-favorites";

type ProgressSnapshot = {
  streakCount: number;
  bestStreak: number;
  lastCompletedDate: string | null;
};

const roomCards = [
  { label: "Home", icon: "⌂", accent: "teal" },
  { label: "Balcony", icon: "▦", accent: "green" },
  { label: "Laundry", icon: "▣", accent: "blue" },
  { label: "Vehicles", icon: "◪", accent: "navy" },
];

const weeklyBars = [28, 52, 68, 44, 34, 58, 82];

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

function readProgressSnapshot(): ProgressSnapshot {
  if (typeof window === "undefined") {
    return { streakCount: 0, bestStreak: 0, lastCompletedDate: null };
  }

  try {
    const saved = window.localStorage.getItem(storageKeys.progress);
    return saved
      ? (JSON.parse(saved) as ProgressSnapshot)
      : { streakCount: 0, bestStreak: 0, lastCompletedDate: null };
  } catch {
    return { streakCount: 0, bestStreak: 0, lastCompletedDate: null };
  }
}

function formatDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getPreviousDateKey(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() - 1);
  return formatDateKey(date);
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


function buildSmartNudges(tasks: Task[], reminders: Reminder[], completionRate: number) {
  const openTasks = tasks.filter((task) => !task.completed);
  const firstTask = openTasks[0];
  const enabledReminder = reminders.find((reminder) => reminder.enabled);

  return [
    completionRate >= 75
      ? "You are almost done. One more reset keeps the streak alive."
      : `Start with ${firstTask?.title.toLowerCase() ?? "your top reset"} for the quickest momentum boost.`,
    enabledReminder
      ? `${enabledReminder.label} is active for ${enabledReminder.time}. Keep the rhythm going.`
      : "Reset your space, reset your energy.",
    openTasks.length <= 1
      ? "You are one task away from a fully reset home today."
      : `${openTasks.length} tasks remain. A 10 minute focus sprint will move this fast.`,
  ];
}

export function MvpDashboard() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
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
  const [progressSnapshot, setProgressSnapshot] = useState<ProgressSnapshot>(readProgressSnapshot);
  const [dailyInspiration, setDailyInspiration] = useState<DailyInspiration>(getDailyInspiration);
  const [showCelebration, setShowCelebration] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("default");
  const reminderTimeouts = useRef<number[]>([]);

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

  useEffect(() => {
    let isMounted = true;

    async function loadDailyInspiration() {
      try {
        const response = await fetch("/api/daily-inspiration", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Failed to load daily inspiration");
        }

        const data = (await response.json()) as DailyInspiration;

        if (isMounted) {
          setDailyInspiration(data);
        }
      } catch {
        if (isMounted) {
          setDailyInspiration(getDailyInspiration());
        }
      }
    }

    void loadDailyInspiration();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }

    setNotificationPermission(window.Notification.permission);
  }, []);

  const completedCount = tasks.filter((task) => task.completed).length;
  const completionRate = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);
  const allTasksCompleted = tasks.length > 0 && completedCount === tasks.length;
  const smartNudges = buildSmartNudges(tasks, reminders, completionRate);

  useEffect(() => {
    if (!completionMessage) {
      return;
    }

    const timer = window.setTimeout(() => setCompletionMessage(null), 2800);

    return () => window.clearTimeout(timer);
  }, [completionMessage]);

  useEffect(() => {
    if (!showCelebration) {
      return;
    }

    const timer = window.setTimeout(() => setShowCelebration(false), 2200);

    return () => window.clearTimeout(timer);
  }, [showCelebration]);

  useEffect(() => {
    return () => {
      reminderTimeouts.current.forEach((timerId) => window.clearTimeout(timerId));
      reminderTimeouts.current = [];
    };
  }, []);

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
  const isFavoriteQuote = favoriteQuotes.includes(dailyInspiration.id);

  function persistProgress(snapshot: ProgressSnapshot) {
    setProgressSnapshot(snapshot);
    window.localStorage.setItem(storageKeys.progress, JSON.stringify(snapshot));
  }

  function updateStreakIfNeeded() {
    const todayKey = formatDateKey();

    if (progressSnapshot.lastCompletedDate === todayKey) {
      return;
    }

    const nextStreak = progressSnapshot.lastCompletedDate === getPreviousDateKey(todayKey)
      ? progressSnapshot.streakCount + 1
      : 1;

    persistProgress({
      streakCount: nextStreak,
      bestStreak: Math.max(progressSnapshot.bestStreak, nextStreak),
      lastCompletedDate: todayKey,
    });
  }

  function toggleTask(taskId: string) {
    setTasks((current) => {
      const nextTasks = current.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        const nextCompleted = !task.completed;

        if (nextCompleted) {
          setCompletionMessage("Well done. Clean space, clear mind.");
        }

        return { ...task, completed: nextCompleted };
      });

      const nextCompletedCount = nextTasks.filter((task) => task.completed).length;
      const nextAllCompleted = nextTasks.length > 0 && nextCompletedCount === nextTasks.length;

      if (nextAllCompleted) {
        updateStreakIfNeeded();
        setShowCelebration(true);
        setCompletionMessage("Daily reset complete. Your streak just grew.");
      }

      return nextTasks;
    });
  }

  function toggleFavoriteQuote() {
    setFavoriteQuotes((current) =>
      current.includes(dailyInspiration.id)
        ? current.filter((quoteId) => quoteId !== dailyInspiration.id)
        : [...current, dailyInspiration.id],
    );
  }

  async function shareQuote() {
    const shareText = `${dailyInspiration.quote} — ${dailyInspiration.author}`;

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

  async function scheduleSmartReminder() {
    if (typeof window === "undefined") {
      return;
    }

    if (!("Notification" in window)) {
      setCompletionMessage("Smart nudges work best in a browser that supports notifications.");
      return;
    }

    // Play sound effect
    try {
      reminderAudio?.play();
    } catch {}

    let permission = window.Notification.permission;

    if (permission === "default") {
      permission = await window.Notification.requestPermission();
      setNotificationPermission(permission);
    }

    if (permission !== "granted") {
      setCompletionMessage("Enable browser notifications to receive gentle reminders from DomestiQ AI.");
      return;
    }

    const reminderBody = smartNudges[0];

    const timerId = window.setTimeout(() => {
      new window.Notification("DomestiQ AI", {
        body: reminderBody,
        icon: "/icons/icon-192.svg",
      });
    }, 6000);

    reminderTimeouts.current.push(timerId);
    setCompletionMessage("Gentle reminder set. You will get a smart nudge in a few seconds.");
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
        <div className={styles.topBarMeta}>
          <div className={styles.profileBadge}>
            <span className={styles.avatar}>{displayName.charAt(0).toUpperCase()}</span>
            <strong>Hello, {displayName}!</strong>
          </div>
          <div className={styles.streakBadge}>
            <span>Clean streak</span>
            <strong>{progressSnapshot.streakCount} day{progressSnapshot.streakCount === 1 ? "" : "s"}</strong>
          </div>
        </div>
      </article>

      <article className={`${styles.dashboardCard} ${styles.mindfulCard}`}>
        <div className={styles.sectionHeaderSplit}>
          <h2>Mindful Cleaning Moments</h2>
        </div>
        <p className={styles.mindfulNote}>{dailyInspiration.note}</p>
        <blockquote className={styles.mindfulQuote}>{dailyInspiration.quote}</blockquote>
        <p className={styles.mindfulMeta}>{dailyInspiration.author} · {dailyInspiration.category}</p>
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

        <div className={styles.streakPanel}>
          <div>
            <span className={styles.streakLabel}>Current streak</span>
            <strong>{progressSnapshot.streakCount} day{progressSnapshot.streakCount === 1 ? "" : "s"}</strong>
          </div>
          <div>
            <span className={styles.streakLabel}>Best streak</span>
            <strong>{progressSnapshot.bestStreak} day{progressSnapshot.bestStreak === 1 ? "" : "s"}</strong>
          </div>
          <div>
            <span className={styles.streakLabel}>Today</span>
            <strong>{allTasksCompleted ? "Fully reset" : "In progress"}</strong>
          </div>
        </div>
      </article>

      <div className={styles.roomGrid}>
        {roomCards.map((room) => (
          <button
            key={room.label}
            className={styles.roomCard}
            type="button"
            style={{ cursor: "pointer", background: "none", border: 0, padding: 0 }}
            onClick={() => setSelectedRoom(room.label)}
          >
            <span className={`${styles.roomIcon} ${styles[`roomIcon${room.accent}`]}`}>{room.icon}</span>
            <strong>{room.label}</strong>
          </button>
        ))}
      </div>

      {selectedRoom && (
        <RoomGuideModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
      )}

      {selectedRoom && (
        <RoomGuideModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
      )}

      <article className={styles.dashboardCard}>
        <div className={styles.sectionHeader}>
          <h2>Smart Suggestions</h2>
        </div>
        <p className={styles.suggestionText}>Time to {activeSuggestion.toLowerCase()}!</p>
        <div className={styles.nudgeList}>
          {smartNudges.map((nudge) => (
            <p key={nudge} className={styles.nudgeItem}>{nudge}</p>
          ))}
        </div>
        <button className={styles.reminderButton} type="button" onClick={() => void scheduleSmartReminder()}>
          {notificationPermission === "granted" ? "Send Gentle Nudge" : "Enable Smart Reminder"}
        </button>
        <p className={styles.reminderHint}>
          {notificationPermission === "unsupported"
            ? "Notifications are not supported in this browser, so DomestiQ AI will keep using in-app nudges."
            : "Smart reminders use your browser notification permission and send a gentle prompt from the open app."}
        </p>
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

      {showCelebration ? (
        <aside className={styles.celebrationBurst} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </aside>
      ) : null}

      {completionMessage ? <aside className={styles.completionToast}>{completionMessage}</aside> : null}

      <AnalyticsTrends streakCount={progressSnapshot.streakCount} bestStreak={progressSnapshot.bestStreak} tasks={tasks} />
      <RoutineTemplates />
      <CleaningResources />
      <footer className={styles.footer}>© 2026 DomestiQ AI. All rights reserved.</footer>
    </section>
  );
}