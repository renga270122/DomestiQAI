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

const roomCards = [
  { label: "Home", icon: "⌂", accent: "teal" },
  { label: "Balcony", icon: "▦", accent: "green" },
  { label: "Laundry", icon: "▣", accent: "blue" },
  { label: "Vehicles", icon: "◪", accent: "navy" },
];

const weeklyBars = [28, 52, 68, 44, 34, 58, 82];

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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKeys.tasks, JSON.stringify(tasks));
    window.localStorage.setItem(storageKeys.reminders, JSON.stringify(reminders));
  }, [reminders, tasks]);

  const completedCount = tasks.filter((task) => task.completed).length;
  const completionRate = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

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

  function toggleTask(taskId: string) {
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
    );
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
          <span className={styles.avatar}>J</span>
          <strong>Hello, John!</strong>
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

      <footer className={styles.footer}>© 2024 DomestiQ AI. All rights reserved.</footer>
    </section>
  );
}