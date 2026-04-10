export type DailyInspiration = {
  id: string;
  quote: string;
  author: string;
  category: string;
  note: string;
};

export const dailyInspirations: DailyInspiration[] = [
  {
    id: "clear-mind",
    quote: "A clean space clears the mind.",
    author: "DomestiQ AI",
    category: "Mindful Cleaning",
    note: "Today’s inspiration",
  },
  {
    id: "prayer-for-peace",
    quote: "Every sweep is a prayer for peace.",
    author: "DomestiQ AI",
    category: "Mindful Cleaning",
    note: "Mindful cleaning moment",
  },
  {
    id: "order-calm",
    quote: "Order outside invites calm inside.",
    author: "DomestiQ AI",
    category: "Soulful Reset",
    note: "Gentle reminder",
  },
  {
    id: "inner-rhythm",
    quote: "Your home reflects your inner rhythm.",
    author: "DomestiQ AI",
    category: "Soulful Reset",
    note: "Sacred space note",
  },
  {
    id: "small-serenity",
    quote: "Small chores, big serenity.",
    author: "DomestiQ AI",
    category: "Daily Momentum",
    note: "Quiet progress",
  },
  {
    id: "reset-energy",
    quote: "Reset your space, reset your energy.",
    author: "DomestiQ AI",
    category: "Daily Momentum",
    note: "Daily reset",
  },
];

function getDayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;

  return Math.floor(diff / oneDay);
}

export function getDailyInspiration(date = new Date()) {
  return dailyInspirations[getDayOfYear(date) % dailyInspirations.length];
}