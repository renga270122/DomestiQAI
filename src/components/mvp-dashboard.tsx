"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  areaOptions,
  readRemindersFromStorage,
  readTasksFromStorage,
  storageKeys,
  type Priority,
  type Reminder,
  type Task,
} from "@/lib/household-data";
import styles from "./mvp-dashboard.module.css";

export function MvpDashboard() {
  const isHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [tasks, setTasks] = useState<Task[]>(readTasksFromStorage);
  const [reminders, setReminders] = useState<Reminder[]>(readRemindersFromStorage);
  const [selectedArea, setSelectedArea] = useState("All areas");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskArea, setTaskArea] = useState("Kitchen");
  const [taskDue, setTaskDue] = useState("Today");
  const [taskPriority, setTaskPriority] = useState<Priority>("medium");
  const [reminderLabel, setReminderLabel] = useState("");
  const [reminderTime, setReminderTime] = useState("7:00 PM");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKeys.tasks, JSON.stringify(tasks));
    window.localStorage.setItem(storageKeys.reminders, JSON.stringify(reminders));
  }, [reminders, tasks]);

  const visibleTasks = selectedArea === "All areas"
    ? tasks
    : tasks.filter((task) => task.area === selectedArea);

  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.length - completedCount;
  const completionRate = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  if (!isHydrated) {
    return (
      <section className={styles.shell}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Phase 1 MVP</span>
            <h2>Loading your household dashboard</h2>
            <p>DomestiQ AI is restoring your local tasks and reminders inside the PWA.</p>
          </div>
          <div className={styles.installCard}>
            <strong>Preparing offline workspace</strong>
            <span>Your saved Phase 1 data will appear as soon as hydration completes.</span>
          </div>
        </div>
      </section>
    );
  }

  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTitle = taskTitle.trim();
    if (!normalizedTitle) {
      return;
    }

    const nextTask: Task = {
      id: crypto.randomUUID(),
      title: normalizedTitle,
      area: taskArea,
      due: taskDue,
      priority: taskPriority,
      completed: false,
    };

    setTasks((current) => [nextTask, ...current]);
    setTaskTitle("");
    setTaskArea("Kitchen");
    setTaskDue("Today");
    setTaskPriority("medium");
  }

  function toggleTask(taskId: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function addReminder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedLabel = reminderLabel.trim();
    if (!normalizedLabel) {
      return;
    }

    const nextReminder: Reminder = {
      id: crypto.randomUUID(),
      label: normalizedLabel,
      time: reminderTime,
      enabled: true,
    };

    setReminders((current) => [nextReminder, ...current]);
    setReminderLabel("");
    setReminderTime("7:00 PM");
  }

  function toggleReminder(reminderId: string) {
    setReminders((current) =>
      current.map((reminder) =>
        reminder.id === reminderId
          ? { ...reminder, enabled: !reminder.enabled }
          : reminder,
      ),
    );
  }

  return (
    <section className={styles.shell}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Dashboard</span>
          <h2>Manage today&apos;s home reset</h2>
          <p>Track chores, update priorities, and keep reminders active.</p>
        </div>
        <div className={styles.installCard}>
          <strong>Mobile ready</strong>
          <span>Designed for one-hand use inside the installed PWA.</span>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <article className={styles.statCard}>
          <span>Tasks completed</span>
          <strong>{completedCount}</strong>
        </article>
        <article className={styles.statCard}>
          <span>Pending tasks</span>
          <strong>{pendingCount}</strong>
        </article>
        <article className={styles.statCard}>
          <span>Completion rate</span>
          <strong>{completionRate}%</strong>
        </article>
        <article className={styles.statCard}>
          <span>Active reminders</span>
          <strong>{reminders.filter((item) => item.enabled).length}</strong>
        </article>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.primaryColumn}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.eyebrow}>Task management</span>
                <h3>Chore list</h3>
              </div>
              <select
                aria-label="Filter tasks by area"
                className={styles.select}
                value={selectedArea}
                onChange={(event) => setSelectedArea(event.target.value)}
              >
                {areaOptions.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <form className={styles.formGrid} onSubmit={addTask}>
              <input
                className={styles.input}
                placeholder="Add a new cleaning task"
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
              />
              <select className={styles.select} value={taskArea} onChange={(event) => setTaskArea(event.target.value)}>
                {areaOptions.filter((area) => area !== "All areas").map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
              <input className={styles.input} value={taskDue} onChange={(event) => setTaskDue(event.target.value)} />
              <select
                className={styles.select}
                value={taskPriority}
                onChange={(event) => setTaskPriority(event.target.value as Priority)}
              >
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>
              <button className={styles.primaryButton} type="submit">
                Add task
              </button>
            </form>

            <div className={styles.taskList}>
              {visibleTasks.map((task) => (
                <button
                  className={styles.taskRow}
                  key={task.id}
                  type="button"
                  onClick={() => toggleTask(task.id)}
                >
                  <span className={`${styles.checkbox} ${task.completed ? styles.checked : ""}`} />
                  <span className={styles.taskBody}>
                    <strong>{task.title}</strong>
                    <span>{task.area} · {task.due}</span>
                  </span>
                  <span className={`${styles.priority} ${styles[task.priority]}`}>{task.priority}</span>
                </button>
              ))}
              {visibleTasks.length === 0 ? <p className={styles.emptyState}>No tasks match this area yet.</p> : null}
            </div>
          </article>
        </div>

        <div className={styles.secondaryColumn}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.eyebrow}>Basic reminders</span>
                <h3>Reminder list</h3>
              </div>
            </div>

            <form className={styles.reminderForm} onSubmit={addReminder}>
              <input
                className={styles.input}
                placeholder="Reminder name"
                value={reminderLabel}
                onChange={(event) => setReminderLabel(event.target.value)}
              />
              <input
                className={styles.input}
                placeholder="7:00 PM"
                value={reminderTime}
                onChange={(event) => setReminderTime(event.target.value)}
              />
              <button className={styles.secondaryButton} type="submit">
                Add reminder
              </button>
            </form>

            <div className={styles.reminderList}>
              {reminders.map((reminder) => (
                <div className={styles.reminderRow} key={reminder.id}>
                  <div>
                    <strong>{reminder.label}</strong>
                    <span>{reminder.time}</span>
                  </div>
                  <button
                    className={`${styles.toggle} ${reminder.enabled ? styles.toggleOn : ""}`}
                    type="button"
                    onClick={() => toggleReminder(reminder.id)}
                  >
                    {reminder.enabled ? "On" : "Off"}
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <span className={styles.eyebrow}>User dashboard</span>
            <h3>Today&apos;s summary</h3>
            <div className={styles.summaryCard}>
              <div className={styles.progressBar} aria-hidden="true">
                <span style={{ width: `${completionRate}%` }} />
              </div>
              <p>
                {completedCount} of {tasks.length} tasks complete. Focus next on
                {" "}<strong>{pendingCount > 0 ? "the remaining priority items" : "keeping the streak alive"}</strong>.
              </p>
            </div>

            <ul className={styles.summaryList}>
              <li>Saved tasks and reminders</li>
              <li>Room filters</li>
              <li>Simple reminder toggles</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}