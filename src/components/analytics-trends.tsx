import { useEffect, useState } from "react";

export default function AnalyticsTrends({ streakCount, bestStreak, tasks }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Simulate fetching streak/task history from localStorage or API
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("domestiq-ai-streak-history") : null;
    setHistory(saved ? JSON.parse(saved) : []);
  }, []);

  // Example: Calculate 7-day streak trend
  const streakTrend = history.slice(-7);
  const avgCompletion = tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0;

  return (
    <section style={{ marginTop: 24 }}>
      <h2>Analytics & Trends</h2>
      <div>
        <strong>Current Streak:</strong> {streakCount} days<br />
        <strong>Best Streak:</strong> {bestStreak} days<br />
        <strong>Avg. Completion Rate:</strong> {avgCompletion.toFixed(1)}%
      </div>
      <div style={{ marginTop: 16 }}>
        <h3>Last 7 Days</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {streakTrend.length === 0 ? (
            <span>No history yet.</span>
          ) : (
            streakTrend.map((val, idx) => (
              <div key={idx} style={{ width: 24, height: 48, background: "#e0f7fa", display: "flex", alignItems: "flex-end" }}>
                <div style={{ width: "100%", height: `${val * 8}%`, background: "#0f7cae" }} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
