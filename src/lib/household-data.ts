export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  area: string;
  due: string;
  priority: Priority;
  completed: boolean;
};

export type Reminder = {
  id: string;
  label: string;
  time: string;
  enabled: boolean;
};

export const storageKeys = {
  tasks: "domestiq-ai-phase1-tasks",
  reminders: "domestiq-ai-phase1-reminders",
  chat: "domestiq-ai-chat",
  chatTitle: "domestiq-ai-chat-title",
} as const;

export const defaultTasks: Task[] = [
  {
    id: "task-1",
    title: "Reset kitchen counters",
    area: "Kitchen",
    due: "Today",
    priority: "high",
    completed: false,
  },
  {
    id: "task-2",
    title: "Wash bedding",
    area: "Bedroom",
    due: "Today",
    priority: "medium",
    completed: true,
  },
  {
    id: "task-3",
    title: "Sweep balcony",
    area: "Balcony",
    due: "Tomorrow",
    priority: "low",
    completed: false,
  },
  {
    id: "task-4",
    title: "Empty robot vacuum bin",
    area: "Living room",
    due: "Saturday",
    priority: "medium",
    completed: false,
  },
];

export const defaultReminders: Reminder[] = [
  { id: "reminder-1", label: "Kitchen reset", time: "7:30 PM", enabled: true },
  { id: "reminder-2", label: "Laundry review", time: "8:00 AM", enabled: true },
  { id: "reminder-3", label: "Weekend deep clean", time: "9:00 AM", enabled: false },
];

export const areaOptions = ["All areas", "Kitchen", "Bathroom", "Bedroom", "Living room", "Balcony", "Garage"];

function readStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const savedValue = window.localStorage.getItem(key);
    return savedValue ? (JSON.parse(savedValue) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function readTasksFromStorage(): Task[] {
  return readStoredValue(storageKeys.tasks, defaultTasks);
}

export function readRemindersFromStorage(): Reminder[] {
  return readStoredValue(storageKeys.reminders, defaultReminders);
}

export function buildHouseholdContextSummary(tasks: Task[], reminders: Reminder[]): string {
  const activeTasks = tasks.filter((task) => !task.completed).slice(0, 6);
  const activeReminders = reminders.filter((reminder) => reminder.enabled).slice(0, 4);

  const taskSummary = activeTasks.length > 0
    ? activeTasks
        .map((task) => `${task.title} (${task.area}, ${task.due}, ${task.priority})`)
        .join("; ")
    : "No active tasks.";

  const reminderSummary = activeReminders.length > 0
    ? activeReminders.map((reminder) => `${reminder.label} at ${reminder.time}`).join("; ")
    : "No active reminders.";

  return `Current household context. Active tasks: ${taskSummary} Active reminders: ${reminderSummary}`;
}

export function buildConversationTitle(input: string): string {
  const cleanInput = input.replace(/\s+/g, " ").trim();

  if (!cleanInput) {
    return "New chat";
  }

  const words = cleanInput.split(" ").slice(0, 5);
  const title = words.join(" ");

  return title.length > 36 ? `${title.slice(0, 33)}...` : title;
}